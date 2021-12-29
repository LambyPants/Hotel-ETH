import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectUserAddress,
  selectHotelABI,
  hasEthereum,
} from '../splash/splashSlice';
import {
  selectPrevCallData,
  getRangeAvailability,
} from '../bookingCalendar/bookingCalendarSlice';

export function DappWrapper(props) {
  const contractABI = useSelector(selectHotelABI);
  const prevCallData = useSelector(selectPrevCallData);
  const dispatch = useDispatch();
  const handleAppointmentEvent = (e) => {
    if (prevCallData.numDays > 0) {
      dispatch(getRangeAvailability(prevCallData));
    }
  };

  // the useRef method of updating our callback function
  // we want the handleAppointmentEvent to contain all up-to-date data
  const cbRef = useRef(handleAppointmentEvent);
  useEffect(() => {
    cbRef.current = handleAppointmentEvent;
  });

  useEffect(() => {
    if (contractABI) {
      const cb = (e) => cbRef.current(e);
      contractABI.on('AppointmentScheduled', cb);
    }

    return function cleanup() {
      contractABI.removeAllListeners();
    };
  }, [contractABI]);
  return <div>{props.children}</div>;
}
