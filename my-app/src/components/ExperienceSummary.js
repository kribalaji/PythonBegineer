import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box, TextField, FormGroup, FormControlLabel, Checkbox, CircularProgress, InputAdornment, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

function ExperienceSummary() {
  const navigate = useNavigate();

  // Arrays for dynamic content generation
  const professionalTraits = [
    "detail-oriented", "analytical", "innovative", "collaborative", "strategic", 
    "results-driven", "adaptable", "resourceful", "methodical", "proactive"
  ];

  const experiencePhrases = [
    "with {years}+ years of hands-on experience",
    "bringing {years}+ years of professional experience",
    "with over {years} years of industry experience",
    "leveraging {years}+ years of technical expertise"
  ];

  const cloudPhrases = [
    "Experienced with {platforms} for cloud-based solutions.",
    "Proficient in implementing solutions using {platforms}.",
    "Skilled in architecting and deploying on {platforms}.",
    "Well-versed in {platforms} infrastructure and services."
  ];

  const aiPhrases = [
    "Leverages {tools} to enhance development productivity and code quality.",
    "Utilizes {tools} for accelerated development workflows.",
    "Employs {tools} to streamline coding processes and improve efficiency.",
    "Skilled in using {tools} to optimize development practices."
  ];

  // Professional summary templates
  const summaryTemplates = [
    // --- Technical Roles ---
    "Experienced software engineer with expertise in building scalable applications using modern technologies. Skilled in problem-solving and delivering high-quality code with a focus on performance and user experience.",
    "Senior Software Engineer with a proven track record of designing and implementing complex software solutions. Adept at leading technical discussions and mentoring junior engineers to foster growth and innovation.",
    "Results-driven developer with a strong background in cloud technologies and microservices architecture. Passionate about creating efficient solutions that solve real-world problems.",
    "Full-stack developer with experience in both frontend and backend technologies. Committed to writing clean, maintainable code and implementing best practices in software development.",
    "DevOps engineer focused on automating deployment pipelines and improving system reliability. Experienced in containerization, CI/CD, and infrastructure as code.",
    "Data scientist with expertise in machine learning algorithms and data analysis. Skilled in transforming complex data into actionable insights that drive business decisions.",
    "Cloud architect specializing in designing and implementing secure, scalable solutions on major cloud platforms. Experienced in optimizing cloud resources for performance and cost-efficiency.",
    // --- Management & Leadership Roles ---
    "Dynamic Team Lead with a talent for motivating engineering teams to achieve peak performance and deliver high-quality projects on schedule. Strong technical background combined with excellent communication and mentorship skills.",
    "Accomplished Technical Manager with extensive experience in overseeing software development lifecycles, managing cross-functional teams, and aligning technology strategy with business goals. Proven ability to drive innovation and efficiency.",
    "Strategic Team Manager focused on fostering a collaborative and inclusive environment, developing talent, and driving innovation within technical teams to exceed organizational objectives and deliver impactful results.",
    "Proactive Account Manager skilled in building and maintaining strong client relationships, understanding customer needs, and ensuring successful project delivery and satisfaction. Adept at identifying new business opportunities.",
    "Seasoned Program Manager with a strong ability to orchestrate complex, multi-faceted projects from inception to completion, ensuring alignment with strategic business objectives, budget adherence, and stakeholder expectations.",
    "Detail-oriented Program Director adept at overseeing a portfolio of programs, managing budgets, mitigating risks, and leading diverse teams to achieve strategic initiatives and deliver impactful results across the organization.",
    "Versatile Associate Director with a history of successfully leading teams and complex projects, contributing to strategic planning, and driving operational excellence within the technology domain. Passionate about mentorship and continuous improvement.",
    "Visionary Senior Director with a comprehensive background in technology leadership, strategic planning, and organizational development. Proven ability to drive large-scale initiatives, foster innovation, and build high-performing global teams.",
    // --- Entry-Level / Fresher ---
    "Enthusiastic and highly motivated New Bee-Fresher eager to apply theoretical knowledge and develop practical skills in a challenging software development environment. Quick learner with a strong foundation in [mention 1-2 key skills/areas] and a passion for technology and innovation.",
    // --- Specialized Roles ---
    "Dedicated QA engineer with a keen eye for detail, proficient in manual and automated testing methodologies to ensure software quality, reliability, and user satisfaction. Experienced in developing test plans and executing test cases.",
    "Cybersecurity analyst with a strong understanding of threat landscapes, vulnerability assessment, and security protocols. Committed to protecting organizational assets and data integrity through proactive monitoring and incident response.",
    "Mobile application developer skilled in creating intuitive and high-performance apps for iOS and Android platforms, leveraging native and cross-platform frameworks to deliver engaging user experiences.",
    "Solutions Architect with a knack for translating complex business requirements into robust and scalable technical solutions. Experienced in system design, integration, and stakeholder management.",
    // --- Testing Engineering ---
    "Detail-oriented Test Engineer with expertise in designing and implementing comprehensive test strategies for complex software systems. Skilled in both manual and automated testing approaches to ensure product quality and reliability.",
    "Methodical QA Automation Engineer specializing in building robust test frameworks and CI/CD integration. Experienced in performance testing, regression testing, and developing maintainable test suites that improve product quality and release velocity.",
    "Results-driven Test Lead with a strong background in quality assurance methodologies and test management. Adept at coordinating testing efforts across teams and ensuring thorough coverage of functional and non-functional requirements.",
    // --- Data Engineering ---
    "Skilled Data Engineer with expertise in designing and implementing data pipelines, warehouses, and lakes. Proficient in optimizing data flows and storage solutions to support analytics and machine learning initiatives.",
    "Experienced Data Engineer focused on building scalable data infrastructure and processing systems. Adept at working with large datasets and implementing efficient ETL processes to transform raw data into valuable business insights.",
    "Technical Data Engineer with a strong foundation in database technologies, distributed computing, and data modeling. Passionate about creating robust data architectures that enable organizations to leverage their data assets effectively.",
    // --- ETL Development ---
    "ETL Developer with extensive experience in designing, developing, and optimizing data integration solutions. Skilled in extracting data from diverse sources, applying complex transformations, and loading into target systems for analytics and reporting.",
    "Data Integration Specialist focused on building reliable and efficient ETL pipelines. Experienced in handling large-scale data processing, ensuring data quality, and implementing best practices for maintainable ETL workflows.",
    "ETL Solutions Developer with expertise in data warehousing concepts and ETL tool implementation. Adept at translating business requirements into technical specifications and delivering scalable data integration solutions.",
    // --- Production Support ---
    "Dedicated Production Support Engineer with a strong focus on system reliability and incident management. Experienced in troubleshooting complex issues, implementing preventive measures, and ensuring high availability of critical applications.",
    "Responsive Production Support Specialist skilled in monitoring system health, diagnosing performance bottlenecks, and resolving production issues with minimal business impact. Committed to maintaining service level agreements and continuous improvement.",
    "Technical Production Support Analyst with expertise in application support, problem resolution, and system optimization. Adept at collaborating with development teams to implement sustainable solutions and enhance system stability."
  ];

  // State to store form data
  const [formData, setFormData] = useState({
    professionalSummary: "",
    yearsOfExperience: "",
    monthsOfExperience: "",
    cloudPlatforms: [], // Array to store selected cloud platforms
    codeAIExperience: [], // Array to store selected Code AI Assistant experience
  });
  
  // State for generating custom summary and tracking selected template
  const [isGenerating, setIsGenerating] = useState(false);
  // State for the project guidance dialog
  const [isGuidanceDialogOpen, setIsGuidanceDialogOpen] = useState(false);
  const [guidanceMessage, setGuidanceMessage] = useState("");

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

  // Generate a custom summary based on user inputs
  const generateCustomSummary = () => {
    if (!formData.yearsOfExperience) {
      alert("Please enter your years of experience first");
      return;
    }
    
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        // Get selected cloud platforms and AI tools
        const cloudExp = formData.cloudPlatforms.filter(p => p !== "Not Applicable-Cloud");
        const aiExp = formData.codeAIExperience.filter(a => a !== "Not Applicable-AI");
        
        // Use the current summary or pick a default if empty
        let customizedSummary = formData.professionalSummary;
        
        // If still no summary, pick one based on experience
        if (!customizedSummary) {
          // Find the most appropriate template based on selections
          let bestTemplateIndex = 0;
          
          if (cloudExp.some(p => p.includes("AWS") || p.includes("Azure") || p.includes("GCP"))) {
            bestTemplateIndex = 2;
            if (cloudExp.length > 1) bestTemplateIndex = 6;
          }
          
          if (aiExp.length > 0 && aiExp.length > 1) {
            bestTemplateIndex = 5;
          }
          
          customizedSummary = summaryTemplates[bestTemplateIndex];
        }
        
        // Select random professional trait
        const randomTrait = professionalTraits[Math.floor(Math.random() * professionalTraits.length)];
        
        // Select random experience phrase and replace {years}
        let randomExpPhrase = experiencePhrases[Math.floor(Math.random() * experiencePhrases.length)];
        randomExpPhrase = randomExpPhrase.replace("{years}", formData.yearsOfExperience);
        
        // Replace years of experience with more dynamic phrasing
        if (customizedSummary.match(/(\d+\+?)\s+years? of experience/i)) {
          customizedSummary = customizedSummary.replace(
            /(\d+\+?)\s+years? of experience/i, 
            randomExpPhrase
          );
        } else {
          // If no years phrase was found, add it at a strategic position
          const sentences = customizedSummary.split('. ');
          if (sentences.length > 1) {
            sentences[0] = `${sentences[0]}. ${randomTrait.charAt(0).toUpperCase() + randomTrait.slice(1)} professional ${randomExpPhrase}`;
            customizedSummary = sentences.join('. ');
          } else {
            customizedSummary = `${randomTrait.charAt(0).toUpperCase() + randomTrait.slice(1)} professional ${randomExpPhrase}. ${customizedSummary}`;
          }
        }
        
        // Add cloud platform experience with varied phrasing
        if (cloudExp.length > 0 && !customizedSummary.toLowerCase().includes("cloud")) {
          const cloudPlatforms = cloudExp.join(", ").replace(/-/g, " ");
          const randomCloudPhrase = cloudPhrases[Math.floor(Math.random() * cloudPhrases.length)]
            .replace("{platforms}", cloudPlatforms);
          
          customizedSummary = customizedSummary.replace(/\.\s*$/, `. ${randomCloudPhrase}`);
        }
        
        // Add AI tools with varied phrasing
        if (aiExp.length > 0 && !customizedSummary.toLowerCase().includes("ai")) {
          const aiTools = aiExp.join(", ").replace(/-/g, " ");
          const randomAiPhrase = aiPhrases[Math.floor(Math.random() * aiPhrases.length)]
            .replace("{tools}", aiTools);
          
          customizedSummary = customizedSummary.replace(/\.\s*$/, `. ${randomAiPhrase}`);
        }
        
        // Ensure the summary doesn't end with multiple periods
        customizedSummary = customizedSummary.replace(/\.+$/, '.');
        
        setFormData({
          ...formData,
          professionalSummary: customizedSummary
        });
        
      } catch (error) {
        console.error("Error generating custom summary:", error);
        alert("Failed to generate a custom summary. Please try again or select a template.");
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
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

  // Determine the project guidance message based on years of experience
  const getProjectGuidanceMessage = (years) => {
    const yearsInt = parseInt(years, 10);

    if (isNaN(yearsInt) || yearsInt < 0) {
      return "Please enter a valid number of years of experience.";
    }

    if (yearsInt >= 0 && yearsInt <= 3) {
      return `Based on your ${yearsInt} years of experience, we recommend including at least 1 project. If you're a New Bee/Fresher, consider showcasing a training project.`;
    } else if (yearsInt > 3 && yearsInt <= 5) {
      return `With ${yearsInt} years of experience, aiming for 2 to 3 projects will effectively highlight your skills and accomplishments.`;
    } else if (yearsInt > 5 && yearsInt <= 10) {
      return `Leveraging ${yearsInt} years of experience, we suggest including at least 4 to 5 projects to demonstrate the breadth and depth of your expertise.`;
    } else if (yearsInt > 10) {
      return `With over ${yearsInt} years of extensive experience, showcasing at least 5 significant projects will best represent your career achievements.`;
    }
    return "Please enter your years of experience to get project guidance."; // Fallback
  };

  // Handle navigation to the next page
  const handleNext = () => {
    if (isFormValid()) {
      const message = getProjectGuidanceMessage(formData.yearsOfExperience);
      setGuidanceMessage(message);
      setIsGuidanceDialogOpen(true);
    } else {
      // Form is not valid, isFormValid() check on button handles this visually,
      // but you might want an alert here too if needed.
      alert("Please fill in all required fields.");
    }
  };

  // Handle continuing from the guidance dialog to the next page
  const handleContinueToProjects = () => {
    setIsGuidanceDialogOpen(false); // Close the dialog
    navigate("../projects-summary", {
      state: {
        overallExperienceYears: formData.yearsOfExperience
      }
    });
    console.log("Form Data:", formData);
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
    <>
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
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ alignItems: 'flex-start', height: '100%', pt: 1 }}>
              <Tooltip title="Generate Summary Suggestion">
                <IconButton
                  onClick={generateCustomSummary}
                  disabled={isGenerating || !formData.yearsOfExperience}
                  edge="end"
                  size="small"
                  sx={{ mb: 'auto' }} // Aligns icon to the top of the adornment space
                >
                  {isGenerating ? <CircularProgress size={24} /> : <AutoAwesomeIcon color="primary" />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />


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

    {/* Project Guidance Dialog */}
    <Dialog
      open={isGuidanceDialogOpen}
      onClose={() => setIsGuidanceDialogOpen(false)} // Allow closing by clicking outside or pressing Escape
      aria-labelledby="project-guidance-dialog-title"
      aria-describedby="project-guidance-dialog-description"
    >
      <DialogTitle id="project-guidance-dialog-title" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Project Guidance
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="project-guidance-dialog-description">
          {guidanceMessage}
        </DialogContentText>
        <DialogContentText sx={{ mt: 2, fontStyle: 'italic', fontSize: '0.9rem', color: 'text.secondary' }}>
          This is a recommendation to help you build a comprehensive profile. You can add more or fewer projects as needed.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsGuidanceDialogOpen(false)} color="primary">Back to Edit</Button>
        <Button onClick={handleContinueToProjects} color="primary" variant="contained" autoFocus>Continue to Projects</Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

export default ExperienceSummary;