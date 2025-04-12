// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   CircularProgress,
//   Snackbar,
//   Alert,
// } from '@mui/material';

// const defaultResults = [
//   {
//     decodedText: "Test QR Code 1",
//     result: { format: { formatName: "QR Code" } }
//   }
// ];

// function filterResults(results) {
//   let filteredResults = [];
//   for (let i = 0; i < results.length; ++i) {
//     if (i === 0 || results[i].decodedText !== results[i - 1].decodedText) {
//       filteredResults.push(results[i]);
//     }
//   }
//   return filteredResults;
// }

// const parseQrData = (qrData) => {
//   const fields = {};
//   qrData.split('\n').forEach(line => {
//     const [key, ...rest] = line.split(':');
//     if (key && rest.length > 0) {
//       fields[key.trim()] = rest.join(':').trim();
//     }
//   });
//   return fields;
// };

// const ResultContainerTable = ({ data }) => {
//   const results = filterResults(data);

//   return (
//     <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
//       <Table>
//         <TableHead sx={{ backgroundColor: '#1976d2' }}>
//           <TableRow>
//             <TableCell sx={{ color: '#fff' }}>#</TableCell>
//             <TableCell sx={{ color: '#fff' }}>Decoded Text</TableCell>
//             <TableCell sx={{ color: '#fff' }}>Format</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {results.map((result, i) => (
//             <TableRow key={i}>
//               <TableCell>{i + 1}</TableCell>
//               <TableCell sx={{ whiteSpace: 'pre-line' }}>{result.decodedText}</TableCell>
//               <TableCell>{result.result.format.formatName}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// const ResultContainerPlugin = ({ results: propsResults }) => {
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   const results = filterResults(
//     propsResults && propsResults.length > 0 ? propsResults : defaultResults
//   );

//   const redirectAfterDelay = () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const tokenFromUrl = urlParams.get("token");
//     const redirectUrl = tokenFromUrl
//       ? `https://www.softinvite.com/blog?token=${tokenFromUrl}`
//       : `https://www.softinvite.com/blog`;
  
//     setTimeout(() => {
//       window.location.href = redirectUrl;
//     }, 3000); 
//   };

//   useEffect(() => {
//     const sendResultsToBackend = async (results) => {
//       if (results.length === 0) return;
  
//       let qrData = results[0].decodedText.trim();
  
//       if (qrData === "Test QR Code 1") {
//         console.log("Skipping test QR code.");
//         return;
//       }
  
//       const parsed = parseQrData(qrData);
//       const firstName = parsed["First Name"]?.trim();
//       const lastName = parsed["Last Name"]?.trim();
//       const eventName = parsed["Event"]?.trim();
  
//       if (!firstName || !lastName || !eventName) {
//         setErrorMessage("Invalid QR code format.");
//         redirectAfterDelay();
//         return;
//       }
  
//       try {
//         const urlParams = new URLSearchParams(window.location.search);
//         const tokenFromUrl = urlParams.get("token");
//         const tokenFromStorage = localStorage.getItem("token");
//         const tokenToUse = tokenFromUrl || tokenFromStorage;
  
//         const response = await fetch('https://software-invite-api-self.vercel.app/guest/scan-qrcode', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${tokenToUse}`,
//           },
//           body: JSON.stringify({ qrData }),
//         });
  
//         const data = await response.json();
  
//         // Early return for known errors
//         if (response.status === 404) {
//           setErrorMessage(
//             data.message.includes("Event not found")
//               ? "Event not found."
//               : "Guest not found."
//           );
//           redirectAfterDelay();
//           return;
//         }
  
//         if (data.message?.includes("already checked in")) {
//           setErrorMessage(`This access code has been used by ${firstName} ${lastName}`);
//           redirectAfterDelay();
//           return;
//         }
  
//         if (response.ok) {
//           setShowSuccess(true);
//           setTimeout(() => {
//             redirectAfterDelay();
//           }, 2000);
//         } else {
//           // Catch all unexpected errors
//           setErrorMessage(data.message || "Unexpected server response.");
//           redirectAfterDelay();
//         }
  
//       } catch (error) {
//         console.error("🚨 Error:", error);
//         setErrorMessage("Server error during check-in.");
//         redirectAfterDelay();
//       }
//     };
  
//     sendResultsToBackend(results);
//   }, [results]);
  

//   return (
//     <>
//       {/* Error Message Toast */}
//       <Snackbar
//         open={Boolean(errorMessage)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         autoHideDuration={7000}
//         onClose={() => setErrorMessage("")}
//         sx={{
//           zIndex: 1500,
//           mt: 4,
//           '& .MuiAlert-root': {
//             fontSize: '1.2rem',
//             fontWeight: 'bold',
//             backgroundColor: '#d32f2f',
//             color: '#fff',
//             padding: '20px 30px',
//             borderRadius: '12px',
//             boxShadow: 6,
//           }
//         }}
//       >
//         <Alert severity="error" variant="filled">
//           {errorMessage}
//         </Alert>
//       </Snackbar>

//       <Box sx={{ padding: 4 }}>
//         <Typography variant="h5" fontWeight="bold" gutterBottom>
//           Scanned Results ({results.length})
//         </Typography>

//         {results.length > 0 ? (
//           <ResultContainerTable data={results} />
//         ) : (
//           <Box display="flex" justifyContent="center" mt={4}>
//             <CircularProgress />
//           </Box>
//         )}

//         <Snackbar open={showSuccess} autoHideDuration={2000}>
//           <Alert severity="success" sx={{ width: '100%' }}>
//             Guest successfully checked in
//           </Alert>
//         </Snackbar>
//       </Box>
//     </>
//   );
// };

// export default ResultContainerPlugin;

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

const ResultContainerPlugin = ({ results: propsResults }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validate if string is a valid MongoDB ObjectId
  const isValidGuestId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const redirectAfterDelay = (delay = 3000) => {
    setTimeout(() => {
      window.location.href = 'https://www.softinvite.com/blog';
    }, delay);
  };

  const handleCheckIn = async (guestId) => {
    setIsLoading(true);
    setErrorMessage("");
    setShowSuccess(false);

    try {
      const token = localStorage.getItem("token") || 
                   new URLSearchParams(window.location.search).get("token");

      const response = await fetch('https://software-invite-api-self.vercel.app/guest/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ guestId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Check-in failed");
      }

      setShowSuccess(true);
      redirectAfterDelay(2000);
    } catch (error) {
      setErrorMessage(error.message);
      redirectAfterDelay();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!propsResults || propsResults.length === 0) return;

    // Get the most recent scan result
    const latestResult = propsResults[propsResults.length - 1];
    const guestId = latestResult.decodedText.trim();

    // Skip test QR codes
    if (guestId === "Test QR Code 1") return;

    // Validate guest ID format
    if (!isValidGuestId(guestId)) {
      setErrorMessage("Invalid guest ID format");
      redirectAfterDelay();
      return;
    }

    // Process check-in
    handleCheckIn(guestId);
  }, [propsResults]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Guest Check-in System
      </Typography>

      {isLoading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
          <Typography variant="body1" ml={2}>Processing check-in...</Typography>
        </Box>
      )}

      {/* Success Notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Guest successfully checked in!
        </Alert>
      </Snackbar>

      {/* Error Notification */}
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={7000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultContainerPlugin;
