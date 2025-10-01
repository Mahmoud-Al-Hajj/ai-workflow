import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Create from "../pages/Create";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Pricing from "../pages/Pricing";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<Create />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/get-started" element={<Register />} />
      <Route path="/features" element={<Home />} /> {/* Temporary redirect */}
    </Routes>
  );
}

export default AppRoutes;
