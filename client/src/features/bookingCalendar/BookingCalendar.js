import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Paper, Button, Fade } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TokenIcon from '@mui/icons-material/Token';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import TodayIcon from '@mui/icons-material/Today';
import moment from 'moment';
import { selectShowCalendar, selectUserAddress } from '../splash/splashSlice';
import {
  getRangeAvailability,
  selectMonthlySchedule,
  selectShowUserBookings,
  toggleUserBookings,
  selectUserBookings,
  fetchUserBookings,
} from './bookingCalendarSlice';
import { toggleModal, toggleSpendTokens } from '../useTokens/useTokenSlice';
import { useSelector, useDispatch } from 'react-redux';
import styles from './BookingCalendar.module.css';
import { UserAppointments } from './components/UserAppointments';

const localizer = momentLocalizer(moment);

function handleSelect({ start, end }, dispatch) {
  dispatch(
    toggleSpendTokens({
      showSpendTokens: true,
      placeholderStart: start.toISOString().slice(0, 10),
      placeholderEnd: end.toISOString().slice(0, 10),
    }),
  );
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

function fetchRangeData({ start, end }, dispatch) {
  const normalizedStart = new Date(start.toISOString().slice(0, 10));
  const normalizedEnd = new Date(end.toISOString().slice(0, 10));
  const numDays = (normalizedEnd - normalizedStart) / (86400 * 1000);
  console.log('numDays: ', numDays, normalizedStart);
  dispatch(
    getRangeAvailability({
      timestamp: normalizedStart / 1000,
      numDays,
    }),
  );
}

export function BookingCalendar() {
  const showCalendar = useSelector(selectShowCalendar);
  const monthlySchedule = useSelector(selectMonthlySchedule);
  const showUserBookings = useSelector(selectShowUserBookings);
  const userBookings = useSelector(selectUserBookings);
  const userAddress = useSelector(selectUserAddress);
  console.log('monthlySchedule: ', monthlySchedule);
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    if (showCalendar) {
      // react-big-calendar doesn't fire onRangeChange on mount
      // this is definitely a 'not recommended for production' hack to avoid forking their repo
      const todayButton = document.querySelector('.rbc-btn-group button');
      if (todayButton) document.querySelector('.rbc-btn-group button').click();
    }
  }, [showCalendar]);

  useEffect(() => {
    if (showUserBookings) {
      dispatch(fetchUserBookings(userAddress));
    } else {
    }
  }, [showUserBookings, dispatch, userAddress]);

  const renderSubcomponent = useCallback(() => {
    return !showUserBookings ? (
      <Calendar
        views={['month']}
        localizer={localizer}
        events={monthlySchedule}
        dayPropGetter={showDayAccessible}
        startAccessor="start"
        endAccessor="end"
        onRangeChange={(range) => {
          fetchRangeData(range, dispatch);
        }}
        timeslots={1}
        selectable={true}
        onSelectSlot={(data) => {
          console.log('data: ', data);
          handleSelect(data, dispatch);
        }}
      />
    ) : (
      <Fade in={showUserBookings}>
        <div className={styles.table}>
          <UserAppointments userBookings={userBookings} />,
        </div>
      </Fade>
    );
  }, [dispatch, monthlySchedule, showUserBookings, userBookings]);

  if (!showCalendar) {
    return '';
  }

  return (
    <Paper className={styles.Calendar} elevation={3}>
      <div className={styles.book}>
        <Button
          variant="extended"
          color="secondary"
          aria-label="Back"
          onClick={() => dispatch(toggleUserBookings(!showUserBookings))}
        >
          <span className={styles.flex} hidden={showUserBookings}>
            <TodayIcon /> Back to Calendar
          </span>
          <span className={styles.flex} hidden={!showUserBookings}>
            <RoomServiceIcon />
            Your Reservations
          </span>
        </Button>
        <Button
          raised="true"
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
      {renderSubcomponent()}
    </Paper>
  );
}
