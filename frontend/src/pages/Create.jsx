import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/UI/Button";
import "../styles/Create.css";

function Create() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter a workflow description.");
      return;
    }
    setLoading(true);
    setError("");
    // Mock API call (replace with real backend later)
    setTimeout(() => {
      setLoading(false);
      // On success, redirect to workflows or preview
      navigate("/workflows");
    }, 2000); // Simulate delay
  };

  return (
    <div className="create-container">
      <div className="create-card">
        <div className="create-header">
          <h1>Create Your Workflow</h1>
          <p className="create-description">Describe the workflow in English</p>
          <p className="small-text">
            Add as much detail as possible for better results
          </p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Workflow Description
            </label>
            <div className="textarea-wrapper">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Send an email when a new lead scores high in Airtable, then create a task in Asana and notify the sales team on Slack."
                className="form-textarea"
                rows={6}
              />
            </div>
          </div>

          <div className="form-footer">
            <div className="char-info">
              <span className="char-count">
                {description.length} characters
              </span>
              <span className="char-hint">More details = better workflow</span>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="create-btn"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Crafting your workflow...
                </>
              ) : (
                <>Create Workflow</>
              )}
            </Button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default Create;
