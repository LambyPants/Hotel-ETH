import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { selectHotelABI, selectUserAddress } from '../splash/splashSlice';

function _incrementTime(t, i) {
  return (
    Number(new Date(t * 1000 + i * (86400 * 1000))) +
    Number(new Date(t).getTimezoneOffset()) * 60 * 1000
  );
}

function _calcBN(hex) {
  return ethers.BigNumber.from(hex).toNumber();
}

export const getRangeAvailability = createAsyncThunk(
  'calendar/getRangeAvailability',
  async ({ timestamp, numDays }, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const userAddress = selectUserAddress(thunkAPI.getState());
      const data = await contractABI.getRangeAvailability(
        timestamp,
        Number(numDays),
      );
      const obj = {};
      let eventStartIndex = 0;
      let eventNumTicker = 0;
      data.forEach((address, index) => {
        if (!address.startsWith('0x00')) {
          if (
            obj[`${address}-${eventStartIndex}`] &&
            index === eventStartIndex + eventNumTicker + 1
          ) {
            obj[`${address}-${eventStartIndex}`].end = _incrementTime(
              timestamp,
              index + 1,
            );
            eventNumTicker++;
          } else {
            eventStartIndex = index;
            eventNumTicker = 0;
            obj[`${address}-${index}`] = {
              title:
                userAddress.toLowerCase() === address.toLowerCase()
                  ? 'Your Booking'
                  : 'Occupied',
              allDay: true,
              start: _incrementTime(timestamp, index),
              end: _incrementTime(timestamp, index),
            };
          }
        }
      });
      return {
        events: Object.keys(obj).map((key) => obj[key]),
        prevCallData: { timestamp, numDays },
      };
    } catch (err) {
      console.log({ err });
      return {
        events: [],
        prevCallData: { timestamp, numDays },
      };
    }
  },
);

export const fetchUserBookings = createAsyncThunk(
  'calendar/getUserBookings',
  async (userAddress, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const data = await contractABI.getAppointmentsByUser(userAddress);
      return data.flatMap((data) => ({
        checkIn: _incrementTime(_calcBN(data[0]), 0),
        checkOut: _incrementTime(_calcBN(data[0]), 1),
        numDays: _calcBN(data[1]),
      }));
    } catch (err) {
      console.log({ err });
      return [];
    }
  },
);

const initialState = {
  events: [],
  userBookings: [],
  showUserBookings: false,
  prevCallData: { timestamp: 0, numDays: 0 },
};
export const bookingCalendar = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    toggleUserBookings(state, action) {
      const showUserBookings = action.payload;
      return { ...state, showUserBookings };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRangeAvailability.fulfilled, (state, action) => {
      const { events, prevCallData } = action.payload;
      return { ...state, events, prevCallData };
    });
    builder.addCase(fetchUserBookings.fulfilled, (state, action) => {
      const userBookings = action.payload;
      return { ...state, userBookings };
    });
  },
});

export const { toggleUserBookings } = bookingCalendar.actions;
export const selectMonthlySchedule = (state) => state.calendar.events;
export const selectUserBookings = (state) => state.calendar.userBookings;
export const selectPrevCallData = (state) => state.calendar.prevCallData;
export const selectShowUserBookings = (state) =>
  state.calendar.showUserBookings;

export default bookingCalendar.reducer;
