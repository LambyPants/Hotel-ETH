const fs = require('fs');

const SUPPORTED_NETWORKS = ['localhost', 'kovan', 'rinkeby'];
const contractsDir = __dirname + '/../client/src/contracts';

async function main() {
  SUPPORTED_NETWORKS.forEach((name) => {
    console.log('name: ', name);
    try {
      const path = contractsDir + `/${name}-address.json`;
      if (!fs.existsSync(path)) {
        console.log('Creating empty imports for ', name);
        fs.writeFileSync(
          contractsDir + `/${name}-address.json`,
          JSON.stringify({ Hotel: '' }, undefined, 2),
        );
      }
    } catch {
      console.log(
        `failed to populate - does your project contain ${contractsDir}?`,
      );
    }
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
