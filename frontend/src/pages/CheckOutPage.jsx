import React from "react";
import QrScanner from "../Components/QrScanner";
import axios from "axios";

const CheckInPage = () => {
  const handleScan = async (workerName) => {
    try {
      const response = await axios.post("http://localhost:5000/api/checkout", {
        workerName,
        rowNumber: 18, // These values should be dynamic later
        blockName: "Blok 1",
      });
      console.log("Check-out successful:", response.data);
      alert("Check-out successful");
    } catch (error) {
      console.error("Check-out failed:", error.response.data);
      alert(`Check-out failed: ${error.response.data.message}`);
    }
  };

  return (
    <div>
      <h1>Worker Check-Out</h1>
      <QrScanner onScan={handleScan} />
    </div>
  );
};

export default CheckInPage;
