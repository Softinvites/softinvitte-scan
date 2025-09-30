import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  Button,
  Typography,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const ResultContainerPlugin = ({ results: propsResults, scannerRef }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryData, setRetryData] = useState(null);
  const [lastScannedGuests, setLastScannedGuests] = useState([]);
  const [scanStatusColor, setScanStatusColor] = useState(null);
  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);
  const scannedCache = useRef(new Map()); 
  const cooldown = 2000;

  const handleCheckIn = useCallback(async (qrData) => {
    try {
      const token = localStorage.getItem('token') ||
        new URLSearchParams(window.location.search).get('token');

      const response = await fetch(
        'https://292x833w13.execute-api.us-east-2.amazonaws.com/guest/scan-qrcode',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ qrData }),
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        errorSoundRef.current?.play();
        setScanStatusColor('red');
        setErrorMessage(data.message?.includes('Event not found')
          ? 'Event not found.'
          : 'Guest not found.');
      } else if (data.message?.includes('already checked in')) {
        errorSoundRef.current?.play();
        setScanStatusColor('red');
        const guest = data.guest;
        setErrorMessage(
          guest
            ? `${guest.fullname} already checked in`
            : 'This guest already checked in'
        );
      } else if (response.ok) {
        successSoundRef.current?.play();
        setScanStatusColor('green');
        setShowSuccess(true);
        scannedCache.current.set(qrData, Date.now());
        setLastScannedGuests(prev => [{ name: `${data.guest.fullname}` }, {TableNo: `${data.guest.TableNo}`},{busNo: `${data.guest.others}`},  ...prev].slice(0, 5));
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        errorSoundRef.current?.play();
        setScanStatusColor('red');
        setErrorMessage(data.message || 'Check-in failed');
        setRetryData(qrData);
      }

      // Reset scan status color after a short delay
      setTimeout(() => setScanStatusColor(null), 1000);

    } catch (error) {
      errorSoundRef.current?.play();
      setScanStatusColor('red');
      console.error('Check-in error:', error);
      setErrorMessage('Network error during check-in');
      setRetryData(qrData);
      setTimeout(() => setScanStatusColor(null), 1000);
    }
  }, []);

  useEffect(() => {
    if (!propsResults || propsResults.length === 0) return;

    const latestResult = propsResults[propsResults.length - 1];
    const qrData = latestResult.decodedText?.trim();

    if (!qrData) return;

    const lastScanTime = scannedCache.current.get(qrData);
    const now = Date.now();

    if (lastScanTime && now - lastScanTime < cooldown) {
      return;
    }

    handleCheckIn(qrData);
  }, [propsResults, handleCheckIn]);

  return (
    <Box sx={{ padding: 4 , width: '100%' }} >
      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />
      <audio ref={errorSoundRef} src="/sounds/error.mp3" preload="auto" />

      {/* Visual border indicator */}
      {scanStatusColor && (
        <style>{`
          #html5qr-code-full-region video {
            border: 5px solid ${scanStatusColor};
            border-radius: 8px;
          }
        `}</style>
      )}

      <Snackbar
        open={Boolean(errorMessage)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={7000}
        onClose={() => setErrorMessage('')}
      >
        <Alert
          severity="error"
          action={
            retryData && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setErrorMessage('');
                  handleCheckIn(retryData);
                }}
              >
                Retry
              </Button>
            )
          }
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success">
          Successfully checked in guest
        </Alert>
      </Snackbar>

      {/* Last scanned guests list */}
      <Box mt={4} sx={{ width: '90%', marginLeft:"5%", display:"flex", justifyContent:"center", flexDirection:"column", alignItems:"center" }}> 
  <Typography variant="h6" gutterBottom>Last Scanned Guests</Typography>

  <TableContainer component={Paper} sx={{ width: '100%' }}>
    <Table aria-label="Last Scanned Guests Table" sx={{ width: '100%' }}>
      <TableHead>
        <TableRow>
          <TableCell><strong>Full Name</strong></TableCell>
          <TableCell><strong>Table No.</strong></TableCell>
          <TableCell><strong>Bus No.</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lastScannedGuests.map((guest, index) => (
          <TableRow key={index}>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{guest.name}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{guest.TableNo}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {guest.busNo ?? 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Box>

    </Box>
  );
};

export default ResultContainerPlugin;
