import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box, TextField, MenuItem } from "@mui/material";
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
  // Add more as needed, but keep the list manageable for performance
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
  // showSuggestions, // No longer needed for Autocomplete for this field
  projectsCount
}) => {
  // Convert comma-separated string from state to an array for Autocomplete's value prop
  const selectedLanguagesArray = project.programmingLanguages
    ? project.programmingLanguages.split(',').map(lang => lang.trim()).filter(lang => lang)
    : [];

  return (
    <Box sx={{ marginBottom: 4, border: "1px solid #e0e0e0", padding: 2, borderRadius: 2, backgroundColor: "#ffffff", boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
        <Typography
          variant="h6"
          sx={{ color: "#333", fontWeight: "bold" }}
        >
          Project: {project.title ? project.title : ""}
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
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onRemoveProject(index)}
          sx={{ ml: 2 }}
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
          // backgroundColor: "#f5f5f5", // Removing individual background for a cleaner look, parent will handle
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
          // backgroundColor: "#f5f5f5",
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
          // backgroundColor: "#f5f5f5",
          borderRadius: "5px",
        }}
      />

      {/* Programming Languages Input */}
      <Autocomplete
        freeSolo // Allows typing arbitrary text not in options
        multiple={true} // Allow multiple selections
        options={programmingLanguageOptions}
        value={selectedLanguagesArray} // Pass the array of selected languages
        onChange={(event, newValueArray) => {
          // newValueArray is an array of strings (selected/entered items)
          // Convert array back to a comma-separated string for storing in state
          onAutocompleteChange(index, "programmingLanguages", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Programming Languages"
            name="programmingLanguages" // Keep name for consistency if needed
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps, // Spread default inputProps from Autocomplete
              maxLength: 200, // Apply max length (to the underlying string state)
            }}
            helperText={`${project.programmingLanguages.length}/200 characters. Select or add multiple languages.`}
            required // Mark as required if necessary
            sx={{
              fontSize: "14px",
              // backgroundColor: "#f5f5f5",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {/* DevOps Tools Input */}
      <TextField
        label="DevOps Tools"
        name="devOpsTools"
        value={project.devOpsTools || ""}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        margin="normal"
        inputProps={{
          maxLength: 200,
          list: "devOpsToolsList",
        }}
        helperText={`${(project.devOpsTools || "").length}/200 characters. Separate multiple entries with commas.`}
        autoComplete="on"
        onKeyUp={(e) => {
          if ((e.key === ',' || e.key === ' ') && e.target.list) {
            setTimeout(() => {
                const event = new Event('input', { bubbles: true });
                e.target.dispatchEvent(event);
            }, 10);
          }
        }}
        sx={{
          fontSize: "14px",
          // backgroundColor: "#f5f5f5",
          borderRadius: "5px",
        }}
      />

      {/* Version Controller Input */}
      <TextField
        select
        label="Version Controller"
        name="versionController"
        value={project.versionController}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        margin="normal"
        sx={{
          fontSize: "14px",
          // backgroundColor: "#f5f5f5",
          borderRadius: "5px",
        }}
      >
        <MenuItem value="Git">Git</MenuItem>
        <MenuItem value="SVN">SVN</MenuItem>
        <MenuItem value="Legacy-Tools">Legacy-Tools</MenuItem>
      </TextField>

      {project.versionController === "Legacy-Tools" && (
        <TextField
          label="Legacy Tools Information"
          name="legacyToolsInfo"
          value={project.legacyToolsInfo}
          onChange={(e) => onInputChange(index, e)}
          fullWidth
          margin="normal"
          required
          sx={{
            fontSize: "14px",
            // backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          }}
        />
      )}

      {/* Databases Input */}
      <TextField
        label="Databases"
        name="databases"
        value={project.databases}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        margin="normal"
        inputProps={{
          maxLength: 200,
          list: "databasesList",
        }}
        helperText={`${project.databases.length}/200 characters. Separate multiple entries with commas.`}
        autoComplete="on"
         onKeyUp={(e) => {
          if ((e.key === ',' || e.key === ' ') && e.target.list) {
            setTimeout(() => {
                const event = new Event('input', { bubbles: true });
                e.target.dispatchEvent(event);
            }, 10);
          }
        }}
        sx={{
          fontSize: "14px",
          // backgroundColor: "#f5f5f5",
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
          // backgroundColor: "#f5f5f5",
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
              // backgroundColor: "#f5f5f5",
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
          minDate={project.startDate ? dayjs(project.startDate).add(1, 'day') : undefined} // End date must be after start date
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
                // backgroundColor: "#f5f5f5",
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

  // Handle input changes for a specific project
  const handleInputChange = useCallback((index, e) => {
    const { name, value } = e.target;
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value;

    if ((name === "devOpsTools" || name === "databases") &&
        value.endsWith(",")) {
      setTimeout(() => {
        if (e.target && typeof e.target.focus === 'function') {
            e.target.focus();
            const event = new Event('input', { bubbles: true });
            e.target.dispatchEvent(event);
        }
      }, 10);
    }

    setProjects(updatedProjects);
  }, [projects]);

  // Handle Autocomplete changes for a specific project
  const handleAutocompleteChange = useCallback((index, name, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value; // Value is already a comma-separated string
    setProjects(updatedProjects);
  }, [projects]);

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

    let proposedStartDate = name === "startDate" ? value : projectToUpdate.startDate;
    let proposedEndDate = name === "endDate" ? value : projectToUpdate.endDate;

    if (value && isDateDuplicate(value, name, index)) {
      projectToUpdate.dateErrorFeedback[name] = `This ${name === "startDate" ? "start date" : "end date"} is already used.`;
      currentProjects[index] = projectToUpdate;
      setProjects(currentProjects);
      return;
    }

    if (proposedStartDate && !proposedEndDate) {
      const otherInProgressProjects = projects.filter((p, i) =>
        i !== index && p.startDate && !p.endDate
      );
      if (otherInProgressProjects.length > 0) {
        projectToUpdate.dateErrorFeedback[name === "endDate" ? "endDate" : "startDate"] = "Only one project can be 'In Progress'.";
        if (name === "startDate") projectToUpdate.startDate = value;
        else if (name === "endDate" && !value) projectToUpdate.endDate = null;
        currentProjects[index] = projectToUpdate;
        setProjects(currentProjects);
        return;
      }
    }

    projectToUpdate[name] = value;

    if (name === "startDate" && projectToUpdate.endDate && value) {
      if (dayjs(projectToUpdate.endDate).isBefore(dayjs(value)) || dayjs(projectToUpdate.endDate).isSame(dayjs(value))) {
        projectToUpdate.endDate = null;
        projectToUpdate.dateErrorFeedback.endDate = "End date cleared (was before new start date).";
      }
    }

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
      (lastProject.versionController !== "Legacy-Tools" || lastProject.legacyToolsInfo.trim()) &&
      lastProject.databases.trim() &&
      lastProject.startDate &&
      !lastProject.dateErrorFeedback?.startDate &&
      !lastProject.dateErrorFeedback?.endDate
    );
  };

  const isProjectInProgress = (project) => {
    return project.startDate && !project.endDate;
  };

  // This showSuggestions is now only relevant for datalist fields (DevOps Tools, Databases).
  const showSuggestions = useCallback((e) => {
    const input = e.target;
    if (input && input.list) {
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
    }
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 800,
          margin: "0 auto",
          padding: { xs: 2, sm: 3 }, // Responsive padding
          backgroundColor: "#f4f6f8", // A soft, light grey background
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // A slightly softer shadow
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ color: "#2c3e50", fontWeight: "600", marginBottom: 3 }} // Darker, slightly bluish-grey, bolder
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
            showSuggestions={showSuggestions}
            projectsCount={projects.length}
          />
        ))}

        {/* Datalists for DevOps Tools and Databases */}
        <>
            {/* programmingLanguagesList is removed as Autocomplete is used */}
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

            <datalist id="databasesList">
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
              <option value="AWS RDS" />
              <option value="AWS Aurora" />
              <option value="AWS DocumentDB" />
              <option value="GCP BigQuery" />
              <option value="GCP Cloud SQL" />
              <option value="GCP Firestore" />
              <option value="GCP Spanner" />
              <option value="Azure SQL Database" />
              <option value="Azure Cosmos DB" />
              <option value="Azure Table Storage" />
              <option value="Synapse Analytics" />
              <option value="Databricks" />
            </datalist>
        </>

        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
          <Button
            variant="outlined"
            // color="primary" // Using sx for more control
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
            // color="primary" // Using sx for more control
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
