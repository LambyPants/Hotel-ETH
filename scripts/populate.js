const fs = require('fs');

const SUPPORTED_NETWORKS = ['localhost', 'sepolia'];
const contractsDir = __dirname + '/../client/src/contracts';

async function main() {
  SUPPORTED_NETWORKS.forEach((name) => {
    console.log('name: ', name);
    try {
      const path = `${contractsDir}/${name}-address.json`;
      if (!fs.existsSync(path)) {
        console.log('Creating empty imports for ', name);
        fs.writeFileSync(path, JSON.stringify({ Hotel: '' }, undefined, 2));
      }
    } catch {
      console.log(
        `failed to populate - does your project contain ${contractsDir}?`,
      );
    }
  });
  const keysPath = `${__dirname}/../keys.js`;
  if (!fs.existsSync(`${__dirname}/../keys.js`)) {
    console.log('Generating a placeholder keys file', keysPath);
    const code = `module.exports = { DEPLOY_PRIVATE_KEY: '0000000000000000000000000000000000000000000000000000000000000000', ALCHEMY_API_KEY_SEPOLIA: '', ALCHEMY_API_KEY_LINEA_SEPOLIA: ''};`;
    fs.writeFileSync(keysPath, code);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
