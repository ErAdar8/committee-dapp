require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const INFURA_URL = process.env.INFURA_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: INFURA_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
