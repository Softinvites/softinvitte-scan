import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

// Filter function to clean results
const filterResults = (results) => {
  return results.filter((result) => result.status === 'valid');
};

const defaultResults = [
  { id: 1, decodedText: 'Default QR Code', status: 'valid' },
  { id: 2, decodedText: 'Another Default QR', status: 'valid' },
];

const ResultContainerTable = ({ data }) => (
  <table>
    <thead>
      <tr>
        <th>QR Code Data</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item) => (
        <tr key={item.id}>
          <td>{item.decodedText}</td>
          <td>{item.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ResultContainerPlugin = ({ results: propsResults, scannerRef }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const lastProcessedCode = useRef("");
  const hasProcessed = useRef(false);

  const results = filterResults(
    propsResults && propsResults.length > 0 ? propsResults : defaultResults
  );

  const restartScannerAfterDelay = useCallback(() => {
    setTimeout(() => {
      hasProcessed.current = false;
      lastProcessedCode.current = "";
      scannerRef?.current?.restartScanner?.();
    }, 3000);
  }, [scannerRef]);

  useEffect(() => {
    const sendResultsToBackend = async (results) => {
      if (results.length === 0 || hasProcessed.current) return;

      const qrData = results[0].decodedText.trim();
      if (!qrData || qrData === lastProcessedCode.current) return;

      lastProcessedCode.current = qrData;
      hasProcessed.current = true;
      setLoading(true);

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        const tokenFromStorage = localStorage.getItem("token");
        const tokenToUse = tokenFromUrl || tokenFromStorage;

        const response = await fetch('https://software-invite-api-self.vercel.app/guest/scan-qrcode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenToUse}`,
          },
          body: JSON.stringify({ qrData }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.status === 500) {
          console.error("🚨 Server Error (500):", data);
          setErrorMessage("Server error. Please try again.");
          restartScannerAfterDelay();
          return;
        }

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
          const name = guest ? `${guest.firstName} ${guest.lastName}` : '';
          setErrorMessage(`This access code has already been used${name ? ` by ${name}` : ''}.`);
          restartScannerAfterDelay();
          return;
        }

        if (response.ok) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            restartScannerAfterDelay();
          }, 2000);
        } else {
          setErrorMessage(data.message || "Unexpected server response.");
          restartScannerAfterDelay();
        }

      } catch (error) {
        console.error("🚨 Error during check-in:", error);
        setErrorMessage("Network/server error during check-in.");
        setLoading(false);
        restartScannerAfterDelay();
      }
    };

    sendResultsToBackend(results);
  }, [results, restartScannerAfterDelay]);

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

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : results.length > 0 ? (
          <ResultContainerTable data={results} />
        ) : (
          <Typography>No results found.</Typography>
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
