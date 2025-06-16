import React, { useState, useEffect, useCallback } from "react";
import { Typography, Form, Input, Select as AntdSelect } from "antd"; // Added AntdSelect
import { useLocation, useNavigate} from "react-router-dom";
import nlp from "compromise";
import {
  Box,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Button,
  Grid, // For layout in ratings dialog
  Tooltip, // Added for info icons
  IconButton, // Added for info icons
} from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Added for info icons

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

// Helper function to calculate technical role score
const calculateTechRoleScore = (text) => {
  const techRoleKeywords = [
    "engineer", "developer", "architect", "specialist", "analyst", "programmer",
    "consultant", "scientist", "designer", "tester", "qa", "technical lead", // "technical lead" is more tech-focused
    "devops", "cloud engineer", "data engineer", "software engineer", "frontend developer", "backend developer"
  ];
  let score = 0;
  const lowerText = text.toLowerCase();

  techRoleKeywords.forEach(keyword => {
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
const determineBestRole = (techSkills, managementScore, text, experienceYears) => {
  const lowerText = text.toLowerCase();

  // Helper to determine role based on experience tiers for specialized roles
  // titles = { junior, regular, senior, lead, principal, manager }
  const getTieredRole = (titles) => {
    if (experienceYears > 10) { // 11+ years
        if (titles.manager && managementScore > 4) return titles.manager;
        return titles.principal || `Principal ${titles.regular}`;
    }
    if (experienceYears > 8) { // 9-10 years
        if (titles.manager && managementScore > 4) return titles.manager; // Early manager track
        if (titles.lead && managementScore > 3) return titles.lead;
        // If no specific lead title, and principal exists, prefer principal. Otherwise, default to senior.
        return titles.principal || titles.senior || `Senior ${titles.regular}`;
    }
    if (experienceYears > 5) { // 6-8 years
        return titles.senior || `Senior ${titles.regular}`;
    }
    if (experienceYears > 2) { // 3-5 years
        return titles.regular;
    }
    // 0-2 years
    return titles.junior || `Junior ${titles.regular}`;
  };

  // Specialized roles based on tech skills and experience
  if (techSkills.some(skill => ["AWS", "Azure", "GCP", "EC2", "S3", "Lambda", "CloudFormation"].includes(skill))) {
    return getTieredRole({
      junior: "Junior Cloud Engineer", regular: "Cloud Engineer", senior: "Senior Cloud Engineer",
      lead: "Lead Cloud Engineer", principal: "Principal Cloud Engineer", manager: "Cloud Solutions Architect"
    });
  }

  if (techSkills.some(skill => ["Machine Learning", "AI", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Data Mining"].includes(skill))) {
    return getTieredRole({
      junior: "Junior Data Scientist / Data Analyst", regular: "Data Scientist", senior: "Senior Data Scientist",
      lead: "Lead Data Scientist", principal: "Principal Data Scientist", manager: "Data Science Manager"
    });
  }

  if (techSkills.some(skill => ["React", "Angular", "Vue.js", "JavaScript", "TypeScript", "HTML", "CSS"].includes(skill))) {
    return getTieredRole({
      junior: "Junior Frontend Developer", regular: "Frontend Developer", senior: "Senior Frontend Developer",
      lead: "Lead Frontend Developer", principal: "Principal Frontend Engineer", manager: "Frontend Engineering Manager"
    });
  }

  if (techSkills.some(skill => ["Java", "Spring", "Node.js", "Express.js", "Django", "Flask", "ASP.NET"].includes(skill))) {
    return getTieredRole({
      junior: "Junior Backend Developer", regular: "Backend Developer", senior: "Senior Backend Developer",
      lead: "Lead Backend Developer", principal: "Principal Backend Engineer", manager: "Backend Engineering Manager"
    });
  }

  if (techSkills.some(skill => ["Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions", "Terraform", "Ansible"].includes(skill))) {
    return getTieredRole({
      junior: "Junior DevOps Engineer", regular: "DevOps Engineer", senior: "Senior DevOps Engineer",
      lead: "Lead DevOps Engineer", principal: "Principal DevOps Engineer", manager: "DevOps Manager"
    });
  }

  // General Management roles if no specific tech track matched and high experience/score
  if (experienceYears > 10 && managementScore > 4) { // 11+ years
     if (lowerText.includes("product")) return "Product Manager";
     if (lowerText.includes("project")) return "Program Manager";
     return "Engineering Manager";
  }
  if (experienceYears > 8 && managementScore > 3) { // 9-10 years with some management
     if (lowerText.includes("product")) return "Associate Product Manager"; // Or similar mid-level product role
     if (lowerText.includes("project")) return "Project Lead";
     return "Technical Lead"; // General technical leadership
  }
  
  // Fallback to general Software Engineering roles, strictly tiered by experience
  if (experienceYears > 10) return managementScore > 3 ? "Technical Lead / Architect" : "Principal Software Engineer";
  if (experienceYears > 8) return managementScore > 2 ? "Technical Lead" : "Senior Software Engineer"; // 9-10 years
  if (experienceYears > 5) return "Senior Software Engineer"; // 6-8 years
  if (experienceYears > 2) return "Software Engineer"; // 3-5 years
  return "Junior Software Engineer"; // 0-2 years
};

// Enhanced NLP function for better summarization
const generateInitialSummaryAndRole = (concatenatedDetails, overallExperienceYearsInput) => { 
  if (!concatenatedDetails || concatenatedDetails.trim() === "" || concatenatedDetails.length < 20) {
    return {
      summaryObject: {
        error: true
      },
      jobRole: "Invalid Role"
    };
  }

  // Extract key information using compromise
  const doc = nlp(concatenatedDetails);
  
  // Extract technical skills
  const techSkills = extractTechnicalSkills(concatenatedDetails);
  
  // Use passed-in overall experience
  const experienceYears = overallExperienceYearsInput || 0; 
  
  // Extract management indicators
  const managementScore = calculateManagementScore(concatenatedDetails);
  
  // Extract technical role indicators
  const techRoleScore = calculateTechRoleScore(concatenatedDetails);

  // Generate a more comprehensive summary
  let summarizedProfile = ""; // Initialize summarizedProfile
  
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
  const suggestedRole = determineBestRole(techSkills, managementScore, concatenatedDetails, experienceYears); // Pass experienceYears
  
  return {
    summaryObject: {
      summary: summarizedProfile,
      skills: techSkills,
      experience: experienceYears,
      managementScore: managementScore,
      techRoleScore: techRoleScore, // Added tech role score
      keyTopics: keyTopics,
      error: false
    },
    jobRole: suggestedRole
  };
};

// Function to adjust role based on performance rating
const adjustRoleBasedOnRating = (currentRole, averageRating) => {
  if (averageRating === null || averageRating === undefined) return currentRole;

  const role = currentRole.toLowerCase();
  const isAlreadyManager = role.includes("manager") || role.includes("architect") || role.includes("director");
  const isAlreadyLead = role.includes("lead");

  if (averageRating === 4) {
    if (!isAlreadyManager && !isAlreadyLead) {
      return `Lead ${currentRole}`;
    }
  } else if (averageRating >= 5) { // averageRating > 4 means 5
    if (!isAlreadyManager) {
      if (role.includes("cloud")) return "Technical Manager (Cloud)";
      if (role.includes("data")) return "Technical Manager (Data)";
      // Add more specific manager roles if needed
      return "Technical Manager";
    }
  }
  return currentRole; // For ratings < 4 or if no promotion applies
};

function Summarize() {
  const location = useLocation();
  const navigate = useNavigate();
  // Correctly get projectsData, which is an array of project objects
  const { projectsData, overallExperience: routeOverallExperience } = location.state || { projectsData: [], overallExperience: 0 };

  const [summary, setSummary] = useState("");
  const [summaryObject, setSummaryObject] = useState(null); // To store the full summary object
  const [jobRole, setJobRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(true);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState("");
  
  // State for performance ratings
  const [isRatingsDialogOpen, setIsRatingsDialogOpen] = useState(false);
  const [ratingYears, setRatingYears] = useState([]);
  const [performanceRatings, setPerformanceRatings] = useState({});
  const [averagePerformanceRating, setAveragePerformanceRating] = useState(null);
  const [ratingsError, setRatingsError] = useState("");

  // Determine how many years of ratings to ask for
  const getRatingYearsToAsk = useCallback((experience) => {
    if (experience < 1) return 0; // No ratings for less than 1 year
    if (experience >= 1 && experience < 2) return 1; // 1 year rating
    if (experience >= 2 && experience < 3) return 2; // 2 years rating
    return 3; // 3 or more years
  }, []); // Empty dependency array means this function is memoized and stable

  const processSummarization = useCallback((avgRating) => {
    setIsRatingsDialogOpen(false); // Ensure ratings dialog is closed
    setProcessingDialogOpen(true); // Now show processing for actual summarization
    setIsLoading(true); // Set loading true for the summary generation phase

    setTimeout(() => {
        const concatenatedDetails = projectsData
            .map(p => `${p.title || ""} ${p.description || ""} ${p.role || ""} ${p.programmingLanguages || ""} ${p.devOpsTools || ""} ${p.databases || ""}`)
            .join("\n\n");

        const { summaryObject: initialSummaryObj, jobRole: initialJobRole } = generateInitialSummaryAndRole(concatenatedDetails, routeOverallExperience);

        if (initialSummaryObj.error) {
            setErrorDialogOpen(true);
        } else {
            const finalJobRole = adjustRoleBasedOnRating(initialJobRole, avgRating);
            setSummary(initialSummaryObj.summary || "");
            setSummaryObject(initialSummaryObj); // Store the full object
            setJobRole(finalJobRole);
        }
        setProcessingDialogOpen(false); // Stop processing dialog
        setIsLoading(false); // Stop main loading indicator
    }, 1500);
  }, [projectsData, routeOverallExperience]); // Dependencies for processSummarization

  useEffect(() => {
    // Initially, we are not "loading" a summary, but setting up for ratings or showing an error.
    setIsLoading(false); 
    setProcessingDialogOpen(false); // Ensure this is false initially

    if (projectsData && projectsData.length > 0) {
      const numRatingYearsToAsk = getRatingYearsToAsk(routeOverallExperience);
      if (numRatingYearsToAsk === 0) {
        // If no ratings needed (e.g., < 1 year exp), proceed directly to summarization
        setAveragePerformanceRating(null); // Or a default if preferred
        processSummarization(null); 
      } else {
        const currentYear = new Date().getFullYear();
        const yearsToRate = [];
        for (let i = 0; i < numRatingYearsToAsk; i++) {
          yearsToRate.push(currentYear - 1 - i);
        }
        setRatingYears(yearsToRate);
        setPerformanceRatings(yearsToRate.reduce((acc, year) => ({ ...acc, [year]: null }), {}));
        setIsRatingsDialogOpen(true);
      }
    } else {
      // No project data, show error
      setErrorDialogOpen(true);
    }
  }, [projectsData, routeOverallExperience, processSummarization, getRatingYearsToAsk]); 

  const handleRatingsSubmit = useCallback(() => {
    // Check if all *requested* years have ratings (ratings variable was unused)
    if (ratingYears.some(year => performanceRatings[year] === null || performanceRatings[year] === undefined || performanceRatings[year] === "")) {
      setRatingsError(`Please provide ratings for all ${ratingYears.length} year(s).`);
      return;
    }
    setRatingsError("");

    let avg = null;
    if (ratingYears.length > 0) {
        const validRatings = ratingYears.map(year => parseInt(performanceRatings[year], 10)).filter(r => !isNaN(r));
        if (validRatings.length > 0) {
            const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
            avg = Math.floor(sum / validRatings.length); // Average without fractions
        }
    }
    setAveragePerformanceRating(avg);

    setIsRatingsDialogOpen(false);
    processSummarization(avg); // Proceed to summarization with the average rating
  }, [performanceRatings, ratingYears, processSummarization]);

  const handleRatingChange = (year, value) => {
    setPerformanceRatings(prev => ({ ...prev, [year]: value }));
    if (ratingsError) setRatingsError(""); // Clear error on change
  };

  // Handle redirect to specified target
  const handleRedirect = (target, navigationState = null) => { // Renamed dataToPass for clarity
    setRedirectTarget(target);
    if (isRatingsDialogOpen) setIsRatingsDialogOpen(false);
    if (errorDialogOpen) setErrorDialogOpen(false);

    setRedirectDialogOpen(true);
    setTimeout(() => {
      // No longer setting redirectDialogOpen to false here for the successful navigation path.
      // The dialog will unmount with the component upon navigation.
      // Check if navigating to projects summary and if there's no valid project data to pass
      if (target === "/build-my-resume/projects-summary") {
        const currentProjectsData = navigationState?.projectsData || projectsData; // Use passed data or component's
        if (!currentProjectsData || !currentProjectsData.length) {
            setErrorDialogOpen(true); 
            setRedirectDialogOpen(false); // Explicitly hide redirect dialog if an error occurs and we don't navigate
            return; // Prevent navigation if no project data
        }
      }
      navigate(target, { state: navigationState }); // Pass the full state object
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

  // Ratings Dialog
  const RatingsDialog = () => (
    <Dialog
      open={isRatingsDialogOpen}
      disableEscapeKeyDown
      PaperProps={{ sx: { borderRadius: 2, minWidth: '450px', p: 1 } }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
        Annual Performance Ratings
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, textAlign: 'center' }}>
          Please provide your performance ratings for the last {ratingYears.length} year(s) (5 being the highest).
        </DialogContentText>
        <Grid container spacing={2} direction="column" alignItems="center">
          {ratingYears.map(year => (
            <Grid item xs={12} sm={10} md={8} key={year} sx={{width: '100%'}}>
              <Form.Item label={`Rating for ${year}:`} style={{ marginBottom: '8px', width: '100%' }}>
                 <AntdSelect
                    placeholder="Select Rating"
                    value={performanceRatings[year]}
                    onChange={(value) => handleRatingChange(year, value)}
                    // Attempt to attach the dropdown to the DialogContent, 
                    // falling back to parentElement if DialogContent is not found up the tree.
                    // This can help avoid issues if the immediate parent is part of a resize loop.
                    getPopupContainer={triggerNode => triggerNode.closest('.MuiDialogContent-root') || triggerNode.parentElement}
                    style={{ width: '100%' }}
                  >
                    {[1, 2, 3, 4, 5].map(r => <AntdSelect.Option key={r} value={r}>{r}</AntdSelect.Option>)}
                  </AntdSelect>
              </Form.Item>
            </Grid>
          ))}
        </Grid>
        {ratingsError && (
          <Typography color="error" sx={{ textAlign: 'center', mt: 1 }}>
            {ratingsError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2, pt:1, gap: 2 }}>
        <Button 
            variant="outlined" 
            onClick={() => handleRedirect(
                "/build-my-resume/projects-summary", 
                { projectsData: projectsData, overallExperienceYears: routeOverallExperience }
            )}
        >
            Back to Projects
        </Button>
        <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRatingsSubmit}>
          Submit Ratings & Summarize
        </Button>
      </DialogActions>
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
          onClick={() => handleRedirect(
            "/build-my-resume/projects-summary", 
            { projectsData: projectsData, overallExperienceYears: routeOverallExperience }
          )}
          sx={{ minWidth: '140px' }}
        >
          Edit Projects
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleRedirect("/", null)}
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
      // This section is now primarily for when processSummarization is running
      <>
        {/* Show processing dialog if it's explicitly set for summarization */}
        {processingDialogOpen && <ProcessingDialog />} 
        {/* The main circular progress for the page content */}
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)', p:3}}>
          <CircularProgress size={60} />
          <Typography sx={{mt: 2, color: 'text.secondary', fontSize: '1.1rem'}}>Generating your profile summary...</Typography>
        </Box>
      </>
    );
  }

  // If any dialog (Ratings, Error, or Redirect) should be open, render them.
  if (isRatingsDialogOpen || errorDialogOpen || redirectDialogOpen) {
    // If ratings dialog was meant to be open but an error occurred before it, ensure it's not lost
    return (
      <>
        {isRatingsDialogOpen && <RatingsDialog />}
        {errorDialogOpen && <ErrorDialog />} 
        {redirectDialogOpen && <RedirectDialog />} 
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
        {/* Professional Summary Output */}
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

        {/* Detailed Report Sections */}
        {summaryObject && !summaryObject.error && (
          <>
            <Form.Item
              label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Years of Experience</span>}
            >
              <Card elevation={1} sx={{ padding: "12px", backgroundColor: "#e3f2fd", border: "1px solid #90caf9", display: 'flex', alignItems: 'center' }}>
                <Typography sx={{
                    color: summaryObject.experience > 0 ? "#1a237e" : "#546e7a", // Darker blue for value, grey for "Not specified"
                    fontWeight: "bold", 
                    fontSize: "16px",
                    fontFamily: "'Roboto Mono', monospace", // A more "data-like" font
                  }}
                >
                  {summaryObject.experience > 0 ? 
                    `${summaryObject.experience}${summaryObject.experience === 1 ? " year" : " years"}` : 
                    "Not specified."
                  }
                  {summaryObject.experience > 0 && <span style={{fontWeight: 'normal', color: '#333'}}> (from experience summary)</span>}
                </Typography>
              </Card>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Management/Leadership Score</span>}
            >
              <Card elevation={1} sx={{ padding: "12px", backgroundColor: "#e3f2fd", border: "1px solid #90caf9", display: 'flex', alignItems: 'center' }}>
                <Typography sx={{
                    color: "#1a237e", 
                    fontWeight: "bold", 
                    fontSize: "16px",
                    fontFamily: "'Roboto Mono', monospace",
                    mr: 1 
                  }}
                >
                  {summaryObject.managementScore !== undefined ? summaryObject.managementScore : "N/A"}
                </Typography>
                <Typography sx={{color: "#333", fontSize: "15px", flexGrow: 1}}>
                  (based on keywords like lead, manage, etc.)
                </Typography>
                <Tooltip title={
                  "Score based on management/leadership keywords (e.g., lead, manage, team lead, strategy).\n" +
                  "0-2: Indicates some exposure or mention of leadership tasks.\n" +
                  "3-4: Suggests moderate experience in leading tasks or small teams.\n" +
                  "5+: Points to significant leadership or management responsibilities."}>
                  <IconButton size="small" sx={{ ml: 'auto', color: '#1976d2' }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Card>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Technical Role Score</span>}
            >
              <Card elevation={1} sx={{ padding: "12px", backgroundColor: "#e3f2fd", border: "1px solid #90caf9", display: 'flex', alignItems: 'center' }}>
                <Typography sx={{
                    color: "#1a237e", 
                    fontWeight: "bold", 
                    fontSize: "16px",
                    fontFamily: "'Roboto Mono', monospace",
                    mr: 1 
                  }}
                >
                  {summaryObject.techRoleScore !== undefined ? summaryObject.techRoleScore : "N/A"}
                </Typography>
                <Typography sx={{color: "#333", fontSize: "15px", flexGrow: 1}}>
                  (based on keywords like engineer, developer, architect, etc.)
                </Typography>
                <Tooltip title={
                  "Score based on technical role keywords (e.g., engineer, developer, architect, analyst).\n" +
                  "0-2: Basic technical involvement mentioned.\n" +
                  "3-5: Solid technical contributions and role identification.\n" +
                  "6+: Deep and broad technical expertise evident through keyword usage."}>
                  <IconButton size="small" sx={{ ml: 'auto', color: '#1976d2' }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Card>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Key Technical Skills</span>}
            >
              <Card elevation={1} sx={{ padding: "12px", backgroundColor: "#e3f2fd", border: "1px solid #90caf9" }}>
                <Typography sx={{
                    color: "#1a237e", 
                    fontSize: "15px", 
                    fontFamily: "'Roboto Mono', monospace",
                    lineHeight: 1.6
                  }}
                >
                  {summaryObject.skills?.join(', ') || "Not specified."}
                </Typography>
              </Card>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Key Project Highlights</span>}
            >
              <Card elevation={1} sx={{ padding: "12px", backgroundColor: "#e3f2fd", border: "1px solid #90caf9" }}>
                {summaryObject.keyTopics?.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: "#1a237e", fontSize: "15px", fontFamily: "'Roboto Mono', monospace", lineHeight: 1.6 }}>
                    {summaryObject.keyTopics.map((topic, index) => <li key={index}>{topic}</li>)}
                  </ul>
                ) : (
                  <Typography sx={{color: "#333", fontSize: "15px"}}>Not specified.</Typography>
                )}
              </Card>
            </Form.Item>

            {averagePerformanceRating !== null && (
                <Form.Item
                  label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Performance Insight</span>}
                >
                  <Card elevation={1} sx={{ padding: "12px", backgroundColor: "#e8eaf6", border: "1px solid #9fa8da" }}>
                    <Typography sx={{color: "#303f9f", fontSize: "15px"}}>
                      Average performance rating (last {ratingYears.length} year(s)):{' '}
                      <Typography component="span" sx={{ 
                          fontWeight: "bold", 
                          fontSize: "16px", 
                          fontFamily: "'Roboto Mono', monospace",
                          color: "#1a237e"
                        }}>{averagePerformanceRating} out of 5</Typography>.
                      This rating has been considered in the role recommendation.
                    </Typography>
                  </Card>
                </Form.Item>
            )}

            <Form.Item
              label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Resume Improvement Suggestions</span>}
            >
              <Card elevation={1} sx={{ padding: "12px", backgroundColor: "#fff3e0", border: "1px solid #ffcc80" }}>
                <Typography sx={{color: "#e65100", fontSize: "15px"}}>
                  Consider the following to enhance your resume:
                </Typography>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: "#e65100", fontSize: "15px" }}>
                    <li>Ensure all project descriptions clearly state your specific contributions and quantifiable achievements.</li>
                    <li>Tailor your summary to the specific job you are applying for, highlighting the most relevant skills.</li>
                    <li>Double-check for consistency in dates and project details.</li>
                </ul>
              </Card>
            </Form.Item>
          </>
        )}
      </Form>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => handleRedirect(
            "/build-my-resume/projects-summary", 
            { projectsData: projectsData, overallExperienceYears: routeOverallExperience }
          )}
          sx={{ minWidth: '160px' }}
        >
          Edit Projects
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleRedirect("/", null)}
          sx={{ minWidth: '160px' }}
        >
          Back to Main Menu
        </Button>
      </Box>
    </Box>
  );
}

export default Summarize;
