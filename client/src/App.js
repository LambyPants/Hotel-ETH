import React from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';
import { Splash } from './features/splash/Splash';
import { BookingCalendar } from './features/bookingCalendar/BookingCalendar';
import { UseToken } from './features/useTokens/UseToken';

function App() {
  // if (window.ethereum === undefined) {
  //   return <NoWalletDetected />;
  // }
  return (
    <div className="App">
      <Splash />
      <BookingCalendar />
      <UseToken />
    </div>
  );
}

export default App;
