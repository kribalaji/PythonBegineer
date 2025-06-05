import React, { useState, useEffect } from "react";
import { Typography, Form, Input } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import nlp from "compromise";
import {
  Box,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const { TextArea } = Input;

// Helper function to extract technical skills
const extractTechnicalSkills = (text) => {
  const techKeywords = [
    // Programming languages
    "Python", "Java", "JavaScript", "TypeScript", "C#", "C++", "Go", "PHP", "Ruby", "Swift",
    // Frameworks & libraries
    "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring", ".NET",
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
  
  if (techSkills.some(skill => ["React", "Angular", "Vue.js", "JavaScript", "TypeScript", "HTML", "CSS"].includes(skill))) {
    return managementScore > 3 ? "Frontend Engineering Manager" : "Frontend Developer";
  }
  
  if (techSkills.some(skill => ["Java", "Spring", "Node.js", "Express.js", "Django", "Flask", "ASP.NET"].includes(skill))) {
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

// Enhanced NLP function for better summarization
const generateSummaryAndRole = (projectDetails) => {
  if (!projectDetails || projectDetails.trim() === "" || projectDetails.length < 20) {
    return {
      summaryObject: {
        error: true
      },
      jobRole: "Invalid Role"
    };
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
  
  return {
    summaryObject: {
      summary: summarizedProfile,
      skills: techSkills,
      experience: experienceYears,
      managementScore: managementScore,
      keyTopics: keyTopics,
      error: false
    },
    jobRole: suggestedRole
  };
};

function Summarize() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectDetails } = location.state || { projectDetails: "" };

  const [summary, setSummary] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(true);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setProcessingDialogOpen(true);
    
    // Simulate processing time with a minimum delay for better UX
    const processingTimer = setTimeout(() => {
      if (projectDetails && projectDetails.trim() !== "") {
        const { summaryObject, jobRole: newJobRole } = generateSummaryAndRole(projectDetails);
        
        if (summaryObject.error) {
          // Show error dialog instead of summary
          setErrorDialogOpen(true);
          setProcessingDialogOpen(false);
          setIsLoading(false);
        } else {
          setSummary(summaryObject.summary || "");
          setJobRole(newJobRole);
          setProcessingDialogOpen(false);
          setIsLoading(false);
        }
      } else {
        // Show error dialog
        setErrorDialogOpen(true);
        setProcessingDialogOpen(false);
        setIsLoading(false);
      }
    }, 1500);

    return () => clearTimeout(processingTimer);
  }, [projectDetails]);

  // Handle redirect to specified target
  const handleRedirect = (target) => {
    setRedirectTarget(target);
    setErrorDialogOpen(false);
    setRedirectDialogOpen(true);
    setTimeout(() => {
      setRedirectDialogOpen(false);
      navigate(target);
    }, 2000);
  };

  // Processing Dialog
  const ProcessingDialog = () => (
    <Dialog 
      open={processingDialogOpen} 
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: '300px',
          maxWidth: '400px',
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
        Processing Candidate Profile
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography sx={{ mt: 3, mb: 1, textAlign: 'center' }}>
            Candidate Summarization in Progress
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Analyzing project details and generating insights...
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );

  // Error Dialog
  const ErrorDialog = () => (
    <Dialog
      open={errorDialogOpen}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: '400px',
          maxWidth: '500px',
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ErrorOutlineIcon sx={{ mr: 1, fontSize: 28 }} />
        Unable to Generate Summary
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Typography sx={{ mb: 2, textAlign: 'center', fontSize: '16px' }}>
            We couldn't generate a meaningful summary based on the provided information.
          </Typography>
          <Typography sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Please ensure you've provided complete project details including technologies used, 
            your role, and responsibilities to get an accurate profile summary.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => handleRedirect("/projects-summary")}
          sx={{ minWidth: '140px' }}
        >
          Edit Projects
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleRedirect("/")}
          sx={{ minWidth: '140px' }}
        >
          Main Menu
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Redirect Dialog
  const RedirectDialog = () => (
    <Dialog
      open={redirectDialogOpen}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: '300px',
          maxWidth: '400px',
          p: 1
        }
      }}
    >
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <CircularProgress size={40} thickness={4} />
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            {redirectTarget === "/" ? "Returning to Main Menu..." : "Returning to Projects Summary..."}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <>
        <ProcessingDialog />
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)', p:3}}>
          <CircularProgress size={60} />
          <Typography sx={{mt: 2, color: 'text.secondary', fontSize: '1.1rem'}}>Generating candidate summary...</Typography>
        </Box>
      </>
    );
  }

  if (errorDialogOpen || redirectDialogOpen) {
    return (
      <>
        <ErrorDialog />
        <RedirectDialog />
      </>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 3,
        backgroundColor: "#f0f7ff",
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        textAlign: "left",
      }}
    >
      <Typography 
        variant="h5" 
        align="center" 
        gutterBottom
        sx={{ 
          color: "#1976d2", 
          fontWeight: "bold",
          marginBottom: 3
        }}
      >
        Candidate Profile Summary
      </Typography>

      <Form layout="vertical">
        {/* Summary Output */}
        <Form.Item 
          label={
            <span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>
              Professional Summary
            </span>
          }
        >
          <Card elevation={2} sx={{ padding: 1, backgroundColor: "#e3f2fd" }}>
            <TextArea
              rows={5}
              value={summary}
              readOnly
              style={{
                color: "#333",
                fontSize: "15px",
                backgroundColor: "#e3f2fd",
                border: "1px solid #90caf9",
                borderRadius: "4px",
                padding: "12px",
              }}
            />
          </Card>
        </Form.Item>

        {/* Job Role Suggestion Output */}
        <Form.Item 
          label={
            <span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>
              Recommended Role
            </span>
          }
        >
          <Card elevation={2} sx={{ padding: 1, backgroundColor: "#e8eaf6" }}>
            <Input
              value={jobRole}
              readOnly
              style={{
                color: "#3f51b5",
                fontWeight: "bold",
                fontSize: "16px",
                backgroundColor: "#e8eaf6",
                border: "1px solid #9fa8da",
                borderRadius: "4px",
                padding: "12px",
                textAlign: "center",
              }}
            />
          </Card>
        </Form.Item>
      </Form>
    </Box>
  );
}

export default Summarize;
