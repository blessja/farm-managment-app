import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

const QrScanner = ({ onScan }) => {
  const [log, setLog] = useState("");

  const handleScan = (result) => {
    if (result) {
      setLog("Scan result: " + JSON.stringify(result));
      const { text } = result;
      if (text) {
        setLog("Scanned text: " + text);
        onScan(text);
      } else {
        setLog("No 'text' in result: " + JSON.stringify(result));
      }
    } else {
      setLog("No result returned from scan.");
    }
  };

  const handleError = (err) => {
    setLog("QR Reader Error: " + err.message);
  };

  return (
    <div>
      <p>{log}</p>
      <QrReader
        delay={300}
        onResult={handleScan}
        onError={handleError}
        constraints={{
          facingMode: "environment",
        }}
        style={{
          width: "400px",
          height: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </div>
  );
};

export default QrScanner;
