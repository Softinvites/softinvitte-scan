// import React, {
//     useEffect,
//     useRef,
//     useState,
//     useImperativeHandle,
//     forwardRef,
//   } from 'react';
//   import {
//     Html5QrcodeScanner,
//     Html5QrcodeScanType,
//   } from 'html5-qrcode';
//   import {
//     Box,
//     Paper,
//     Typography,
//     CircularProgress,
//   } from '@mui/material';
  
//   const qrcodeRegionId = 'html5qr-code-full-region';
  
//   const createConfig = () => ({
//     fps: 10,
//     qrbox: 250,
//     aspectRatio: 1.0,
//     disableFlip: true,
//     supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
//     experimentalFeatures: {
//       useBarCodeDetectorIfSupported: true,
//     },
//     videoConstraints: {
//       facingMode: 'environment',
//       width: { ideal: 640 },
//       height: { ideal: 480 },
//     },
//   });
  
//   const Html5QrcodePlugin = forwardRef((props, ref) => {
//     const [loading, setLoading] = useState(true);
//     const scannerInitialized = useRef(false);
//     const scannerRef = useRef(null);
//     const { qrCodeSuccessCallback, qrCodeErrorCallback, verbose } = props;
  
//     useEffect(() => {
//       const timeoutId = setTimeout(() => {
//         if (!scannerInitialized.current) {
//           const config = createConfig();
//           const verboseOption = verbose === true;
  
//           scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, verboseOption);
  
//           scannerRef.current.render(
//             (decodedText, result) => {
//               setLoading(false);
//               qrCodeSuccessCallback(decodedText, result);
//             },
//             qrCodeErrorCallback
//           );
  
//           scannerInitialized.current = true;
//         }
//       }, 300); // Short delay to ensure DOM is ready
  
//       return () => {
//         clearTimeout(timeoutId);
//         if (scannerInitialized.current) {
//           scannerRef.current
//             .clear()
//             .catch((err) => console.error('Clear failed', err));
//         }
//       };
//     }, [qrCodeSuccessCallback, qrCodeErrorCallback, verbose]);
  
//     useImperativeHandle(ref, () => ({
//       restartScanner: () => {
//         setLoading(true);
//         if (scannerInitialized.current && scannerRef.current) {
//           scannerRef.current
//             .clear()
//             .then(() => {
//               scannerRef.current.render(
//                 (decodedText, result) => {
//                   setLoading(false);
//                   qrCodeSuccessCallback(decodedText, result);
//                 },
//                 qrCodeErrorCallback
//               );
//             })
//             .catch((err) => {
//               console.error('Restart failed', err);
//               setLoading(false);
//             });
//         }
//       },
//     }));
  
//     return (
//       <Paper elevation={4} sx={{ p: 3, mt: 4, position: 'relative' }}>
//         <Typography variant="h6" fontWeight="bold" gutterBottom>
//           Scan QR Code
//         </Typography>
  
//         <Box id={qrcodeRegionId} sx={{ width: '100%', height: 300 }} />
  
//         {loading && (
//           <Box
//             position="absolute"
//             top={0}
//             left={0}
//             right={0}
//             bottom={0}
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             sx={{ backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}
//           >
//             <CircularProgress />
//           </Box>
//         )}
//       </Paper>
//     );
//   });
  
//   export default Html5QrcodePlugin;


import React, { 
    useEffect, 
    useRef, 
    useImperativeHandle, 
    forwardRef 
  } from 'react';
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { Box, Paper, Typography } from '@mui/material';
  
  const qrcodeRegionId = "html5qr-code-full-region";
  
  const Html5QrcodePlugin = forwardRef((props, ref) => {
    const scannerRef = useRef(null);
  
    useEffect(() => {
      const config = {
        fps: 15, // Increased for better performance
        qrbox: 250,
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment",
          focusMode: "continuous",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      };
  
      const html5QrcodeScanner = new Html5QrcodeScanner(
        qrcodeRegionId, 
        config, 
        props.verbose || false
      );
  
      html5QrcodeScanner.render(
        props.qrCodeSuccessCallback,
        props.qrCodeErrorCallback
      );
  
      scannerRef.current = html5QrcodeScanner;
  
      return () => {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear scanner: ", error);
        });
      };
    }, [props]);
  
    useImperativeHandle(ref, () => ({
      restartScanner: () => {
        scannerRef.current?.clear().then(() => {
          scannerRef.current?.render(
            props.qrCodeSuccessCallback,
            props.qrCodeErrorCallback
          );
        });
      },
      pauseScanner: () => scannerRef.current?.pause(),
      resumeScanner: () => scannerRef.current?.resume()
    }));
  
    return (
      <Paper elevation={4} sx={{ 
        p: 3, 
        mt: 4,
        '& video': {
          filter: 'contrast(1.2) brightness(1.1)' // Enhanced for better scanning
        }
      }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Scan QR Code
        </Typography>
        <Box id={qrcodeRegionId} sx={{ width: '100%', height: 300 }} />
      </Paper>
    );
  });
  
  export default Html5QrcodePlugin;