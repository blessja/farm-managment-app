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
import * as XLSX from "xlsx";
import "./Dashboard.css";
import { useHistory } from "react-router-dom";

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
  blocks: Block[];
}

interface AggregatedData {
  workerID: string;
  name: string;
  total_stock_count: number;
  date: string;
  block_names: string;
  row_numbers: string;
}

const Dashboard: React.FC = () => {
  const [workersData, setWorkersData] = useState<Worker[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.0.103:5000/api/workers"
        );
        setWorkersData(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // If error is an AxiosError, it has a response property
          console.error(
            "Error fetching data:",
            error.response ? error.response.data : error.message
          );
        } else if (error instanceof Error) {
          // If error is a general Error object
          console.error("Error fetching data:", error.message);
        } else {
          // For unexpected error types
          console.error("An unexpected error occurred:", error);
        }
      }
    };

    fetchData();
  }, []);

  // Aggregate the data by worker and date
  const aggregatedData: AggregatedData[] = workersData.reduce((acc, worker) => {
    const workerDataByDate: { [key: string]: AggregatedData } = {};

    worker.blocks.forEach((block) => {
      block.rows.forEach((row) => {
        const dateKey = new Date(row.date).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        if (!workerDataByDate[dateKey]) {
          workerDataByDate[dateKey] = {
            workerID: worker.workerID,
            name: worker.name,
            total_stock_count: 0,
            date: dateKey,
            block_names: "",
            row_numbers: "",
          };
        }

        workerDataByDate[dateKey].total_stock_count += row.stock_count;

        // Avoid duplicates in block names
        if (!workerDataByDate[dateKey].block_names.includes(block.block_name)) {
          workerDataByDate[dateKey].block_names += `${block.block_name}, `;
        }

        workerDataByDate[dateKey].row_numbers += `${row.row_number}, `;
      });
    });

    // Add aggregated data to the accumulator
    acc.push(...Object.values(workerDataByDate));
    return acc;
  }, [] as AggregatedData[]);

  const exportToExcel = () => {
    // Prepare the data for Excel
    const exportData = aggregatedData.map((data) => ({
      WorkerID: data.workerID,
      WorkerName: data.name,
      TotalStockCount: data.total_stock_count,
      Blocks: data.block_names.slice(0, -2), // Remove trailing comma
      Rows: data.row_numbers.slice(0, -2), // Remove trailing comma
      Date: data.date,
    }));

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];

    // Center-align the values in each cell
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
        const cellAddress = { c: colNum, r: rowNum };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (!worksheet[cellRef]) continue;
        if (!worksheet[cellRef].s) {
          worksheet[cellRef].s = {};
        }
        worksheet[cellRef].s.alignment = {
          horizontal: "center", // Center align horizontally
          vertical: "center", // Center align vertically
        };
      }
    }

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Workers Data");

    // Export the Excel file
    XLSX.writeFile(workbook, "workers_data.xlsx");
  };
  const history = useHistory();

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
            <IonCol className="centered-col">
              <IonLabel>Worker ID</IonLabel>
            </IonCol>
            <IonCol className="centered-col">
              <IonLabel>Worker Name</IonLabel>
            </IonCol>
            <IonCol className="centered-col">
              <IonLabel>Total Stock Count</IonLabel>
            </IonCol>
            <IonCol className="centered-col">
              <IonLabel>Blocks</IonLabel>
            </IonCol>
            <IonCol className="centered-col">
              <IonLabel>Rows</IonLabel>
            </IonCol>
            <IonCol className="centered-col">
              <IonLabel>Date</IonLabel>
            </IonCol>
          </IonRow>
          {aggregatedData.map((data, index) => (
            <IonRow key={index}>
              <IonCol className="centered-col-2">{data.workerID}</IonCol>
              <IonCol className="centered-col-2">{data.name}</IonCol>
              <IonCol className="centered-col-2">
                {data.total_stock_count}
              </IonCol>
              <IonCol className="centered-col-2">
                {data.block_names.slice(0, -2)}
              </IonCol>{" "}
              {/* Remove trailing comma */}
              <IonCol className="centered-col-2">
                {data.row_numbers.slice(0, -2)}
              </IonCol>{" "}
              {/* Remove trailing comma */}
              <IonCol className="centered-col-2">{data.date}</IonCol>
            </IonRow>
          ))}
        </IonGrid>
        <IonButton
          style={{ marginTop: "40px" }}
          expand="block"
          onClick={exportToExcel}
        >
          Export to Excel
        </IonButton>

        <IonButton
          style={{ marginTop: "30px" }}
          expand="block"
          onClick={() => history.push("/")}
        >
          Go to Home
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
