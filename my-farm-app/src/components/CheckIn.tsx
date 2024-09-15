import React, { useState, useEffect } from "react";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import {
  IonButton,
  IonCard,
  IonContent,
  IonPage,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { Watermark } from "antd";
import Header from "./Header";
import Footer from "./Footer";
import { useHistory } from "react-router-dom";
import "./Checkin.css";

const CheckIn: React.FC = () => {
  const [workerName, setWorkerName] = useState("");
  const [workerID, setWorkerID] = useState(""); // New state for worker ID
  const [blockName, setBlockName] = useState("");
  const [rowNumber, setRowNumber] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<string[]>([]); // Array to store block names
  const [rows, setRows] = useState<string[]>([]); // Array to store row numbers

  // Fetch block names when component mounts
  useEffect(() => {
    fetch("http://localhost:5000/api/blocks")
      .then((response) => response.json())
      .then((data) => setBlocks(data))
      .catch((error) => console.error("Error fetching blocks:", error));
  }, []);

  // Fetch rows for the selected block
  useEffect(() => {
    if (blockName) {
      fetch(`http://localhost:5000/api/block/${blockName}/rows`)
        .then((response) => response.json())
        .then((data) => setRows(data))
        .catch((error) => console.error("Error fetching rows:", error));
    }
  }, [blockName]); // Refetch rows when blockName changes

  const startScan = async () => {
    try {
      console.log("Starting QR code scan...");
      await BarcodeScanner.checkPermission({ force: true });
      console.log("Permission granted. Hiding background...");
      await BarcodeScanner.hideBackground();
      console.log("Starting the scan...");
      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        console.log("QR Code Content:", result.content);

        try {
          // Parse the QR code content as JSON
          const workerData = JSON.parse(result.content);

          // Set the worker's name and ID from the QR code
          setWorkerName(workerData.workerName);
          setWorkerID(workerData.workerID);
          console.log("Worker data parsed and set:", workerData);
        } catch (parseError) {
          console.error("Error parsing QR code content:", parseError);
          alert("Invalid QR code content. Please try again.");
        }
      } else {
        console.log("No content found in the QR code.");
        alert("No QR code content found. Please try again.");
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
      alert("An error occurred while scanning the QR code. Please try again.");
    } finally {
      console.log("Showing background again...");
      await BarcodeScanner.showBackground(); // Show the background again after scanning
    }
  };

  const handleCheckIn = async () => {
    if (!workerID || !workerName || !blockName || rowNumber === null) {
      alert("Please provide all required information.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerID, workerName, blockName, rowNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Check-in successful:", data);
        alert("Check-in successful!");

        // Clear the form values after successful check-in
        setWorkerName("");
        setWorkerID(""); // Clear worker ID
        setBlockName("");
        setRowNumber(null);
      } else {
        const errorData = await response.json();
        console.error("Check-in failed:", errorData);
        alert(`Check-in failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      alert("An error occurred during check-in.");
    }
  };

  const history = useHistory();
  return (
    <IonPage>
      <IonContent>
        <Watermark content="">
          <Header />
          <IonCard style={{ marginTop: "20px" }}>
            <IonCardHeader>
              <IonCardTitle>Check In</IonCardTitle>
              <IonCardSubtitle>
                {workerName ? (
                  <p>Worker Name: {workerName}</p>
                ) : (
                  <IonButton onClick={startScan}>Scan Worker QR Code</IonButton>
                )}
              </IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              <p>Please select the block number and row number</p>
            </IonCardContent>

            {/* Block Dropdown */}
            <FormControl
              variant="outlined"
              style={{ width: "100%", padding: "10px 20px" }}
            >
              <InputLabel
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  fontSize: "16px",
                }}
                id="block-label"
              >
                Block Name
              </InputLabel>
              <Select
                labelId="block-label"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                label="Block Name"
              >
                <MenuItem value="">
                  <em>Select Block</em>
                </MenuItem>
                {blocks.map((block) => (
                  <MenuItem key={block} value={block}>
                    {block}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Row Dropdown */}
            <FormControl
              variant="outlined"
              disabled={!blockName}
              style={{ width: "100%", marginTop: "20px", padding: "10px 20px" }}
            >
              <InputLabel
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  fontSize: "16px",
                }}
                id="row-label"
              >
                Row Number
              </InputLabel>
              <Select
                labelId="row-label"
                value={rowNumber || ""}
                onChange={(e) => setRowNumber(e.target.value)}
                label="Row Number"
              >
                <MenuItem value="">
                  <em>Select Row</em>
                </MenuItem>
                {rows.map((row) => (
                  <MenuItem key={row} value={row}>
                    {row}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IonButton
              className="btn"
              onClick={handleCheckIn}
              disabled={!blockName || !rowNumber}
            >
              Check In
            </IonButton>
          </IonCard>
          <div id="main"></div>
        </Watermark>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 2, mt: 2, ml: 2 }}
          onClick={() => history.push("/home")}
        >
          Back
        </Button>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default CheckIn;
