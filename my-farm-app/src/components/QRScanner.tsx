import React from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

const QRScanner: React.FC = () => {
  const startScan = async () => {
    try {
      await BarcodeScanner.checkPermission({ force: true });
      await BarcodeScanner.hideBackground(); // make background transparent
      const result = await BarcodeScanner.startScan(); // start scanning and wait for a result

      if (result.hasContent) {
        alert(result.content); // Process the QR code content
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
    }
  };

  return (
    <div>
      <button onClick={startScan}>Start QR Scan</button>
    </div>
  );
};

export default QRScanner;
