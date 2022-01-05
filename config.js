const INITIAL_ROOM_PRICE = 100;
const PRICING_CONTRACT_ADDRESS =
  network.name === 'kovan'
    ? '0x9326BFA02ADD2366b30bacB125260Af641031331' // kovan USD/ETH
    : '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e'; // rinkeby USD/ETH

// this demo was only meant for use on rinkeby and kovan
const USE_FIXED_PRICING = !(
  network.name.includes('kovan') || network.name.includes('rinkeby')
);

module.exports = {
  INITIAL_ROOM_PRICE,
  PRICING_CONTRACT_ADDRESS,
  USE_FIXED_PRICING,
};
