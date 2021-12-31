import React, { useState } from 'react';
import { Grid, Box, Typography, TextField, Button, Alert } from '@mui/material';
import styles from '../UseTokens.module.css';

export function BuyToken({
  ethPrice,
  usdPrice,
  closeModal,
  buyToken,
  tokenLoading,
}) {
  const [isError, setError] = useState(false);
  const [currVal, setVal] = useState(1);
  const [userTyped, setUserTyped] = useState(false);

  return (
    <Grid
      className={styles.innerContent}
      container={true}
      justifyContent="space-between"
      alignItems="space-between"
      direction="column"
    >
      <Box>
        <Typography id="modal-modal-title" variant="h4">
          How many tokens would you like to buy?
        </Typography>

        <Grid
          container={true}
          justifyContent="center"
          alignItems="center"
          className={styles.alert}
        >
          <Alert severity="info">
            {userTyped && tokenLoading
              ? 'Processing your transaction - track its progress on MetaMask'
              : 'Buying in advance allows you to share / gift tokens to others and secures the current price.'}
          </Alert>
          <Grid
            className={styles.prices}
            container={true}
            justifyContent="space-between"
            align-items="center"
          >
            <Typography id="modal-modal-title" variant="subtitle1">
              Price in USD ${isError ? usdPrice : usdPrice * currVal}
            </Typography>
            <Typography id="modal-modal-title" variant="subtitle1">
              Price in ETH{' '}
              {isError
                ? Number(ethPrice).toFixed(4)
                : Number(ethPrice * currVal).toFixed(4)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Grid
        className={styles.input}
        container={true}
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        <TextField
          type="number"
          error={isError}
          helperText="1 token can be redeemed for 1 night of accomodation"
          id="buy-token"
          label="Number of booking tokens"
          onChange={(e) => {
            setUserTyped(true);
            const isValid = Number(e.target.value) > 0;
            setVal(e.target.value);
            setError(!isValid);
          }}
        ></TextField>
      </Grid>
      <div className={styles.buttons}>
        <Button
          variant="contained"
          color="secondary"
          disabled={!userTyped || isError || tokenLoading}
          onClick={() => {
            buyToken(currVal);
          }}
        >
          Buy Now
        </Button>
        <Button variant="outlined" color="secondary" onClick={closeModal}>
          Cancel
        </Button>
      </div>
    </Grid>
  );
}
