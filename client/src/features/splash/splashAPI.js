import { ethers } from 'ethers';
import HotelArtifact from '../../contracts/Hotel.json';
import contractAddress from '../../contracts/contract-address.json';

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
      contractAddress.Hotel,
      HotelArtifact.abi,
      provider.getSigner(0),
    ),
    provider,
  };
}
