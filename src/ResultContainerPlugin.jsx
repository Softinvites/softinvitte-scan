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

  const results = filterResults(
    propsResults && propsResults.length > 0 ? propsResults : defaultResults
  );

  useEffect(() => {


const sendResultsToBackend = async (results) => {
  if (results.length === 0) return;

  try {
    let qrData = results[0].decodedText.trim();

    // Parse the QR data
    const parsed = parseQrData(qrData);

    // Extract the necessary fields from the parsed QR data
    const firstName = parsed["First Name"]?.trim();
    const lastName = parsed["Last Name"]?.trim();
    const eventName = parsed["Event"]?.trim();

    console.log("📦 Parsed QR fields:", { firstName, lastName, eventName });

    // Validate the required fields
    if (!firstName || !lastName || !eventName) {
      console.error("❌ Missing required QR fields");
      return;
    }


  const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get("token");
const tokenFromStorage = localStorage.getItem("token");

const tokenToUse = tokenFromUrl || tokenFromStorage;

    // Send the entire qrData to the backend
    const response = await fetch('https://software-invite-api-self.vercel.app/guest/scan-qrcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenToUse}`,
      },
      body: JSON.stringify({ qrData })  // Send the full qrData as the payload
    });

    const data = await response.json();

    console.log("⬅️ Backend response:", data);

    if (response.ok) {
      console.log("✅ Check-in success:", data);
      setShowSuccess(true);
    
      // Get the token from the URL to preserve it if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
    
      setTimeout(() => {
        const redirectUrl = token
          ? `https://www.softinvite.com/blog?token=${token}`
          : `https://www.softinvite.com/blog`;
    
        window.location.href = redirectUrl;
      }, 5000);
    } else {
      console.error("❌ Check-in failed:", data.message);
    }
    
  } catch (error) {
    console.error("🚨 Error sending data to backend:", error);
  }
};


    sendResultsToBackend(results);
  }, [results]);

  return (
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

      <Snackbar open={showSuccess} autoHideDuration={5000}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Guest successfully checked in
        </Alert>
      </Snackbar>
    </Box>
  );
};


export default ResultContainerPlugin;
