import React, { useState, useEffect } from "react";
import { Typography, Form, Input } from "antd";
import { useLocation } from "react-router-dom";
import nlp from "compromise";
import { Box } from "@mui/material";

const { TextArea } = Input;

// Enhanced NLP function for better summarization
const generateSummaryAndRole = (projectDetails, setSummary, setJobRole) => {
  if (!projectDetails || projectDetails.trim() === "" || projectDetails.length < 20) {
    setSummary(
      "Invalid Details entered. Not able to Summarize the candidate proficiency -> Please fill it correctly to ensure this application summarizes it correctly."
    );
    setJobRole("Invalid Role");
    return;
  }

  // Extract key information using compromise
  const doc = nlp(projectDetails);
  
  // Extract technical skills
  const techSkills = extractTechnicalSkills(projectDetails);
  
  // Extract years of experience
  const experienceYears = extractExperienceYears(projectDetails);
  
  // Extract management indicators
  const managementScore = calculateManagementScore(projectDetails);
  
  // Generate a more comprehensive summary
  let summarizedProfile = "";
  
  // Add experience summary
  if (experienceYears > 0) {
    summarizedProfile += `Professional with ${experienceYears}+ years of experience. `;
  } else {
    summarizedProfile += "Professional with relevant experience. ";
  }
  
  // Add technical skills summary
  if (techSkills.length > 0) {
    summarizedProfile += `Proficient in ${techSkills.slice(0, 5).join(", ")}${techSkills.length > 5 ? ", and other technologies" : ""}. `;
  }
  
  // Add key sentences from the original text
  const sentences = doc.sentences().out("array");
  const keyTopics = extractKeyTopics(sentences);
  if (keyTopics.length > 0) {
    summarizedProfile += `Experienced in ${keyTopics.join(", ")}. `;
  }
  
  // Add leadership/management summary if applicable
  if (managementScore > 3) {
    summarizedProfile += "Demonstrates strong leadership and project management capabilities. ";
  } else if (managementScore > 1) {
    summarizedProfile += "Shows potential for team leadership roles. ";
  }
  
  // Determine the most suitable role
  const suggestedRole = determineBestRole(techSkills, managementScore, projectDetails);
  
  setSummary(summarizedProfile);
  setJobRole(suggestedRole);
};

// Helper function to extract technical skills
const extractTechnicalSkills = (text) => {
  const techKeywords = [
    // Programming languages
    "Python", "Java", "JavaScript", "TypeScript", "C#", "C++", "Go", "Ruby", "PHP", "Swift", "Kotlin", "Rust",
    // Frameworks & libraries
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", "ASP.NET", "Laravel",
    // Cloud platforms
    "AWS", "Azure", "GCP", "Google Cloud", "EC2", "S3", "Lambda", "DynamoDB", "CloudFormation",
    // DevOps tools
    "Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions", "Terraform", "Ansible", "Puppet",
    // Databases
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "DynamoDB", "Cassandra", "Redis", "Oracle", "SQL Server",
    // Data science
    "Machine Learning", "AI", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Data Mining", "Big Data",
    // Other tech
    "Microservices", "RESTful API", "GraphQL", "Serverless", "CI/CD", "Agile", "Scrum"
  ];
  
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  
  techKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
};

// Helper function to extract years of experience
const extractExperienceYears = (text) => {
  const experienceRegex = /(\d+)[\s-]*years? of experience/i;
  const match = text.match(experienceRegex);
  return match ? parseInt(match[1]) : 0;
};

// Helper function to calculate management score
const calculateManagementScore = (text) => {
  const managementKeywords = [
    "lead", "leader", "leadership", "manage", "manager", "management", "team lead",
    "supervised", "directed", "coordinated", "head", "chief", "executive",
    "strategy", "strategic", "decision-making", "stakeholder", "mentor"
  ];
  
  let score = 0;
  const lowerText = text.toLowerCase();
  
  managementKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      score++;
    }
  });
  
  return score;
};

// Helper function to extract key topics from sentences
const extractKeyTopics = (sentences) => {
  const topics = [];
  const topicRegex = /(developed|built|created|designed|implemented|architected|managed|led) ([^.]*)/i;
  
  sentences.forEach(sentence => {
    const match = sentence.match(topicRegex);
    if (match && match[2]) {
      const topic = match[2].trim();
      if (topic.length > 5 && topic.length < 50) {
        topics.push(topic);
      }
    }
  });
  
  return topics.slice(0, 3); // Return top 3 topics
};

// Helper function to determine the best role
const determineBestRole = (techSkills, managementScore, text) => {
  const lowerText = text.toLowerCase();
  
  // Check for specialized technical roles
  if (techSkills.some(skill => ["AWS", "Azure", "GCP", "EC2", "S3", "Lambda", "CloudFormation"].includes(skill))) {
    return managementScore > 3 ? "Cloud Solutions Architect" : "Cloud Engineer";
  }
  
  if (techSkills.some(skill => ["Machine Learning", "AI", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Data Mining"].includes(skill))) {
    return managementScore > 3 ? "Data Science Manager" : "Data Scientist";
  }
  
  if (techSkills.some(skill => ["React", "Angular", "Vue", "JavaScript", "TypeScript", "HTML", "CSS"].includes(skill))) {
    return managementScore > 3 ? "Frontend Engineering Manager" : "Frontend Developer";
  }
  
  if (techSkills.some(skill => ["Java", "Spring", "Node.js", "Express", "Django", "Flask", "ASP.NET"].includes(skill))) {
    return managementScore > 3 ? "Backend Engineering Manager" : "Backend Developer";
  }
  
  if (techSkills.some(skill => ["Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions", "Terraform", "Ansible"].includes(skill))) {
    return managementScore > 3 ? "DevOps Manager" : "DevOps Engineer";
  }
  
  // Check for management roles
  if (managementScore > 4) {
    if (lowerText.includes("product")) {
      return "Product Manager";
    } else if (lowerText.includes("project")) {
      return "Project Manager";
    } else {
      return "Engineering Manager";
    }
  }
  
  // Default roles based on management score
  return managementScore > 3 ? "Technical Team Lead" : "Software Developer";
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