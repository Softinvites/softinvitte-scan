// import React, { 
//     useEffect, 
//     useRef, 
//     useImperativeHandle, 
//     forwardRef 
//   } from 'react';
//   import { Html5QrcodeScanner } from 'html5-qrcode';
//   import { Box, Paper, Typography } from '@mui/material';
  
//   const qrcodeRegionId = "html5qr-code-full-region";
  
//   const Html5QrcodePlugin = forwardRef((props, ref) => {
//     const scannerRef = useRef(null);
  
//     useEffect(() => {
//       const config = {
//         fps: 15, // Increased for better performance
//         qrbox: 250,
//         disableFlip: false,
//         videoConstraints: {
//           facingMode: "environment",
//           focusMode: "continuous",
//           width: { min: 640, ideal: 1280, max: 1920 },
//           height: { min: 480, ideal: 720, max: 1080 }
//         }
//       };
  
//       const html5QrcodeScanner = new Html5QrcodeScanner(
//         qrcodeRegionId, 
//         config, 
//         props.verbose || false
//       );
  
//       html5QrcodeScanner.render(
//         props.qrCodeSuccessCallback,
//         props.qrCodeErrorCallback
//       );
  
//       scannerRef.current = html5QrcodeScanner;
  
//       return () => {
//         html5QrcodeScanner.clear().catch(error => {
//           console.error("Failed to clear scanner: ", error);
//         });
//       };
//     }, [props]);
  
//     useImperativeHandle(ref, () => ({
//       restartScanner: () => {
//         scannerRef.current?.clear().then(() => {
//           scannerRef.current?.render(
//             props.qrCodeSuccessCallback,
//             props.qrCodeErrorCallback
//           );
//         });
//       },
//       pauseScanner: () => scannerRef.current?.pause(),
//       resumeScanner: () => scannerRef.current?.resume()
//     }));
  
//     return (
//       <Paper elevation={4} sx={{ 
//         p: 3, 
//         mt: 4,
//         '& video': {
//           filter: 'contrast(1.2) brightness(1.1)' // Enhanced for better scanning
//         }
//       }}>
//         <Typography variant="h6" fontWeight="bold" gutterBottom>
//           Scan QR Code
//         </Typography>
//         <Box id={qrcodeRegionId} sx={{ width: '100%', height: 300 }} />
//       </Paper>
//     );
//   });
  
//   export default Html5QrcodePlugin;



import React, { 
    useEffect, 
    useRef, 
    useImperativeHandle, 
    forwardRef,
    useCallback,
    useState
  } from 'react';
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { Box, Paper, Typography } from '@mui/material';
  
  const qrcodeRegionId = "html5qr-code-full-region";
  
  const Html5QrcodePlugin = forwardRef((props, ref) => {
    const scannerRef = useRef(null);
    const isMounted = useRef(false);
    const [isScannerReady, setIsScannerReady] = useState(false);
  
    const startScanner = useCallback(() => {
      if (!isMounted.current || !document.getElementById(qrcodeRegionId)) {
        return;
      }
  
      // Clear any existing scanner first
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear previous scanner: ", error);
        });
      }
  
      const config = {
        fps: 15,
        qrbox: 250,
        disableFlip: false,
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanner.SCAN_TYPE_CAMERA],
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
      setIsScannerReady(true);
    }, [props.qrCodeErrorCallback, props.qrCodeSuccessCallback, props.verbose]);
  
    useEffect(() => {
      isMounted.current = true;
      
      // Wait briefly to ensure DOM is ready
      const timer = setTimeout(() => {
        if (isMounted.current) {
          startScanner();
        }
      }, 100);
  
      return () => {
        isMounted.current = false;
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(error => {
            console.error("Failed to clear scanner: ", error);
          });
        }
      };
    }, [startScanner]);
  
    useImperativeHandle(ref, () => ({
      restartScanner: () => {
        if (scannerRef.current) {
          scannerRef.current.clear().then(() => {
            startScanner();
          }).catch(error => {
            console.error("Failed to restart scanner: ", error);
          });
        }
      },
      pauseScanner: () => {
        if (scannerRef.current) {
          scannerRef.current.pause();
        }
      },
      resumeScanner: () => {
        if (scannerRef.current) {
          scannerRef.current.resume();
        }
      },
      isReady: () => isScannerReady
    }));
  
    return (
      <Paper elevation={4} sx={{ 
        p: 3, 
        mt: 4,
        '& video': {
          filter: 'contrast(1.2) brightness(1.1)'
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