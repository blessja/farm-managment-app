import React from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

const CheckIn: React.FC = () => {
  const startScan = async () => {
    try {
      await BarcodeScanner.checkPermission({ force: true });
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        const workerName = result.content; // Assuming QR code contains the worker's name
        const checkInData = {
          workerName,
          blockName: 'Block 1', // Replace with the actual block name
          rowNumber: 20, // Replace with the actual row number
        };

        await fetch('http://localhost:5000/api/checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(checkInData),
        });

        alert(`Checked in ${workerName} successfully!`);
      }
    } catch (error) {
      console.error('Error scanning QR code for check-in:', error);
    }
  };

  return (
    <div>
      <h1>Check In</h1>
      <button onClick={startScan}>Start Check-In</button>
    </div>
  );
};

export default CheckIn;
