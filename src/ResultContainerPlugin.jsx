import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  Button,
  Typography,
  CircularProgress
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
  const [isProcessing, setIsProcessing] = useState(false);
  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);
  const scannedCache = useRef(new Map()); 
  const requestQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const cooldown = 1500; // Reduced cooldown for better performance

  // Process queue to handle multiple rapid scans
  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || requestQueue.current.length === 0) {
      return;
    }
    
    isProcessingQueue.current = true;
    setIsProcessing(true);
    
    while (requestQueue.current.length > 0) {
      const qrData = requestQueue.current.shift();
      
      try {
        const token = localStorage.getItem('token') ||
          new URLSearchParams(window.location.search).get('token');

        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(
          'https://292x833w13.execute-api.us-east-2.amazonaws.com/guest/scan-qrcode',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ qrData }),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        await handleResponse(response, qrData);
        
        // Small delay between requests to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('Queue processing error:', error);
        if (error.name === 'AbortError') {
          setErrorMessage('Request timeout. Please try again.');
        } else {
          setErrorMessage('Network error. Please check connection.');
        }
        setScanStatusColor('red');
        errorSoundRef.current?.play();
      }
    }
    
    isProcessingQueue.current = false;
    setIsProcessing(false);
  }, []);

  const handleResponse = useCallback(async (response, qrData) => {
    const data = await response.json();

    if (response.status === 404) {
      errorSoundRef.current?.play();
      setScanStatusColor('red');
      setErrorMessage(data.message?.includes('Event not found')
        ? 'Event not found.'
        : 'Guest not found.');
    } else if (response.status === 403) {
      errorSoundRef.current?.play();
      setScanStatusColor('red');
      setErrorMessage(data.message || 'Access denied - Wrong event or unauthorized');
    } else if (response.status === 410) {
      errorSoundRef.current?.play();
      setScanStatusColor('red');
      setErrorMessage('Event has expired. Check-in is no longer available.');
    } else if (response.status === 401) {
      errorSoundRef.current?.play();
      setScanStatusColor('red');
      setErrorMessage('Scanner authorization expired. Please refresh the link.');
    } else if (data.message?.includes('Event is not active')) {
      errorSoundRef.current?.play();
      setScanStatusColor('red');
      setErrorMessage('Event is currently inactive. Check-in is disabled.');
    } else if (data.message?.includes('already checked in')) {
      errorSoundRef.current?.play();
      setScanStatusColor('red');
      const guest = data.guest;
      const checkedInTime = guest?.checkedInAt ? new Date(guest.checkedInAt).toLocaleString() : 'Unknown time';
      setErrorMessage(
        guest
          ? `${guest.fullname} already checked in at ${checkedInTime}`
          : 'This guest already checked in'
      );
    } else if (response.ok) {
      successSoundRef.current?.play();
      setScanStatusColor('green');
      setShowSuccess(true);
      scannedCache.current.set(qrData, Date.now());
      
      // Enhanced guest data structure with check-in timestamp
      const guestData = {
        name: data.guest.fullname || 'Unknown',
        tableNo: data.guest.TableNo || 'N/A',
        busNo: data.guest.others || 'N/A',
        timestamp: data.guest.checkedInAt ? new Date(data.guest.checkedInAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
        checkedInAt: data.guest.checkedInAt
      };
      
      setLastScannedGuests(prev => [guestData, ...prev].slice(0, 3));
      setTimeout(() => setShowSuccess(false), 1500);
    } else {
      errorSoundRef.current?.play();
      setScanStatusColor('red');
      setErrorMessage(data.message || 'Check-in failed');
      setRetryData(qrData);
    }

    // Reset scan status color after a short delay
    setTimeout(() => setScanStatusColor(null), 800);
  }, []);

  const handleCheckIn = useCallback((qrData) => {
    // Add to queue instead of processing immediately
    requestQueue.current.push(qrData);
    processQueue();
  }, [processQueue]);

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

      {/* Processing indicator */}
      {isProcessing && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Processing...</Typography>
        </Box>
      )}

      {/* Last scanned guests list - Optimized layout */}
      <Box mt={4} sx={{ width: '95%', marginLeft: '2.5%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}> 
        <Typography variant="h6" gutterBottom>Last 3 Scanned Guests</Typography>

        <TableContainer component={Paper} sx={{ width: '100%', maxWidth: 600 }}>
          <Table aria-label="Last Scanned Guests Table" size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Bus</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lastScannedGuests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No guests scanned yet
                  </TableCell>
                </TableRow>
              ) : (
                lastScannedGuests.map((guest, index) => (
                  <TableRow key={`${guest.name}-${index}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                    <TableCell sx={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      maxWidth: 120,
                      fontSize: '0.875rem'
                    }}>
                      {guest.name}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      {guest.tableNo}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      {guest.busNo}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'text.secondary' }}>
                      {guest.timestamp}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </Box>
  );
};

export default ResultContainerPlugin;
