// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   Button,
// } from '@mui/material';

// const filterResults = (results) => {
//   return results.filter((result) => result.status === 'valid');
// };

// const ResultContainerTable = ({ data }) => (
//   <table>
//     <thead>
//       <tr>
//         <th>QR Code Data</th>
//         <th>Status</th>
//       </tr>
//     </thead>
//     <tbody>
//       {data.map((item) => (
//         <tr key={item.id}>
//           <td>{item.decodedText}</td>
//           <td>{item.status}</td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// );

// const ResultContainerPlugin = ({ results: propsResults, scannerRef }) => {
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [retryData, setRetryData] = useState(null);
//   const scannedCache = useRef(new Set());

//   const results = filterResults(propsResults || []);

//   const restartScannerAfterDelay = useCallback(() => {
//     setTimeout(() => {
//       scannerRef?.current?.restartScanner();
//       setIsLoading(true);
//     }, 3000);
//   }, [scannerRef]);

//   const handleCheckIn = useCallback(
//     async (qrData) => {
//       try {
//         const token =
//           new URLSearchParams(window.location.search).get('token') ||
//           localStorage.getItem('token');

//         const response = await fetch(
//           'https://software-invite-api-self.vercel.app/guest/scan-qrcode',
//           {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({ qrData }),
//           }
//         );

//         const data = await response.json();

//         if (response.status === 404) {
//           setErrorMessage(
//             data.message.includes('Event not found')
//               ? 'Event not found.'
//               : 'Guest not found.'
//           );
//           restartScannerAfterDelay();
//         } else if (data.message?.includes('already checked in')) {
//           const guest = data.guest;
//           const guestName = guest
//             ? `${guest.firstName} ${guest.lastName}`
//             : 'This access code';
//           setErrorMessage(`${guestName} has already been used.`);
//           restartScannerAfterDelay();
//         } else if (response.ok) {
//           setShowSuccess(true);
//           scannedCache.current.add(qrData);
//           setTimeout(() => {
//             setShowSuccess(false);
//             restartScannerAfterDelay();
//           }, 2000);
//         } else {
//           setErrorMessage(data.message || 'Unexpected server response.');
//           setRetryData(qrData);
//         }
//       } catch (error) {
//         console.error('🚨 Error during check-in:', error);
//         setErrorMessage('Server error during check-in.');
//         setRetryData(qrData);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [restartScannerAfterDelay]
//   );

//   const processScan = useCallback(() => {
//     const qrData = results[0]?.decodedText?.trim();
//     if (!qrData || scannedCache.current.has(qrData)) return;

//     scannedCache.current.add(qrData); // prevent reprocessing
//     setIsLoading(true);
//     handleCheckIn(qrData);
//   }, [results, handleCheckIn]);

//   useEffect(() => {
//     if (results.length > 0) processScan();
//   }, [results, processScan]);

//   return (
//     <>
//       <Snackbar
//         open={Boolean(errorMessage)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         autoHideDuration={null}
//         onClose={() => setErrorMessage('')}
//         sx={{
//           zIndex: 1500,
//           mt: 4,
//           '& .MuiAlert-root': {
//             fontSize: '1.2rem',
//             fontWeight: 'bold',
//             backgroundColor: '#d32f2f',
//             color: '#fff',
//             padding: '20px 30px',
//             borderRadius: '12px',
//             boxShadow: 6,
//           },
//         }}
//       >
//         <Alert
//           severity="error"
//           variant="filled"
//           action={
//             retryData && (
//               <Button
//                 color="inherit"
//                 size="small"
//                 onClick={() => {
//                   setErrorMessage('');
//                   handleCheckIn(retryData);
//                   setRetryData(null);
//                 }}
//               >
//                 RETRY
//               </Button>
//             )
//           }
//         >
//           {errorMessage}
//         </Alert>
//       </Snackbar>

//       <Box sx={{ padding: 4 }}>
//         <Typography variant="h5" fontWeight="bold" gutterBottom>
//           Scanned Results ({results.length})
//         </Typography>

//         {isLoading ? (
//           <Box display="flex" justifyContent="center" mt={4}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <ResultContainerTable data={results} />
//         )}

//         <Snackbar
//           open={showSuccess}
//           autoHideDuration={2000}
//           onClose={() => setShowSuccess(false)}
//         >
//           <Alert severity="success" sx={{ width: '100%' }}>
//             Guest successfully checked in
//           </Alert>
//         </Snackbar>
//       </Box>
//     </>
//   );
// };

// export default ResultContainerPlugin;

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';

const ResultContainerPlugin = ({ results: propsResults, scannerRef }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryData, setRetryData] = useState(null);
  const scannedCache = useRef(new Set());

  const handleCheckIn = useCallback(async (qrData) => {
    try {
      const token = localStorage.getItem('token') || 
                   new URLSearchParams(window.location.search).get('token');

      const response = await fetch(
        'https://software-invite-api-self.vercel.app/guest/scan-qrcode',
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
        setErrorMessage(
          data.message.includes('Event not found') 
            ? 'Event not found.' 
            : 'Guest not found.'
        );
      } 
      else if (data.message?.includes('already checked in')) {
        const guest = data.guest;
        setErrorMessage(
          guest 
            ? `${guest.firstName} ${guest.lastName} already checked in`
            : 'This guest already checked in'
        );
      }
      else if (response.ok) {
        setShowSuccess(true);
        scannedCache.current.add(qrData);
        setTimeout(() => setShowSuccess(false), 2000);
      } 
      else {
        setErrorMessage(data.message || 'Check-in failed');
        setRetryData(qrData);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setErrorMessage('Network error during check-in');
      setRetryData(qrData);
    }
  }, []);

  useEffect(() => {
    if (!propsResults || propsResults.length === 0) return;
    
    const latestResult = propsResults[propsResults.length - 1];
    const qrData = latestResult.decodedText?.trim();
    
    if (!qrData || scannedCache.current.has(qrData)) return;
    
    scannedCache.current.add(qrData);
    handleCheckIn(qrData);
    
    // Pause scanner temporarily
    scannerRef.current?.pause();
    setTimeout(() => scannerRef.current?.resume(), 2000);
  }, [propsResults, handleCheckIn, scannerRef]);

  return (
    <Box sx={{ padding: 4 }}>
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
    </Box>
  );
};

export default ResultContainerPlugin;
