import { run, network } from "hardhat";
import "@nomiclabs/hardhat-ethers/internal/type-extensions";
import { ConfigEntity } from "../deploy/entities";
import { EtherScanResult, getBSCScanAPI, getImplAddress } from "./utils";
import axios from "axios";

async function main() {
  const config = ConfigEntity.getConfig();
  const bscScanAPI = getBSCScanAPI();
  const proxyAddr = config.GrassMaxi;
  const treasureBountyBPs = 20;
  const address = await getImplAddress(proxyAddr);
  await run("verify:verify", {
    address,
    args: [config.mxALPACA, config.xALPACA, config.ALPACA, config.pcsRouterV2, treasureBountyBPs],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
