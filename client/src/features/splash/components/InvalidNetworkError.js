import React from 'react';
import { Alert, Fade } from '@mui/material';

export function InvalidNetworkError({ validNetwork }) {
  if (validNetwork || validNetwork === null) {
    return '';
  }
  return (
    <Fade in={!validNetwork} timeout={1000}>
      <Alert severity="error" sx={{ mb: 2 }}>
        Unsupported Network - Please connect to Sepolia or localhost
        ChainID 1337
      </Alert>
    </Fade>
  );
}
