import { ethers } from 'ethers';
import {
  createSlice,
  current,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { selectHotelABI } from '../splash/splashSlice';

export const getBookingTokenPrice = createAsyncThunk(
  'token/getBookingPrice',
  async (arg, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const usdPrice = (await contractABI.bookingTokenPrice()).toNumber();
      const ethPrice = ethers.utils.formatEther(
        await contractABI.getEthPriceForTokens(1),
      );
      return { usdPrice, ethPrice };
    } catch (err) {
      console.log({ err });
      return 0;
    }
  },
);

export const buyNumTokens = createAsyncThunk(
  'token/buyNumTokens',
  async (num, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const tx = await contractABI.buyTokens(num, {
        value: ethers.utils.parseEther('1.0'),
      });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
      return true;
    } catch (err) {
      console.log({ err });
    }
  },
);

export const redeemTokens = createAsyncThunk(
  'token/redeemTokens',
  async ({ name, timestamp, numDays, testTransaction }, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const methodToCall = testTransaction
        ? contractABI.callStatic.bookAppointment
        : contractABI.bookAppointment;

      const tx = await methodToCall(name, timestamp, numDays);
      console.log({ tx });
      const receipt = await tx.wait();
      console.log('receipt: ', receipt);
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
      return true;
    } catch (err) {
      console.log({ err });
      return false;
    }
  },
);

export const verifyBooking = createAsyncThunk(
  'token/buyNumTokens',
  async (num, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const tx = await contractABI.buyTokens(num, {
        value: ethers.utils.parseEther('1.0'),
      });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
      return true;
    } catch (err) {
      console.log({ err });
    }
  },
);

const initialState = {
  showModal: false,
  showSpendTokens: false,
  tokenPrice: { usdPrice: 0, ethPrice: 0 },
};
export const useTokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    toggleModal(state, action) {
      const showModal = action.payload;
      return { ...state, showModal, showSpendTokens: false };
    },
    toggleSpendTokens(state, action) {
      const showSpendTokens = action.payload;
      return { ...state, showSpendTokens, showModal: showSpendTokens };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getBookingTokenPrice.fulfilled, (state, action) => {
      const tokenPrice = action.payload;
      console.log(action.payload);
      return { ...state, tokenPrice };
    });
  },
});

export const { toggleModal, toggleSpendTokens } = useTokenSlice.actions;

export const selectShowModal = (state) => state.token.showModal;
export const selectShowSpendTokens = (state) => state.token.showSpendTokens;
export const selectTokenPriceUSD = (state) => state.token.tokenPrice.usdPrice;
export const selectTokenPriceEth = (state) => state.token.tokenPrice.ethPrice;

export default useTokenSlice.reducer;
