import React from "react";
import QrScanner from "../Components/QrScanner";
import axios from "axios";

const CheckInPage = () => {
  const handleScan = async (workerName) => {
    try {
      const response = await axios.post("http://localhost:5000/api/checkin", {
        workerName,
        rowNumber: 18, // These values should be dynamic later
        blockName: "Blok 1",
      });
      console.log("Check-in successful:", response.data);
      alert("Check-in successful");
    } catch (error) {
      console.error("Check-in failed:", error.response.data);
      alert(`Check-in failed: ${error.response.data.message}`);
    }
  };

  return (
    <div>
      <h1>Worker Check-In</h1>
      <QrScanner onScan={handleScan} />
    </div>
  );
};

export default CheckInPage;
