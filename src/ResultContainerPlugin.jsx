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





import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Paper, Typography } from '@mui/material';

const qrcodeRegionId = "html5qr-code-full-region";

const Html5QrcodePlugin = forwardRef((props, ref) => {
  const html5QrCodeRef = useRef(null);
  const cameraIdRef = useRef(null);

  useEffect(() => {
    const setupScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          cameraIdRef.current = devices[0].id;

          html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId);
          await html5QrCodeRef.current.start(
            cameraIdRef.current,
            {
              fps: props.fps || 10,
              qrbox: props.qrbox || 250,
              disableFlip: props.disableFlip || false,
              videoConstraints: {
                facingMode: "environment"
              }
            },
            props.qrCodeSuccessCallback,
            props.qrCodeErrorCallback
          );
        } else {
          console.error("No camera found.");
        }
      } catch (error) {
        console.error("Error starting scanner:", error);
      }
    };

    setupScanner();

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch((err) => console.error("Failed to stop scanner", err));
      }
    };
  }, [props]);

  useImperativeHandle(ref, () => ({
    async restartScanner() {
      if (!html5QrCodeRef.current || !cameraIdRef.current) return;
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();

        await html5QrCodeRef.current.start(
          cameraIdRef.current,
          {
            fps: props.fps || 10,
            qrbox: props.qrbox || 250,
            disableFlip: props.disableFlip || false,
            videoConstraints: {
              facingMode: "environment"
            }
          },
          props.qrCodeSuccessCallback,
          props.qrCodeErrorCallback
        );
      } catch (err) {
        console.error("Failed to restart scanner:", err);
      }
    },
    async stopScanner() {
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      }
    }
  }));

  return (
    <Paper elevation={4} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Scan QR Code
      </Typography>
      <Box id={qrcodeRegionId} sx={{ width: '100%', height: 300 }} />
    </Paper>
  );
});

export default Html5QrcodePlugin;

