import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState
} from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Paper, Typography, Alert } from '@mui/material';

const qrcodeRegionId = "html5qr-code-full-region";

const Html5QrcodePlugin = forwardRef((props, ref) => {
  const html5QrcodeRef = useRef(null);
  const cameraIdRef = useRef(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initializeScanner = async () => {
      try {
        if (html5QrcodeRef.current) {
          await html5QrcodeRef.current.stop();
          html5QrcodeRef.current.clear();
        }
        
        html5QrcodeRef.current = new Html5Qrcode(qrcodeRegionId);
        
        // Get cameras with better device selection
        const devices = await Html5Qrcode.getCameras();
        
        if (!devices || devices.length === 0) {
          throw new Error('No cameras found');
        }
        
        // Prefer back camera for mobile devices
        let selectedCamera = devices[0];
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          selectedCamera = backCamera;
        }
        
        cameraIdRef.current = selectedCamera.id;
        
        if (!mounted) return;
        
        // Enhanced configuration for cross-platform compatibility
        const config = {
          fps: Math.min(props.fps || 15, 30), // Cap FPS for performance
          qrbox: {
            width: Math.min(props.qrbox || 280, window.innerWidth * 0.8),
            height: Math.min(props.qrbox || 280, window.innerWidth * 0.8)
          },
          aspectRatio: 1.0, // Square aspect ratio works better
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          videoConstraints: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 15, max: 30 }
          },
          // Additional mobile optimizations
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5Qrcode.SCAN_TYPE_CAMERA]
        };
        
        await html5QrcodeRef.current.start(
          selectedCamera.id,
          config,
          props.qrCodeSuccessCallback,
          props.qrCodeErrorCallback
        );
        
        if (mounted) {
          setIsInitialized(true);
          setError(null);
        }
        
      } catch (err) {
        console.error("Scanner initialization failed:", err);
        if (mounted) {
          setError(err.message || 'Failed to initialize camera');
        }
      }
    };
    
    // Delay initialization slightly for better mobile compatibility
    const timer = setTimeout(initializeScanner, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
      
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop()
          .then(() => {
            if (html5QrcodeRef.current) {
              html5QrcodeRef.current.clear();
            }
          })
          .catch(err => console.error("Failed to stop scanner:", err));
      }
    };
  }, [props.fps, props.qrbox]);

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (html5QrcodeRef.current && isInitialized) {
        html5QrcodeRef.current.pause(true);
      }
    },
    resume: () => {
      if (html5QrcodeRef.current && isInitialized) {
        html5QrcodeRef.current.resume();
      }
    },
    isReady: () => isInitialized
  }));

  return (
    <Paper elevation={4} sx={{
      p: 3,
      mt: 4,
      '& video': {
        filter: 'contrast(1.1) brightness(1.05)',
        borderRadius: 2
      },
      '& canvas': {
        borderRadius: 2
      }
    }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Scan QR Code
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box 
        id={qrcodeRegionId} 
        sx={{ 
          width: '100%', 
          height: 'fit-content',
          minHeight: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }} 
      />
    </Paper>
  );
});

Html5QrcodePlugin.displayName = 'Html5QrcodePlugin';

export default Html5QrcodePlugin;
