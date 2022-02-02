import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {ethers} from "hardhat";
import {MxALPACA} from "../../../../typechain";
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

  console.log(`>> Adding GrassMaxi as mxALPACA operator`);
  const mxALPACA = await ethers.getContractAt("mxALPACA", config.mxALPACA, deployer) as MxALPACA;
  const tx = await mxALPACA.setOKOperator(config.GrassMaxi, true);
  console.log(`tx: ${tx.hash}`)
  await tx.wait();
  console.log("✅ Done");

};

export default func;
func.tags = ["mxALPACASetOperator"];
