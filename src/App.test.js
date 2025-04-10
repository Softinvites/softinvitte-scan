// @ts-nocheck

import React, { useState } from 'react';
import './App.css';
import Html5QrcodePlugin from './Html5QrcodePlugin.jsx';
import ResultContainerPlugin from './ResultContainerPlugin.jsx';

import { Box, Container, Typography } from '@mui/material';

const App = () => {
    const [decodedResults, setDecodedResults] = useState([]);

    const onNewScanResult = (decodedText, decodedResult) => {
        console.log("App [result]", decodedResult);
        setDecodedResults(prev => [...prev, decodedResult]);
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    SoftInvites Check-in
                </Typography>
            </Box>

            <Html5QrcodePlugin
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
            />

            <ResultContainerPlugin results={decodedResults} />
        </Container>
    );
};

export default App;
