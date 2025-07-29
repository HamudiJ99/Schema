import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; 
import './App.css';
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <div className="app-layout" style={{ fontFamily: "Arial, sans-serif" }}>
      <Navbar />
      <ScrollToTop />
      <main style={{ padding: 40, flex: 1, textAlign: "left" }}>
        <Outlet />
      </main>
    </div>
  );
}