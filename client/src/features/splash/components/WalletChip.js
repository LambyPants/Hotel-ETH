import React from 'react';
import { Chip } from '@mui/material';
import { Close, AccountBalanceWallet, Hotel } from '@mui/icons-material';

import styles from '../Splash.module.css';

export function WalletChip({ userAddress, userBalance, handleDelete }) {
  if (!userAddress) return '';
  return (
    <div className={styles.chip}>
      <Chip
        color="secondary"
        label={`You have ${userBalance} tokens`}
        icon={<Hotel />}
        variant="raised"
      />
      <Chip
        color="primary"
        label={userAddress}
        onDelete={handleDelete}
        icon={<AccountBalanceWallet />}
        deleteIcon={<Close />}
        variant="raised"
      />
    </div>
  );
}
