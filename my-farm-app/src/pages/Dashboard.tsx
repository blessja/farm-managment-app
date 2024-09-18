import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRow,
  IonCol,
  IonLabel,
  IonButton,
  IonGrid,
} from "@ionic/react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import xlsx library

// Define TypeScript interfaces for your data structure
interface Row {
  row_number: string;
  stock_count: number;
  date: string; // or Date if you prefer to use Date objects directly
}

interface Block {
  block_name: string;
  rows: Row[];
}

interface Worker {
  workerID: string;
  name: string;
  total_stock_count: number;
  blocks: Block[];
}

const Dashboard: React.FC = () => {
  // Use the Worker[] type for workersData
  const [workersData, setWorkersData] = useState<Worker[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/workers");
        setWorkersData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const exportToExcel = () => {
    // Prepare the data for Excel
    const exportData: any[] = [];
    workersData.forEach((worker) => {
      worker.blocks.forEach((block) => {
        block.rows.forEach((row) => {
          exportData.push({
            WorkerID: worker.workerID,
            WorkerName: worker.name,
            Block: block.block_name,
            Row: row.row_number,
            StockCount: row.stock_count,
            Date: new Date(row.date).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          });
        });
      });
    });

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Workers Data");
    // Export the Excel file
    XLSX.writeFile(workbook, "workers_data.xlsx");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonLabel>Worker ID</IonLabel>
            </IonCol>
            <IonCol>
              <IonLabel>Worker Name</IonLabel>
            </IonCol>
            <IonCol>
              <IonLabel>Block(s)</IonLabel>
            </IonCol>
            <IonCol>
              <IonLabel>Row(s)</IonLabel>
            </IonCol>
            <IonCol>
              <IonLabel>Stock Count</IonLabel>
            </IonCol>
            <IonCol>
              <IonLabel>Date</IonLabel>
            </IonCol>
          </IonRow>
          {workersData.map((worker, workerIndex) =>
            worker.blocks.map((block, blockIndex) =>
              block.rows.map((row, rowIndex) => (
                <IonRow key={`${workerIndex}-${blockIndex}-${rowIndex}`}>
                  <IonCol>{worker.workerID}</IonCol>
                  <IonCol>{worker.name}</IonCol>
                  <IonCol>{block.block_name}</IonCol>
                  <IonCol>{row.row_number}</IonCol>
                  <IonCol>{row.stock_count}</IonCol>
                  <IonCol>
                    {new Date(row.date).toLocaleDateString("en-GB", {
                      weekday: "short", // "Wed"
                      day: "2-digit", // "18"
                      month: "short", // "Sep"
                      year: "numeric", // "2024"
                    })}
                  </IonCol>
                </IonRow>
              ))
            )
          )}
        </IonGrid>
        <IonButton expand="block" onClick={exportToExcel}>
          Export to Excel
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
