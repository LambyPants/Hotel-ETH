const { expect } = require('chai');
const { ethers } = require('hardhat');
const {
  INITIAL_ROOM_PRICE,
  PRICING_CONTRACT_ADDRESS,
  USE_FIXED_PRICING,
} = require('../config');

let Hotel;
// deployed hotel contract
let dHotel;
let owner;
let addr1;
let addr2;
let addrs;
let validTimestamp;

async function performSetup() {
  Hotel = await ethers.getContractFactory('Hotel');
  dHotel = await Hotel.deploy(
    INITIAL_ROOM_PRICE,
    PRICING_CONTRACT_ADDRESS,
    USE_FIXED_PRICING,
  );
  await dHotel.deployed();
  const deployYear = new Date().getFullYear();
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

  validTimestamp = await dHotel.getUnixTimestamp(6, 22, deployYear + 1);
  expect(validTimestamp % 86400).to.equal(0);
  await dHotel.deployed();
}

describe('Hotel tests', function () {
  beforeEach(async function () {
    await performSetup();
  });

  describe('Hotel - Deployment + Ownership', function () {
    it('constructor works as intended', async function () {
      expect(await dHotel.owner()).to.equal(owner.address);
      expect(await dHotel.bookingTokenPrice()).to.equal(INITIAL_ROOM_PRICE);
    });

    it('passOwnerRole works as expected', async function () {
      // should fail
      await expect(
        dHotel.connect(addr1).passOwnerRole(addr1.address),
      ).to.be.revertedWith('owner restricted funtionality');
      // should pass
      const asyncWrapper = () =>
        new Promise(async (resolve) => {
          dHotel.on('OwnerChanged', async (oldOwner, newOwner) => {
            expect(oldOwner).to.equal(owner.address);
            expect(await dHotel.owner()).to.equal(newOwner);
            dHotel.removeAllListeners();
            resolve(true);
          });
        });
      await dHotel.passOwnerRole(addr1.address);
      await asyncWrapper();
    });

    it('changeTokenPrice works as expected', async function () {
      const newPrice = INITIAL_ROOM_PRICE - 10;
      // should fail
      await expect(
        dHotel.connect(addr1).changeTokenPrice(newPrice),
      ).to.be.revertedWith('owner restricted funtionality');
      // should pass
      const asyncWrapper = () =>
        new Promise(async (resolve) => {
          dHotel.on('TokenPriceChanged', async (oldPrice, newPrice) => {
            expect(oldPrice).to.equal(INITIAL_ROOM_PRICE);
            expect(await dHotel.bookingTokenPrice()).to.equal(newPrice);
            dHotel.removeAllListeners();
            resolve(true);
          });
        });
      await dHotel.changeTokenPrice(newPrice);
      await asyncWrapper();
    });
  });

  describe('Hotel - Buying Tokens', function () {
    it('getEthPriceForTokens works as intended', async function () {
      await expect(dHotel.getEthPriceForTokens(0)).to.be.revertedWith(
        'invalid number of tokens',
      );
      expect(
        ethers.utils.formatEther(await dHotel.getEthPriceForTokens(1)),
      ).to.equal('0.1');
      expect(
        ethers.utils.formatEther(await dHotel.getEthPriceForTokens(5)),
      ).to.equal('0.5');
    });

    it('buyTokens works as intended', async function () {
      await expect(dHotel.buyTokens(1)).to.be.revertedWith(
        'must send ether in request',
      );
      const currEthPrice = await dHotel.getEthPriceForTokens(1);
      await expect(dHotel.buyTokens(1, { value: 10 })).to.be.revertedWith(
        'not enough ether sent in request',
      );
      await dHotel.buyTokens(1, { value: currEthPrice });
      const asyncWrapper = () =>
        new Promise((resolve) => {
          dHotel.on('TokenBought', async (addr, num, price) => {
            expect(addr).to.equal(owner.address);
            expect(num).to.equal(1);
            expect(price).to.equal(await dHotel.bookingTokenPrice());
            expect(await dHotel.getTokenBalance(owner.address)).to.equal(1);
            dHotel.removeAllListeners();
            resolve();
          });
        });
      await asyncWrapper();
    });
  });

  describe('Hotel - Redeeming Tokens', function () {
    beforeEach(async function () {
      await performSetup();
      await dHotel.buyTokens(10, {
        value: '1000000000000000000',
      });
    });

    it('bookAppointment works as intended - failure from faulty params', async function () {
      await expect(dHotel.bookAppointment('', 100, 1)).to.be.revertedWith(
        'Party name cannot be blank',
      );
      await expect(dHotel.bookAppointment('foo', 100, 1)).to.be.revertedWith(
        'Cannot use any timestamp before the contract deploy timestamp',
      );
      await expect(
        dHotel.bookAppointment('foo', validTimestamp + 3, 1),
      ).to.be.revertedWith(
        'Timestamp must be mod 86400; try using getUnixTimestamp for a given month, day, year',
      );
      await expect(
        dHotel.bookAppointment('foo', validTimestamp, 100),
      ).to.be.revertedWith('ERC20: burn amount exceeds balance');
    });

    it('bookAppointment works as intended - success case', async function () {
      expect(await dHotel.getAppointmentsByUser(owner.address)).to.deep.equal(
        [],
      );
      const asyncWrapper = () =>
        new Promise(async (resolve) => {
          dHotel.on(
            'AppointmentScheduled',
            async (address, timestamp, numDays) => {
              expect(address).to.equal(owner.address);
              expect(timestamp).to.equal(validTimestamp);
              expect(numDays).to.equal(4);
              expect(await dHotel.getTokenBalance(owner.address)).to.equal(6);
              const foundApp = await dHotel.getAppointmentsByUser(
                owner.address,
              );
              expect(ethers.BigNumber.from(foundApp[0][0]).toNumber()).to.equal(
                timestamp,
              );
              expect(foundApp[0][1]).to.equal(4);
              dHotel.removeAllListeners();
              resolve(true);
            },
          );
        });
      await dHotel.bookAppointment('foo', validTimestamp, 4);
      await asyncWrapper();
    });
  });

  describe('Hotel - Refunding Tokens', function () {
    beforeEach(async function () {
      await performSetup();
      await dHotel.buyTokens(10, {
        value: '1000000000000000000',
      });
      await dHotel.bookAppointment('foo', validTimestamp, 4);
    });

    it('refundAppointment works as intended - failure from faulty params', async function () {
      await expect(dHotel.callStatic.refundAppointment(1)).to.be.reverted;
    });

    it('bookAppointment works as intended - success case', async function () {
      expect(await dHotel.getTokenBalance(owner.address)).to.equal(6);
      const asyncWrapper = () =>
        new Promise(async (resolve) => {
          dHotel.on(
            'AppointmentRefunded',
            async (address, timestamp, numDays) => {
              expect(address).to.equal(owner.address);
              expect(timestamp).to.equal(validTimestamp);
              expect(numDays).to.equal(4);
              expect(await dHotel.getTokenBalance(owner.address)).to.equal(10);
              expect(
                await dHotel.getAppointmentsByUser(owner.address),
              ).to.deep.equal([]);
              dHotel.removeAllListeners();
              resolve(true);
            },
          );
        });
      await dHotel.refundAppointment(0);
      asyncWrapper();
    });
  });
});
