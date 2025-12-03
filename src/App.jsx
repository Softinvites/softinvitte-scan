import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import './App.css';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import ResultContainerPlugin from './ResultContainerPlugin';

const App = () => {
  const scannerRef = useRef(null); 
  const [decodedResults, setDecodedResults] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState('');
  const lastScanTime = useRef(0);
  const scanCooldown = 1000; // 1 second cooldown

  // Get event info from token
  useEffect(() => {
    const token = localStorage.getItem('token') || new URLSearchParams(window.location.search).get('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setEventId(payload.eventId || '');
        
        // Fetch event details
        if (payload.eventId) {
          fetch(`https://software-invite-api-self.vercel.app/event/${payload.eventId}`)
            .then(res => res.json())
            .then(data => setEventName(data.event?.name || 'Event'))
            .catch((error) => {
              console.error('Event fetch error:', error);
              setEventName('Event');
            });
        }
      } catch (error) {
        console.error('Token decode error:', error);
      }
    }
  }, []);

  const onNewScanResult = useCallback((decodedText, decodedResult) => {
    const now = Date.now();
    
    // Prevent rapid duplicate scans
    if (now - lastScanTime.current < scanCooldown) {
      return;
    }
    
    lastScanTime.current = now;
    console.log("Scan result:", decodedResult);

    setDecodedResults([{ decodedText, result: decodedResult }]);
  }, [scanCooldown]);

  const onScanError = useCallback((error) => {
    // Only log actual errors, not routine scan attempts
    if (!error.includes('No QR code found') && !error.includes('QR code parse error')) {
      console.warn("QR Error:", error);
    }
  }, []);

  // Memoize scanner props to prevent unnecessary re-renders
  const scannerProps = useMemo(() => ({
    scannerRef,
    fps: 15, // Optimized FPS
    qrbox: 280, // Slightly larger scan box
    disableFlip: false,
    qrCodeSuccessCallback: onNewScanResult,
    qrCodeErrorCallback: onScanError
  }), [onNewScanResult, onScanError]);

  return (
    <div className="App">
      <section className="App-section">
        <div className="App-section-title">
          SoftInvites Check-in
          {eventName && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>- {eventName}</span>}
        </div>
        <Html5QrcodePlugin {...scannerProps} />
        <ResultContainerPlugin 
          results={decodedResults}
          scannerRef={scannerRef}
        />
      </section>
    </div>
  );
};

export default React.memo(App);