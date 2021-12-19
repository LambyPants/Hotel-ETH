import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Counter } from './features/counter/Counter';
import './App.css';
import { Splash } from './features/splash/Splash';
import { BookingCalendar } from './features/bookingCalendar/BookingCalendar';
const localizer = momentLocalizer(moment);

function handleSelect({ start, end }) {
  console.log('end: ', end);
  console.log('start: ', start);
  // const title = window.prompt('New Event name');
  // if (title)
  //   this.setState({
  //     events: [
  //       ...this.state.events,
  //       {
  //         start,
  //         end,
  //         title,
  //       },
  //     ],
  //   });
}

const showDayAccessible = (date) => {
  if (date < Number(new Date()) - 86400 * 1000)
    return {
      className: 'special-day',
      style: {
        border: '1px dashed gray',
      },
    };
  else return {};
};

function App() {
  // if (window.ethereum === undefined) {
  //   return <NoWalletDetected />;
  // }
  return (
    <div className="App">
      <Splash />
      <BookingCalendar />
    </div>
  );
}

export default App;
