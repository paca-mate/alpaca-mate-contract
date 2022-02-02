import { network } from "hardhat";
import MainnetConfig from "../../.mainnet.json";
import TestnetConfig from "../../.testnet.json";
import { Config } from "../interfaces/config";

export function getConfig(): Config {
  return network.name === "mainnet" || network.name === "mainnetfork" ? MainnetConfig : TestnetConfig;
}
