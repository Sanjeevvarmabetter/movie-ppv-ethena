require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",

  networks: {
    ethenaTestnet: {
      url:"https://testnet.rpc.ethena.fi",
      chainId:52085143,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

