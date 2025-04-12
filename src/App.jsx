// import React, { useRef, useState } from 'react';
// import './App.css';
// import Html5QrcodePlugin from './Html5QrcodePlugin';
// import ResultContainerPlugin from './ResultContainerPlugin';

// const App = () => {
//   const scannerRef = useRef(null); // Properly set up ref
//   const [decodedResults, setDecodedResults] = useState([]);

//   const onNewScanResult = (decodedText, decodedResult) => {
//     console.log("Scan result:", decodedResult);

//     setDecodedResults([{ decodedText, result: decodedResult }]);

//     // Try to pause the scanner safely
//     if (scannerRef.current && scannerRef.current.pause) {
//       scannerRef.current.pause().catch(err => {
//         console.error("Pause failed:", err);
//       });
//     } else {
//       console.warn("Scanner does not support pause or ref is not set.");
//     }
//   };

//   return (
//     <div className="App">
//       <section className="App-section">
//         <div className="App-section-title">SoftInvites Check-in</div>
//         <Html5QrcodePlugin
//           scannerRef={scannerRef} // pass correctly named prop
//           fps={10}
//           qrbox={250}
//           disableFlip={false}
//           qrCodeSuccessCallback={onNewScanResult}
//           qrCodeErrorCallback={(error) => {
//             console.warn("QR Error:", error);
//           }}
//         />
//         <ResultContainerPlugin 
//           results={decodedResults}
//           scannerRef={scannerRef}
//         />
//       </section>
//     </div>
//   );
// };

// export default App;


import React, { useState, useRef } from 'react';
import './App.css';
import Html5QrcodePlugin from './Html5QrcodePlugin.jsx';
import ResultContainerPlugin from './ResultContainerPlugin.jsx';
import { Box, Container, Typography } from '@mui/material';

const App = () => {
  const [decodedResults, setDecodedResults] = useState([]);
  const scannerRef = useRef(null);

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
        ref={scannerRef}
        fps={10}
        qrbox={250}
        disableFlip={false}
        qrCodeSuccessCallback={onNewScanResult}
      />

      <ResultContainerPlugin 
        results={decodedResults} 
        scannerRef={scannerRef} 
      />
    </Container>
  );
};

export default App;