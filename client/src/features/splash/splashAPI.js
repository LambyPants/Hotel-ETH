import { ethers } from 'ethers';
import HotelArtifact from '../../contracts/Hotel.json';
import localAddress from '../../contracts/localhost-address.json';
import rinkebyAddress from '../../contracts/rinkeby-address.json';
import kovanAddress from '../../contracts/kovan-address.json';

export function findNetwork(chainId) {
  switch (chainId) {
    case 4:
      return rinkebyAddress;
    case 42:
      return kovanAddress;
    default:
      return localAddress;
  }
}

export async function connectWallet() {
  const [address] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  return address;
}

export function setContractABI() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return {
    contract: new ethers.Contract(
      findNetwork(Number(window.ethereum.chainId))['Hotel'],
      HotelArtifact.abi,
      provider.getSigner(0),
    ),
    provider,
  };
}
