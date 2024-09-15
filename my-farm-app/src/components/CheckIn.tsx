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
  IonAlert,
  IonToast,
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
  const [workerID, setWorkerID] = useState("");
  const [blockName, setBlockName] = useState("");
  const [rowNumber, setRowNumber] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [rows, setRows] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

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
      await BarcodeScanner.checkPermission({ force: true });

      await BarcodeScanner.hideBackground();

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
          setAlertMessage("Invalid QR code content. Please try again.");
          setShowAlert(true);
        }
      } else {
        setAlertMessage("No QR code content found. Please try again.");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage(
        "An error occurred while scanning the QR code. Please try again."
      );
      setShowAlert(true);
    } finally {
      await BarcodeScanner.showBackground(); // Show the background again after scanning
    }
  };

  const handleCheckIn = async () => {
    if (!workerID || !workerName || !blockName || rowNumber === null) {
      setAlertMessage("Please provide all required information.");
      setShowAlert(true);
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
        setShowToast(true);
        setWorkerName("");
        setWorkerID("");
        setBlockName("");
        setRowNumber(null);
      } else {
        const errorData = await response.json();
        setAlertMessage(`Check-in failed: ${errorData.message}`);
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("An error occurred during check-in.");
      setShowAlert(true);
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
      {/* IonAlert for Error Messages */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Alert"}
        message={alertMessage}
        buttons={["OK"]}
      />

      {/* IonToast for Success Messages */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Check-in successful!"
        duration={2000}
      />
      <Footer />
    </IonPage>
  );
};

export default CheckIn;
