import React from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';

function _renderTable(userBookings, cancelBooking) {
  return userBookings.map((data, index) => (
    <TableRow
      key={data.checkIn}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell>{new Date(data.checkIn).toDateString()}</TableCell>
      <TableCell align="center">
        {new Date(data.checkOut).toDateString()}
      </TableCell>
      <TableCell align="right">{data.numDays}</TableCell>
      <TableCell align="right">
        <Button
          color="secondary"
          aria-label="cancel booking and receive back tokens"
          disabled={Boolean(data.checkIn < Date.now())}
          onClick={() => {
            cancelBooking(index);
          }}
        >
          Cancel & Refund
        </Button>
      </TableCell>
    </TableRow>
  ));
}

export function UserAppointments({ userBookings, cancelBooking }) {
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
            <TableCell align="right">Manage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{_renderTable(userBookings, cancelBooking)}</TableBody>
      </Table>
      {!userBookings.length ? (
        <Alert severity="error">You do not have any bookings yet.</Alert>
      ) : (
        ''
      )}
    </TableContainer>
  );
}
