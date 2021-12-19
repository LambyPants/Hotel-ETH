import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import splashReducer from '../features/splash/splashSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    splash: splashReducer,
  },
});
