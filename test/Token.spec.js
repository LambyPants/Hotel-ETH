const { expect } = require('chai');

describe('Token contract', function () {
  let Token;
  let hotelToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory('BookingToken');
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hotelToken = await Token.deploy(owner.address);
    await hotelToken.deployed();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await hotelToken.owner()).to.equal(owner.address);
    });
    it('Should return 0 decimals', async function () {
      expect(await hotelToken.decimals()).to.equal(0);
    });
  });

  describe('Transactions', function () {
    it('mint works as expected', async function () {
      expect(await hotelToken.balanceOf(addr1.address)).to.equal(0);
      // should fail
      await expect(
        hotelToken.connect(addr2).mint(addr1.address, 10),
      ).to.be.revertedWith('owner restricted funtionality');
      // should pass
      await hotelToken.mint(addr1.address, 10);
      expect(await hotelToken.balanceOf(addr1.address)).to.equal(10);
    });

    it('burn works as expected', async function () {
      await hotelToken.mint(addr2.address, 10);
      expect(await hotelToken.balanceOf(addr2.address)).to.deep.equal(10);
      // should fail
      await expect(
        hotelToken.connect(addr2).burn(addr2.address, 10),
      ).to.be.revertedWith('owner restricted funtionality');
      // should pass
      await hotelToken.burn(addr2.address, 10);
      expect(await hotelToken.balanceOf(addr2.address)).to.equal(0);
    });

    it('passOwnerRole works as expected', async function () {
      // should fail
      await expect(
        hotelToken.connect(addr2).passMinterRole(addr1.address),
      ).to.be.revertedWith('owner restricted funtionality');
      // should pass
      const asyncWrapper = () =>
        new Promise(async (resolve) => {
          hotelToken.on('OwnerChanged', (oldOwner, newOwner) => {
            expect(oldOwner).to.equal(owner.address);
            expect(newOwner).to.equal(addr1.address);
            hotelToken.removeAllListeners();
            resolve(true);
          });
          await hotelToken.passMinterRole(addr1.address);
          expect(await hotelToken.owner()).to.equal(addr1.address);
        });

      await asyncWrapper();
    });
  });
});
