import { ethers } from 'ethers';
import HotelArtifact from '../../contracts/Hotel.json';
import contractAddress from '../../contracts/contract-address.json';

export async function connectWallet(thunkAPI) {
  const [address] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  return address;
}

export const fetchUser = (foo) => {
  console.log('foo: ', foo);
  // console.log('dispatch: ', dispatch);
  // dispatch({ type: 'splash/connectEthereum', payload: {} });
};

export function setContractABI() {
  // We first initialize ethers by creating a provider using window.ethereum
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // When, we initialize the contract using that provider and the token's
  // artifact. You can do this same thing with your contracts.
  return new ethers.Contract(
    contractAddress.Hotel,
    HotelArtifact.abi,
    provider.getSigner(0),
  );
}
