import React from 'react';
import { Button, Container, makeStyles, Grid } from '@material-ui/core';
import styles from './Splash.module.css';
import Typography from '@material-ui/core/Typography';

const themeOverrides = makeStyles((theme) => ({
  title: {
    color: 'white',
    // display: 'none',
    // [theme.breakpoints.up('sm')]: {
    //   display: 'block',
    // },
  },
}));

export function Splash() {
  const overrides = themeOverrides();

  // if (window.ethereum === undefined) {
  //   return <NoWalletDetected />;
  // }
  return (
    <div className={styles.wrapper}>
      <Grid
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
        <Button variant="contained" color="secondary">
          Connect Wallet
        </Button>
        <Button variant="text" color="white">
          View Schedule
        </Button>
      </Grid>
    </div>
  );
}
