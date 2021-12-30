const INITIAL_ROOM_PRICE = 100;
const PRICING_CONTRACT_ADDRESS =
  network.name === 'kovan'
    ? '0x9326BFA02ADD2366b30bacB125260Af641031331' // kovan USD/ETH
    : '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e'; // rinkeby USD/ETH

// this demo was only meant for use on rinkeby and kovan
const USE_FIXED_PRICING = Boolean(
  !network.name.includes('kovan') || !network.name.includes('rinkeby'),
);

async function main() {
  console.log('Target network:', network.name);
  // This is just a convenience check
  if (network.name === 'hardhat') {
    console.warns(
      'You are trying to deploy a contract to the Hardhat Network, which' +
        'gets automatically created and destroyed every time. Use the Hardhat' +
        " option '--network localhost'",
    );
  }
  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    'Deploying the contracts with the account:',
    await deployer.getAddress(),
  );

  console.log('Account balance:', (await deployer.getBalance()).toString());
  console.log({
    INITIAL_ROOM_PRICE,
    PRICING_CONTRACT_ADDRESS,
    USE_FIXED_PRICING,
  });
  const Hotel = await ethers.getContractFactory('Hotel');
  // const hotel = await Hotel.deploy(
  //   INITIAL_ROOM_PRICE,
  //   PRICING_CONTRACT_ADDRESS,
  //   USE_FIXED_PRICING,
  // );
  // await hotel.deployed();

  // console.log('Hotel address:', hotel.address);

  // // We also save the contract's artifacts and address in the client directory
  // saveFrontendFiles(hotel);
}

function saveFrontendFiles(hotel) {
  const fs = require('fs');
  const contractsDir = __dirname + '/../client/src/contracts';

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${network.name}-address.json`,
    JSON.stringify({ Hotel: hotel.address }, undefined, 2),
  );
  const HotelArtifact = artifacts.readArtifactSync('Hotel');

  fs.writeFileSync(
    contractsDir + '/Hotel.json',
    JSON.stringify(HotelArtifact, null, 2),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
