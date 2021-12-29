import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Alert } from '@mui/material';

function _renderTable(userBookings) {
  return userBookings.map((data) => (
    <TableRow
      key={data.checkIn}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell>{new Date(data.checkIn).toDateString()}</TableCell>
      <TableCell align="center">
        {new Date(data.checkOut).toDateString()}
      </TableCell>
      <TableCell align="right">{data.numDays}</TableCell>
    </TableRow>
  ));
}

export function UserAppointments({ userBookings }) {
  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ maxWidth: '100%', maxHeight: '100%' }}
        aria-label="your bookings"
      >
        <TableHead>
          <TableRow>
            <TableCell>Check in</TableCell>
            <TableCell align="center">Check out</TableCell>
            <TableCell align="right">Total days</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{_renderTable(userBookings)}</TableBody>
      </Table>
      {!userBookings.length ? (
        <Alert severity="error">You do not have any bookings yet.</Alert>
      ) : (
        ''
      )}
    </TableContainer>
  );
}
