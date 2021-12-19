import React from 'react';
import {
  Alert,
  Button,
  Collapse,
  IconButton,
  Grid,
  Typography,
  Chip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import {
  selectShowCalendar,
  toggleCalendar,
  connectEthereum,
  selectUserAddress,
} from './splashSlice';
import { useSelector, useDispatch } from 'react-redux';

import styles from './Splash.module.css';

const themeOverrides = makeStyles((theme) => ({
  title: {
    color: 'white',
    // display: 'none',
    // [theme.breakpoints.up('sm')]: {
    //   display: 'block',
    // },
  },
}));

function renderNoEthereumError(open, setOpen) {
  // if (window.ethereum) {
  //   return '';
  // }
  return (
    <Collapse in={open}>
      <Alert
        severity="error"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setOpen(false);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {' '}
        No Ethereum wallet was detected. To book a room, please install{' '}
        <a
          href="http://metamask.io"
          aria-label="install an ethereum wallet to use this app"
          target="_blank"
          rel="noopener noreferrer"
        >
          MetaMask
        </a>
      </Alert>
    </Collapse>
  );
}

function renderWelcomeMessage(showCalendar, dispatch) {
  return (
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
        onClick={() => dispatch(connectEthereum())}
      >
        Connect Wallet
      </Button>
      <Button variant="text" color="secondary">
        View Schedule
      </Button>
    </Grid>
  );
}

function renderWalletChip(userAddress) {
  if (!userAddress) return '';
  return (
    <Chip
      label={userAddress}
      onClick={() => {}}
      // onClick={handleClick}
      // onDelete={handleDelete}
      deleteIcon={<CloseIcon />}
      variant="raised"
    />
  );
}

export function Splash() {
  const [open, setOpen] = React.useState(true);
  const showCalendar = useSelector(selectShowCalendar);
  const userAddress = useSelector(selectUserAddress);
  console.log('showCalendar: ', showCalendar);
  const dispatch = useDispatch();
  const overrides = themeOverrides();

  return (
    <div className={styles.wrapper}>
      {renderWalletChip(userAddress)}
      {renderWelcomeMessage(showCalendar, dispatch)}
      <div className={styles.warning}>
        <div>{renderNoEthereumError(open, setOpen)}</div>
      </div>
    </div>
  );
}
