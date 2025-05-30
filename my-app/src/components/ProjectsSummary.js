import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box, TextField, MenuItem, Checkbox, FormControlLabel } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Import Day.js adapter

function ProjectsSummary() {
  const navigate = useNavigate();

  // State to manage multiple projects
  const [projects, setProjects] = useState([
    {
      title: "",
      description: "",
      role: "",
      programmingLanguages: "",
      versionController: "",
      legacyToolsInfo: "",
      databases: "",
      startDate: null,
      endDate: null,
      inProgress: false,
    },
  ]);

  // Handle input changes for a specific project
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value;
    setProjects(updatedProjects);
  };

  // Handle checkbox change for "In Progress"
  const handleCheckboxChange = (index, e) => {
    const { checked } = e.target;
    const updatedProjects = [...projects];
    updatedProjects[index].inProgress = checked;
    if (checked) {
      updatedProjects[index].endDate = null; // Clear end date if "In Progress" is checked
    }
    setProjects(updatedProjects);
  };

  // Handle date changes
  const handleDateChange = (index, name, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value;
    setProjects(updatedProjects);
  };

  // Add a new project
  const addNextProject = () => {
    setProjects([
      ...projects,
      {
        title: "",
        description: "",
        role: "",
        programmingLanguages: "",
        versionController: "",
        legacyToolsInfo: "",
        databases: "",
        startDate: null,
        endDate: null,
        inProgress: false,
      },
    ]);
  };

  // Check if the "Add Next Project" button should be enabled
  const isAddNextProjectEnabled = projects.some(
    (project) =>
      project.title.trim() &&
      project.description.trim() &&
      project.role.trim() &&
      project.programmingLanguages.trim() &&
      project.versionController.trim() &&
      (project.versionController !== "Legacy-Tools" || project.legacyToolsInfo.trim()) &&
      project.databases.trim() &&
      project.startDate
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 800,
          margin: "0 auto",
          padding: 3,
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          boxShadow: 3,
          textAlign: "left",
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ color: "#333", fontWeight: "bold" }}
        >
          Projects Summary
        </Typography>

        {projects.map((project, index) => (
          <Box key={index} sx={{ marginBottom: 4 }}>
            {/* Project Header */}
            <Typography
              variant="h6"
              sx={{ marginBottom: 2, color: "#333", fontWeight: "bold" }}
            >
              Project: {project.title || `Untitled ${index + 1}`}
            </Typography>

            {/* Title Input */}
            <TextField
              label="Title"
              name="title"
              value={project.title}
              onChange={(e) => handleInputChange(index, e)}
              fullWidth
              margin="normal"
              inputProps={{ maxLength: 200 }}
              helperText={`${project.title.length}/200 characters`}
              required
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            />

            {/* Description Input */}
            <TextField
              label="Description"
              name="description"
              value={project.description}
              onChange={(e) => handleInputChange(index, e)}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              inputProps={{ maxLength: 500 }}
              helperText={`${project.description.length}/500 characters`}
              required
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            />

            {/* Role/Contribution Input */}
            <TextField
              label="Role/Contribution"
              name="role"
              value={project.role}
              onChange={(e) => handleInputChange(index, e)}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              inputProps={{ maxLength: 500 }}
              helperText={`${project.role.length}/500 characters`}
              required
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            />

            {/* Programming Languages Input */}
            <TextField
              label="Programming Languages"
              name="programmingLanguages"
              value={project.programmingLanguages}
              onChange={(e) => handleInputChange(index, e)}
              fullWidth
              margin="normal"
              inputProps={{
                maxLength: 200,
                list: "programmingLanguagesList",
              }}
              helperText={`${project.programmingLanguages.length}/200 characters`}
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            />
            <datalist id="programmingLanguagesList">
              <option value="Python" />
              <option value="SQL" />
              <option value="Java" />
              <option value="PERL" />
              <option value="COBOL" />
              <option value="JCL" />
              <option value="Rust" />
              <option value="JavaScript" />
              <option value="BigQuery" />
              <option value="T-SQL" />
            </datalist>

            {/* Version Controller Input */}
            <TextField
              select
              label="Version Controller"
              name="versionController"
              value={project.versionController}
              onChange={(e) => handleInputChange(index, e)}
              fullWidth
              margin="normal"
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            >
              <MenuItem value="Git">Git</MenuItem>
              <MenuItem value="SVN">SVN</MenuItem>
              <MenuItem value="Legacy-Tools">Legacy-Tools</MenuItem>
            </TextField>

            {/* Legacy Tools Information Input */}
            {project.versionController === "Legacy-Tools" && (
              <TextField
                label="Legacy Tools Information"
                name="legacyToolsInfo"
                value={project.legacyToolsInfo}
                onChange={(e) => handleInputChange(index, e)}
                fullWidth
                margin="normal"
                required
                sx={{
                  fontSize: "14px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "5px",
                }}
              />
            )}

            {/* Databases Input */}
            <TextField
              label="Databases"
              name="databases"
              value={project.databases}
              onChange={(e) => handleInputChange(index, e)}
              fullWidth
              margin="normal"
              inputProps={{
                maxLength: 200,
                list: "databasesList",
              }}
              helperText={`${project.databases.length}/200 characters`}
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            />
            <datalist id="databasesList">
              <option value="DB2" />
              <option value="Teradata" />
              <option value="MongoDB" />
              <option value="MySQL" />
              <option value="PostgreSQL" />
              <option value="Oracle" />
              <option value="BigQuery" />
            </datalist>

            {/* Start Date Input */}
            <DatePicker
              label="Start Date"
              value={project.startDate}
              onChange={(value) => handleDateChange(index, "startDate", value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  sx={{
                    fontSize: "14px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "5px",
                  }}
                />
              )}
            />

            {/* End Date or In Progress */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={project.inProgress}
                  onChange={(e) => handleCheckboxChange(index, e)}
                />
              }
              label="In Progress"
              sx={{ color: "#333" }}
            />
            {!project.inProgress && (
              <DatePicker
                label="End Date"
                value={project.endDate}
                onChange={(value) => handleDateChange(index, "endDate", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    sx={{
                      fontSize: "14px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "5px",
                    }}
                  />
                )}
              />
            )}
          </Box>
        ))}

        {/* Add Next Project Button */}
        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={addNextProject}
            disabled={!isAddNextProjectEnabled}
            sx={{ marginRight: 2 }}
          >
            Add Next Project
          </Button>
        </Box>

        {/* Next Page Button */}
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/summarize")}
            sx={{ width: "50%" }}
          >
            Next Page → Summarize
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default ProjectsSummary;