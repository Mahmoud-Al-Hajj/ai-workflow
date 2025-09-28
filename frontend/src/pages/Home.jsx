import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <>
      {/* Full-bleed hero (not inside container) */}
      <section className="hero-bleed">
        <h1>Workflow automation, supercharged by AI</h1>
        <p>
          Describe your automation in plain English. Our AI transforms your
          ideas into powerful n8n workflows. Connect 400+ apps without writing a
          single line of code.
        </p>

        <div className="cta-buttons">
          <Link to="/get-started" className="primary-btn">
            Get started
          </Link>
          <Link to="/features" className="secondary-btn">
            Features
          </Link>
        </div>
      </section>

      <div className="home-container">
        <h2 className="section-title">Your automation, simplified</h2>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Describe the task</h3>
              <p>Tell the AI what you want to automate in natural language.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Preview workflow</h3>
              <p>
                See the generated n8n workflow and tweak parameters visually.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Deploy to n8n</h3>
              <p>Deploy directly to your n8n instance using your API key.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
