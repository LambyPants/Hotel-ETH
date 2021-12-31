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

function _stringToDateNum(s) {
  return Number(new Date(s));
}

function _renderAlertMessage(alertMessage, tokenLoading, overlapLoading) {
  if (overlapLoading) {
    return 'Checking dates for overlaps...';
  }
  if (tokenLoading) {
    return 'Processing your transaction - track its progress on MetaMask';
  }
  return alertMessage;
}

export function RedeemToken({
  userBalance,
  closeModal,
  redeemToken,
  checkTokenRange,
  tokenLoading,
  placeholderDates,
  overlapLoading,
}) {
  const { start, end } = placeholderDates;
  const [alertMessage, setMessage] = useState('');
  const [startDate, setStartDate] = useState(_stringToDateNum(start));
  const [endDate, setEndDate] = useState(_stringToDateNum(end));
  const [isValid, setIsValid] = useState(false);
  const [hasCheckedRange, setCheckedRange] = useState(false);
  const [partyName, setPartyName] = useState('Anonymous');
  // only allow redemption when we have a start + end date with valid inputs and nothing is loading
  const enableButton =
    startDate && endDate && isValid && !tokenLoading && !overlapLoading;
  useEffect(() => {
    async function _testRedeemTokens(checkTokenRange) {
      const numDays = _calcNumTokens(startDate, endDate);
      const data = {
        name: 'Anonymous',
        timestamp: startDate / 1000,
        numDays,
      };
      const res = await checkTokenRange(data);
      if (res) {
        setIsValid(true);
        setMessage(`You will use ${numDays} token(s)`);
      } else {
        setMessage('Date range overlaps with another booking');
        setIsValid(false);
      }
    }
    // require both start and end to exist
    if (startDate && endDate && !overlapLoading) {
      if (!startDate || !endDate) {
        setMessage('Please provide a start and end date');
        setIsValid(false);
      } else if (startDate >= endDate) {
        setMessage('Start date must be before end date');
        setIsValid(false);
      } else if (startDate < new Date(new Date().toISOString().slice(0, 10))) {
        setMessage('Start date cannot be before today');
        setIsValid(false);
      } else if (notEnoughTokens(userBalance, startDate, endDate)) {
        setMessage('You do not have enough tokens for that date range');
        setIsValid(false);
      } else if (!hasCheckedRange) {
        setCheckedRange(true);
        _testRedeemTokens(checkTokenRange);
      }
    }
  }, [
    startDate,
    endDate,
    userBalance,
    overlapLoading,
    checkTokenRange,
    hasCheckedRange,
  ]);
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
          <Alert severity={!isValid && !overlapLoading ? 'error' : 'info'}>
            {_renderAlertMessage(alertMessage, tokenLoading, overlapLoading)}
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
          error={!isValid && !overlapLoading}
          helperText="The day you check-in"
          id="date-start"
          defaultValue={placeholderDates.start}
          onChange={(e) => {
            setCheckedRange(false);
            setStartDate(_stringToDateNum(e.target.value));
          }}
        ></TextField>
        <TextField
          type="date"
          error={!isValid && !overlapLoading}
          helperText="The day you check-out"
          id="date-end"
          defaultValue={placeholderDates.end}
          onChange={(e) => {
            setCheckedRange(false);
            setEndDate(_stringToDateNum(e.target.value));
          }}
        ></TextField>
      </Grid>
      <div className={styles.buttons}>
        <Button
          variant="contained"
          color="secondary"
          disabled={!enableButton}
          onClick={() => {
            const data = {
              name: partyName || 'Anonymous',
              timestamp: startDate / 1000,
              numDays: _calcNumTokens(startDate, endDate),
            };
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
