// src/Components/QrCodeGenerator.js
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const QrCodeGenerator = ({ workerName }) => {
  return (
    <div>
      <h3>QR Code for {workerName}</h3>
      <QRCodeCanvas
        value={workerName}
        size={256}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"H"}
        includeMargin={true}
      />
    </div>
  );
};

export default QrCodeGenerator;
