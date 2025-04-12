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
  const filteredResults = [];
  for (let i = 0; i < results.length; i++) {
    if (i === 0 || results[i].decodedText !== results[i - 1].decodedText) {
      filteredResults.push(results[i]);
    }
  }
  return filteredResults;
}

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
              <TableCell>
              {result && result.result && result.result.format
                ? result.result.format.formatName
                : "N/A"}
            </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ✅ scannerRef now accepted here
const ResultContainerPlugin = ({ results: propsResults, scannerRef }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [guestDetails, setGuestDetails] = useState(null);

  const results = filterResults(
    propsResults && propsResults.length > 0 ? propsResults : defaultResults
  );

  const restartScannerAfterDelay = () => {
    setTimeout(() => {
      scannerRef?.current?.restartScanner();
    }, 3000);
  };

  useEffect(() => {
    const sendResultsToBackend = async (results) => {
      if (results.length === 0) return;

      const qrData = results[0].decodedText.trim();
      if (!qrData) {
        setErrorMessage("QR code data is empty");
        restartScannerAfterDelay();
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
          setErrorMessage(
            data.message.includes("Event not found")
              ? "Event not found."
              : "Guest not found."
          );
          restartScannerAfterDelay();
          return;
        }

        if (data.message?.includes("already checked in")) {
          const guest = data.guest;
          if (guest) {
            setErrorMessage(`This access code has already been used by ${guest.firstName} ${guest.lastName}.`);
          } else {
            setErrorMessage(`This access code has already been used.`);
          }
          restartScannerAfterDelay();
          return;
        }

        if (response.ok) {
          setGuestDetails(data.guest);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false); 
            restartScannerAfterDelay();
          }, 2000);
        }else {
          setErrorMessage(data.message || "Unexpected server response.");
          restartScannerAfterDelay();
        }

      } catch (error) {
        console.error("🚨 Error during check-in:", error);
        setErrorMessage("Server error during check-in.");
        restartScannerAfterDelay();
      }
    };

    sendResultsToBackend(results);
  }, [results]);

  return (
    <>
      <Snackbar
        open={Boolean(errorMessage)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={7000}
        onClose={() => setErrorMessage("")}
        sx={{
          zIndex: 1500,
          mt: 4,
          '& .MuiAlert-root': {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            backgroundColor: '#d32f2f',
            color: '#fff',
            padding: '20px 30px',
            borderRadius: '12px',
            boxShadow: 6,
          }
        }}
      >
        <Alert severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>

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

<Snackbar
  open={showSuccess}
  autoHideDuration={2000}
  onClose={() => setShowSuccess(false)}
>
  <Alert severity="success" sx={{ width: '100%' }}>
    Guest successfully checked in
  </Alert>
</Snackbar>
      </Box>
    </>
  );
};

export default ResultContainerPlugin;
