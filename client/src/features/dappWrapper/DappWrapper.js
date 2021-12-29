import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectHotelABI, selectUserAddress } from '../splash/splashSlice';
import {
  selectPrevCallData,
  getRangeAvailability,
} from '../bookingCalendar/bookingCalendarSlice';

export function DappWrapper(props) {
  const contractABI = useSelector(selectHotelABI);
  const prevCallData = useSelector(selectPrevCallData);
  const userAddress = useSelector(selectUserAddress);
  const dispatch = useDispatch();
  const handleAppointmentEvent = (addr) => {
    // only refresh the UI from the AppointmentScheduled event when the addr doesn't match our current address
    // this is because we grab that data automatically after redeeming a token and waiting for the event can be slow
    if (prevCallData.numDays > 0 && addr !== userAddress.toLowerCase()) {
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
