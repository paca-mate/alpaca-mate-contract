import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {ethers} from "hardhat";
import {MxALPACA, MxALPACA__factory} from "../../../../typechain";

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
  const deployer = (await ethers.getSigners())[0];

  console.log(`>> Deploying mxALPACA`);
  const MXALPACA = (await ethers.getContractFactory("mxALPACA", deployer)) as MxALPACA__factory;
  const mxALPACA = (await MXALPACA.deploy()) as MxALPACA;
  await mxALPACA.deployed();
  console.log(`>> Deployed at ${mxALPACA.address}`);
  console.log("✅ Done");
};

export default func;
func.tags = ["mxALPACA"];
