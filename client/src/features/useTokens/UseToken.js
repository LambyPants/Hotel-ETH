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
  selectPlaceholderDates,
  redeemTokens,
  checkTokenRange,
  selectTokenLoading,
  selectOverlapCheckLoading,
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
  const placeholderDates = useSelector(selectPlaceholderDates);
  const tokenLoading = useSelector(selectTokenLoading);
  const overlapLoading = useSelector(selectOverlapCheckLoading);

  useEffect(() => {
    if (showModal && !showSpendTokens) {
      dispatch(getBookingTokenPrice());
    }
  }, [showModal, showSpendTokens, dispatch]);
  return (
    <Modal
      open={showModal}
      onClose={() => {
        dispatch(toggleModal(!showModal));
      }}
      aria-labelledby="buy or use tokens"
      aria-describedby="buy or use tokens"
      elevation={3}
    >
      <div>
        <Paper
          className={[
            styles.content,
            showSpendTokens ? styles.redeem : '',
          ].join(' ')}
        >
          {!showSpendTokens ? (
            <BuyToken
              usdPrice={usdPrice}
              ethPrice={ethPrice}
              tokenLoading={tokenLoading}
              buyToken={async (arg) => {
                await dispatch(buyNumTokens(arg));
                dispatch(toggleModal(!showModal));
              }}
              closeModal={() => {
                dispatch(toggleModal(!showModal));
              }}
            />
          ) : (
            <RedeemToken
              userBalance={userBalance}
              placeholderDates={placeholderDates}
              tokenLoading={tokenLoading}
              overlapLoading={overlapLoading}
              redeemToken={async (dataObj) => {
                const { payload } = await dispatch(redeemTokens(dataObj));
                if (payload) {
                  dispatch(toggleModal(!showModal));
                }
              }}
              checkTokenRange={async (dataObj) => {
                const { payload } = await dispatch(checkTokenRange(dataObj));
                return payload;
              }}
              closeModal={() => {
                dispatch(toggleModal(!showModal));
              }}
            />
          )}
        </Paper>
      </div>
    </Modal>
  );
}
