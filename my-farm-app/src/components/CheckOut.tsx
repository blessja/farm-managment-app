import React from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

const CheckOut: React.FC = () => {
  const startScan = async () => {
    try {
      await BarcodeScanner.checkPermission({ force: true });
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        const workerName = result.content; // Assuming QR code contains the worker's name
        const checkOutData = {
          workerName,
          blockName: 'Block 1', // Replace with the actual block name
          rowNumber: 20, // Replace with the actual row number
        };

        await fetch('http://localhost:5000/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(checkOutData),
        });

        alert(`Checked out ${workerName} successfully!`);
      }
    } catch (error) {
      console.error('Error scanning QR code for check-out:', error);
    }
  };

  return (
    <div>
      <h1>Check Out</h1>
      <button onClick={startScan}>Start Check-Out</button>
    </div>
  );
};

export default CheckOut;
