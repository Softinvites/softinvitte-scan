import React, {
    useEffect,
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
    let scanner;
  
    useEffect(() => {
      const config = createConfig();
      const verbose = props.verbose === true;
  
      if (!props.qrCodeSuccessCallback) {
        throw new Error('qrCodeSuccessCallback is required callback.');
      }
  
      scanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
  
      setLoading(true); // Show loading spinner
  
      scanner.render(
        (decodedText, result) => {
          setLoading(false); // Hide spinner on first successful scan
          props.qrCodeSuccessCallback(decodedText, result);
        },
        props.qrCodeErrorCallback
      );
  
      return () => {
        scanner
          .clear()
          .catch((err) => console.error('Clear failed', err));
      };
    }, []);
  
    useImperativeHandle(ref, () => ({
      restartScanner: () => {
        setLoading(true);
        scanner
          ?.clear()
          .then(() => {
            scanner.render(
              (decodedText, result) => {
                setLoading(false);
                props.qrCodeSuccessCallback(decodedText, result);
              },
              props.qrCodeErrorCallback
            );
          })
          .catch((err) => {
            console.error('Error restarting scanner:', err);
            setLoading(false);
          });
      },
    }));
  
    return (
      <Paper elevation={4} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Scan QR Code
        </Typography>
  
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={300}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box id={qrcodeRegionId} />
        )}
      </Paper>
    );
  });
  
  export default Html5QrcodePlugin;
  