import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Import Day.js adapter
import dayjs from "dayjs";
import Autocomplete from '@mui/material/Autocomplete'; // Import Autocomplete

const initialProjectState = {
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
  projectURL: "", // Optional field for project URL
  dateErrorFeedback: { startDate: "", endDate: "" }, // For inline date error messages
};

// A more comprehensive (but not exhaustive) list of programming languages and related technologies
const programmingLanguageOptions = [
  "Python", "JavaScript", "TypeScript", "Java", "C#", "C++", "Go", "PHP", "Ruby", "Swift",
  "Kotlin", "Scala", "Rust", "Perl", "COBOL", "JCL", "Fortran", "R", "MATLAB", "SQL",
  "HTML", "CSS", "Bash", "Shell", "PowerShell", "VBA", "Groovy", "Dart", "Elixir", "Clojure",
  "Lisp", "Scheme", "Haskell", "F#", "Erlang", "Lua", "Julia", "Solidity", "Assembly",
  "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring", ".NET",
  "Ruby on Rails", "Laravel", "Symfony", "ASP.NET", "Android (Kotlin/Java)", "iOS (Swift/Objective-C)",
  "Flutter (Dart)", "React Native", "AngularJS", "jQuery", "Bootstrap", "Tailwind CSS",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis",
  "GraphQL", "REST API", "SOAP", "Microservices", "Serverless", "Blockchain", "AI/ML", "Data Science",
  "Big Data", "Spark", "Hadoop", "Kafka", "ETL", "CI/CD", "Agile", "Scrum", "Kanban",
];

// DevOps Tools options
const devOpsToolsOptions = [
  "Jenkins", "GitLab CI/CD", "GitHub Actions", "CircleCI", "Travis CI",
  "Ansible", "Puppet", "Chef", "Terraform", "Docker", "Kubernetes", "Helm",
  "ArgoCD", "Prometheus", "Grafana", "ELK Stack", "SonarQube", "Nexus",
  "JFrog Artifactory", "AWS CodePipeline", "AWS CodeBuild", "AWS CodeDeploy",
  "Azure DevOps Pipelines", "GCP Cloud Build", "Spinnaker", "Istio", "Vault", "Consul"
];

// Version Controller options
const versionControllerOptions = [
  "Git", "GitHub", "GitLab", "Bitbucket", "Azure DevOps", "SVN", 
  "Mercurial", "Perforce", "CVS", "TFS", "AWS CodeCommit", 
  "Plastic SCM", "Fossil", "Bazaar", "Darcs", "Legacy-Tools"
];

// Database options
const databaseOptions = [
  "MySQL", "PostgreSQL", "Oracle", "SQL Server", "MariaDB", "SQLite", "DB2",
  "Teradata", "Snowflake", "Redshift", "Vertica", "T-SQL", "PL/SQL", "MongoDB",
  "Cassandra", "Redis", "DynamoDB", "Couchbase", "CouchDB", "Firebase Realtime Database",
  "Neo4j", "HBase", "Elasticsearch", "AWS RDS", "AWS Aurora", "AWS DocumentDB",
  "GCP BigQuery", "GCP Cloud SQL", "GCP Firestore", "GCP Spanner",
  "Azure SQL Database", "Azure Cosmos DB", "Azure Table Storage", "Synapse Analytics", "Databricks"
];

// Memoized ProjectFormItem component
const ProjectFormItem = React.memo(({
  project,
  index,
  onInputChange, // Keep for other text fields
  onAutocompleteChange, // New handler for Autocomplete
  onDateChange,
  onRemoveProject,
  isProjectInProgress,
  projectsCount,
  programmingLanguageOptions,
  devOpsToolsOptions,
  versionControllerOptions,
  databaseOptions
}) => {
  // Convert comma-separated string from state to an array for Autocomplete's value prop
  const selectedLanguagesArray = project.programmingLanguages
    ? project.programmingLanguages.split(',').map(lang => lang.trim()).filter(lang => lang)
    : [];
    
  // Convert comma-separated string from state to an array for DevOps Tools
  const selectedDevOpsToolsArray = project.devOpsTools
    ? project.devOpsTools.split(',').map(tool => tool.trim()).filter(tool => tool)
    : [];
    
  // Convert comma-separated string from state to an array for Version Controller
  const selectedVersionControllerArray = project.versionController
    ? project.versionController.split(',').map(vc => vc.trim()).filter(vc => vc)
    : [];
    
  // Convert comma-separated string from state to an array for Databases
  const selectedDatabasesArray = project.databases
    ? project.databases.split(',').map(db => db.trim()).filter(db => db)
    : [];

  return (
    <Box sx={{ marginBottom: 4, border: "1px solid #e0e0e0", padding: 2, borderRadius: 2, backgroundColor: "#ffffff", boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography
            variant="h6"
            sx={{ color: "#333", fontWeight: "bold", mr: 1 }}
          >
            Project: {project.title ? project.title : ""}
          </Typography>
          {isProjectInProgress(project) && (
            <Typography
              component="span"
              sx={{
                fontSize: "0.8rem",
                backgroundColor: "#4caf50",
                color: "white",
                padding: "3px 8px",
                borderRadius: "12px",
                display: "inline-block",
              }}
            >
              In Progress
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onRemoveProject(index)}
          sx={{ ml: 2, flexShrink: 0 }}
        >
          {projectsCount > 1 ? "Remove Project" : "Reset Project"}
        </Button>
      </Box>

      {/* Title Input */}
      <TextField
        label="Title"
        name="title"
        value={project.title}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        margin="normal"
        inputProps={{ maxLength: 200 }}
        helperText={`${project.title.length}/200 characters`}
        required
        sx={{
          fontSize: "14px",
          borderRadius: "5px",
        }}
      />

      {/* Description Input */}
      <TextField
        label="Description"
        name="description"
        value={project.description}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
        inputProps={{ maxLength: 500 }}
        helperText={`${project.description.length}/500 characters`}
        required
        sx={{
          fontSize: "14px",
          borderRadius: "5px",
        }}
      />

      {/* Role/Contribution Input */}
      <TextField
        label="Role/Contribution"
        name="role"
        value={project.role}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
        inputProps={{ maxLength: 500 }}
        helperText={`${project.role.length}/500 characters`}
        required
        sx={{
          fontSize: "14px",
          borderRadius: "5px",
        }}
      />

      {/* Programming Languages Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={programmingLanguageOptions}
        value={selectedLanguagesArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "programmingLanguages", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Programming Languages"
            name="programmingLanguages"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${project.programmingLanguages.length}/200 characters. Select or add multiple languages.`}
            required
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {/* DevOps Tools Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={devOpsToolsOptions}
        value={selectedDevOpsToolsArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "devOpsTools", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="DevOps Tools"
            name="devOpsTools"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${(project.devOpsTools || "").length}/200 characters. Select or add multiple tools.`}
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {/* Version Controller Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={versionControllerOptions}
        value={selectedVersionControllerArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "versionController", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Version Controller"
            name="versionController"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${(project.versionController || "").length}/200 characters. Select or add multiple version control tools.`}
            required
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {project.versionController && project.versionController.includes("Legacy-Tools") && (
        <TextField
          label="Legacy Tools Information"
          name="legacyToolsInfo"
          value={project.legacyToolsInfo || ""}
          onChange={(e) => onInputChange(index, e)}
          fullWidth
          margin="normal"
          required
          sx={{
            fontSize: "14px",
            borderRadius: "5px",
          }}
        />
      )}

      {/* Databases Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={databaseOptions}
        value={selectedDatabasesArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "databases", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Databases"
            name="databases"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${project.databases.length}/200 characters. Select or add multiple databases.`}
            required
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {/* Project URL Input (Optional) */}
      <TextField
        label="Project URL (Optional)"
        name="projectURL"
        value={project.projectURL}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        margin="normal"
        inputProps={{ maxLength: 300 }}
        helperText={`${project.projectURL.length}/300 characters`}
        type="url"
        sx={{
          fontSize: "14px",
          borderRadius: "5px",
        }}
      />

      {/* Start Date Input */}
      <DatePicker
        label="Start Date"
        value={project.startDate}
        onChange={(value) => onDateChange(index, "startDate", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            margin="normal"
            required
            error={!!project.dateErrorFeedback?.startDate}
            helperText={project.dateErrorFeedback?.startDate || "Select the project start date"}
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
      />

      <Box sx={{ mt: 3 }}></Box>

      {/* End Date Input - Optional */}
      <Box>
        <DatePicker
          label="End Date (Leave empty for current projects)"
          value={project.endDate}
          onChange={(value) => onDateChange(index, "endDate", value)}
          minDate={project.startDate ? dayjs(project.startDate).add(1, 'day') : undefined}
          disabled={!project.startDate}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              margin="normal"
              error={!!project.dateErrorFeedback?.endDate}
              helperText={project.dateErrorFeedback?.endDate || (project.startDate ? "Leave empty if this is a current project" : "Please select a start date first")}
              sx={{
                fontSize: "14px",
                borderRadius: "5px",
                "& .MuiInputLabel-root": {
                  fontSize: "14px", whiteSpace: "normal", lineHeight: "1.2",
                  maxWidth: "100%", height: "auto", padding: "2px 0", overflow: "visible"
                },
                "& .MuiInputLabel-shrink": {
                  transform: "translate(14px, -9px) scale(0.75)", background: "#f9f9f9", padding: "0 4px"
                }
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
});

function ProjectsSummary() {
  const navigate = useNavigate();

  // State to manage multiple projects
  const [projects, setProjects] = useState([{ ...initialProjectState }]);
  
  // State to manage dynamic options lists
  const [dynamicProgrammingLanguageOptions, setDynamicProgrammingLanguageOptions] = useState([...programmingLanguageOptions]);
  const [dynamicDevOpsToolsOptions, setDynamicDevOpsToolsOptions] = useState([...devOpsToolsOptions]);
  const [dynamicVersionControllerOptions, setDynamicVersionControllerOptions] = useState([...versionControllerOptions]);
  const [dynamicDatabaseOptions, setDynamicDatabaseOptions] = useState([...databaseOptions]);

  // Handle input changes for a specific project
  const handleInputChange = useCallback((index, e) => {
    const { name, value } = e.target;
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value;
    setProjects(updatedProjects);
  }, [projects]);

  // Handle Autocomplete changes for a specific project
  const handleAutocompleteChange = useCallback((index, name, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value; // Value is already a comma-separated string
    
    // Add any new values to the respective options arrays
    if (name === "programmingLanguages") {
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicProgrammingLanguageOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicProgrammingLanguageOptions(prev => [...prev, ...newValues]);
      }
    } else if (name === "devOpsTools") {
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicDevOpsToolsOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicDevOpsToolsOptions(prev => [...prev, ...newValues]);
      }
    } else if (name === "versionController") {
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicVersionControllerOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicVersionControllerOptions(prev => [...prev, ...newValues]);
      }
    } else if (name === "databases") {
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicDatabaseOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicDatabaseOptions(prev => [...prev, ...newValues]);
      }
    }
    
    setProjects(updatedProjects);
  }, [projects, dynamicProgrammingLanguageOptions, dynamicDevOpsToolsOptions, dynamicVersionControllerOptions, dynamicDatabaseOptions]);

  // Check if date already exists in other projects
  const isDateDuplicate = useCallback((date, fieldName, currentIndex) => {
    if (!date) return false;
    return projects.some((project, idx) =>
      idx !== currentIndex &&
      project[fieldName] &&
      project[fieldName].isSame(date, 'day')
    );
  }, [projects]);

  // Handle date changes
  const handleDateChange = useCallback((index, name, value) => {
    const currentProjects = [...projects];
    const projectToUpdate = { ...currentProjects[index] };

    projectToUpdate.dateErrorFeedback = { ...projectToUpdate.dateErrorFeedback, [name]: "" };

    // Check for duplicate dates
    if (value && isDateDuplicate(value, name, index)) {
      projectToUpdate.dateErrorFeedback[name] = `This ${name === "startDate" ? "start date" : "end date"} is already used.`;
      currentProjects[index] = projectToUpdate;
      setProjects(currentProjects);
      return;
    }

    // Only check for in-progress projects when setting a new project to in-progress
    // or when removing an end date (making a project in-progress)
    if ((name === "startDate" && value && !projectToUpdate.endDate) || 
        (name === "endDate" && !value && projectToUpdate.startDate)) {
      const otherInProgressProjects = projects.filter((p, i) =>
        i !== index && p.startDate && !p.endDate
      );
      if (otherInProgressProjects.length > 0) {
        projectToUpdate.dateErrorFeedback[name === "endDate" ? "endDate" : "startDate"] = 
          "Only one project can be 'In Progress'. Please add an end date to your current in-progress project first.";
        if (name === "startDate") projectToUpdate.startDate = value;
        currentProjects[index] = projectToUpdate;
        setProjects(currentProjects);
        return;
      }
    }

    projectToUpdate[name] = value;

    // If changing start date and there's an end date, validate end date is after start date
    if (name === "startDate" && projectToUpdate.endDate && value) {
      if (dayjs(projectToUpdate.endDate).isBefore(dayjs(value)) || dayjs(projectToUpdate.endDate).isSame(dayjs(value))) {
        projectToUpdate.endDate = null;
        projectToUpdate.dateErrorFeedback.endDate = "End date cleared (was before new start date).";
      }
    }

    // If changing end date, validate it's after start date
    if (name === "endDate" && value && projectToUpdate.startDate) {
      if (dayjs(value).isBefore(dayjs(projectToUpdate.startDate)) || dayjs(value).isSame(dayjs(projectToUpdate.startDate))) {
        projectToUpdate.endDate = null;
        projectToUpdate.dateErrorFeedback.endDate = "End date must be after start date.";
        currentProjects[index] = projectToUpdate;
        setProjects(currentProjects);
        return;
      }
    }

    currentProjects[index] = projectToUpdate;
    setProjects(currentProjects);
  }, [projects, isDateDuplicate]);

  const addNextProject = () => {
    setProjects([
      ...projects,
      { ...initialProjectState },
    ]);
  };

  const removeProject = useCallback((indexToRemove) => {
    if (projects.length > 1) {
      setProjects(prevProjects => prevProjects.filter((_, index) => index !== indexToRemove));
    } else if (projects.length === 1 && indexToRemove === 0) {
      setProjects([{ ...initialProjectState }]);
    }
  }, [projects.length]);

  const isAddNextProjectEnabled = () => {
    if (projects.length === 0) return false;
    const lastProject = projects[projects.length - 1];
    return (
      lastProject.title.trim() &&
      lastProject.description.trim() &&
      lastProject.role.trim() &&
      lastProject.programmingLanguages.trim() &&
      lastProject.versionController.trim() &&
      (lastProject.versionController.includes("Legacy-Tools") ? lastProject.legacyToolsInfo.trim() : true) &&
      lastProject.databases.trim() &&
      lastProject.startDate &&
      !lastProject.dateErrorFeedback?.startDate &&
      !lastProject.dateErrorFeedback?.endDate
    );
  };

  const isProjectInProgress = (project) => {
    return project.startDate && !project.endDate;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 800,
          margin: "0 auto",
          padding: { xs: 2, sm: 3 },
          backgroundColor: "#f4f6f8",
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ color: "#2c3e50", fontWeight: "600", marginBottom: 3 }}
        >
          Projects Summary
        </Typography>

        {projects.map((project, index) => (
          <ProjectFormItem
            key={index}
            project={project}
            index={index}
            onInputChange={handleInputChange}
            onAutocompleteChange={handleAutocompleteChange}
            onDateChange={handleDateChange}
            onRemoveProject={removeProject}
            isProjectInProgress={isProjectInProgress}
            projectsCount={projects.length}
            programmingLanguageOptions={dynamicProgrammingLanguageOptions}
            devOpsToolsOptions={dynamicDevOpsToolsOptions}
            versionControllerOptions={dynamicVersionControllerOptions}
            databaseOptions={dynamicDatabaseOptions}
          />
        ))}

        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
          <Button
            variant="outlined"
            onClick={addNextProject}
            disabled={!isAddNextProjectEnabled()}
            sx={{ marginRight: 2, borderColor: "#3498db", color: "#3498db", '&:hover': { borderColor: "#2980b9", backgroundColor: 'rgba(52, 152, 219, 0.04)' } }}
          >
            Add Next Project
          </Button>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/summarize")}
            sx={{ width: "50%", backgroundColor: "#3498db", '&:hover': { backgroundColor: "#2980b9" } }}
          >
            Next Page → Summarize
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default ProjectsSummary;
