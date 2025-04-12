// // import React, { useEffect, useState, useCallback, useRef } from 'react';
// // import {
// //   Box,
// //   Snackbar,
// //   Alert,
// //   Button,
// // } from '@mui/material';

// // const ResultContainerPlugin = ({ results: propsResults, scannerRef }) => {
// //   const [showSuccess, setShowSuccess] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState('');
// //   const [retryData, setRetryData] = useState(null);
// //   const scannedCache = useRef(new Set());

// //   const handleCheckIn = useCallback(async (qrData) => {
// //     try {
// //       const token = localStorage.getItem('token') || 
// //                    new URLSearchParams(window.location.search).get('token');

// //       const response = await fetch(
// //         'https://software-invite-api-self.vercel.app/guest/scan-qrcode',
// //         {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             'Authorization': `Bearer ${token}`,
// //           },
// //           body: JSON.stringify({ qrData }),
// //         }
// //       );

// //       const data = await response.json();

// //       if (response.status === 404) {
// //         setErrorMessage(
// //           data.message.includes('Event not found') 
// //             ? 'Event not found.' 
// //             : 'Guest not found.'
// //         );
// //       } 
// //       else if (data.message?.includes('already checked in')) {
// //         const guest = data.guest;
// //         setErrorMessage(
// //           guest 
// //             ? `${guest.firstName} ${guest.lastName} already checked in`
// //             : 'This guest already checked in'
// //         );
// //       }
// //       else if (response.ok) {
// //         setShowSuccess(true);
// //         scannedCache.current.add(qrData);
// //         setTimeout(() => setShowSuccess(false), 2000);
// //       } 
// //       else {
// //         setErrorMessage(data.message || 'Check-in failed');
// //         setRetryData(qrData);
// //       }
// //     } catch (error) {
// //       console.error('Check-in error:', error);
// //       setErrorMessage('Network error during check-in');
// //       setRetryData(qrData);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     if (!propsResults || propsResults.length === 0) return;
    
// //     const latestResult = propsResults[propsResults.length - 1];
// //     const qrData = latestResult.decodedText?.trim();
    
// //     if (!qrData || scannedCache.current.has(qrData)) return;
    
// //     scannedCache.current.add(qrData);
// //     handleCheckIn(qrData);
    
// //     // Pause scanner temporarily
// //     scannerRef.current?.pause();
// //     setTimeout(() => scannerRef.current?.resume(), 2000);
// //   }, [propsResults, handleCheckIn, scannerRef]);

// //   return (
// //     <Box sx={{ padding: 4 }}>
// //       <Snackbar
// //         open={Boolean(errorMessage)}
// //         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
// //         autoHideDuration={7000}
// //         onClose={() => setErrorMessage('')}
// //       >
// //         <Alert
// //           severity="error"
// //           action={
// //             retryData && (
// //               <Button 
// //                 color="inherit" 
// //                 size="small"
// //                 onClick={() => {
// //                   setErrorMessage('');
// //                   handleCheckIn(retryData);
// //                 }}
// //               >
// //                 Retry
// //               </Button>
// //             )
// //           }
// //         >
// //           {errorMessage}
// //         </Alert>
// //       </Snackbar>

// //       <Snackbar
// //         open={showSuccess}
// //         autoHideDuration={2000}
// //         onClose={() => setShowSuccess(false)}
// //       >
// //         <Alert severity="success">
// //           Successfully checked in guest
// //         </Alert>
// //       </Snackbar>
// //     </Box>
// //   );
// // };

// // export default ResultContainerPlugin;

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import {
//   Box,
//   Snackbar,
//   Alert,
//   Button,
// } from '@mui/material';

// const ResultContainerPlugin = ({ results: propsResults, scannerRef }) => {
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [retryData, setRetryData] = useState(null);
//   const scannedCache = useRef(new Set());

//   const handleCheckIn = useCallback(async (qrData) => {
//     try {
//       const token = localStorage.getItem('token') || 
//                    new URLSearchParams(window.location.search).get('token');

//       const response = await fetch(
//         'https://software-invite-api-self.vercel.app/guest/scan-qrcode',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({ qrData }),
//         }
//       );

//       const data = await response.json();

//       if (response.status === 404) {
//         setErrorMessage(
//           data.message.includes('Event not found') 
//             ? 'Event not found.' 
//             : 'Guest not found.'
//         );
//       } 
//       else if (data.message?.includes('already checked in')) {
//         const guest = data.guest;
//         setErrorMessage(
//           guest 
//             ? `${guest.firstName} ${guest.lastName} already checked in`
//             : 'This guest already checked in'
//         );
//       }
//       else if (response.ok) {
//         setShowSuccess(true);
//         scannedCache.current.add(qrData);

//         setTimeout(() => {
//           setShowSuccess(false);
//           scannerRef.current?.resume(); // Resume after success
//         }, 2000);
//       } 
//       else {
//         setErrorMessage(data.message || 'Check-in failed');
//         setRetryData(qrData);
//       }
//     } catch (error) {
//       console.error('Check-in error:', error);
//       setErrorMessage('Network error during check-in');
//       setRetryData(qrData);
//     }
//   }, [scannerRef]);

//   useEffect(() => {
//     if (!propsResults || propsResults.length === 0) return;
    
//     const latestResult = propsResults[propsResults.length - 1];
//     const qrData = latestResult.decodedText?.trim();
    
//     if (!qrData || scannedCache.current.has(qrData)) return;
    
//     scannedCache.current.add(qrData);
//     handleCheckIn(qrData);
    
//     // Pause scanner temporarily
//     scannerRef.current?.pause();
//   }, [propsResults, handleCheckIn, scannerRef]);

//   const handleErrorClose = () => {
//     setErrorMessage('');
//     scannerRef.current?.resume(); // Resume after error
//   };

//   const handleRetry = () => {
//     if (retryData) {
//       setErrorMessage('');
//       handleCheckIn(retryData);
//     }
//   };

//   return (
//     <Box sx={{ padding: 4 }}>
//       <Snackbar
//         open={Boolean(errorMessage)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         autoHideDuration={7000}
//         onClose={handleErrorClose}
//       >
//         <Alert
//           severity="error"
//           action={
//             retryData && (
//               <Button 
//                 color="inherit" 
//                 size="small"
//                 onClick={handleRetry}
//               >
//                 Retry
//               </Button>
//             )
//           }
//         >
//           {errorMessage}
//         </Alert>
//       </Snackbar>

//       <Snackbar
//         open={showSuccess}
//         autoHideDuration={2000}
//         onClose={() => {
//           setShowSuccess(false);
//           scannerRef.current?.resume(); // Make sure scanner resumes
//         }}
//       >
//         <Alert severity="success">
//           Successfully checked in guest
//         </Alert>
//       </Snackbar>
//     </Box>
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
  const [successMessage, setSuccessMessage] = useState('');
  const scannedCache = useRef(new Set());
  const isProcessing = useRef(false);

  const handleCheckIn = useCallback(async (qrData) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      scannerRef.current?.pause();
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
            ? `${guest.firstName} ${guest.lastName} is already checked in`
            : 'This guest is already checked in'
        );
      }
      else if (response.ok) {
        const guestName = data.guest 
          ? `${data.guest.firstName} ${data.guest.lastName}` 
          : 'Guest';
        setSuccessMessage(`${guestName} checked in successfully`);
        setShowSuccess(true);
        scannedCache.current.add(qrData);
      } 
      else {
        setErrorMessage(data.message || 'Check-in failed');
        setRetryData(qrData);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setErrorMessage('Network error during check-in');
      setRetryData(qrData);
    } finally {
      isProcessing.current = false;
      // Always attempt to restart scanner after a delay
      setTimeout(() => {
        scannerRef.current?.restartScanner().catch(console.error);
      }, 1500);
    }
  }, [scannerRef]);

  useEffect(() => {
    if (!propsResults || propsResults.length === 0 || isProcessing.current) return;
    
    const latestResult = propsResults[propsResults.length - 1];
    const qrData = latestResult.decodedText?.trim();
    
    if (!qrData || scannedCache.current.has(qrData)) return;
    
    scannedCache.current.add(qrData);
    handleCheckIn(qrData);
  }, [propsResults, handleCheckIn]);

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage('');
  };

  const handleCloseError = () => {
    setErrorMessage('');
    setRetryData(null);
  };

  const handleRetry = () => {
    if (retryData) {
      setErrorMessage('');
      handleCheckIn(retryData);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Snackbar
        open={Boolean(errorMessage)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert
          severity="error"
          variant="filled"
          action={
            retryData && (
              <Button 
                color="inherit" 
                size="small"
                onClick={handleRetry}
                sx={{ ml: 1 }}
              >
                Retry
              </Button>
            )
          }
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultContainerPlugin;