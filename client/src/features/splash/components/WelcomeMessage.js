import React from 'react';
import { Button, Grid, Typography, Fade } from '@mui/material';

import styles from '../Splash.module.css';

export function WelcomeMessage({
  showCalendar,
  handleConnectEthereum,
  handleDemoConnect,
}) {
  if (showCalendar) {
    return '';
  }
  return (
    <Fade in={!showCalendar} timeout={1000}>
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
          A (fictional) Bed and Breakfast Run on Ethereum
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleConnectEthereum}
        >
          Connect Wallet
        </Button>
        <Button className={styles.scheduleButton} onClick={handleDemoConnect}>
          Connect as Demo User
        </Button>
      </Grid>
    </Fade>
  );
}
