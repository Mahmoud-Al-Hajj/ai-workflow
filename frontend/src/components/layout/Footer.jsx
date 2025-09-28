import React from "react";
import "../../styles/Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <div className="footer-brand">AI Workflow</div>
          <div className="footer-copy">
            © {new Date().getFullYear()} AI Workflow - All rights reserved.
          </div>
        </div>
        <div className="footer-right">
          <a className="footer-link" href="/privacy">
            Privacy
          </a>
          <a className="footer-link" href="/terms">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
