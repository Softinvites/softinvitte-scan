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
  useState,
  useImperativeHandle, 
  forwardRef 
} from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Paper, Typography } from '@mui/material';

const qrcodeRegionId = "html5qr-code-full-region";

const Html5QrcodePlugin = forwardRef((props, ref) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;

    const config = {
      fps: props.fps || 15,
      qrbox: props.qrbox || 250,
      disableFlip: props.disableFlip || false,
      rememberLastUsedCamera: true, // Important for continuous scanning
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
      (decodedText, decodedResult) => {
        props.qrCodeSuccessCallback(decodedText, decodedResult);
        // Scanner continues automatically without pausing
      },
      props.qrCodeErrorCallback
    );

    scannerRef.current = html5QrcodeScanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner: ", error);
        });
      }
    };
  }, [isScanning, props]);

  useImperativeHandle(ref, () => ({
    restartScanner: () => {
      setIsScanning(false);
      setTimeout(() => setIsScanning(true), 100);
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
    }
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