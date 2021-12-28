import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectUserAddress,
  selectHotelABI,
  selectProvider,
} from '../splash/splashSlice';
import {
  selectPrevCallData,
  getRangeAvailability,
} from '../bookingCalendar/bookingCalendarSlice';

export function DappWrapper(props) {
  console.log('props: ', props);
  // const userAddress = useSelector(selectUserAddress);
  const contractABI = useSelector(selectHotelABI);
  const prevCallData = useSelector(selectPrevCallData);
  const dispatch = useDispatch();
  const handleUserKeyPress = (e) => {
    console.log('e: ', e);
    if (prevCallData.numDays > 0) {
      dispatch(getRangeAvailability(prevCallData));
    }
  };

  const cbRef = useRef(handleUserKeyPress);
  useEffect(() => {
    cbRef.current = handleUserKeyPress;
  }); // update after each render

  // const [userText, handleUserKeyPress] = useReducer((state, event) => {
  //   console.log('state: ', state);
  //   console.log('event: ', event);
  //   // isUpperCase is always the most recent state (no stale closure value)
  //   // dispatch(getRangeAvailability(prevCallData));
  // }, '');

  useEffect(() => {
    if (contractABI) {
      const cb = (e) => cbRef.current(e);
      contractABI.on('AppointmentScheduled', cb);
    }

    return function cleanup() {
      console.log('cleanup');
      contractABI.removeAllListeners();
    };
  }, [contractABI]);
  return <div>{props.children}</div>;
}
