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
  } from 'react';
  import { Html5Qrcode } from 'html5-qrcode';
  import { Box, Paper, Typography } from '@mui/material';
  
  const qrcodeRegionId = "html5qr-code-full-region";
  
  const Html5QrcodePlugin = forwardRef((props, ref) => {
    const html5QrCodeRef = useRef(null);
    const cameraIdRef = useRef(null);
  
    useEffect(() => {
      const initScanner = async () => {
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length) {
            cameraIdRef.current = devices[0].id;
  
            html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId);
  
            await html5QrCodeRef.current.start(
              cameraIdRef.current,
              {
                fps: 15,
                qrbox: 250,
                disableFlip: false,
                videoConstraints: {
                  facingMode: "environment",
                  focusMode: "continuous",
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 }
                }
              },
              props.qrCodeSuccessCallback,
              props.qrCodeErrorCallback
            );
          } else {
            console.error("No cameras found.");
          }
        } catch (err) {
          console.error("Error initializing scanner:", err);
        }
      };
  
      initScanner();
  
      return () => {
        if (html5QrCodeRef.current?.isScanning) {
          html5QrCodeRef.current.stop()
            .then(() => html5QrCodeRef.current.clear())
            .catch((err) => console.error("Error stopping scanner on cleanup:", err));
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
              fps: 15,
              qrbox: 250,
              disableFlip: false,
              videoConstraints: {
                facingMode: "environment",
                focusMode: "continuous",
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 }
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
  