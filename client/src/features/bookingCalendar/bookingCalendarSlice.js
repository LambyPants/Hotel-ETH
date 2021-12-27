import {
  createSlice,
  current,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { selectHotelABI } from '../splash/splashSlice';
// import { connectWallet, setContractABI } from './calendarAPI';

function _incrementTime(t, i) {
  return (
    Number(new Date(t * 1000 + i * (86400 * 1000))) +
    Number(new Date(t).getTimezoneOffset()) * 60 * 1000
  );
}

export const getRangeAvailability = createAsyncThunk(
  'calendar/getRangeAvailability',
  async ({ timestamp, numDays }, thunkAPI) => {
    console.log('timestamp: ', timestamp, numDays);
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      const data = await contractABI.getRangeAvailability(timestamp, numDays);
      const obj = {};
      data.forEach((rawVal, index) => {
        const num = rawVal.toNumber();
        if (num > 0) {
          if (obj[num]) {
            obj[num].end = _incrementTime(timestamp, index + 1);
          } else {
            obj[num] = {
              title: 'Occupied',
              allDay: true,
              start: _incrementTime(timestamp, index),
              end: _incrementTime(timestamp, index),
            };
          }
        }
      });
      console.log(obj);
      return Object.keys(obj).map((key) => obj[key]);
    } catch (err) {
      console.log({ err });
      return [];
    }
  },
);

const initialState = {
  events: [],
};
export const bookingCalendar = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // toggleCalendar(state, action) {
    //   const showCalendar = action.payload;
    //   return { ...state, showCalendar };
    // },
  },
  extraReducers: (builder) => {
    builder.addCase(getRangeAvailability.fulfilled, (state, action) => {
      const events = action.payload;
      return { ...state, events };
    });
  },
});

// export const { toggleCalendar, resetState } = bookingCalendar.actions;
// [
//   {
//     id: 0,
//     title: 'Occupied',
//     allDay: true,
//     start: new Date(),
//     end: Number(new Date()) + 86400 * 1000,
//   },
// ];
export const selectMonthlySchedule = (state) => state.calendar.events;

export default bookingCalendar.reducer;
