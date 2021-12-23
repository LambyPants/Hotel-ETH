import {
  createSlice,
  current,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { selectHotelABI } from '../splash/splashSlice';
// import { connectWallet, setContractABI } from './calendarAPI';

export const getMonthlyAvailability = createAsyncThunk(
  'calendar/getMonthlyAvailability',
  async ({ month, year }, thunkAPI) => {
    try {
      const contractABI = selectHotelABI(thunkAPI.getState());
      console.log('contractABI: ', contractABI);
      const data = await contractABI.getMonthlyAvailability(month, year);
      console.log('data: ', data);
      return data;
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
    builder.addCase(getMonthlyAvailability.fulfilled, (state, action) => {
      const events = action.payload;
      console.log(action.payload);
      return { ...state, events };
    });
  },
});

// export const { toggleCalendar, resetState } = bookingCalendar.actions;

export const selectMonthlySchedule = (state) => state.calendar.events;

export default bookingCalendar.reducer;
