import React, { useRef, useState } from 'react';
import './App.css';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import ResultContainerPlugin from './ResultContainerPlugin';

const App = () => {
  const scannerRef = useRef(null); 
  const [decodedResults, setDecodedResults] = useState([]);

  const onNewScanResult = (decodedText, decodedResult) => {
    console.log("Scan result:", decodedResult);

    setDecodedResults([{ decodedText, result: decodedResult }]);
  };

  return (
    <div className="App">
      <section className="App-section">
        <div className="App-section-title">SoftInvites Check-in</div>
        <Html5QrcodePlugin
          scannerRef={scannerRef} // pass correctly named prop
          fps={10}
          qrbox={250}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}
          qrCodeErrorCallback={(error) => {
            console.warn("QR Error:", error);
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