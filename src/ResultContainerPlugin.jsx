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
  const [hasProcessed, setHasProcessed] = useState(false); // New state to track if we've processed

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
      if (results.length === 0 || hasProcessed) return; // Skip if already processed
      
      let qrData = results[0].decodedText.trim();

      // Skip API call for test QR
      if (qrData === "Test QR Code 1") {
        console.log("Skipping test QR code.");
        setHasProcessed(true);
        return;
      }

      const parsed = parseQrData(qrData);
      const firstName = parsed["First Name"]?.trim();
      const lastName = parsed["Last Name"]?.trim();
      const eventName = parsed["Event"]?.trim();

      if (!firstName || !lastName || !eventName) {
        setErrorMessage("Invalid QR code format.");
        setHasProcessed(true);
        setTimeout(() => redirectAfterDelay(), 200);
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
          setHasProcessed(true);
          setTimeout(() => redirectAfterDelay(), 200);
          return;
        }

        if (response.status === 200 && data.message?.includes("already checked in")) {
          setErrorMessage(`This access code has been used by ${firstName} ${lastName}`);
          setHasProcessed(true);
          setTimeout(() => redirectAfterDelay(), 200);
          return;
        }

        if (response.ok) {
          setShowSuccess(true);
          setHasProcessed(true);
          redirectAfterDelay();
          return; // Explicit return to prevent further processing
        }

      } catch (error) {
        console.error("🚨 Error:", error);
        setErrorMessage("Server error during check-in.");
        setHasProcessed(true);
        setTimeout(() => redirectAfterDelay(), 200);
      }
    };

    sendResultsToBackend(results);
  }, [results, hasProcessed]); // Add hasProcessed to dependencies

  return (
    <>
      {/* Bold Red Toast for Error */}
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
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 1500,
            mt: 4,
            '& .MuiAlert-root': {
              fontSize: '1.2rem',
              fontWeight: 'bold',
              backgroundColor: '#4caf50',
              color: '#fff',
              padding: '20px 30px',
              borderRadius: '12px',
              boxShadow: 6,
            }
          }}
        >
          <Alert severity="success" variant="filled">
            Guest successfully checked in
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default ResultContainerPlugin;