import React, { useState, useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import "./Checkin.css"

const CheckIn: React.FC = () => {
  const [workerName, setWorkerName] = useState('');
  const [blockName, setBlockName] = useState('');
  const [rowNumber, setRowNumber] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<string[]>([]);       // Array to store block names
  const [rows, setRows] = useState<number[]>([]);           // Array to store row numbers

  // Fetch block names when component mounts
  useEffect(() => {
    fetch('http://localhost:5000/api/blocks')
      .then(response => response.json())
      .then(data => setBlocks(data))
      .catch(error => console.error('Error fetching blocks:', error));
  }, []);

  // Fetch rows for the selected block
  useEffect(() => {
    if (blockName) {
      fetch(`http://localhost:5000/api/block/${blockName}/rows`)
        .then(response => response.json())
        .then(data => setRows(data))
        .catch(error => console.error('Error fetching rows:', error));
    }
  }, [blockName]); // Refetch rows when blockName changes

  const startScan = async () => {
    try {
      await BarcodeScanner.checkPermission({ force: true });
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        console.log('QR Code Content:', result.content);
        setWorkerName(result.content); // Set the worker's name from QR code
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
    } finally {
      await BarcodeScanner.showBackground(); // Show the background again after scanning
    }
  };

  const handleCheckIn = async () => {
    if (!workerName || !blockName || rowNumber === null) {
      alert('Please provide all required information.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerName, blockName, rowNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Check-in successful:', data);
        alert('Check-in successful!');
      } else {
        const errorData = await response.json();
        console.error('Check-in failed:', errorData);
        alert(`Check-in failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('An error occurred during check-in.');
    }
  };

  return (
    <div id="container">
      <h2>Check In</h2>

      {workerName ? (
        <p>Worker Name: {workerName}</p>
      ) : (
        <button onClick={startScan}>Scan Worker QR Code</button>
      )}

      {/* Block Dropdown */}
      <div>
        <label>Block Name:</label>
        <select value={blockName} onChange={(e) => setBlockName(e.target.value)}>
          <option value="">Select Block</option>
          {blocks.map((block) => (
            <option key={block} value={block}>
              {block}
            </option>
          ))}
        </select>
      </div>

      {/* Row Dropdown */}
      <div>
        <label>Row Number:</label>
        <select
          value={rowNumber || ''}
          onChange={(e) => setRowNumber(Number(e.target.value))}
          disabled={!blockName} // Disable dropdown until a block is selected
        >
          <option value="">Select Row</option>
          {rows.map((row) => (
            <option key={row} value={row}>
              {row}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleCheckIn} disabled={!blockName || !rowNumber}>Check In</button>
    </div>
  );
};

export default CheckIn;
