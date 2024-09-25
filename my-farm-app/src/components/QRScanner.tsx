import React, { useState } from "react";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import { IonButton, IonAlert } from "@ionic/react";

interface QRScannerProps {
  onScanSuccess: (workerData: { workerName: string; workerID: string }) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Function to request camera permissions
  const requestCameraPermission = async (): Promise<boolean> => {
    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status && status.granted) {
      return true; // Permission already granted
    } else if (status && status.denied) {
      setAlertMessage(
        "Camera permission is denied. Please enable it in settings."
      );
      setShowAlert(true);
      return false;
    }

    return false; // Default case if status is undefined
  };

  // Function to start the QR code scan
  const startScan = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      // Permission was not granted
      return;
    }

    try {
      await BarcodeScanner.hideBackground(); // Hide background during scan

      const result = await BarcodeScanner.startScan(); // Start scanning

      if (result.hasContent) {
        // Parse the QR code content
        const workerData = JSON.parse(result.content);
        onScanSuccess(workerData); // Handle scanned data
      } else {
        setAlertMessage("No QR code content found.");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("QR code scanning error:", error);
      setAlertMessage("An error occurred while scanning the QR code.");
      setShowAlert(true);
    } finally {
      await BarcodeScanner.showBackground(); // Show background again after scanning
    }
  };

  return (
    <>
      <IonButton onClick={startScan}>Scan Worker QR Code</IonButton>

      {/* Alert for displaying messages */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Alert"}
        message={alertMessage}
        buttons={["OK"]}
      />
    </>
  );
};

export default QRScanner;
