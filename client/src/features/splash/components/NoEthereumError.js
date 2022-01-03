import React from 'react';
import { Alert, Collapse, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

export function NoEthereumError({ ethExists, open, setOpen }) {
  if (ethExists) {
    return '';
  }
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
            <Close fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {' '}
        No Ethereum wallet detected. To book a room, please install{' '}
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
