import React, { useEffect } from 'react';
import { useDebounce } from '@react-hook/debounce';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectShowCalendar,
  resetState,
  connectEthereum,
  selectUserAddress,
  hasEthereum,
  setValidNetwork,
  selectUserBalance,
  selectValidChain,
} from './splashSlice';

import styles from './Splash.module.css';
import { WalletChip } from './components/WalletChip';
import { WelcomeMessage } from './components/WelcomeMessage';
import { NoEthereumError } from './components/NoEthereumError';
import { InvalidNetworkError } from './components/InvalidNetworkError';

export function Splash() {
  const [open, setOpen] = useDebounce(false, 500, true);
  const showCalendar = useSelector(selectShowCalendar);
  const userAddress = useSelector(selectUserAddress);
  const ethExists = useSelector(hasEthereum);
  const userBalance = useSelector(selectUserBalance);
  const validNetwork = useSelector(selectValidChain);
  const dispatch = useDispatch();

  useEffect(() => {
    if (ethExists) {
      dispatch(setValidNetwork());
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
  }, [ethExists, dispatch, setOpen]);

  return (
    <div className={styles.wrapper}>
      <WalletChip
        userAddress={userAddress}
        userBalance={userBalance}
        handleDelete={() => dispatch(resetState())}
      />
      <WelcomeMessage
        disableButtons={!validNetwork}
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
          <InvalidNetworkError validNetwork={!ethExists || validNetwork} />
        </div>
      </div>
    </div>
  );
}
