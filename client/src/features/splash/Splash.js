import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectShowCalendar,
  resetState,
  connectEthereum,
  selectUserAddress,
  hasEthereum,
  selectUserBalance,
} from './splashSlice';

import styles from './Splash.module.css';
import { WalletChip } from './components/WalletChip';
import { WelcomeMessage } from './components/WelcomeMessage';
import { NoEthereumError } from './components/NoEthereumError';

const themeOverrides = makeStyles((theme) => ({
  title: {
    color: 'white',
    // display: 'none',
    // [theme.breakpoints.up('sm')]: {
    //   display: 'block',
    // },
  },
}));

function _startPollingData() {
  this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);

  // We run it once immediately so we don't have to wait for it
  this._updateBalance();
}

export function Splash() {
  const [open, setOpen] = useState(true);
  const showCalendar = useSelector(selectShowCalendar);
  const userAddress = useSelector(selectUserAddress);
  const ethExists = useSelector(hasEthereum);
  const userBalance = useSelector(selectUserBalance);
  const dispatch = useDispatch();

  useEffect(() => {
    if (ethExists) {
      window.ethereum.on('accountsChanged', ([newAddress]) => {
        if (newAddress === undefined) {
          dispatch(resetState());
          return;
        }
        dispatch(connectEthereum());
      });
    } else {
      setOpen(true);
    }
  }, [ethExists, dispatch]);

  return (
    <div className={styles.wrapper}>
      <WalletChip
        userAddress={userAddress}
        userBalance={userBalance}
        handleDelete={() => dispatch(resetState())}
      />
      <WelcomeMessage
        showCalendar={showCalendar}
        handleConnectEthereum={() => dispatch(connectEthereum())}
      />

      <div className={styles.warning}>
        <div>
          <NoEthereumError
            ethExists={ethExists}
            open={open}
            setOpen={setOpen}
          />
        </div>
      </div>
    </div>
  );
}
