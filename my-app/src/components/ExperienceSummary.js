import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box, TextField, FormGroup, FormControlLabel, Checkbox } from "@mui/material";

function ExperienceSummary() {
  const navigate = useNavigate();

  // State to store form data
  const [formData, setFormData] = useState({
    professionalSummary: "",
    yearsOfExperience: "",
    monthsOfExperience: "",
    cloudPlatforms: [], // Array to store selected cloud platforms
    codeAIExperience: [], // Array to store selected Code AI Assistant experience
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Ensure only integers are allowed for years and months
    if ((name === "yearsOfExperience" || name === "monthsOfExperience") && !/^\d*$/.test(value)) {
      return;
    }

    // Additional validation for months (0-12)
    if (name === "monthsOfExperience" && value !== "") {
      const monthValue = parseInt(value, 10);
      if (monthValue > 12) {
        alert("Months cannot exceed 12. Please enter a value between 0 and 12.");
        return;
      }
    }

    // Ensure years is a positive integer
    if (name === "yearsOfExperience" && value !== "" && parseInt(value, 10) < 0) {
      alert("Years of experience cannot be negative.");
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox changes for cloud platforms
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    // Skip the special handling for "Not Applicable-Cloud" as it's handled separately
    if (name !== "Not Applicable-Cloud") {
      setFormData((prevState) => {
        // If a regular platform is checked and "Not Applicable" was previously selected, remove "Not Applicable"
        if (checked && prevState.cloudPlatforms.includes("Not Applicable-Cloud")) {
          return {
            ...prevState,
            cloudPlatforms: [name]
          };
        }
        
        const updatedPlatforms = checked
          ? [...prevState.cloudPlatforms, name] // Add platform if checked
          : prevState.cloudPlatforms.filter((platform) => platform !== name); // Remove platform if unchecked
        return { ...prevState, cloudPlatforms: updatedPlatforms };
      });
    }
  };

  // Handle checkbox changes for Code AI Assistant experience
  const handleCodeAICheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    // Skip the special handling for "Not Applicable-AI" as it's handled separately
    if (name !== "Not Applicable-AI") {
      setFormData((prevState) => {
        // If a regular AI is checked and "Not Applicable" was previously selected, remove "Not Applicable"
        if (checked && prevState.codeAIExperience.includes("Not Applicable-AI")) {
          return {
            ...prevState,
            codeAIExperience: [name]
          };
        }
        
        const updatedCodeAIExperience = checked
          ? [...prevState.codeAIExperience, name] // Add assistant if checked
          : prevState.codeAIExperience.filter((assistant) => assistant !== name); // Remove assistant if unchecked
        return { ...prevState, codeAIExperience: updatedCodeAIExperience };
      });
    }
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.professionalSummary.trim() !== "" &&
      formData.yearsOfExperience.trim() !== "" &&
      formData.monthsOfExperience.trim() !== "" &&
      formData.cloudPlatforms.length > 0 &&
      formData.codeAIExperience.length > 0
    );
  };

  // Handle navigation to the next page
  const handleNext = () => {
    console.log("Form Data:", formData); // Debugging: Log form data
    navigate("../projects-summary");
  };

  // Common styles for text fields
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#f0f7ff", // Light blue background
      "&:hover": {
        backgroundColor: "#e3f2fd", // Slightly darker blue on hover
      },
      "&.Mui-focused": {
        backgroundColor: "#e1f5fe", // Even darker blue when focused
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#90caf9", // Light blue border
    },
    fontSize: "14px",
    borderRadius: "5px",
  };

  return (
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
      {/* Experience Summary Header */}
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: "bold", marginBottom: 2 }}
      >
        Experience Summary
      </Typography>

      {/* Professional Summary */}
      <TextField
        label="Professional Summary"
        name="professionalSummary"
        value={formData.professionalSummary}
        onChange={handleInputChange}
        fullWidth
        multiline
        rows={4}
        margin="normal"
        required
        inputProps={{ maxLength: 500 }}
        helperText={`${formData.professionalSummary.length}/500 characters`}
        sx={textFieldStyles}
      />

      {/* Total Number of Experience */}
      <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
        <TextField
          label="Total Years of Experience"
          name="yearsOfExperience"
          value={formData.yearsOfExperience}
          onChange={handleInputChange}
          type="number"
          fullWidth
          required
          inputProps={{ min: 0 }}
          helperText="Enter a positive integer"
          sx={textFieldStyles}
        />
        <TextField
          label="Months"
          name="monthsOfExperience"
          value={formData.monthsOfExperience}
          onChange={handleInputChange}
          type="number"
          fullWidth
          required
          inputProps={{ min: 0, max: 12 }}
          helperText="Enter a value between 0 and 12"
          sx={textFieldStyles}
        />
      </Box>

      {/* Cloud Platform Experience */}
      <Box
        sx={{
          marginTop: 4,
          padding: 2,
          backgroundColor: "#e3f2fd", // Light blue background
          borderRadius: 2,
          border: "1px solid #90caf9", // Light blue border
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ marginBottom: 2, color: "#1976d2", fontWeight: "bold" }}
        >
          Cloud Platform Experience
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                name="AWS-Amazon Web Services"
                checked={formData.cloudPlatforms.includes("AWS-Amazon Web Services")}
                onChange={handleCheckboxChange}
                sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
              />
            }
            label="AWS - Amazon Web Services"
            sx={{ color: "#333" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="GCP-Google Cloud"
                checked={formData.cloudPlatforms.includes("GCP-Google Cloud")}
                onChange={handleCheckboxChange}
                sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
              />
            }
            label="GCP - Google Cloud"
            sx={{ color: "#333" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="Azure-Microsoft Azure"
                checked={formData.cloudPlatforms.includes("Azure-Microsoft Azure")}
                onChange={handleCheckboxChange}
                sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
              />
            }
            label="Azure - Microsoft Azure"
            sx={{ color: "#333" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="Not Applicable-Cloud"
                checked={formData.cloudPlatforms.includes("Not Applicable-Cloud")}
                onChange={(e) => {
                  if (e.target.checked) {
                    // If "Not Applicable" is checked, clear other selections
                    setFormData({
                      ...formData,
                      cloudPlatforms: ["Not Applicable-Cloud"]
                    });
                  } else {
                    // If unchecked, just remove it from the array
                    setFormData({
                      ...formData,
                      cloudPlatforms: formData.cloudPlatforms.filter(platform => platform !== "Not Applicable-Cloud")
                    });
                  }
                }}
                sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
              />
            }
            label="Not Applicable"
            sx={{ color: "#333", marginTop: 1, fontStyle: "italic" }}
          />
        </FormGroup>
      </Box>

      {/* Code AI Assistant Experience */}
      <Box
        sx={{
          marginTop: 4,
          padding: 2,
          backgroundColor: "#e8eaf6", // Light indigo background
          borderRadius: 2,
          border: "1px solid #9fa8da", // Light indigo border
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ marginBottom: 2, color: "#3f51b5", fontWeight: "bold" }}
        >
          Code AI Assistant Experience
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                name="Gemini AI - GCP"
                checked={formData.codeAIExperience.includes("Gemini AI - GCP")}
                onChange={handleCodeAICheckboxChange}
                sx={{ color: "#3f51b5", "&.Mui-checked": { color: "#3f51b5" } }}
              />
            }
            label="Gemini AI - GCP"
            sx={{ color: "#333" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="GitHubCoPilot - Microsoft"
                checked={formData.codeAIExperience.includes("GitHubCoPilot - Microsoft")}
                onChange={handleCodeAICheckboxChange}
                sx={{ color: "#3f51b5", "&.Mui-checked": { color: "#3f51b5" } }}
              />
            }
            label="GitHubCoPilot - Microsoft"
            sx={{ color: "#333" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="AmazonQ - AWS"
                checked={formData.codeAIExperience.includes("AmazonQ - AWS")}
                onChange={handleCodeAICheckboxChange}
                sx={{ color: "#3f51b5", "&.Mui-checked": { color: "#3f51b5" } }}
              />
            }
            label="AmazonQ - AWS"
            sx={{ color: "#333" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="Not Applicable-AI"
                checked={formData.codeAIExperience.includes("Not Applicable-AI")}
                onChange={(e) => {
                  if (e.target.checked) {
                    // If "Not Applicable" is checked, clear other selections
                    setFormData({
                      ...formData,
                      codeAIExperience: ["Not Applicable-AI"]
                    });
                  } else {
                    // If unchecked, just remove it from the array
                    setFormData({
                      ...formData,
                      codeAIExperience: formData.codeAIExperience.filter(ai => ai !== "Not Applicable-AI")
                    });
                  }
                }}
                sx={{ color: "#3f51b5", "&.Mui-checked": { color: "#3f51b5" } }}
              />
            }
            label="Not Applicable"
            sx={{ color: "#333", marginTop: 1, fontStyle: "italic" }}
          />
        </FormGroup>
      </Box>

      {/* Next Page Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleNext}
        disabled={!isFormValid()}
        sx={{ 
          marginTop: 3,
          padding: "10px 20px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          opacity: isFormValid() ? 1 : 0.7
        }}
      >
        Next Page → Projects Summary
      </Button>
    </Box>
  );
}

export default ExperienceSummary;
