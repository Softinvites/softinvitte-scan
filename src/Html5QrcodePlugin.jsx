import React, {
    useEffect,
    useRef,
    useState,
    useImperativeHandle,
    forwardRef,
  } from 'react';
  import {
    Html5QrcodeScanner,
    Html5QrcodeScanType,
  } from 'html5-qrcode';
  import {
    Box,
    Paper,
    Typography,
    CircularProgress,
  } from '@mui/material';
  
  const qrcodeRegionId = 'html5qr-code-full-region';
  
  const createConfig = () => ({
    fps: 15,
    qrbox: 300,
    aspectRatio: 1.0,
    disableFlip: true,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true,
    },
    videoConstraints: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
  });
  
  const Html5QrcodePlugin = forwardRef((props, ref) => {
    const [loading, setLoading] = useState(true);
    const scannerRef = useRef(null);
  
    const { qrCodeSuccessCallback, qrCodeErrorCallback, verbose } = props;
  
    useEffect(() => {
      const config = createConfig();
      const verboseOption = verbose === true;
  
      if (!qrCodeSuccessCallback) {
        throw new Error('qrCodeSuccessCallback is a required callback.');
      }
  
      scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, verboseOption);
  
      setLoading(true);
  
      scannerRef.current.render(
        (decodedText, result) => {
          setLoading(false);
          qrCodeSuccessCallback(decodedText, result);
        },
        qrCodeErrorCallback
      );
  
      return () => {
        scannerRef.current
          .clear()
          .catch((err) => console.error('Clear failed', err));
      };
    }, [qrCodeSuccessCallback, qrCodeErrorCallback, verbose]);
  
    useImperativeHandle(ref, () => ({
      restartScanner: () => {
        setLoading(true);
        scannerRef.current
          ?.clear()
          .then(() => {
            scannerRef.current.render(
              (decodedText, result) => {
                setLoading(false);
                qrCodeSuccessCallback(decodedText, result);
              },
              qrCodeErrorCallback
            );
          })
          .catch((err) => {
            console.error('Error restarting scanner:', err);
            setLoading(false);
          });
      },
    }));
  
    return (
      <Paper elevation={4} sx={{ p: 3, mt: 4, position: 'relative' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Scan QR Code
        </Typography>
  
        {/* Always render the target element */}
        <Box
          id={qrcodeRegionId}
          sx={{
            width: '100%',
            height: 300,
          }}
        />
  
        {/* Overlay loading spinner */}
        {loading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 10 }}
          >
            <CircularProgress />
          </Box>
        )}
      </Paper>
    );
  });
  
  export default Html5QrcodePlugin;
  