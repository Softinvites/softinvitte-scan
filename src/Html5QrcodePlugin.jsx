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
  import { Box, Paper, Typography, CircularProgress, Button } from '@mui/material';
  
  const qrcodeRegionId = "html5qr-code-full-region";
  
  const Html5QrcodePlugin = forwardRef((props, ref) => {
    const { verbose, qrCodeSuccessCallback, qrCodeErrorCallback } = props;
    const scannerRef = useRef(null);
    const isMounted = useRef(false);
    const [isScannerReady, setIsScannerReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cameraError, setCameraError] = useState(null);
  
    const startScanner = useCallback(async () => {
      if (!isMounted.current || !document.getElementById(qrcodeRegionId)) return;
  
      try {
        setIsLoading(true);
        setCameraError(null);
  
        // Clear any existing scanner
        if (scannerRef.current) {
          await scannerRef.current.clear().catch(console.error);
        }
  
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
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
          verbose || false
        );
  
        await html5QrcodeScanner.render(
          qrCodeSuccessCallback,
          (error) => {
            console.error("Scanner error:", error);
            setCameraError(error || "Failed to access camera");
            qrCodeErrorCallback?.(error);
          }
        );
  
        scannerRef.current = html5QrcodeScanner;
        setIsScannerReady(true);
      } catch (error) {
        console.error("Scanner initialization error:", error);
        setCameraError(error.message || "Failed to initialize scanner");
      } finally {
        setIsLoading(false);
      }
    }, [verbose, qrCodeErrorCallback, qrCodeSuccessCallback]);
  
    useEffect(() => {
      isMounted.current = true;
      startScanner();
  
      return () => {
        isMounted.current = false;
        scannerRef.current?.clear().catch(console.error);
      };
    }, [startScanner]);
  
    useImperativeHandle(ref, () => ({
      restartScanner: async () => {
        try {
          await scannerRef.current?.clear();
          await startScanner();
        } catch (error) {
          console.error("Error restarting scanner:", error);
        }
      },
      pauseScanner: () => scannerRef.current?.pause(),
      resumeScanner: () => scannerRef.current?.resume(),
      isReady: () => isScannerReady
    }));
  
    return (
      <Paper elevation={4} sx={{ 
        p: 3, 
        mt: 4,
        position: 'relative',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Scan QR Code
        </Typography>
        
        {isLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Initializing scanner...
            </Typography>
          </Box>
        )}
  
        {cameraError && (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography color="error" sx={{ mb: 2 }}>
              {cameraError}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={startScanner}
            >
              Retry Camera
            </Button>
          </Box>
        )}
  
        <Box 
          id={qrcodeRegionId} 
          sx={{ 
            width: '100%', 
            minHeight: 300,
            visibility: isScannerReady && !cameraError ? 'visible' : 'hidden',
            '& video': {
              filter: 'contrast(1.2) brightness(1.1)',
              borderRadius: 1
            }
          }} 
        />
      </Paper>
    );
  });
  
  export default Html5QrcodePlugin;