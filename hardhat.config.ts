import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "solidity-coverage";
import "@nomiclabs/hardhat-etherscan";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      accounts: { mnemonic: "test test test test test test test test test test test junk" },
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [process.env.BSC_TESTNET_PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.BSC_MAINNET_RPC,
      accounts: [process.env.BSC_MAINNET_PRIVATE_KEY],
    },
    mainnetfork: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.BSC_MAINNET_PRIVATE_KEY],
      timeout: 500000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts/8.10",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "./typechain",
    target: "ethers-v5",
  },
  mocha: {
    timeout: 50000,
  },
  etherscan: {
    apiKey: process.env.BSC_SCAN_APIKEY || "",
  },
};
