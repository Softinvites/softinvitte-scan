import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = (props) => {
    let config = {};
    if (props.fps) config.fps = props.fps;
    if (props.qrbox) config.qrbox = props.qrbox;
    if (props.aspectRatio) config.aspectRatio = props.aspectRatio;
    if (props.disableFlip !== undefined) config.disableFlip = props.disableFlip;
    return config;
};

const Html5QrcodePlugin = (props) => {
    useEffect(() => {
        const config = createConfig(props);
        const verbose = props.verbose === true;

        if (!props.qrCodeSuccessCallback) {
            throw new Error("qrCodeSuccessCallback is required callback.");
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
        html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, [props]);

    return (
        <Paper elevation={4} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Scan QR Code
            </Typography>
            <Box id={qrcodeRegionId} />
        </Paper>
    );
};

export default Html5QrcodePlugin;
