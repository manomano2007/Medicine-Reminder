import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import AddMedicine from "./AddMedicine";
import Reorder from "./Reorder";

import App from "./App";
import Register from "./Register";
import Login from "./Login";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-medicine" element={<AddMedicine />} />
        <Route path="/reorder" element={<Reorder />} />
        
        
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);