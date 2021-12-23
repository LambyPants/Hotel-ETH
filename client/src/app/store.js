import { configureStore } from '@reduxjs/toolkit';
import splashReducer from '../features/splash/splashSlice';
import useTokenReducer from '../features/useTokens/useTokenSlice';
import bookingCalendarReducer from '../features/bookingCalendar/bookingCalendarSlice';

export const store = configureStore({
  reducer: {
    splash: splashReducer,
    token: useTokenReducer,
    calendar: bookingCalendarReducer,
  },
});
