const Web3 = require("web3");
const ganache = require("ganache-cli");
const assert = require("assert");

const web3 = new Web3(ganache.provider());
const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });
  //   console.log(accounts);
  await factory.methods
    .createCampaign("100")
    .send({ from: accounts[0], gas: "1000000" });

  const addresses = await factory.methods.getDeployedCampaigns().call();
  campaignAddress = addresses[0];

  campaign = new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a factory and campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it("allow contribution and mark as approver", async () => {
    await campaign.methods.contribute().send({
      value: "124",
      from: accounts[1],
    });
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });
  it("account has minimum money", async () => {
    try {
      await campaign.methods.contribute().send({
        value: "80",
        from: accounts[1],
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });
  it("manager makes payment request", async () => {
    await campaign.methods
      .createRequest("visit the tester", "102", accounts[2])
      .send({
        from: accounts[0],
        gas: "1000000",
      });
    const request = await campaign.methods.requests(0).call();
    assert.equal("visit the tester", request.description);
  });
  it("capture the workflow", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });
    await campaign.methods
      .createRequest(
        "buy a giga processor",
        web3.utils.toWei("5", "ether"),
        accounts[1]
      )
      .send({ from: accounts[0], gas: "1000000" });
    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });
    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });
    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);
    console.log(balance);
    assert(balance > 103);
  });
});
