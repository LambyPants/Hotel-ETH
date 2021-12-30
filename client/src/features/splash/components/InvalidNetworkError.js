import React from 'react';
import { Alert } from '@mui/material';

export function InvalidNetworkError({ validNetwork }) {
  if (validNetwork) {
    return '';
  }
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      Error - please connect to Rinkeby, Kovan, or localhost ChainID 1337
    </Alert>
  );
}
