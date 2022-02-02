import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {ethers, upgrades} from "hardhat";
import {GrassMaxi, GrassMaxi__factory} from "../../../../typechain";
import {ConfigEntity} from "../../../entities";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    ░██╗░░░░░░░██╗░█████╗░██████╗░███╗░░██╗██╗███╗░░██╗░██████╗░
    ░██║░░██╗░░██║██╔══██╗██╔══██╗████╗░██║██║████╗░██║██╔════╝░
    ░╚██╗████╗██╔╝███████║██████╔╝██╔██╗██║██║██╔██╗██║██║░░██╗░
    ░░████╔═████║░██╔══██║██╔══██╗██║╚████║██║██║╚████║██║░░╚██╗
    ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║██║░╚███║██║██║░╚███║╚██████╔╝
    ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝╚═╝░░╚══╝░╚═════╝░
    Check all variables below before execute the deployment script
    */

  const config = ConfigEntity.getConfig();
  const deployer = (await ethers.getSigners())[0];
  const treasuryBountyBps = 20;

  console.log(`>> Deploying GrassMaxi`);
  const GrassMaxi = (await ethers.getContractFactory("GrassMaxi", deployer)) as GrassMaxi__factory;
  const grassMaxi = (await upgrades.deployProxy(GrassMaxi, [
    config.mxALPACA,
    config.xALPACA,
    config.ALPACA,
    config.pcsRouterV2,
    treasuryBountyBps
  ])) as GrassMaxi;
  await grassMaxi.deployed();
  console.log(`>> Deployed at ${grassMaxi.address}`);
  console.log("✅ Done");

};

export default func;
func.tags = ["GrassMaxi"];
