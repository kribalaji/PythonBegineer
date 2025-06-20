import React, { useState, useEffect, useCallback } from "react";
import { Typography, Form, Input, Select as AntdSelect } from "antd";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import { QRCodeSVG } from 'qrcode.react'; 
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

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

// Helper function to safely rehydrate date values (similar to ProjectsSummary.js)
const rehydrateDateForSummarize = (valueFromState) => {
  if (!valueFromState) {
    return null;
  }
  // If it's already a Dayjs object with methods, dayjs() will clone it.
  // If it's a string, number, or native Date, dayjs() will parse it.
  // If it's a plain object that looks like a Dayjs object but lacks methods (e.g., from state transfer),
  // dayjs() might still be able to parse it if its internal structure ($d) is a recognizable date.
  if (typeof valueFromState === 'object' && valueFromState !== null && valueFromState.$isDayjsObject && typeof valueFromState.clone !== 'function') {
    // Attempt to reconstruct from internal $d property if it's a problematic Dayjs-like object
    if (valueFromState.$d) {
      const rawDate = valueFromState.$d;
      if (rawDate instanceof Date || typeof rawDate === 'string' || typeof rawDate === 'number' || dayjs.isDayjs(rawDate)) {
        return dayjs(rawDate);
      }
    }
    // Fallback for problematic objects that can't be easily reconstructed
    return null; 
  }
  return dayjs(valueFromState); // Standard Dayjs parsing/cloning
};

// Helper function to calculate project duration in years
const calculateProjectDurationInYears = (startDate, endDate) => {
  // startDate and endDate are expected to be dayjs objects
  if (!startDate || !startDate.isValid()) return 0;

  // If endDate is null/undefined (ongoing project) or not a valid dayjs object, default to now.
  // If endDate is a valid dayjs object, use it.
  const end = (endDate && endDate.isValid()) ? endDate : dayjs();

  if (end.isBefore(startDate)) return 0;
  return end.diff(startDate, 'month') / 12; // Duration in years (can be fractional)
};

// Helper function to prepare data for the skills experience graph
const prepareSkillsExperienceData = (projects, topN = 15) => {
  const skillExperience = {};

  projects.forEach(project => {
    const sDate = project.startDate && dayjs(project.startDate).isValid() ? dayjs(project.startDate) : null;
    const eDate = project.endDate && dayjs(project.endDate).isValid() ? dayjs(project.endDate) : null;

    if (!sDate) return; // Skip project if start date is invalid

    const duration = calculateProjectDurationInYears(sDate, eDate);
    if (duration <= 0) return;

    const skills = [];
    if (project.programmingLanguages) skills.push(...project.programmingLanguages.split(',').map(s => s.trim()).filter(s => s));
    if (project.devOpsTools) skills.push(...project.devOpsTools.split(',').map(s => s.trim()).filter(s => s));
    if (project.databases) skills.push(...project.databases.split(',').map(s => s.trim()).filter(s => s));
    if (project.cloudPlatform) skills.push(...project.cloudPlatform.split(',').map(s => s.trim()).filter(s => s));

    const uniqueSkillsInProject = [...new Set(skills)];

    uniqueSkillsInProject.forEach(skill => {
      skillExperience[skill] = (skillExperience[skill] || 0) + duration;
    });
  });

  const allSkills = Object.entries(skillExperience)
    .map(([name, experience]) => ({ name, experience: parseFloat(experience.toFixed(1)) }))
    .sort((a, b) => b.experience - a.experience);

  return allSkills.slice(0, topN);
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

// Custom label renderer for the Pie Chart
const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
  const RADIAN = Math.PI / 180;
  // Position label outside the slice
  const radius = outerRadius + 15; // Adjust this value for distance from pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const MAX_NAME_LENGTH_IN_LABEL = 10; // Max characters for skill name part in the label
  const displayName = name.length > MAX_NAME_LENGTH_IN_LABEL 
    ? `${name.substring(0, MAX_NAME_LENGTH_IN_LABEL - 3)}...` 
    : name;
  
  const labelText = `${displayName} (${(percent * 100).toFixed(0)}%)`;

  // Do not render label if the slice is too small (e.g., less than 5% to avoid clutter)
  if (percent * 100 < 5) {
    return null;
  }

  return (
    <text x={x} y={y} fill="#333333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
      {labelText}
    </text>
  );
};

function Summarize() {
  const location = useLocation();
  const navigate = useNavigate();
  // Correctly get projectsData, which is an array of project objects
  const { projectsData, overallExperience: routeOverallExperience, codeAIExperienceFromSummary,
    firstName, lastName, mobileNumber // Extract name and mobile number
  } = location.state || { projectsData: [], overallExperience: 0, codeAIExperienceFromSummary: [], firstName: "", lastName: "", mobileNumber: "" };


  const [summary, setSummary] = useState("");
  const [summaryObject, setSummaryObject] = useState(null); // To store the full summary object
  const [jobRole, setJobRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(true);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false); // For dialogs
  const [redirectTarget, setRedirectTarget] = useState("");
  
  // State for performance ratings
  const [isRatingsDialogOpen, setIsRatingsDialogOpen] = useState(false);
  const [ratingYears, setRatingYears] = useState([]);
  const [performanceRatings, setPerformanceRatings] = useState({});
  const [averagePerformanceRating, setAveragePerformanceRating] = useState(null);
  const [ratingsError, setRatingsError] = useState("");
  const [skillsExperienceData, setSkillsExperienceData] = useState([]);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false); // State for download dialog
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false); // State for DOCX generation
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false); // State for PDF generation
  const [showSkillsChart, setShowSkillsChart] = useState(false);

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
        // Rehydrate dates in projectsData before processing
        const rehydratedProjectsData = projectsData.map(p => ({
          ...p,
          startDate: rehydrateDateForSummarize(p.startDate),
          endDate: rehydrateDateForSummarize(p.endDate),
        }));

        const concatenatedDetails = rehydratedProjectsData
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

            if (rehydratedProjectsData && rehydratedProjectsData.length > 0) {
              const chartData = prepareSkillsExperienceData(rehydratedProjectsData);
              setSkillsExperienceData(chartData);
            } else {
              setSkillsExperienceData([]);
            }
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
    if (isDownloadDialogOpen) setIsDownloadDialogOpen(false); // Close download dialog on redirect

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

  const generateDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      const docChildren = []; // Array to hold all document elements

      // Helper function to capture chart as base64 image
      const captureChartAsImage = async (elementId) => {
        const element = document.getElementById(elementId);
        if (!element) {
          console.warn(`Chart element with ID ${elementId} not found for DOCX export.`);
          return null;
        }
        try {
          const canvas = await html2canvas(element, {
            logging: false, // To reduce console noise during capture
            useCORS: true,  // Important if your charts use external resources like web fonts
            scale: 3,       // Increased scale for better image resolution in DOCX
          });
          return canvas.toDataURL("image/png"); // Returns base64 string
        } catch (error) {
          console.error(`Error capturing chart ${elementId}:`, error);
          return null;
        }
      };

      // Add existing text content to docChildren
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: firstName && lastName ? `${firstName} ${lastName}'s Resume Summary` : "Candidate Resume Summary",
              bold: true, size: 32 
            })],
          heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),

        // Add Mobile Number if available
        ...(mobileNumber ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Mobile Number: ", bold: true }),
              new TextRun({ text: mobileNumber }),
            ],
            spacing: { after: 200 },
          }),
        ] : []),
        new Paragraph({
              children: [new TextRun({ text: "Recommended Role", bold: true, size: 28, underline: {} })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            new Paragraph({ text: jobRole || "Not specified", spacing: { after: 200 } }),

        new Paragraph({
              children: [new TextRun({ text: "Professional Summary", bold: true, size: 28, underline: {} })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            new Paragraph({ text: summary || "Not specified", spacing: { after: 200 } }),

        new Paragraph({
              children: [new TextRun({ text: "Key Information", bold: true, size: 28, underline: {} })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Years of Experience: ", bold: true }),
                new TextRun({ text: `${summaryObject?.experience || 0} years` }),
              ],
              spacing: { after: 50 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Key Technical Skills: ", bold: true }),
                new TextRun({ text: summaryObject?.skills?.join(', ') || "Not specified" }),
              ],
              spacing: { after: 200 }
            }),
      );

      if (averagePerformanceRating !== null) {
        docChildren.push(
          new Paragraph({
                children: [new TextRun({ text: "Performance Insight", bold: true, size: 28, underline: {} })],
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 100, before: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Average performance rating (last ${ratingYears.length} year(s)): `, bold: true }),
                  new TextRun({ text: `${averagePerformanceRating} out of 5` }),
                ],
                spacing: { after: 200 }
              }),
        );
      }

      // Add Code AI Assistant Experience to DOCX
      if (codeAIExperienceFromSummary && codeAIExperienceFromSummary.length > 0) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: "Code AI Assistant Experience", bold: true, size: 28, underline: {} })],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 100, before: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: codeAIExperienceFromSummary.join(', ').replace(/-/g, " ") || "Not specified" })],
            spacing: { after: 200 },
          })
        );
      }

      // Add Detailed Project Experience to DOCX
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: "Project Experience", bold: true, size: 28, underline: {} })],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 100, before: 200 },
        }),
        ...(projectsData && projectsData.length > 0 ? projectsData.flatMap((project, index) => [
          new Paragraph({
            children: [new TextRun({ text: project.title || `Project ${index + 1}`, bold: true, size: 24, underline: {} })],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 50, before: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Dates: ", bold: true }),
              new TextRun({
                text: `${project.startDate ? dayjs(rehydrateDateForSummarize(project.startDate)).format('MMM YYYY') : 'N/A'} - ${project.endDate ? dayjs(rehydrateDateForSummarize(project.endDate)).format('MMM YYYY') : 'Present'}`,
              }),
            ],
            spacing: { after: 50 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "Role/Contribution: ", bold: true })],
            spacing: { after: 20 }
          }),
          new Paragraph({ text: project.role || "Not specified", spacing: { after: 50 } }),
          new Paragraph({
            children: [new TextRun({ text: "Description: ", bold: true })],
            spacing: { after: 20 }
          }),
          new Paragraph({ text: project.description || "Not specified", spacing: { after: 50 } }),
          new Paragraph({
            children: [new TextRun({ text: "Technologies: ", bold: true })], // Keep this as a TextRun
            // For the actual list of technologies, create a new Paragraph if you want it on a new line,
            // or append as TextRun if you want it on the same line.
            // Here, assuming you want it on the same line or as part of the same logical block:
          }),
          new Paragraph({ // This will put technologies on a new line after "Technologies: "
            text: [
              project.programmingLanguages,
              project.devOpsTools,
              project.databases,
              project.cloudPlatform,
            ].filter(Boolean).join(', ') || "Not specified",
            spacing: { after: 100 }
          }),
        ]) : [new Paragraph({ text: "No project data available.", spacing: { after: 200 } })])
      );

      // --- Add Charts ---

      // 1. Top Skills Experience Distribution (Pie Chart)
      if (skillsExperienceData && skillsExperienceData.length > 0) {
        const pieChartImageBase64 = await captureChartAsImage('pieChartContainer');
        if (pieChartImageBase64) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: "Top Skills Experience Distribution", bold: true, size: 24, underline: {} })],
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100, before: 200 },
            }),
            new Paragraph({
              children: [new ImageRun({ data: pieChartImageBase64, transformation: { width: 480, height: 320 } })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          );
        }
      }

      // 2. Profile Score Overview (Bar Chart)
      if (summaryObject && summaryObject.managementScore !== undefined && summaryObject.techRoleScore !== undefined) {
        const profileScoreChartImageBase64 = await captureChartAsImage('profileScoreChartContainer');
        if (profileScoreChartImageBase64) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: "Profile Score Overview", bold: true, size: 24, underline: {} })],
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100, before: 200 },
            }),
            new Paragraph({
              children: [new ImageRun({ data: profileScoreChartImageBase64, transformation: { width: 480, height: 270 } })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          );
        }
      }

      // 3. Skills Experience Breakdown (Years) (Bar Chart)
      // This chart is captured if it's currently shown in the UI (showSkillsChart is true) and data exists.
      if (showSkillsChart && skillsExperienceData && skillsExperienceData.length > 0) {
        const skillsBarChartImageBase64 = await captureChartAsImage('skillsBarChartContainer');
        if (skillsBarChartImageBase64) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: "Skills Experience Breakdown (Years)", bold: true, size: 24, underline: {} })],
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100, before: 200 },
            }),
            new Paragraph({
              children: [new ImageRun({ data: skillsBarChartImageBase64, transformation: { width: 500, height: 400 } })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          );
        }
      }
      
      // --- Add QR Code if mobileNumber exists ---
      if (mobileNumber) {
        const qrCodeImageBase64 = await captureChartAsImage('qrCodeForDocx'); // Use the new ID
        if (qrCodeImageBase64) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: "Contact QR Code", bold: true, size: 24, underline: {} })],
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100, before: 200 },
            }),
            new Paragraph({
              children: [new ImageRun({ data: qrCodeImageBase64, transformation: { width: 100, height: 100 } })], // Adjust size as needed
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          );
        }
      }

      // --- Add Resume Improvement Suggestions ---
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: "Resume Improvement Suggestions", bold: true, size: 24, underline: {} })],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100, before: 200 },
        }),
        new Paragraph({
          children: [new TextRun("Consider the following to enhance your resume:")],
          spacing: { after: 50 },
        }),
        new Paragraph({
          text: "Ensure all project descriptions clearly state your specific contributions and quantifiable achievements.",
          bullet: { level: 0 },
        }),
        new Paragraph({
          text: "Tailor your summary to the specific job you are applying for, highlighting the most relevant skills.",
          bullet: { level: 0 },
        }),
        new Paragraph({
          text: "Double-check for consistency in dates and project details.",
          bullet: { level: 0 },
          spacing: { after: 200 },
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: docChildren,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "resume_summary_with_charts.docx");
      console.log("Document with charts created successfully");

    } catch (error) {
      console.error("Error generating DOCX with charts:", error);
      alert("An error occurred while generating the DOCX file with charts.");
    } finally {
      setIsGeneratingDocx(false);
      setIsDownloadDialogOpen(false); // Close dialog after attempt
    }
  };

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    setIsDownloadDialogOpen(false); // Close dialog before starting

    const summaryContentElement = document.getElementById('summaryContentToPrint');
    if (!summaryContentElement) {
      alert("Could not find summary content to print.");
      setIsGeneratingPdf(false);
      return;
    }

    try {
      // Temporarily adjust styles for printing if needed, e.g., remove box shadow
      const originalBoxShadow = summaryContentElement.style.boxShadow;
      summaryContentElement.style.boxShadow = 'none';

      const canvas = await html2canvas(summaryContentElement, {
        scale: 2, // Adjust scale for PDF quality
        useCORS: true,
        logging: false,
        windowWidth: summaryContentElement.scrollWidth,
        windowHeight: summaryContentElement.scrollHeight,
      });

      // Restore original styles
      summaryContentElement.style.boxShadow = originalBoxShadow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 page in portrait, units in mm
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('resume_summary.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF file.");
    } finally {
      setIsGeneratingPdf(false);
    }
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
                { projectsData: projectsData, overallExperienceYears: routeOverallExperience, firstName, lastName, mobileNumber }
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

  // Download Options Dialog
  const DownloadDialog = () => (
    <Dialog
      open={isDownloadDialogOpen}
      onClose={() => setIsDownloadDialogOpen(false)}
      aria-labelledby="download-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: '350px',
          maxWidth: '450px',
          p: 1
        }
      }}
    >
      <DialogTitle id="download-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
        Download Resume
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, textAlign: 'center' }}>
          Choose a format to download your generated resume summary.
        </DialogContentText>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={generateDocx}
            disabled={isGeneratingDocx}
          >
            {isGeneratingDocx ? <CircularProgress size={24} color="inherit" /> : "Download as DOCX"}
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={generatePdf} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? <CircularProgress size={24} color="inherit" /> : "Download as PDF"}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
        <Button onClick={() => setIsDownloadDialogOpen(false)} color="primary">Close</Button>
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
            { projectsData: projectsData, overallExperienceYears: routeOverallExperience, firstName, lastName, mobileNumber }
          )}
          sx={{ minWidth: '140px' }}
        >
          Edit Projects
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleRedirect("/", { firstName, lastName, mobileNumber })}
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
  // DownloadDialog is handled separately in the main return.
  if (isRatingsDialogOpen || errorDialogOpen || redirectDialogOpen) {
    return (
      <>
        {isRatingsDialogOpen && <RatingsDialog />}
        {errorDialogOpen && <ErrorDialog />} 
        {redirectDialogOpen && <RedirectDialog />} 
      </>
    );
  }

  return (
    <>
    <Box
      id="summaryContentToPrint" // Added ID for PDF generation
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
        {firstName && lastName ? `${firstName} ${lastName}'s Summary` : "Candidate Profile Summary"}
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

            {/* Code AI Assistant Experience Display */}
            {codeAIExperienceFromSummary && codeAIExperienceFromSummary.length > 0 && (
              <Form.Item
                label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Code AI Assistant Experience</span>}
              >
                <Card elevation={1} sx={{ padding: "12px", backgroundColor: "#e8eaf6", border: "1px solid #9fa8da" }}>
                  <Typography sx={{
                      color: "#303f9f",
                      fontSize: "15px",
                      fontFamily: "'Roboto Mono', monospace",
                      lineHeight: 1.6
                    }}
                  >
                    {codeAIExperienceFromSummary.join(', ').replace(/-/g, " ") || "Not specified."}
                  </Typography>
                </Card>
              </Form.Item>
            )}

            {skillsExperienceData && skillsExperienceData.length > 0 && (
              <Form.Item
                label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Top Skills Experience Distribution</span>}
              >
                <Card elevation={1} sx={{ padding: "16px", backgroundColor: "#ffffff", border: "1px solid #e0e0e0" }}>
                <ResponsiveContainer width="100%" height={300} id="pieChartContainer">
                    <PieChart>
                      <Pie
                        data={skillsExperienceData.slice(0, 7)} // Show top 7 skills for pie chart
                        cx="50%"
                        cy="50%"
                        labelLine={true} // Enable label lines
                        label={renderCustomizedPieLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="experience"
                        nameKey="name"
                      >
                        {skillsExperienceData.slice(0, 7).map((entry, index) => {
                          const isAICodingAssistant = codeAIExperienceFromSummary && codeAIExperienceFromSummary.includes(entry.name);
                          const defaultColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB'];
                          const fillColor = isAICodingAssistant ? '#A569BD' : defaultColors[index % defaultColors.length]; // Purple for AI assistants, cycles through defaults otherwise
                          return <Cell key={`cell-${index}`} fill={fillColor} />;
                        })}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [`${parseFloat(value).toFixed(1)} years`, name]} />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconSize={10}
                        wrapperStyle={{ lineHeight: '24px', paddingLeft: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" display="block" sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
                    Proportional experience breakdown for top skills.
                  </Typography>
                </Card>
              </Form.Item>
            )}

            {summaryObject && summaryObject.managementScore !== undefined && summaryObject.techRoleScore !== undefined && (
              <Form.Item
                label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Profile Score Overview</span>}
              >
                <Card elevation={1} sx={{ padding: "16px", backgroundColor: "#ffffff", border: "1px solid #e0e0e0" }}>
                  <ResponsiveContainer width="100%" height={250} id="profileScoreChartContainer">
                    <BarChart
                      data={[
                        { name: 'Management Score', score: summaryObject.managementScore },
                        { name: 'Technical Score', score: summaryObject.techRoleScore },
                      ]}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                      layout="vertical" // For horizontal bars
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'dataMax + 1']} /> 
                      <YAxis dataKey="name" type="category" width={120} />
                      <RechartsTooltip formatter={(value) => `${value} points`} />
                      <Legend />
                      <Bar dataKey="score" fill="#8884d8" name="Score" barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" display="block" sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
                    Comparison of calculated management/leadership and technical role scores.
                  </Typography>
                </Card>
              </Form.Item>
            )}

            {showSkillsChart && skillsExperienceData && skillsExperienceData.length > 0 && (
              <Form.Item
                label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Skills Experience Breakdown (Years)</span>}
              >
                <Card elevation={1} sx={{ padding: "16px", backgroundColor: "#ffffff", border: "1px solid #e0e0e0" }}>
                  <ResponsiveContainer width="100%" height={400} id="skillsBarChartContainer">
                    <BarChart
                      data={skillsExperienceData}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 100, // Increased bottom margin for rotated labels
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} height={100} />
                      <YAxis 
                        label={{ value: 'Years of Experience', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fontSize: '12px', fill: '#666'}, offset: -5 }} 
                        tickFormatter={(value) => value.toFixed(1)}
                      />
                      <RechartsTooltip formatter={(value) => `${parseFloat(value).toFixed(1)} years`} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                      <Bar dataKey="experience" fill="#82ca9d" name="Years of Experience" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Form.Item>
            )}

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

            {/* QR Code Display */}
            {mobileNumber && (
              <Form.Item label={<span style={{ color: "#1976d2", fontWeight: 500, fontSize: "16px" }}>Contact QR Code</span>}>
                <Card id="qrCodeForDocx" elevation={1} sx={{ padding: 2, backgroundColor: "#f1f8e9", border: "1px solid #c8e6c9", display: 'flex', justifyContent: 'center' }}>
                  <QRCodeSVG value={mobileNumber} size={128} level="H" />
                </Card>
                <Typography variant="caption" display="block" sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
                  Scan to get in touch!
                </Typography>
              </Form.Item>
            )}
            
          </>
        )}
      </Form>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* Download Button */}
        <Button
          variant="contained"
          color="success" // Using success color for download
          onClick={() => setIsDownloadDialogOpen(true)}
          sx={{ minWidth: '160px' }}
        >
          Download Resume
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowSkillsChart(!showSkillsChart)}
          disabled={!skillsExperienceData || skillsExperienceData.length === 0}
          sx={{ minWidth: '160px' }}
        >
          {showSkillsChart ? "Hide Skill Charts" : "Explore Skill Charts"}
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => handleRedirect(
            "/build-my-resume/projects-summary", 
            { projectsData: projectsData, overallExperienceYears: routeOverallExperience, firstName, lastName, mobileNumber }
          )}
          sx={{ minWidth: '160px' }}
        >
          Edit Projects
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleRedirect("/", { firstName, lastName, mobileNumber })}
          sx={{ minWidth: '160px' }}
        >
          Back to Main Menu
        </Button>
      </Box>
    </Box>
    {/* Render the Download Dialog */}
    {isDownloadDialogOpen && <DownloadDialog />}
    </>
  );
}

export default Summarize;
