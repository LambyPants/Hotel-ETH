import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, TextField, Button, Alert } from '@mui/material';
import styles from '../UseTokens.module.css';

function notEnoughTokens(userTokens, start, end) {
  const numTokens = _calcNumTokens(start, end); // number of days between start and end
  return numTokens && numTokens > userTokens;
}

function _calcNumTokens(s, e) {
  return (e - s) / 86400000; // number of days between start and end
}

export function RedeemToken({
  userBalance,
  showSpendTokens,
  closeModal,
  redeemToken,
}) {
  const [errorMessage, setErrorMessage] = useState('');
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [partyName, setPartyName] = useState('Anonymous');
  useEffect(() => {
    async function _testRedeemTokens(abiFunctionality) {
      console.log('abiFunctionality: ', abiFunctionality);
      const data = {
        name: partyName || 'Anonymous',
        timestamp: startDate / 1000,
        numDays: _calcNumTokens(startDate, endDate),
        testTransaction: false,
      };
      const res = await abiFunctionality(data);
      console.log('res: ', res);
      return res;
    }
    // require both start and end to exist
    if (startDate && endDate) {
      if (startDate > endDate) {
        setErrorMessage('Start date cannot be before end date');
      } else if (notEnoughTokens(userBalance, startDate, endDate)) {
        setErrorMessage('You do not have enough tokens for that date range');
      } else if (_testRedeemTokens(redeemToken)) {
        console.log('sd');
        setErrorMessage('');
      }
    }
  }, [startDate, endDate, userBalance]);

  if (showSpendTokens) {
    return '';
  }

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
          How many nights do you want to stay?
        </Typography>

        <Grid
          container={true}
          justifyContent="center"
          alignItems="center"
          className={styles.alert}
        >
          <Alert severity={errorMessage ? 'error' : 'info'}>
            {errorMessage
              ? errorMessage
              : 'You can redeem 1 token for 1 night of accomodation'}
          </Alert>
        </Grid>
      </Box>
      <TextField
        type="text"
        helperText="How we greet you when you arrive"
        label="Party name (optional)"
        id="date-start"
        onChange={(e) => {
          setPartyName(Number(e.target.value));
        }}
      ></TextField>
      <Grid
        className={styles.input}
        container={true}
        justifyContent="space-evenly"
        alignItems="center"
        direction="row"
      >
        <TextField
          type="date"
          error={Boolean(errorMessage)}
          helperText="Accomodation start date"
          id="date-start"
          onChange={(e) => {
            const date = new Date(e.target.value);
            console.log('date: ', Number(date));
            setStartDate(Number(date));
          }}
        ></TextField>
        <TextField
          type="date"
          error={Boolean(errorMessage)}
          helperText="Accomodation end date"
          id="date-end"
          onChange={(e) => {
            const date = new Date(e.target.value);
            console.log('date: ', Number(date));
            setEndDate(Number(date));
          }}
        ></TextField>
      </Grid>
      <div className={styles.buttons}>
        <Button
          variant="contained"
          color="secondary"
          disabled={!startDate || !endDate || Boolean(errorMessage)}
          onClick={() => {
            const data = {
              name: partyName || 'Anonymous',
              timestamp: startDate / 1000,
              numDays: _calcNumTokens(startDate, endDate),
              testTransaction: false,
            };
            console.log(data);
            redeemToken(data);
          }}
        >
          Use Tokens
        </Button>
        <Button variant="outlined" color="secondary" onClick={closeModal}>
          Cancel
        </Button>
      </div>
    </Grid>
  );
}
