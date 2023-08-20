const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);
const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf-8");
// config file for solc
const input = {
  language: 'Solidity',
  sources: {
    'campaign.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};


// compile
const output = solc.compile(JSON.stringify(input)).contracts
console.log(output);


// create that build folder
fs.ensureDirSync(buildPath);

for (let contract in output) {
  // console.log(contract)
  // fs.outputJsonSync(
  //   path.resolve(buildPath, contract.replace(":", "") + ".json"),
  //   output[contract]
  // );
}
