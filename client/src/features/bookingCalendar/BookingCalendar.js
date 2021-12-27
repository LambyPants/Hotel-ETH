import React, { useLayoutEffect, useState } from 'react';
import { useDebounce, useDebounceCallback } from '@react-hook/debounce';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Paper, Button } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TokenIcon from '@mui/icons-material/Token';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import moment from 'moment';
import { selectShowCalendar } from '../splash/splashSlice';
import {
  getRangeAvailability,
  selectMonthlySchedule,
} from './bookingCalendarSlice';
import { toggleModal, toggleSpendTokens } from '../useTokens/useTokenSlice';
import { useSelector, useDispatch } from 'react-redux';
import styles from './BookingCalendar.module.css';

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
  console.log('monthlySchedule: ', monthlySchedule);
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    if (showCalendar) {
      // react-big-calendar doesn't fire onRangeChange on mount
      // this is definitely a 'not recommended for production' hack to avoid forking their repo
      document.querySelector('.rbc-btn-group button').click();
    }
  }, [showCalendar]);

  if (!showCalendar) {
    return '';
  }
  return (
    <Paper className={styles.Calendar} elevation={3}>
      <div className={styles.book}>
        <Button variant="extended" color="secondary" aria-label="add">
          <RoomServiceIcon sx={{ mr: 1 }} />
          Your Reservations
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
      <Calendar
        views={['month']}
        localizer={localizer}
        events={monthlySchedule}
        dayPropGetter={showDayAccessible}
        startAccessor="start"
        endAccessor="end"
        onRangeChange={(range) => {
          console.log('range: ', range);
          fetchRangeData(range, dispatch);
        }}
        timeslots={1}
        selectable={true}
        onSelectSlot={(data) => {
          console.log('data: ', data);
          handleSelect(data, dispatch);
        }}
      />
    </Paper>
  );
}
