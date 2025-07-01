import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

function ExperienceSummary() {
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize resumeData to avoid unnecessary effect triggers
  const resumeData = useMemo(
    () => location.state?.resumeData || {},
    [location.state?.resumeData]
  );
  const mobileNumber = location.state?.mobileNumber;
  const [showPopup, setShowPopup] = useState(location.state?.showExperiencePopup || false);

  // Experience fields (initialize from resumeData if present)
  const [yearsOfExperience, setYearsOfExperience] = useState(resumeData.yearsOfExperience || "");
  const [monthsOfExperience, setMonthsOfExperience] = useState(resumeData.monthsOfExperience || "");
  const [professionalSummary, setProfessionalSummary] = useState(resumeData.professionalSummary || "");
  const [cloudPlatforms, setCloudPlatforms] = useState(resumeData.cloudPlatforms || "");
  const [codeAIExperience, setCodeAIExperience] = useState(resumeData.codeAIExperience || "");

  // Defensive: redirect if resumeData or mobileNumber missing
  useEffect(() => {
    if (!location.state || !location.state.resumeData || !location.state.mobileNumber) {
      navigate("/");
    }
  }, [location, navigate]);

  // Reload form fields if resumeData changes (e.g., on navigation)
  useEffect(() => {
    setYearsOfExperience(resumeData.yearsOfExperience || "");
    setMonthsOfExperience(resumeData.monthsOfExperience || "");
    setProfessionalSummary(resumeData.professionalSummary || "");
    setCloudPlatforms(resumeData.cloudPlatforms || "");
    setCodeAIExperience(resumeData.codeAIExperience || "");
  }, [resumeData]);

  // Handle continue to projects
  const handleContinueToProjects = () => {
    const updatedResumeData = {
      ...resumeData,
      yearsOfExperience,
      monthsOfExperience,
      professionalSummary,
      cloudPlatforms,
      codeAIExperience
    };
    navigate("/projects-summary", {
      state: {
        resumeData: updatedResumeData,
        mobileNumber
      }
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Experience Summary
      </Typography>
      <form>
        <TextField
          label="Total Years of Experience"
          type="number"
          value={yearsOfExperience}
          onChange={e => setYearsOfExperience(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Total Months of Experience"
          type="number"
          value={monthsOfExperience}
          onChange={e => setMonthsOfExperience(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Professional Summary"
          value={professionalSummary}
          onChange={e => setProfessionalSummary(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <TextField
          label="Cloud Platforms"
          value={cloudPlatforms}
          onChange={e => setCloudPlatforms(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Code/AI Experience"
          value={codeAIExperience}
          onChange={e => setCodeAIExperience(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleContinueToProjects}
          >
            Continue to Project Summary
          </Button>
        </Box>
      </form>

      {/* Popup Dialog */}
      <Dialog open={showPopup} onClose={() => setShowPopup(false)}>
        <DialogTitle>Update Experience</DialogTitle>
        <DialogContent>
          <Typography>
            Any change in Total years of experience - please update
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPopup(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExperienceSummary;