import React, { useEffect } from 'react';
import { Modal, Paper } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectShowModal,
  selectShowSpendTokens,
  toggleModal,
  getBookingTokenPrice,
  buyNumTokens,
  selectTokenPriceUSD,
  selectTokenPriceEth,
  redeemTokens,
} from './useTokenSlice';
import { selectUserBalance } from '../splash/splashSlice';
import { BuyToken } from './components/BuyTokens';
import styles from './UseTokens.module.css';
import { RedeemToken } from './components/RedeemToken';

export function UseToken() {
  const showModal = useSelector(selectShowModal);
  const usdPrice = useSelector(selectTokenPriceUSD);
  const ethPrice = useSelector(selectTokenPriceEth);
  const dispatch = useDispatch();
  const userBalance = useSelector(selectUserBalance);
  const showSpendTokens = useSelector(selectShowSpendTokens);

  useEffect(() => {
    if (showModal) {
      dispatch(getBookingTokenPrice());
    }
  }, [showModal, dispatch]);
  return (
    <Modal
      open={showModal}
      onClose={() => {
        console.log({ showModal });
        dispatch(toggleModal(!showModal));
      }}
      aria-labelledby="buy or use tokens"
      aria-describedby="buy or use tokens"
      elevation={3}
    >
      <div>
        <Paper className={styles.content}>
          <BuyToken
            showSpendTokens={showSpendTokens}
            usdPrice={usdPrice}
            ethPrice={ethPrice}
            buyToken={async (arg) => {
              await dispatch(buyNumTokens(arg));
              dispatch(toggleModal(!showModal));
            }}
            closeModal={() => {
              dispatch(toggleModal(!showModal));
            }}
          />
          <RedeemToken
            userBalance={userBalance}
            showSpendTokens={showSpendTokens}
            redeemToken={async (dataObj) => {
              const res = await dispatch(redeemTokens(dataObj));
              if (res) {
                dispatch(toggleModal(!showModal));
              }
            }}
            closeModal={() => {
              dispatch(toggleModal(!showModal));
            }}
          />
        </Paper>
      </div>
    </Modal>
  );
}
