const INITIAL_ROOM_PRICE = 100;
const PRICING_CONTRACT_ADDRESS ="0x694AA1769357215DE4FAC081bf1f309aDC325306" // sepolia USD/ETH

// this demo was only meant for use on rinkeby and kovan and later sepolia
const USE_FIXED_PRICING = !(
  network.name.includes('sepolia')
);

module.exports = {
  INITIAL_ROOM_PRICE,
  PRICING_CONTRACT_ADDRESS,
  USE_FIXED_PRICING,
};
