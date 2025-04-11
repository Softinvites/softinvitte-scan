import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

const defaultResults = [
  {
    decodedText: "Test QR Code 1",
    result: { format: { formatName: "QR Code" } }
  }
];

function filterResults(results) {
  let filteredResults = [];
  for (let i = 0; i < results.length; ++i) {
    if (i === 0 || results[i].decodedText !== results[i - 1].decodedText) {
      filteredResults.push(results[i]);
    }
  }
  return filteredResults;
}

const parseQrData = (qrData) => {
  const fields = {};
  qrData.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length > 0) {
      fields[key.trim()] = rest.join(':').trim();
    }
  });
  return fields;
};

const ResultContainerTable = ({ data }) => {
  const results = filterResults(data);

  return (
    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#1976d2' }}>
          <TableRow>
            <TableCell sx={{ color: '#fff' }}>#</TableCell>
            <TableCell sx={{ color: '#fff' }}>Decoded Text</TableCell>
            <TableCell sx={{ color: '#fff' }}>Format</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, i) => (
            <TableRow key={i}>
              <TableCell>{i + 1}</TableCell>
              <TableCell sx={{ whiteSpace: 'pre-line' }}>{result.decodedText}</TableCell>
              <TableCell>{result.result.format.formatName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ResultContainerPlugin = ({ results: propsResults }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const results = filterResults(
    propsResults && propsResults.length > 0 ? propsResults : defaultResults
  );

  const redirectAfterDelay = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    const redirectUrl = tokenFromUrl
      ? `https://www.softinvite.com/blog?token=${tokenFromUrl}`
      : `https://www.softinvite.com/blog`;

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 5000);
  };

  useEffect(() => {
    const sendResultsToBackend = async (results) => {
      if (results.length === 0) return;

      let qrData = results[0].decodedText.trim();

      // Skip API call for test QR
      if (qrData === "Test QR Code 1") {
        console.log("Skipping test QR code.");
        return;
      }

      const parsed = parseQrData(qrData);
      const firstName = parsed["First Name"]?.trim();
      const lastName = parsed["Last Name"]?.trim();
      const eventName = parsed["Event"]?.trim();

      if (!firstName || !lastName || !eventName) {
        setErrorMessage("Invalid QR code format.");
        redirectAfterDelay();
        return;
      }

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        const tokenFromStorage = localStorage.getItem("token");
        const tokenToUse = tokenFromUrl || tokenFromStorage;

        const response = await fetch('https://software-invite-api-self.vercel.app/guest/scan-qrcode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenToUse}`,
          },
          body: JSON.stringify({ qrData }),
        });

        const data = await response.json();

        if (response.status === 404) {
          if (data.message.includes("Event not found")) {
            setErrorMessage("Event not found.");
          } else if (data.message.includes("Guest not found")) {
            setErrorMessage("Guest not found.");
          } else {
            setErrorMessage("Guest not found.");
          }
          redirectAfterDelay();
          return;
        }

        if (response.status === 200 && data.message?.includes("already checked in")) {
          setErrorMessage(`This access code has been used by ${firstName} ${lastName}`);
          redirectAfterDelay();
          return;
        }

        if (response.ok) {
          setShowSuccess(true);
          redirectAfterDelay();
        }

      } catch (error) {
        console.error("🚨 Error:", error);
        setErrorMessage("Server error during check-in.");
        redirectAfterDelay();
      }
    };

    sendResultsToBackend(results);
  }, [results]);

  return (
    <>
      {errorMessage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: '#fff',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: '#d32f2f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h2" color="white">✕</Typography>
          </Box>
          <Typography variant="h6" align="center" fontWeight="bold">
            {errorMessage}
          </Typography>
        </Box>
      )}

      <Box sx={{ padding: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Scanned Results ({results.length})
        </Typography>

        {results.length > 0 ? (
          <ResultContainerTable data={results} />
        ) : (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {!errorMessage && (
          <Snackbar open={showSuccess} autoHideDuration={5000}>
            <Alert severity="success" sx={{ width: '100%' }}>
              Guest successfully checked in
            </Alert>
          </Snackbar>
        )}
      </Box>
    </>
  );
};

export default ResultContainerPlugin;
