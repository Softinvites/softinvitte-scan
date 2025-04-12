// @ts-nocheck

import React, { useRef, useState } from 'react';
import './App.css';
import Html5QrcodePlugin from './Html5QrcodePlugin.jsx';
import ResultContainerPlugin from './ResultContainerPlugin.jsx';

const App = () => {
  const [decodedResults, setDecodedResults] = useState([]);
  const scannerRef = useRef();

  const onNewScanResult = (decodedText, decodedResult) => {
    console.log("App [result]", decodedResult);
    // Save the result in an array format with required structure
    setDecodedResults([{ decodedText, result: decodedResult }]);
  };

  return (
    <div className="App">
      <section className="App-section">
        <div className="App-section-title">SoftInvites Check-in</div>
        <br /><br /><br />
        
        <Html5QrcodePlugin
          scannerRef={scannerRef}  // ✅ Pass scannerRef via props
          fps={10}
          qrbox={250}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}
        />

        <ResultContainerPlugin
          results={decodedResults}
          scannerRef={scannerRef}  // ✅ Send scannerRef for restarts
        />
      </section>
    </div>
  );
};

export default App;
