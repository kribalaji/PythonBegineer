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

    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox changes for cloud platforms
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevState) => {
      const updatedPlatforms = checked
        ? [...prevState.cloudPlatforms, name] // Add platform if checked
        : prevState.cloudPlatforms.filter((platform) => platform !== name); // Remove platform if unchecked
      return { ...prevState, cloudPlatforms: updatedPlatforms };
    });
  };

  // Handle checkbox changes for Code AI Assistant experience
  const handleCodeAICheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevState) => {
      const updatedCodeAIExperience = checked
        ? [...prevState.codeAIExperience, name] // Add assistant if checked
        : prevState.codeAIExperience.filter((assistant) => assistant !== name); // Remove assistant if unchecked
      return { ...prevState, codeAIExperience: updatedCodeAIExperience };
    });
  };

  // Handle navigation to the next page
  const handleNext = () => {
    console.log("Form Data:", formData); // Debugging: Log form data
    navigate("../projects-summary");
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
        sx={{ color: "#333", fontWeight: "bold" }} // Set text color to dark gray and bold
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
        inputProps={{ maxLength: 500 }} // Limit to 500 characters
        helperText={`${formData.professionalSummary.length}/500 characters`} // Character counter
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5",
          borderRadius: "5px",
        }}
      />

      {/* Total Number of Experience */}
      <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
        <TextField
          label="Years of Experience"
          name="yearsOfExperience"
          value={formData.yearsOfExperience}
          onChange={handleInputChange}
          type="number"
          fullWidth
          required
          sx={{
            fontSize: "14px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          }}
        />
        <TextField
          label="Months of Experience"
          name="monthsOfExperience"
          value={formData.monthsOfExperience}
          onChange={handleInputChange}
          type="number"
          fullWidth
          required
          sx={{
            fontSize: "14px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          }}
        />
      </Box>

      {/* Cloud Platform Experience */}
      <Box
        sx={{
          marginTop: 4,
          padding: 2,
          backgroundColor: "#e8f4fc", // Light blue background for better visibility
          borderRadius: 2,
          border: "1px solid #b3d8f5", // Subtle border for separation
        }}
      >
        <Typography
          variant="h6"
          sx={{ marginBottom: 2, color: "#333", fontWeight: "bold" }} // Set text color to dark gray and bold
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
              />
            }
            label="AWS - Amazon Web Services"
            sx={{ color: "#333" }} // Set label text color to dark gray
          />
          <FormControlLabel
            control={
              <Checkbox
                name="GCP-Google Cloud"
                checked={formData.cloudPlatforms.includes("GCP-Google Cloud")}
                onChange={handleCheckboxChange}
              />
            }
            label="GCP - Google Cloud"
            sx={{ color: "#333" }} // Set label text color to dark gray
          />
          <FormControlLabel
            control={
              <Checkbox
                name="Azure-Microsoft Azure"
                checked={formData.cloudPlatforms.includes("Azure-Microsoft Azure")}
                onChange={handleCheckboxChange}
              />
            }
            label="Azure - Microsoft Azure"
            sx={{ color: "#333" }} // Set label text color to dark gray
          />
        </FormGroup>
      </Box>

      {/* Code AI Assistant Experience */}
      <Box
        sx={{
          marginTop: 4,
          padding: 2,
          backgroundColor: "#e8f4fc", // Light blue background for better visibility
          borderRadius: 2,
          border: "1px solid #b3d8f5", // Subtle border for separation
        }}
      >
        <Typography
          variant="h6"
          sx={{ marginBottom: 2, color: "#333", fontWeight: "bold" }} // Set text color to dark gray and bold
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
              />
            }
            label="Gemini AI - GCP"
            sx={{ color: "#333" }} // Set label text color to dark gray
          />
          <FormControlLabel
            control={
              <Checkbox
                name="GitHubCoPilot - Microsoft"
                checked={formData.codeAIExperience.includes("GitHubCoPilot - Microsoft")}
                onChange={handleCodeAICheckboxChange}
              />
            }
            label="GitHubCoPilot - Microsoft"
            sx={{ color: "#333" }} // Set label text color to dark gray
          />
          <FormControlLabel
            control={
              <Checkbox
                name="AmazonQ - AWS"
                checked={formData.codeAIExperience.includes("AmazonQ - AWS")}
                onChange={handleCodeAICheckboxChange}
              />
            }
            label="AmazonQ - AWS"
            sx={{ color: "#333" }} // Set label text color to dark gray
          />
        </FormGroup>
      </Box>

      {/* Next Page Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleNext}
        sx={{ marginTop: 3 }}
      >
        Next Page → Projects Summary
      </Button>
    </Box>
  );
}

export default ExperienceSummary;