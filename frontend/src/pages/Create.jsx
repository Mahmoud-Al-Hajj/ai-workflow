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
        <h1>Create Your Workflow</h1>
        <p>Describe the workflow in English</p>
        <p className="small-text">Add as much detail as possible</p>

        <form onSubmit={handleSubmit} className="create-form">
          <label htmlFor="description" className="form-label">
            Workflow Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Send an email when a new lead scores high in Airtable."
            className="form-textarea"
            rows={6}
          />
          <div className="form-footer">
            <span className="char-count">{description.length} characters</span>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Crafting the workflow..." : "Create Workflow"}
            </Button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Create;
