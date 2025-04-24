import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Paper, Typography } from '@mui/material';

const qrcodeRegionId = "html5qr-code-full-region";

const Html5QrcodePlugin = forwardRef((props, ref) => {
  const html5QrcodeRef = useRef(null);
  const cameraIdRef = useRef(null);

  useEffect(() => {
    html5QrcodeRef.current = new Html5Qrcode(qrcodeRegionId);

    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          const cameraId = devices[0].id;
          cameraIdRef.current = cameraId;

          html5QrcodeRef.current
            .start(
              cameraId,
              {
                fps: props.fps || 10,
                qrbox: props.qrbox || 250,
                aspectRatio: 1.777,
                experimentalFeatures: {
                  useBarCodeDetectorIfSupported: true
                },
                videoConstraints: {
                  facingMode: "environment"
                }
              },
              props.qrCodeSuccessCallback,
              props.qrCodeErrorCallback
            )
            .catch(err => {
              console.error("Failed to start scanner:", err);
            });
        }
      })
      .catch(err => {
        console.error("Camera fetch failed:", err);
      });

    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop()
          .then(() => html5QrcodeRef.current.clear())
          .catch(err => console.error("Failed to stop/clear scanner:", err));
      }
    };
  }, [props]);

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.pause(true);
      }
    },
    resume: () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.resume();
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
