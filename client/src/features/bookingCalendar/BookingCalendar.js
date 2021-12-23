import React, { useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Paper, Button } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TokenIcon from '@mui/icons-material/Token';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import moment from 'moment';
import { selectShowCalendar } from '../splash/splashSlice';
import { getMonthlyAvailability } from './bookingCalendarSlice';
import { toggleModal } from '../useTokens/useTokenSlice';
import { useSelector, useDispatch } from 'react-redux';
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
  else
    return {
      className: 'special-day',
      style: {
        cursor: 'pointer',
      },
    };
};

function fetchRangeData(date, dispatch) {
  dispatch(
    getMonthlyAvailability({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }),
  );
}

export function BookingCalendar() {
  const showCalendar = useSelector(selectShowCalendar);
  const dispatch = useDispatch();
  useEffect(() => {
    if (showCalendar) {
      fetchRangeData(new Date(), dispatch);
    }
  }, [showCalendar, dispatch]);

  if (!showCalendar) {
    return '';
  }
  return (
    <Paper className={styles.Calendar} elevation={3}>
      {/* <Button>Your bookings</Button> */}
      <div className={styles.book}>
        <Button variant="extended" color="secondary" aria-label="add">
          <RoomServiceIcon sx={{ mr: 1 }} />
          Your Reservations
        </Button>
        <Button
          raised
          color="secondary"
          aria-label="add"
          onClick={() => {
            dispatch(toggleModal(true));
          }}
        >
          <TokenIcon sx={{ mr: 1 }} />
          Buy Tokens
        </Button>
      </div>
      <Calendar
        views={['month']}
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
        selectable={true}
        onNavigate={(arg) => {
          fetchRangeData(arg, dispatch);
        }}
        onSelectSlot={handleSelect}
      />
    </Paper>
  );
}
