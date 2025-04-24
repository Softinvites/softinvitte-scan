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
  const scannedCache = useRef(new Map()); // Track scanned data with timestamp
  const cooldown = 2000; // 2 seconds cooldown per unique scan

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
        setErrorMessage(data.message?.includes('Event not found')
          ? 'Event not found.'
          : 'Guest not found.');
      } else if (data.message?.includes('already checked in')) {
        const guest = data.guest;
        setErrorMessage(
          guest
            ? `${guest.firstName} ${guest.lastName} already checked in`
            : 'This guest already checked in'
        );
      } else if (response.ok) {
        setShowSuccess(true);
        scannedCache.current.set(qrData, Date.now());
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
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

    if (!qrData) return;

    const lastScanTime = scannedCache.current.get(qrData);
    const now = Date.now();

    if (lastScanTime && now - lastScanTime < cooldown) {
      return; // Cooldown not passed, skip processing
    }

    handleCheckIn(qrData);
  }, [propsResults, handleCheckIn]);

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
//         setTimeout(() => setShowSuccess(false), 2000);
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
//   }, []);

//   useEffect(() => {
//     if (!propsResults || propsResults.length === 0) return;
    
//     const latestResult = propsResults[propsResults.length - 1];
//     const qrData = latestResult.decodedText?.trim();
    
//     if (!qrData || scannedCache.current.has(qrData)) return;
    
//     scannedCache.current.add(qrData);
//     handleCheckIn(qrData);
    

//   }, [propsResults, handleCheckIn, scannerRef]);

//   return (
//     <Box sx={{ padding: 4 }}>
//       <Snackbar
//         open={Boolean(errorMessage)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         autoHideDuration={7000}
//         onClose={() => setErrorMessage('')}
//       >
//         <Alert
//           severity="error"
//           action={
//             retryData && (
//               <Button 
//                 color="inherit" 
//                 size="small"
//                 onClick={() => {
//                   setErrorMessage('');
//                   handleCheckIn(retryData);
//                 }}
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
//         onClose={() => setShowSuccess(false)}
//       >
//         <Alert severity="success">
//           Successfully checked in guest
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ResultContainerPlugin;






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
//         setTimeout(() => setShowSuccess(false), 2000);
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
//   }, []);

//   useEffect(() => {
//     if (!propsResults || propsResults.length === 0) return;
    
//     const latestResult = propsResults[propsResults.length - 1];
//     const qrData = latestResult.decodedText?.trim();
    
//     if (!qrData || scannedCache.current.has(qrData)) return;
    
//     scannedCache.current.add(qrData);
//     handleCheckIn(qrData);
    
//     // No longer pausing the scanner - continuous scanning
//   }, [propsResults, handleCheckIn]);

//   return (
//     <Box sx={{ padding: 4 }}>
//       <Snackbar
//         open={Boolean(errorMessage)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         autoHideDuration={7000}
//         onClose={() => setErrorMessage('')}
//       >
//         <Alert
//           severity="error"
//           action={
//             retryData && (
//               <Button 
//                 color="inherit" 
//                 size="small"
//                 onClick={() => {
//                   setErrorMessage('');
//                   handleCheckIn(retryData);
//                 }}
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
//         onClose={() => setShowSuccess(false)}
//       >
//         <Alert severity="success">
//           Successfully checked in guest
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ResultContainerPlugin;