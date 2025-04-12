import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Box, Paper, Typography } from '@mui/material';

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = () => ({
  fps: 15,
  qrbox: 300,
  aspectRatio: 1.0,
  disableFlip: true,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true
  },
  videoConstraints: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
});

// Make scanner externally controllable
const Html5QrcodePlugin = forwardRef((props, ref) => {
  let scanner;

  useEffect(() => {
    const config = createConfig();
    const verbose = props.verbose === true;

    if (!props.qrCodeSuccessCallback) {
      throw new Error("qrCodeSuccessCallback is required callback.");
    }

    scanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);

    scanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback
    );

    return () => {
      scanner.clear().catch(err => console.error("Clear failed", err));
    };
  }, []);

  useImperativeHandle(ref, () => ({
    restartScanner: () => {
      scanner?.clear().then(() => {
        scanner.render(
          props.qrCodeSuccessCallback,
          props.qrCodeErrorCallback
        );
      }).catch((err) => {
        console.error("Error restarting scanner:", err);
      });
    }
  }));

  return (
    <Paper elevation={4} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Scan QR Code
      </Typography>
      <Box id={qrcodeRegionId} />
    </Paper>
  );
});

export default Html5QrcodePlugin;
