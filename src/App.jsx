// @ts-nocheck

import React, { useRef, useState } from 'react';
import './App.css';
import Html5QrcodePlugin from './Html5QrcodePlugin.jsx';
import ResultContainerPlugin from './ResultContainerPlugin.jsx';

const App = () => {
  const [decodedResults, setDecodedResults] = useState([]);
  const scannerRef = useRef();

  const onNewScanResult = (decodedText, decodedResult) => {
    if (!decodedText) return;
    console.log("App [result]", decodedResult);
    setDecodedResults([{ decodedText, result: decodedResult }]);
  };

  return (
    <div className="App">
      <section className="App-section">
        <div className="App-section-title">SoftInvites Check-in</div>
        <br /><br /><br />
        <Html5QrcodePlugin
          ref={scannerRef}
          fps={10}
          qrbox={250}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}
          qrCodeErrorCallback={(errorMessage) => {
            console.warn("Camera error:", errorMessage);
          }}
        />
        <ResultContainerPlugin
          results={decodedResults}
          scannerRef={scannerRef}
        />
      </section>
    </div>
  );
};

export default App;
