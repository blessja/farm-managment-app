// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CheckInPage from "./pages/CheckInPage";
import CheckOutPage from "./pages/CheckOutPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/checkin" element={<CheckInPage />} />
          <Route path="/checkout" element={<CheckOutPage />} />
          {/* You can add more routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
