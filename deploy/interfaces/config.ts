export interface Config {
  ProxyAdmin: string;
  GrassMaxi: string;
  mxALPACA: string;
  xALPACA: string;
  ALPACA: string;
  pcsRouterV2: string;
  GrassHouses: GrassHouse[];
}

export interface GrassHouse {
  name: string;
  address: string;
  rewardToken: string;
}
