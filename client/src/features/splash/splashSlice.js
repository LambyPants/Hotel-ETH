import {
  createSlice,
  current,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { connectWallet, setContractABI } from './splashAPI';

export const connectEthereum = createAsyncThunk(
  'splash/connectEthereum',
  async () => connectWallet(),
);

export const splashSlice = createSlice({
  name: 'splash',
  initialState: {
    showCalendar: false,
    userAddress: '',
    hotelAPI: {},
    provider: null,
  },
  reducers: {
    toggleCalendar(state, action) {
      const showCalendar = action.payload;
      return { ...state, showCalendar };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(connectEthereum.fulfilled, (state, action) => {
      const userAddress = action.payload;
      console.log(action.payload);
      return { ...state, userAddress, showCalendar: false };
    });
  },
});

export const { toggleCalendar } = splashSlice.actions;

export const hasEthereum = () => window.ethereum;
export const selectShowCalendar = (state) => state.splash.showCalendar;
export const selectUserAddress = (state) => state.splash.userAddress;
export const selectHotelABI = createSelector([hasEthereum], (eth) =>
  eth ? setContractABI() : {},
);

export default splashSlice.reducer;
// async function _connectWallet() {
//   // This method is run when the user clicks the Connect. It connects the
//   // dapp to the user's wallet, and initializes it.

//   // To connect to the user's wallet, we have to run this method.
//   // It returns a promise that will resolve to the user's address.
//   const [selectedAddress] = await window.ethereum.enable();

//   // Once we have the address, we can initialize the application.

//   // First we check the network
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
// }
