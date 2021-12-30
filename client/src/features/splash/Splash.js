import React, { useEffect, useState } from 'react';
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
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
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
        handleDemoConnect={() => dispatch(connectEthereum(true))}
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
