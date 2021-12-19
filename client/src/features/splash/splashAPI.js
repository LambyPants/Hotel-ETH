import { ethers } from 'ethers';
import HotelArtifact from '../../contracts/Hotel.json';
import contractAddress from '../../contracts/contract-address.json';

export async function connectWallet() {
  const [address] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  return address;

  // Once we have the address, we can initialize the application.

  // First we check the network
  //   if (!this._checkNetwork()) {
  //     return;
  //   }

  //   this._initialize(selectedAddress);

  //   // We reinitialize it whenever the user changes their account.
  //   window.ethereum.on('accountsChanged', ([newAddress]) => {
  //     this._stopPollingData();
  //     // `accountsChanged` event can be triggered with an undefined newAddress.
  //     // This happens when the user removes the Dapp from the "Connected
  //     // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
  //     // To avoid errors, we reset the dapp state
  //     if (newAddress === undefined) {
  //       return this._resetState();
  //     }

  //     this._initialize(newAddress);
  //   });

  //   // We reset the dapp state if the network is changed
  //   window.ethereum.on('networkChanged', ([networkId]) => {
  //     this._stopPollingData();
  //     this._resetState();
  //   });
}

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

function _initialize(userAddress) {
  // This method initializes the dapp
  // Then, we initialize ethers, fetch the token's data, and start polling
  // for the user's balance.
  // Fetching the token data and the user's balance are specific to this
  // sample project, but you can reuse the same initialization pattern.
  //   this._intializeEthers();
  //   this._getTokenData();
  //   this._startPollingData();
}
