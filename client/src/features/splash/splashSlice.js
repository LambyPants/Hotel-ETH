import {
  createSlice,
  current,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { connectWallet, setContractABI } from './splashAPI';

export const fetchUserBalance = createAsyncThunk(
  'splash/fetchUserBalance',
  async (address, thunkAPI) => {
    console.log('address: ', address);
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const data = (await contractABI.getTokenBalance(address)).toNumber();
      console.log('data: ', data);
      return data;
    } catch (err) {
      console.log({ err });
    }
  },
);

export const connectEthereum = createAsyncThunk(
  'splash/connectEthereum',
  async (arg, thunkAPI) => {
    console.log('thunkAPI: ', thunkAPI);
    const address = await connectWallet();
    thunkAPI.dispatch(fetchUserBalance(address));
    return address;
  },
);

const initialState = {
  showCalendar: false,
  userAddress: '',
  hotelAPI: {},
  provider: null,
  userBalance: 0,
};
export const splashSlice = createSlice({
  name: 'splash',
  initialState,
  reducers: {
    toggleCalendar(state, action) {
      const showCalendar = action.payload;
      return { ...state, showCalendar };
    },
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(connectEthereum.fulfilled, (state, action) => {
      const userAddress = action.payload;
      console.log(action.payload);
      return { ...state, userAddress, showCalendar: true };
    });
    builder.addCase(fetchUserBalance.fulfilled, (state, action) => {
      const userBalance = action.payload;
      console.log(userBalance);
      return { ...state, userBalance };
    });
  },
});

export const { toggleCalendar, resetState } = splashSlice.actions;

export const hasEthereum = () => window.ethereum;
export const selectShowCalendar = (state) => state.splash.showCalendar;
export const selectUserAddress = (state) => state.splash.userAddress;
export const selectUserBalance = (state) => state.splash.userBalance;
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
