import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Paper, Button, Fade, Slide } from '@mui/material';
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
import {
  refundTokens,
  selectTokenLoading,
  toggleModal,
  toggleSpendTokens,
} from '../useTokens/useTokenSlice';
import { useSelector, useDispatch } from 'react-redux';
import styles from './BookingCalendar.module.css';
import { UserAppointments } from './components/UserAppointments';
import { TouchCellWrapper } from './components/TouchCellWrapper';

const localizer = momentLocalizer(moment);

function handleSelect({ start, end }, dispatch) {
  if (start < Date.now() - 86400 * 1000) return;
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
      className: 'past-day',
    };
  else
    return {
      className: 'available-day',
    };
};

const modifyEventColor = (event) => {
  if (event.title === 'Your Booking')
    return {
      style: {
        backgroundColor: '#9c27b0',
      },
    };
};

function fetchRangeData({ start, end }, dispatch) {
  const normalizedStart = new Date(start.toISOString().slice(0, 10));
  const normalizedEnd = new Date(end.toISOString().slice(0, 10));
  const numDays = (normalizedEnd - normalizedStart) / (86400 * 1000);
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
  const tokenLoading = useSelector(selectTokenLoading);
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    if (showCalendar) {
      // react-big-calendar doesn't fire onRangeChange on mount
      // this is definitely a 'not recommended for production' hack to avoid forking their repo
      const todayButton = document.querySelector('.rbc-btn-group button');
      if (todayButton) document.querySelector('.rbc-btn-group button').click();
    }
  }, [showCalendar, userAddress]);

  useEffect(() => {
    if (showUserBookings) {
      dispatch(fetchUserBookings(userAddress));
    }
  }, [showUserBookings, dispatch, userAddress]);
  const renderSubcomponent = useCallback(() => {
    return !showUserBookings ? (
      <Calendar
        components={{
          dateCellWrapper: (props) => (
            <TouchCellWrapper
              {...props}
              onSelectSlot={({ action, slots }) => {
                setTimeout(() => {
                  if (action === 'click') {
                    const [start, end] = slots;
                    const data = {
                      start,
                      end: end || new Date(Number(start) + 86400 * 1000),
                    };
                    handleSelect(data, dispatch);
                  }
                }, 0);
              }}
            />
          ),
        }}
        views={['month']}
        localizer={localizer}
        events={monthlySchedule}
        dayPropGetter={showDayAccessible}
        eventPropGetter={modifyEventColor}
        startAccessor="start"
        endAccessor="end"
        onRangeChange={(range) => {
          fetchRangeData(range, dispatch);
        }}
        timeslots={1}
        selectable={true}
        onSelectSlot={(data) => {
          handleSelect(data, dispatch);
        }}
      />
    ) : (
      <Fade in={showUserBookings}>
        <div className={styles.table}>
          <UserAppointments
            userBookings={userBookings}
            tokenLoading={tokenLoading}
            cancelBooking={(index) => {
              dispatch(refundTokens(index));
            }}
          />
        </div>
      </Fade>
    );
  }, [dispatch, monthlySchedule, showUserBookings, userBookings, tokenLoading]);

  return (
    <Slide direction="up" in={showCalendar} unmountOnExit>
      <Paper className={styles.Calendar} elevation={3}>
        <div className={styles.book}>
          <Button
            variant="text"
            color="primary"
            aria-label="Back"
            onClick={() => dispatch(toggleUserBookings(!showUserBookings))}
          >
            <span className={styles.flex} hidden={!showUserBookings}>
              <TodayIcon /> Back to Calendar
            </span>
            <span className={styles.flex} hidden={showUserBookings}>
              <RoomServiceIcon />
              Your Reservations
            </span>
          </Button>
          <Button
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
    </Slide>
  );
}
