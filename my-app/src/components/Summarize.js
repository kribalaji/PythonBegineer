import React, { useState, useEffect } from "react";
import { Typography, Form, Input } from "antd";
import { useLocation } from "react-router-dom";
import nlp from "compromise";
import { Box } from "@mui/material";

const { TextArea } = Input;

// Move the function outside the component
const generateSummaryAndRole = (projectDetails, setSummary, setJobRole) => {
  if (!projectDetails || projectDetails.trim() === "" || projectDetails.length < 20) {
    setSummary(
      "Invalid Details entered. Not able to Summarize the candidate proficiency -> Please fill it correctly to ensure this application summarizes it correctly."
    );
    setJobRole("Invalid Role");
    return;
  }

  // Summarize the project details using compromise
  const doc = nlp(projectDetails);
  const sentences = doc.sentences().out("array");
  const summarizedSentences = sentences.slice(0, 5).join(" "); // Take the first 5 sentences

  // Suggest a job role based on keywords
  let suggestedRole = "Software Developer";
  if (projectDetails.toLowerCase().includes("cloud")) {
    suggestedRole = "Cloud Engineer";
  } else if (projectDetails.toLowerCase().includes("data")) {
    suggestedRole = "Data Scientist";
  } else if (projectDetails.toLowerCase().includes("frontend")) {
    suggestedRole = "Frontend Developer";
  } else if (projectDetails.toLowerCase().includes("backend")) {
    suggestedRole = "Backend Developer";
  }

  setSummary(summarizedSentences);
  setJobRole(suggestedRole);
};

function Summarize() {
  const location = useLocation();
  const { projectDetails } = location.state || { projectDetails: "" };

  const [summary, setSummary] = useState("");
  const [jobRole, setJobRole] = useState("");

  useEffect(() => {
    generateSummaryAndRole(projectDetails, setSummary, setJobRole);
  }, [projectDetails]);

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
      <Typography variant="h5" align="center" gutterBottom>
        Summarization about Associate
      </Typography>

      <Form layout="vertical">
        {/* Summary Output */}
        <Form.Item label="Summarization about Associate">
          <TextArea
            rows={5}
            value={summary}
            readOnly
            style={{
              color: summary.startsWith("Invalid") ? "red" : "black",
              fontWeight: summary.startsWith("Invalid") ? "bold" : "normal",
              fontSize: summary.startsWith("Invalid") ? "16px" : "14px",
            }}
          />
        </Form.Item>

        {/* Job Role Suggestion Output */}
        <Form.Item label="Best fit for Job Role">
          <Input
            value={jobRole}
            readOnly
            style={{
              color: jobRole === "Invalid Role" ? "red" : "black",
              fontWeight: jobRole === "Invalid Role" ? "bold" : "normal",
              fontSize: jobRole === "Invalid Role" ? "16px" : "14px",
            }}
          />
        </Form.Item>
      </Form>
    </Box>
  );
}

export default Summarize;