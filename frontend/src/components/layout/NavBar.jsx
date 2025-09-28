import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/NavBar.css";

function NavBar() {
  return (
    <header className="nav-header">
      <div className="nav-container container">
        <div className="nav-left">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden>
              ●
            </span>
            <span className="brand-text">AI Workflow</span>
          </Link>
        </div>

        <nav className="nav-right">
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/get-started" className="nav-cta">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default NavBar;
