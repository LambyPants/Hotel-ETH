import React from 'react';
import { Button, Grid, Typography, Fade } from '@mui/material';
import { GitHub, Email, LinkedIn } from '@mui/icons-material';
import styles from '../Splash.module.css';

export function WelcomeMessage({
  showCalendar,
  handleConnectEthereum,
  disableButtons,
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
          disabled={disableButtons}
          variant="contained"
          color="secondary"
          onClick={handleConnectEthereum}
        >
          Connect Wallet
        </Button>
        <Grid
          className={styles.links}
          container
          justifyContent="space-between"
          align-items="center"
        >
          <a
            href="https://github.com/LambyPants/Hotel-ETH"
            aria-label="see the code"
          >
            <GitHub fontSize="large" />
          </a>
          <a
            title="contact developer"
            aria-label="E-mail the developer"
            href="mailto:appsbylamby@gmail.com"
          >
            <Email fontSize="large" />
          </a>
          <a
            href="https://www.linkedin.com/in/ryan-lambert-58202596/"
            aria-label="developer's LinkedIn"
          >
            <LinkedIn fontSize="large" />
          </a>
        </Grid>
      </Grid>
    </Fade>
  );
}
