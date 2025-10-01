import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <>
      <section className="hero-bleed">
        <div className="hero-content">
          <div className="hero-badge">
            <span>Designed for n8n</span>
          </div>

          <h1>
            <span className="hero-highlight">Workflow automation,</span>
            <br />
            <span className="hero-gradient">supercharged by AI</span>
          </h1>

          <p className="hero-description">
            Describe your automation in plain English. Our AI transforms your
            ideas into powerful n8n workflows. Connect 590+ apps without writing
            a single line of code.
          </p>

          <div className="cta-buttons">
            <Link to="/create" className="primary-btn">
              Start Creating
            </Link>
            <Link to="/features" className="btn" style={{ marginLeft: "7px" }}>
              See Features
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">590+</span>
              <span className="stat-label">Nodes</span>
            </div>
            <div className="stat">
              <span className="stat-number">more than 80%</span>
              <span className="stat-label">faster setup time</span>
            </div>
            <div className="stat">
              <span className="stat-number">Countless</span>
              <span className="stat-label">Workflows</span>
            </div>
          </div>
        </div>

        <div className="home-container">
          <h2 className="section-title">Your automation, simplified</h2>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Describe the task</h3>
                <p>
                  Tell the AI what you want to automate in natural language.
                </p>
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
      </section>
    </>
  );
}

export default Home;
