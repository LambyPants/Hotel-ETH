import React from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';
import { Splash } from './features/splash/Splash';
import { BookingCalendar } from './features/bookingCalendar/BookingCalendar';
import { UseToken } from './features/useTokens/UseToken';
import { DappWrapper } from './features/dappWrapper/DappWrapper';

function App() {
  return (
    <div className="App">
      <DappWrapper>
        <Splash />
        <BookingCalendar />
        <UseToken />
      </DappWrapper>
    </div>
  );
}

export default App;
