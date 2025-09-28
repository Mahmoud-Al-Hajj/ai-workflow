import React from "react";
import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import "./styles/Home.css";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Routes>
        <Route path="/features" element={<Home />} />
      </Routes>
      <Routes>
        <Route path="/get-started" element={<Create />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
