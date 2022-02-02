import {
  BEP20,
  BEP20__factory,
  GrassMaxi,
  GrassMaxi__factory,
  MockGrassHouse,
  MockGrassHouse__factory,
  MockxALPACA,
  MockxALPACA__factory, MxALPACA, MxALPACA__factory,
  PancakeFactory,
  PancakeFactory__factory,
  PancakeRouterV2,
  PancakeRouterV2__factory,
  WETH,
  WETH__factory
} from "../../typechain";
import {BigNumber, Signer} from "ethers";
import {ethers, upgrades, waffle} from "hardhat";
import * as timeHelpers from "../helpers/time";
import {expect} from "chai";
import {formatEther, parseEther} from "ethers/lib/utils";

describe("GrassMaxi", () => {
  const FOREVER = "2000000000";
  const TREASURE_BPS = 30; // 0.3%
  const DAY = ethers.BigNumber.from(86400);
  const WEEK = DAY.mul(7);

  // Contact Instance
  let mxALPACA: MxALPACA;
  let ALPACA: BEP20;
  let RewardToken1: BEP20;
  let RewardToken2: BEP20;
  let MockBUSD: BEP20;
  let wbnb: WETH;

  let xALPACA: MockxALPACA;
  let grassHouse1: MockGrassHouse; // RewardToken1
  let grassHouse2: MockGrassHouse; // RewardToken2
  let grassHouse3: MockGrassHouse; // ALPACA

  let pcsFactory: PancakeFactory;
  let pcsRouter: PancakeRouterV2;

  let grassMaxi: GrassMaxi;

  // MockGrassHouse start week cursor
  let startWeekCursor: BigNumber;

  // Accounts
  let deployer: Signer;
  let alice: Signer;
  let bob: Signer;
  let eve: Signer;

  let deployerAddress: string;
  let aliceAddress: string;
  let bobAddress: string;
  let eveAddress: string;

  // Contract Signer
  let ALPACAasAlice: BEP20;
  let ALPACAasBob: BEP20;
  let ALPACAasEve: BEP20;

  let RT1asAlice: BEP20;
  let RT1asBob: BEP20;
  let RT1asEve: BEP20;

  let RT2asAlice: BEP20;
  let RT2asBob: BEP20;
  let RT2asEve: BEP20;

  let grassMaxiasAlice: GrassMaxi;
  let grassMaxiasBob: GrassMaxi;
  let grassMaxiasEve: GrassMaxi;

  let xALPACAasAlice: MockxALPACA;
  let xALPACAasBob: MockxALPACA;
  let xALPACAasEve: MockxALPACA;

  let grassHouseAsAlice: MockGrassHouse;
  let grassHouseAsBob: MockGrassHouse;
  let grassHouseAsEve: MockGrassHouse;

  async function fixture() {
    [deployer, alice, bob, eve] = await ethers.getSigners();
    [deployerAddress, aliceAddress, bobAddress, eveAddress] = await Promise.all([
      deployer.getAddress(),
      alice.getAddress(),
      bob.getAddress(),
      eve.getAddress(),
    ]);

    // Deploy mxALPACA
    const MXALPACA = (await ethers.getContractFactory("mxALPACA", deployer)) as MxALPACA__factory;
    mxALPACA = await MXALPACA.deploy();

    // Deploy ALPACA & RewardToken1&2
    const BEP20 = (await ethers.getContractFactory("BEP20", deployer)) as BEP20__factory;
    ALPACA = await BEP20.deploy("ALPACA", "ALPACA");
    await ALPACA.mint(deployerAddress, ethers.utils.parseEther("888888888888888"));
    RewardToken1 = await BEP20.deploy("RewardToken1", "RT1");
    await RewardToken1.mint(deployerAddress, ethers.utils.parseEther("888888888888888"));

    RewardToken2 = await BEP20.deploy("RewardToken2", "RT2");
    await RewardToken2.mint(deployerAddress, ethers.utils.parseEther("888888888888888"));

    MockBUSD = await BEP20.deploy("MockBUSD", "MBUSD");
    await MockBUSD.mint(deployerAddress, ethers.utils.parseEther("888888888888888"));

    // Deploy xALPACA
    const MockxALPACA = (await ethers.getContractFactory("MockxALPACA", deployer)) as MockxALPACA__factory;
    xALPACA = (await upgrades.deployProxy(MockxALPACA, [ALPACA.address])) as MockxALPACA;
    await xALPACA.deployed();

    // Distribute ALPACA and approve xALPACA to do "transferFrom"
    for (let i = 0; i < 10; i++) {
      await ALPACA.transfer((await ethers.getSigners())[i].address, ethers.utils.parseEther("88888"));
      const alpacaWithSigner = BEP20__factory.connect(ALPACA.address, (await ethers.getSigners())[i]);
      await alpacaWithSigner.approve(xALPACA.address, ethers.constants.MaxUint256);
    }

    // Deploy MockGrassHouses, 1: RewardToken1, 2: RewardToken2, 3: ALPACA
    startWeekCursor = (await timeHelpers.latestTimestamp()).div(WEEK).mul(WEEK);
    const MockGrassHouse = (await ethers.getContractFactory("MockGrassHouse", deployer)) as MockGrassHouse__factory;
    grassHouse1 = (await upgrades.deployProxy(MockGrassHouse, [
      xALPACA.address,
      await timeHelpers.latestTimestamp(),
      RewardToken1.address,
      deployerAddress,
    ])) as MockGrassHouse;
    await grassHouse1.deployed();

    grassHouse2 = (await upgrades.deployProxy(MockGrassHouse, [
      xALPACA.address,
      await timeHelpers.latestTimestamp(),
      RewardToken2.address,
      deployerAddress,
    ])) as MockGrassHouse;
    await grassHouse2.deployed();

    grassHouse3 = (await upgrades.deployProxy(MockGrassHouse, [
      xALPACA.address,
      await timeHelpers.latestTimestamp(),
      ALPACA.address,
      deployerAddress,
    ])) as MockGrassHouse;
    await grassHouse3.deployed();

    // Setup Pancakeswap
    const PancakeFactory = (await ethers.getContractFactory("PancakeFactory", deployer)) as PancakeFactory__factory;
    pcsFactory = await PancakeFactory.deploy(await deployer.getAddress());
    await pcsFactory.deployed();

    const WBNB = (await ethers.getContractFactory("WETH", deployer)) as WETH__factory;
    wbnb = await WBNB.deploy();
    await wbnb.deployed();

    const PancakeRouter = (await ethers.getContractFactory("PancakeRouterV2", deployer)) as PancakeRouterV2__factory;
    pcsRouter = await PancakeRouter.deploy(pcsFactory.address, wbnb.address);
    await pcsRouter.deployed();

    // Setting up liquidity
    await ALPACA.approve(pcsRouter.address, ethers.constants.MaxUint256);
    await MockBUSD.approve(pcsRouter.address, ethers.constants.MaxUint256);
    await RewardToken1.approve(pcsRouter.address, ethers.constants.MaxUint256);
    await RewardToken2.approve(pcsRouter.address, ethers.constants.MaxUint256);

    // WBNB-MBUSD liquidity 1000 WBNB - 100000 MBUSD
    await pcsRouter.addLiquidityETH(
      MockBUSD.address,
      ethers.utils.parseEther("100000"),
      "0",
      "0",
      await deployer.getAddress(),
      FOREVER,
      {value: ethers.utils.parseEther("1000")}
    );

    // Alpaca-MBUSD liquidity 1000 Alpaca - 1000 MBUSD
    await pcsRouter.addLiquidity(
      ALPACA.address,
      MockBUSD.address,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("100"),
      "0",
      "0",
      await deployer.getAddress(),
      FOREVER
    );

    // RewardToken1-MBUSD liquidity 100 RewardToken1 - 1000 MBUSD
    await pcsRouter.addLiquidity(
      RewardToken1.address,
      MockBUSD.address,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("1000"),
      "0",
      "0",
      await deployer.getAddress(),
      FOREVER
    );

    // RewardToken1-WBNB liquidity 100 RewardToken2 - 10 WBNB
    await pcsRouter.addLiquidityETH(
      RewardToken2.address,
      ethers.utils.parseEther("100"),
      "0",
      "0",
      await deployer.getAddress(),
      FOREVER,
      {value: ethers.utils.parseEther("10")}
    );

    // deploy GrassMaxi
    const GrassMaxi = (await ethers.getContractFactory("GrassMaxi", deployer)) as GrassMaxi__factory;
    grassMaxi = (await upgrades.deployProxy(GrassMaxi, [
      mxALPACA.address,
      xALPACA.address,
      ALPACA.address,
      pcsRouter.address,
      TREASURE_BPS
    ])) as GrassMaxi;
    await grassMaxi.deployed();
    // set grassMaxi as mxALPACA operator
    await mxALPACA.setOKOperator(grassMaxi.address, true);
    // white list grassmaxi
    await xALPACA.setWhitelistCaller(grassMaxi.address, true);
    // Assign contract signer
    ALPACAasAlice = BEP20__factory.connect(ALPACA.address, alice);
    ALPACAasBob = BEP20__factory.connect(ALPACA.address, bob);
    ALPACAasEve = BEP20__factory.connect(ALPACA.address, eve);

    RT1asAlice = BEP20__factory.connect(RewardToken1.address, alice);
    RT1asBob = BEP20__factory.connect(RewardToken1.address, bob);
    RT1asEve = BEP20__factory.connect(RewardToken1.address, eve);

    RT2asAlice = BEP20__factory.connect(RewardToken2.address, alice);
    RT2asBob = BEP20__factory.connect(RewardToken2.address, bob);
    RT2asEve = BEP20__factory.connect(RewardToken2.address, eve);

    xALPACAasAlice = MockxALPACA__factory.connect(xALPACA.address, alice);
    xALPACAasBob = MockxALPACA__factory.connect(xALPACA.address, bob);
    xALPACAasEve = MockxALPACA__factory.connect(xALPACA.address, eve);

    grassHouseAsAlice = MockGrassHouse__factory.connect(grassHouse1.address, alice);
    grassHouseAsBob = MockGrassHouse__factory.connect(grassHouse1.address, bob);
    grassHouseAsEve = MockGrassHouse__factory.connect(grassHouse1.address, eve);
    grassMaxiasAlice = GrassMaxi__factory.connect(grassMaxi.address, alice);
    grassMaxiasBob = GrassMaxi__factory.connect(grassMaxi.address, bob);
    grassMaxiasEve = GrassMaxi__factory.connect(grassMaxi.address, eve);
  }

  beforeEach(async () => {
    await waffle.loadFixture(fixture);
  });
  describe("#initialized", async () => {
    it("should initialized correctly", async () => {
      expect(await grassMaxi.xALPACA()).to.be.eq(xALPACA.address);
      expect(await grassMaxi.ALPACA()).to.be.eq(ALPACA.address);
      expect(await grassMaxi.totalLockedAmount()).to.be.eq(0);
    });
  });
  describe("#createLock", async () => {
    it('should create lock correctly', async () => {
      await ALPACA.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxi.createLock();
      expect(await grassMaxi.totalLockedAmount()).to.gt(0);
      await expect(grassMaxi.createLock()).to.be.revertedWith("already has a lock")
    });
  })
  describe("#deposit", async () => {
    it('should have correct mxAlpaca balance for alice and bob after depositing', async () => {
      const aliceAmount = parseEther("10");
      const bobAmount = parseEther("20");
      await ALPACAasAlice.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await expect(grassMaxiasAlice.deposit(aliceAmount)).to.be.revertedWith("lock not created yet");
      await ALPACA.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxi.createLock();
      await grassMaxiasAlice.deposit(aliceAmount);
      expect(await mxALPACA.balanceOf(aliceAddress)).to.be.eq(aliceAmount);
      await ALPACAasBob.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxiasBob.deposit(bobAmount);
      expect(await mxALPACA.balanceOf(bobAddress)).to.be.eq(bobAmount);
    });
  })
  describe("#widthdraw - simple", async () => {
    it('should withdraw same amount if no reinvest', async () => {
      const aliceAmount = parseEther("10");
      const bobAmount = parseEther("20");
      const eveAmount = parseEther("30");

      // Move blocktimestamp to W1 (Assuming W1 is next week)
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(1).mul(WEEK));
      await xALPACA.checkpoint();

      // deployer create lock
      await ALPACA.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxi.createLock();
      // alice deposit
      await ALPACAasAlice.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxiasAlice.deposit(aliceAmount);
      // bob deposit
      await ALPACAasBob.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxiasBob.deposit(bobAmount);

      // Move timestamp to W4
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(4).mul(WEEK));
      // eva deposit
      await ALPACAasEve.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxiasEve.deposit(eveAmount);

      // withdraw before lock expires
      await expect(grassMaxiasAlice.withdraw()).to.be.revertedWith("!lock expired");

      // Move timestamp to W53, expires lock
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(49).mul(WEEK));

      // alice withdraw
      const aliceBalanceBefore = await ALPACA.balanceOf(aliceAddress);
      await grassMaxiasAlice.withdraw();
      const aliceBalanceAfter = await ALPACA.balanceOf(aliceAddress);
      expect(aliceBalanceAfter.sub(aliceBalanceBefore)).to.be.gte(aliceAmount);

      // bob withdraw
      const bobBalanceBefore = await ALPACA.balanceOf(bobAddress);
      await grassMaxiasBob.withdraw();
      const bobBalanceAfter = await ALPACA.balanceOf(bobAddress);
      expect(bobBalanceAfter.sub(bobBalanceBefore)).to.be.gte(bobAmount);

      // eva withdraw
      const eveBalanceBefore = await ALPACA.balanceOf(eveAddress);
      await grassMaxiasEve.withdraw();
      const eveBalanceAfter = await ALPACA.balanceOf(eveAddress);
      expect(eveBalanceAfter.sub(eveBalanceBefore)).to.be.gte(eveAmount);

    });
  })
  describe("#claimAndReinvest", async () => {
    it('should increase totalLocked when successful reinvest', async () => {
      // Steps:
      // 1. Deployer call checkpointToken to move lastTokenTimestamp to W1.
      // 2. Alice lock ALPACA at [W1 + 1 day]
      // 3. Move timestamp to W2
      // 4. Deployer call checkpoint to move lastTokenTimestamp to W2 to allocate rewards to W2 only
      // Then deployer transfer rewards directly to MockGrassHouse and call checkpoint to perform the actual reward allocation.
      // At this point user can call checkpointToken, hence Deployer enable canCheckpointToken
      // 5. Move timestamp to W3
      // 6. Alice should get rewards on W2-W3 window at W3 as she locked ALPACA at W1 + seconds
      // Timeline:
      //                           3             5
      //             1 2           4             6
      // ─ ─ ─ ─ ─ ─ + ─ ─ ─ ─ ─ ─ + ─ ─ ─ ─ ─ ─ + ─ ─ ─ ─ ─ ─ ▶ Time (DAY)
      //             W1            W2            W3

      // Preparation
      const stages: any = {};
      const feedAmountRT1 = ethers.utils.parseEther("10");
      const feedAmountRT2 = ethers.utils.parseEther("20");
      const feedAmountAlpaca = ethers.utils.parseEther("100");
      const lockAlpacaAmount = parseEther("10000");
      const INIT_AMOUNT = "1";
      const GS1Path = [RewardToken1.address, MockBUSD.address, ALPACA.address];
      const GS2Path = [RewardToken2.address, wbnb.address, MockBUSD.address, ALPACA.address];
      const GS3Path: string[] = []; // grassHouse3 is alpaca reward, the path is useless;
      // Move blocktimestamp to W1 (Assuming W1 is next week)
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(1).mul(WEEK));

      // 1. Deployer call checkpointToken to move lastTokenTimestamp to W1.
      await grassHouse1.checkpointToken();
      await grassHouse2.checkpointToken();
      await grassHouse3.checkpointToken();

      // 2. Deployer create lock, alice and bob deposit at [W1 + 1 day]
      await timeHelpers.increaseTimestamp(DAY);

      await ALPACA.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxi.createLock();

      await ALPACAasAlice.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxiasAlice.deposit(lockAlpacaAmount);

      await ALPACAasBob.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxiasBob.deposit(lockAlpacaAmount);

      const W1LockedAmount = lockAlpacaAmount.add(lockAlpacaAmount).add(INIT_AMOUNT);
      expect(await grassMaxi.totalLockedAmount()).to.be.eq(W1LockedAmount);

      // 3. Move timestamp to W2
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(1).mul(WEEK));

      await grassHouse1.setCanCheckpointToken(true);
      await grassHouse2.setCanCheckpointToken(true);
      await grassHouse3.setCanCheckpointToken(true);

      // 4. setup grassHouse1
      await RewardToken1.approve(grassHouse1.address, ethers.constants.MaxUint256);
      await grassHouse1.feed(feedAmountRT1);

      // 5. Move timestamp to W3
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(1).mul(WEEK));

      // 6. grassMaxi should get rewards on W2-W3 window at W3 as it locked ALPACA at W1 + seconds
      await grassHouse1.checkpointTotalSupply();
      await grassMaxi.claimAndReinvest([grassHouse1.address], [GS1Path]);
      const W3LockedAmount = await grassMaxi.totalLockedAmount();
      const W3Earned = W3LockedAmount.sub(W1LockedAmount);
      expect(W3Earned).to.be.gt(0);
      expect(await grassMaxi.bountyAmount()).to.be.gt(0)

      // 7. setup grassHouse2
      await RewardToken2.approve(grassHouse2.address, ethers.constants.MaxUint256);
      await grassHouse2.feed(feedAmountRT2);

      // 8. Move timestamp to W4, W4 earned should be larger than W3 earned since grassHouse2 have added
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(1).mul(WEEK));
      await grassHouse1.checkpointTotalSupply();
      await grassHouse2.checkpointTotalSupply();
      await grassMaxi.claimAndReinvest([grassHouse1.address, grassHouse2.address], [GS1Path, GS2Path]);
      const W4LockedAmount = await grassMaxi.totalLockedAmount();
      const W4Earned = W4LockedAmount.sub(W3LockedAmount);
      expect(W4Earned).to.be.gt(W3Earned);

      // 8.1 eve locks alpaca
      await ALPACAasEve.approve(grassMaxi.address, ethers.constants.MaxUint256);
      await grassMaxiasEve.deposit(lockAlpacaAmount);

      // 9. setup grassHouse3
      await ALPACA.approve(grassHouse3.address, ethers.constants.MaxUint256);
      await grassHouse3.feed(feedAmountAlpaca);

      // 10. Move timestamp to W5, W5 earned should be larger than W4 earned since grassHouse3 have added
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(1).mul(WEEK));
      await grassHouse1.checkpointTotalSupply();
      await grassHouse2.checkpointTotalSupply();
      await grassHouse2.checkpointTotalSupply();
      await grassMaxi.claimAndReinvest([grassHouse1.address, grassHouse2.address, grassHouse3.address], [GS1Path, GS2Path, GS3Path]);
      const W5LockedAmount = await grassMaxi.totalLockedAmount();
      const W5Earned = W5LockedAmount.sub(W4LockedAmount);
      expect(W5Earned).to.be.gt(W4Earned);


      // Move timestamp to W53, expires lock
      await timeHelpers.setTimestamp((await timeHelpers.latestTimestamp()).div(WEEK).add(49).mul(WEEK));
      // alice withdraw
      const aliceBalanceBefore = await ALPACA.balanceOf(aliceAddress);
      await grassMaxiasAlice.withdraw();
      const aliceBalanceAfter = await ALPACA.balanceOf(aliceAddress);
      const aliceEarned = aliceBalanceAfter.sub(aliceBalanceBefore)

      expect(aliceEarned).to.be.gt(lockAlpacaAmount);

      // bob withdraw
      const bobBalanceBefore = await ALPACA.balanceOf(bobAddress);
      await grassMaxiasBob.withdraw();
      const bobBalanceAfter = await ALPACA.balanceOf(bobAddress);

      // bob amount should eq alice's
      const bobEarned = bobBalanceAfter.sub(bobBalanceBefore);
      expect(bobEarned).to.be.eq(aliceEarned);

      // eva withdraw
      const eveBalanceBefore = await ALPACA.balanceOf(eveAddress);
      await grassMaxiasEve.withdraw();
      const eveBalanceAfter = await ALPACA.balanceOf(eveAddress);
      const eveEarned = eveBalanceAfter.sub(eveBalanceBefore);
      // eve amount should < alice since eva locked later
      expect(eveEarned).to.be.gt(lockAlpacaAmount);
      expect(eveEarned).to.be.lt(aliceEarned);

      // bounty
      const bounty = await grassMaxi.bountyAmount();
      console.log("bounty: ", formatEther(bounty));
      expect(bounty).to.be.gt(0);
    });
  })

})