require('@nomiclabs/hardhat-waffle');
const {
  ALCHEMY_API_KEY_LINEA_SEPOLIA,
  ALCHEMY_API_KEY_SEPOLIA,
  DEPLOY_PRIVATE_KEY,
} = require('./keys');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const developmentChains = ['hardhat', 'localhost'];

// rinkeby	chainid 4
// kovan chainid 42

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  developmentChains,
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: ALCHEMY_API_KEY_SEPOLIA,
      accounts: [`${DEPLOY_PRIVATE_KEY}`],
    }
  },
};
