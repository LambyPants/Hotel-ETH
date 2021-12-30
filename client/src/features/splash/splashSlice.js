import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { connectWallet, setContractABI } from './splashAPI';

export const fetchUserBalance = createAsyncThunk(
  'splash/fetchUserBalance',
  async (address, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const data = (await contractABI.getTokenBalance(address)).toNumber();
      return data;
    } catch (err) {
      console.log({ err });
    }
  },
);

export const connectEthereum = createAsyncThunk(
  'splash/connectEthereum',
  async (data, thunkAPI) => {
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
      return { ...state, userAddress, showCalendar: true };
    });
    builder.addCase(fetchUserBalance.fulfilled, (state, action) => {
      const userBalance = action.payload;
      return { ...state, userBalance };
    });
  },
});

export const { toggleCalendar, resetState } = splashSlice.actions;

export const hasEthereum = () => window.ethereum;
export const selectShowCalendar = (state) => state.splash.showCalendar;
export const selectUserAddress = (state) => state.splash.userAddress;
export const selectUserBalance = (state) => state.splash.userBalance || 0;
export const selectContractAndProvider = createSelector([hasEthereum], (eth) =>
  eth ? setContractABI() : {},
);
export const selectHotelABI = createSelector(
  [selectContractAndProvider],
  ({ contract }) => contract,
);
export const selectProvider = createSelector(
  [selectContractAndProvider],
  ({ provider }) => provider,
);

export default splashSlice.reducer;
