import { ethers } from 'ethers';
import HotelArtifact from '../../contracts/Hotel.json';
import localAddress from '../../contracts/localhost-address.json';
import rinkebyAddress from '../../contracts/rinkeby-address.json';
import kovanAddress from '../../contracts/kovan-address.json';

function _findNetwork() {
  const chainId = Number(window.ethereum.chainId);
  switch (chainId) {
    case chainId === 4:
      return rinkebyAddress;
    case chainId === 42:
      return kovanAddress;
    default:
      return localAddress;
  }
}

export async function connectWallet(isDemoAccount) {
  const [address] = isDemoAccount
    ? ['0x0000000000000000000000000000000000000000']
    : await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
  return address;
}

export function setContractABI() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  return {
    contract: new ethers.Contract(
      _findNetwork()['Hotel'],
      HotelArtifact.abi,
      provider.getSigner(0),
    ),
    provider,
  };
}
