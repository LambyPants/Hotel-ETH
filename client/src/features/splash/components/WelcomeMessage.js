import React from 'react';
import { Button, Grid, Typography, Fade } from '@mui/material';

import styles from '../Splash.module.css';

export function WelcomeMessage({ showCalendar, handleConnectEthereum }) {
  console.log('showCalendar: ', showCalendar);
  //   if (showCalendar) {
  //     return '';
  //   }
  return (
    <Fade in={!showCalendar}>
      <Grid
        className={styles.textContainer}
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        <Typography variant="h1" className={styles.text}>
          Hotel ETH
        </Typography>
        <Typography variant="h6" className={styles.text}>
          A (demo) Bed and Breakfast run on Ethereum
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleConnectEthereum}
        >
          Connect Wallet
        </Button>
        <Button variant="text" color="secondary">
          View Schedule
        </Button>
      </Grid>
    </Fade>
  );
}
