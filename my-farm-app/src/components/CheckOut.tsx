import React, { useState, useEffect } from "react";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import Header from "./Header";
import Footer from "./Footer";
import { useHistory } from "react-router-dom";
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
} from "@ionic/react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Input,
} from "@mui/material";

const CheckOut: React.FC = () => {
  const [workerId, setWorkerId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [blockName, setBlockName] = useState("");
  const [rowNumber, setRowNumber] = useState<string | null>(null);
  const [stockCount, setStockCount] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [rows, setRows] = useState<string[]>([]);

  useEffect(() => {
    console.log("Fetching blocks...");
    fetch("http://localhost:5000/api/blocks")
      .then((response) => response.json())
      .then((data) => {
        console.log("Blocks fetched:", data);
        setBlocks(data);
      })
      .catch((error) => console.error("Error fetching blocks:", error));
  }, []);

  useEffect(() => {
    if (blockName) {
      console.log(`Fetching rows for block: ${blockName}`);
      fetch(`http://localhost:5000/api/block/${blockName}/rows`)
        .then((response) => response.json())
        .then((data) => {
          console.log(`Rows fetched for block:`, data);
          setRows(data);
        })
        .catch((error) => console.error("Error fetching rows:", error));
    }
  }, [blockName]);

  const startScan = async () => {
    try {
      await BarcodeScanner.checkPermission({ force: true });
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        console.log("QR Code Content:", result.content);
        const scannedData = JSON.parse(result.content);
        setWorkerId(scannedData.workerID); // Use the correct key
        setWorkerName(scannedData.workerName);
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
    } finally {
      await BarcodeScanner.showBackground();
    }
  };

  const handleCheckOut = async () => {
    console.log("Handling checkout...");
    console.log("Checking for checkout data:", {
      workerId,
      blockName,
      rowNumber,
    });

    if (!workerId || !blockName || rowNumber === null) {
      console.warn("Incomplete check-out information.");
      alert("Please provide all required information.");
      return;
    }

    try {
      console.log("Sending checkout request with data:", {
        workerId,
        blockName,
        rowNumber,
        stockCount,
      });

      const response = await fetch("http://localhost:5000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, blockName, rowNumber, stockCount }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Check-out successful:", data);
        alert("Check-out successful!");

        setWorkerId("");
        setWorkerName("");
        setBlockName("");
        setRowNumber(null);
        setStockCount(null);
      } else {
        const errorData = await response.json();
        console.error("Check-out failed:", errorData);
        alert(`Check-out failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during check-out:", error);
      alert("An error occurred during check-out.");
    }
  };

  const history = useHistory();
  return (
    <IonPage>
      <IonContent>
        <Header />
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Check Out</IonCardTitle>
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
              onChange={(e) => {
                setBlockName(e.target.value);
                console.log("Block selected:", e.target.value);
              }}
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
              onChange={(e) => {
                setRowNumber(e.target.value);
                console.log("Row selected:", e.target.value);
              }}
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

          <FormControl
            variant="outlined"
            style={{ width: "100%", marginTop: "20px", padding: "10px 20px" }}
          >
            <InputLabel
              style={{
                display: "flex",
                padding: "10px 20px",
                fontSize: "16px",
              }}
              htmlFor="stock-count"
            >
              Stock Count (Optional)
            </InputLabel>
            <Input
              id="stock-count"
              value={stockCount || ""}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                setStockCount(value);
                console.log("Stock count entered:", value);
              }}
              type="number"
              placeholder="Enter stock count"
            />
          </FormControl>

          <IonButton
            className="btn"
            onClick={handleCheckOut}
            disabled={!blockName || !rowNumber}
          >
            Check Out
          </IonButton>
        </IonCard>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 2, mt: 2, ml: 2 }}
          onClick={() => history.push("/home")}
        >
          Back
        </Button>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default CheckOut;
