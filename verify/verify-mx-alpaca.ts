import {run} from "hardhat";
import "@nomiclabs/hardhat-ethers/internal/type-extensions";
import {ConfigEntity} from "../deploy/entities";

async function main() {
  const config = ConfigEntity.getConfig();

  const address = config.mxALPACA;
  await run("verify:verify", {
    address,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
