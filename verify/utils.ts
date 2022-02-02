import { ethers, network } from "hardhat";

const { utils } = ethers;

const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
export type EtherScanResult = {
  status: string;
  message: string;
  result: string;
};
export const getImplAddress = async (contract: string): Promise<string> => {
  const rawAddr = await ethers.provider.getStorageAt(contract, IMPLEMENTATION_SLOT);
  return utils.getAddress(utils.hexDataSlice(rawAddr, 12));
};

export const getBSCScanAPI = () => {
  return network.name === "mainnet" ? "https://api.bscscan.com/" : "https://api-testnet.bscscan.com/";
};
