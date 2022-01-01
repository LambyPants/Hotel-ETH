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
  fetchUserBookings,
} from '../bookingCalendar/bookingCalendarSlice';

// to allow metamask to handle insufficient funds
// 1500000 was the old ethers.js default
const GAS_LIMIT = 1500000;

const _refreshUserBalance = (thunkAPI) => {
  // fetch the users balance upon successful purchase of tokens
  const userAddress = selectUserAddress(thunkAPI.getState());
  thunkAPI.dispatch(fetchUserBalance(userAddress));
};

const _refreshUserBookings = (thunkAPI) => {
  // fetch the users balance upon successful purchase of tokens
  const userAddress = selectUserAddress(thunkAPI.getState());
  thunkAPI.dispatch(fetchUserBookings(userAddress));
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
      const usdPrice = (await contractABI.bookingTokenPrice()).toNumber();
      const ethPrice = ethers.utils.formatEther(
        await contractABI.getEthPriceForTokens(1),
      );
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
      // grab it again for better accuracy
      const currEthPrice = await contractABI.getEthPriceForTokens(num);
      const tx = await contractABI.buyTokens(num, {
        value: currEthPrice,
        gasLimit: GAS_LIMIT,
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
      const tx = await contractABI.bookAppointment(name, timestamp, numDays, {
        gasLimit: GAS_LIMIT,
      });
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

export const refundTokens = createAsyncThunk(
  'token/refundTokens',
  async (deleteIndex, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const tx = await contractABI.refundAppointment(deleteIndex, {
        gasLimit: GAS_LIMIT,
      });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
      _refreshUserBalance(thunkAPI);
      _refreshUserBookings(thunkAPI);
      return true;
    } catch (err) {
      console.log({ err });
      return false;
    }
  },
);

const initialState = {
  showModal: false,
  showSpendTokens: false,
  tokenLoading: false,
  overlapCheckLoading: false,
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
    builder.addCase(checkTokenRange.pending, (state) => {
      return { ...state, overlapCheckLoading: true };
    });
    builder.addCase(checkTokenRange.fulfilled, (state) => {
      return { ...state, overlapCheckLoading: false };
    });
    builder.addCase(getBookingTokenPrice.fulfilled, (state, action) => {
      const tokenPrice = action.payload;
      return { ...state, tokenPrice };
    });

    builder.addMatcher(
      isAnyOf(buyNumTokens.pending, redeemTokens.pending, refundTokens.pending),
      (state) => {
        return { ...state, tokenLoading: true };
      },
    );
    builder.addMatcher(
      isAnyOf(
        buyNumTokens.fulfilled,
        redeemTokens.fulfilled,
        refundTokens.fulfilled,
      ),
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
export const selectOverlapCheckLoading = (state) =>
  state.token.overlapCheckLoading;

export default useTokenSlice.reducer;
