import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button, TextField, Typography } from "@mui/material";
import axios from "axios";

function ProjectsSummary() {
  const location = useLocation();
  const resumeData = location.state?.resumeData || {};
  const mobileNumber = location.state?.mobileNumber;

  // Always use the latest projectsData from resumeData
  const [projects, setProjects] = useState(resumeData.projectsData || []);

  // Reload projects if resumeData.projectsData changes (e.g., on navigation)
  useEffect(() => {
    setProjects(resumeData.projectsData || []);
  }, [resumeData.projectsData]);

  // Find indexes of "In Progress" projects
  const inProgressIndexes = projects
    .map((p, idx) =>
      (p.status === "In Progress" || p.endDate === null || p.endDate === "")
        ? idx
        : -1
    )
    .filter(idx => idx !== -1);

  // Check if all "In Progress" projects have endDate filled
  const allEndDatesFilled = inProgressIndexes.every(
    idx => projects[idx].endDate && projects[idx].endDate.trim() !== ""
  );

  const handleEndDateChange = (idx, value) => {
    setProjects(prev =>
      prev.map((p, i) => i === idx ? { ...p, endDate: value } : p)
    );
  };

  const handleAddNextProject = () => {
    setProjects([
      ...projects,
      {
        title: "",
        status: "In Progress",
        endDate: "",
        // ...other fields as needed
      }
    ]);
  };

  // Save all projects to backend
  const handleSave = async () => {
    if (!mobileNumber) {
      alert("Mobile number missing. Cannot save.");
      return;
    }
    try {
      await axios.post("/api/resume", {
        mobileNumber,
        resumeData: {
          ...resumeData, // preserve other resume fields
          projectsData: projects
        }
      });
      alert("Projects updated successfully!");
    } catch (err) {
      alert("Failed to update projects.");
    }
  };

  if (!mobileNumber) {
    return <Typography color="error">Mobile number missing. Please start from the main menu.</Typography>;
  }

  return (
    <div>
      <h2>Project Summary</h2>
      {inProgressIndexes.length === 0 && (
        <Typography>No "In Progress" projects found.</Typography>
      )}
      {inProgressIndexes.map(idx => (
        <div key={idx} style={{ marginBottom: 16 }}>
          <Typography>Project: {projects[idx].title || "(Untitled Project)"}</Typography>
          <TextField
            label="End Date (required)"
            value={projects[idx].endDate || ""}
            onChange={e => handleEndDateChange(idx, e.target.value)}
            required
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 1, mb: 1 }}
          />
        </div>
      ))}
      <Button
        variant="contained"
        color="primary"
        disabled={!allEndDatesFilled}
        onClick={handleAddNextProject}
        sx={{ mr: 2 }}
      >
        Add Next Project
      </Button>
      <Button
        variant="contained"
        color="success"
        disabled={!allEndDatesFilled}
        onClick={handleSave}
      >
        Save Projects
      </Button>
    </div>
  );
}

export default ProjectsSummary;
