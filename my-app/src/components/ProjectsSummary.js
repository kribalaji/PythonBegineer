import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box, TextField, MenuItem } from "@mui/material";
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
      devOpsTools: "",
      versionController: "",
      legacyToolsInfo: "",
      databases: "",
      startDate: null,
      endDate: null,
    },
  ]);

  // Handle input changes for a specific project
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value;
    
    // If the user types a comma in one of the fields with suggestions,
    // trigger the suggestions to appear again
    if ((name === "programmingLanguages" || name === "devOpsTools" || name === "databases") && 
        value.endsWith(",")) {
      setTimeout(() => {
        // Focus on the input to trigger suggestions
        e.target.focus();
        // Create a fake input event to trigger browser's autocomplete
        const event = new Event('input', { bubbles: true });
        e.target.dispatchEvent(event);
      }, 10);
    }
    
    setProjects(updatedProjects);
  };

  // Check if date already exists in other projects
  const isDateDuplicate = (date, fieldName, currentIndex) => {
    if (!date) return false;
    
    return projects.some((project, idx) => 
      idx !== currentIndex && 
      project[fieldName] && 
      project[fieldName].isSame(date, 'day')
    );
  };

  // Handle date changes
  const handleDateChange = (index, name, value) => {
    const updatedProjects = [...projects];
    
    // Check for duplicate dates across projects
    if (value && isDateDuplicate(value, name, index)) {
      alert(`This ${name === "startDate" ? "start date" : "end date"} is already used in another project. Please select a different date.`);
      return; // Don't update if duplicate
    }
    
    // Check if we're removing an end date and there's already another project without an end date
    if (name === "endDate" && !value) {
      const inProgressProjects = projects.filter((p, i) => i !== index && p.startDate && !p.endDate);
      if (inProgressProjects.length > 0) {
        alert("Only one project can be marked as 'In Progress'. Please provide an end date for this project.");
        return; // Don't update if there's already an in-progress project
      }
    }
    
    updatedProjects[index][name] = value;
    
    // If changing start date and there's an end date, validate end date is after start date
    if (name === "startDate" && updatedProjects[index].endDate && value) {
      // If end date is before or equal to start date, clear the end date
      if (updatedProjects[index].endDate.isBefore(value) || updatedProjects[index].endDate.isSame(value)) {
        updatedProjects[index].endDate = null;
      }
    }
    
    // If changing end date, validate it's after start date
    if (name === "endDate" && value && updatedProjects[index].startDate) {
      // If end date is before or equal to start date, reset to null
      if (value.isBefore(updatedProjects[index].startDate) || value.isSame(updatedProjects[index].startDate)) {
        updatedProjects[index].endDate = null;
        alert("End date must be after start date.");
        return; // Exit early to prevent setting invalid date
      }
    }
    
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
        devOpsTools: "",
        versionController: "",
        legacyToolsInfo: "",
        databases: "",
        startDate: null,
        endDate: null,
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
    // Note: devOpsTools is optional, so not included in validation
  );

  // Helper function to determine if a project is in progress
  const isProjectInProgress = (project) => {
    return project.startDate && !project.endDate;
  };

  // Function to handle showing suggestions
  const showSuggestions = (e) => {
    // This is a workaround to force datalist to show
    const input = e.target;
    // Create a fake input event to trigger browser's autocomplete
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  };

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
              Project{project.title ? `: ${project.title}` : ""}
              {isProjectInProgress(project) && (
                <Typography
                  component="span"
                  sx={{
                    ml: 2,
                    fontSize: "0.8rem",
                    backgroundColor: "#4caf50",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    verticalAlign: "middle",
                  }}
                >
                  In Progress
                </Typography>
              )}
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
              helperText={`${project.programmingLanguages.length}/200 characters. Separate multiple entries with commas.`}
              autoComplete="on"
              onClick={showSuggestions}
              onFocus={showSuggestions}
              onKeyUp={(e) => {
                // Show suggestions when comma or space is typed
                if (e.key === ',' || e.key === ' ') {
                  setTimeout(showSuggestions, 10, e);
                }
              }}
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            />
            <datalist id="programmingLanguagesList">
              {/* Programming Languages */}
              <option value="Python" />
              <option value="SQL" />
              <option value="Java" />
              <option value="PERL" />
              <option value="COBOL" />
              <option value="JCL" />
              <option value="Rust" />
              <option value="JavaScript" />
              <option value="TypeScript" />
              <option value="C#" />
              <option value="C++" />
              <option value="Go" />
              <option value="PHP" />
              <option value="Ruby" />
              <option value="Swift" />
              
              {/* AWS Services */}
              <option value="AWS EC2" />
              <option value="AWS S3" />
              <option value="AWS Lambda" />
              <option value="AWS DynamoDB" />
              <option value="AWS RDS" />
              <option value="AWS CloudFormation" />
              <option value="AWS CloudWatch" />
              <option value="AWS IAM" />
              <option value="AWS API Gateway" />
              <option value="AWS SQS" />
              <option value="AWS SNS" />
              <option value="AWS ECS" />
              <option value="AWS EKS" />
              <option value="AWS Fargate" />
              <option value="AWS Glue" />
              
              {/* GCP Services */}
              <option value="GCP Compute Engine" />
              <option value="GCP Cloud Storage" />
              <option value="GCP Cloud Functions" />
              <option value="GCP BigQuery" />
              <option value="GCP Cloud SQL" />
              <option value="GCP Kubernetes Engine" />
              <option value="GCP Dataflow" />
              <option value="GCP Dataproc" />
              <option value="GCP Pub/Sub" />
              <option value="GCP Cloud Run" />
              <option value="GCP Firestore" />
              <option value="GCP Spanner" />
              
              {/* Azure Services */}
              <option value="Azure Virtual Machines" />
              <option value="Azure Blob Storage" />
              <option value="Azure Functions" />
              <option value="Azure Cosmos DB" />
              <option value="Azure SQL Database" />
              <option value="Azure Kubernetes Service" />
              <option value="Azure Data Factory" />
              <option value="Azure Logic Apps" />
              <option value="Azure Service Bus" />
              <option value="Azure App Service" />
              <option value="Azure DevOps" />
              <option value="Azure Active Directory" />
              
              {/* Databases */}
              <option value="MongoDB" />
              <option value="MySQL" />
              <option value="PostgreSQL" />
              <option value="Oracle" />
              <option value="SQL Server" />
              <option value="DB2" />
              <option value="Teradata" />
              <option value="BigQuery" />
              <option value="T-SQL" />
            </datalist>

            {/* DevOps Tools Input */}
            <TextField
              label="DevOps Tools"
              name="devOpsTools"
              value={project.devOpsTools || ""}
              onChange={(e) => handleInputChange(index, e)}
              fullWidth
              margin="normal"
              inputProps={{
                maxLength: 200,
                list: "devOpsToolsList",
              }}
              helperText={`${(project.devOpsTools || "").length}/200 characters. Separate multiple entries with commas.`}
              autoComplete="on"
              onClick={showSuggestions}
              onFocus={showSuggestions}
              onKeyUp={(e) => {
                // Show suggestions when comma or space is typed
                if (e.key === ',' || e.key === ' ') {
                  setTimeout(showSuggestions, 10, e);
                }
              }}
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            />
            <datalist id="devOpsToolsList">
              <option value="Jenkins" />
              <option value="GitLab CI/CD" />
              <option value="GitHub Actions" />
              <option value="CircleCI" />
              <option value="Travis CI" />
              <option value="Ansible" />
              <option value="Puppet" />
              <option value="Chef" />
              <option value="Terraform" />
              <option value="Docker" />
              <option value="Kubernetes" />
              <option value="Helm" />
              <option value="ArgoCD" />
              <option value="Prometheus" />
              <option value="Grafana" />
              <option value="ELK Stack" />
              <option value="SonarQube" />
              <option value="Nexus" />
              <option value="JFrog Artifactory" />
              <option value="AWS CodePipeline" />
              <option value="AWS CodeBuild" />
              <option value="AWS CodeDeploy" />
              <option value="Azure DevOps Pipelines" />
              <option value="GCP Cloud Build" />
              <option value="Spinnaker" />
              <option value="Istio" />
              <option value="Vault" />
              <option value="Consul" />
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
              helperText={`${project.databases.length}/200 characters. Separate multiple entries with commas.`}
              autoComplete="on"
              onClick={showSuggestions}
              onFocus={showSuggestions}
              onKeyUp={(e) => {
                // Show suggestions when comma or space is typed
                if (e.key === ',' || e.key === ' ') {
                  setTimeout(showSuggestions, 10, e);
                }
              }}
              sx={{
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
              }}
            />
            <datalist id="databasesList">
              {/* Relational Databases */}
              <option value="MySQL" />
              <option value="PostgreSQL" />
              <option value="Oracle" />
              <option value="SQL Server" />
              <option value="MariaDB" />
              <option value="SQLite" />
              <option value="DB2" />
              <option value="Teradata" />
              <option value="Snowflake" />
              <option value="Redshift" />
              <option value="Vertica" />
              <option value="T-SQL" />
              <option value="PL/SQL" />
              
              {/* NoSQL Databases */}
              <option value="MongoDB" />
              <option value="Cassandra" />
              <option value="Redis" />
              <option value="DynamoDB" />
              <option value="Couchbase" />
              <option value="CouchDB" />
              <option value="Firebase Realtime Database" />
              <option value="Neo4j" />
              <option value="HBase" />
              <option value="Elasticsearch" />
              
              {/* Cloud Databases */}
              <option value="AWS RDS" />
              <option value="AWS Aurora" />
              <option value="AWS DynamoDB" />
              <option value="AWS DocumentDB" />
              <option value="GCP BigQuery" />
              <option value="GCP Cloud SQL" />
              <option value="GCP Firestore" />
              <option value="GCP Spanner" />
              <option value="Azure SQL Database" />
              <option value="Azure Cosmos DB" />
              <option value="Azure Table Storage" />
              
              {/* Data Warehouses */}
              <option value="Snowflake" />
              <option value="BigQuery" />
              <option value="Redshift" />
              <option value="Teradata" />
              <option value="Synapse Analytics" />
              <option value="Databricks" />
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
            
            {/* Add spacing between date fields */}
            <Box sx={{ mt: 3 }}></Box>

            {/* End Date Input - Optional */}
            <Box sx={{ width: "120%" }}>
              <DatePicker
                label="End Date (Leave empty for current projects)"
                value={project.endDate}
                onChange={(value) => handleDateChange(index, "endDate", value)}
                minDate={project.startDate} // Prevent selecting dates before start date
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    helperText={project.startDate ? "Leave empty if this is a current project" : "Please select a start date first"}
                    sx={{
                      fontSize: "14px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "5px",
                      "& .MuiInputLabel-root": {
                        fontSize: "14px",
                        whiteSpace: "normal",
                        lineHeight: "1.2",
                        maxWidth: "100%",
                        height: "auto",
                        padding: "2px 0",
                        overflow: "visible"
                      },
                      "& .MuiInputLabel-shrink": {
                        transform: "translate(14px, -9px) scale(0.75)",
                        background: "#f9f9f9",
                        padding: "0 4px"
                      }
                    }}
                  />
                )}
              />
            </Box>
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
