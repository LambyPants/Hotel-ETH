import { ethers } from 'ethers';
import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import {
  fetchUserBalance,
  selectHotelABI,
  selectUserAddress,
} from '../splash/splashSlice';
import {
  selectPrevCallData,
  getRangeAvailability,
} from '../bookingCalendar/bookingCalendarSlice';

const _refreshUserBalance = (thunkAPI) => {
  // fetch the users balance upon successful purchase of tokens
  const userAddress = selectUserAddress(thunkAPI.getState());
  thunkAPI.dispatch(fetchUserBalance(userAddress));
};

const _refreshCalendar = (thunkAPI) => {
  // fetch the users balance upon successful purchase of tokens
  const prevCallData = selectPrevCallData(thunkAPI.getState());
  thunkAPI.dispatch(getRangeAvailability(prevCallData));
};

export const getBookingTokenPrice = createAsyncThunk(
  'token/getBookingPrice',
  async (arg, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      console.log('contractABI: ', contractABI);
      const usdPrice = (await contractABI.bookingTokenPrice()).toNumber();
      console.log('usdPrice: ', usdPrice);
      const ethPrice = ethers.utils.formatEther(
        await contractABI.getEthPriceForTokens(1),
      );
      console.log('ethPrice: ', ethPrice);
      return { usdPrice, ethPrice };
    } catch (err) {
      console.log({ err });
      return { usdPrice: 0, ethPrice: 0 };
    }
  },
);

export const buyNumTokens = createAsyncThunk(
  'token/buyNumTokens',
  async (num, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const tx = await contractABI.buyTokens(num, {
        value: ethers.utils.parseEther('10.0'),
      });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
      _refreshUserBalance(thunkAPI);
      return true;
    } catch (err) {
      console.log({ err });
    }
  },
);

export const checkTokenRange = createAsyncThunk(
  'token/checkTokenRange',
  async ({ name, timestamp, numDays }, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      await contractABI.callStatic.bookAppointment(name, timestamp, numDays);
      return true;
    } catch (err) {
      console.log({ err });
      return false;
    }
  },
);

export const redeemTokens = createAsyncThunk(
  'token/redeemTokens',
  async ({ name, timestamp, numDays }, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const tx = await contractABI.bookAppointment(name, timestamp, numDays);
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
      _refreshUserBalance(thunkAPI);
      _refreshCalendar(thunkAPI);
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
  tokenLoading: false,
  tokenPrice: { usdPrice: 0, ethPrice: 0 },
  placeholderStart: '',
  placeholderEnd: '',
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
      const { showSpendTokens, placeholderStart, placeholderEnd } =
        action.payload;
      return {
        ...state,
        showSpendTokens,
        showModal: showSpendTokens,
        placeholderStart,
        placeholderEnd,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getBookingTokenPrice.fulfilled, (state, action) => {
      const tokenPrice = action.payload;
      return { ...state, tokenPrice };
    });
    builder.addMatcher(
      isAnyOf(checkTokenRange.pending, getBookingTokenPrice.pending),
      (state) => {
        return { ...state, tokenLoading: true };
      },
    );
    builder.addMatcher(
      isAnyOf(checkTokenRange.fulfilled, getBookingTokenPrice.fulfilled),
      (state) => {
        return { ...state, tokenLoading: false };
      },
    );
  },
});

export const { toggleModal, toggleSpendTokens } = useTokenSlice.actions;

export const selectShowModal = (state) => state.token.showModal;
export const selectShowSpendTokens = (state) => state.token.showSpendTokens;
export const selectPlaceholderDates = (state) => ({
  start: state.token.placeholderStart,
  end: state.token.placeholderEnd,
});
export const selectTokenPriceUSD = (state) => state.token.tokenPrice.usdPrice;
export const selectTokenPriceEth = (state) => state.token.tokenPrice.ethPrice;
export const selectTokenLoading = (state) => state.token.tokenLoading;

export default useTokenSlice.reducer;
