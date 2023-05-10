import web3 from "./web3";
import campaignFactory from "./build/CampaignFactory.json";
// console.log(campaignFactory);
const instance = new web3.eth.Contract(
  JSON.parse(campaignFactory.interface),
  "0x1D49c666E18f8FE1a27F699b06BF0e3D41dd8D78"
);
export default instance;
