import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './BookingCalendar.module.css';
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

export function BookingCalendar() {
  // if (window.ethereum === undefined) {
  //   return <NoWalletDetected />;
  // }
  return (
    <div className={styles.Calendar}>
      {/* <Calendar
        views={['month', 'week']}
        localizer={localizer}
        events={[
          {
            id: 0,
            title: 'Occupied',
            allDay: true,
            start: new Date(),
            end: Number(new Date()) + 86400 * 1000,
          },
        ]}
        dayPropGetter={showDayAccessible}
        startAccessor="start"
        endAccessor="end"
        timeslots={1}
        onSelectSlot={handleSelect}
      /> */}
    </div>
  );
}
