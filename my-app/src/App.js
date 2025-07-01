import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";
import ResumeForm from "./components/ResumeForm";
import ExperienceSummary from "./components/ExperienceSummary";
import ProjectsSummary from "./components/ProjectsSummary";
import Summarize from "./components/Summarize";
import BuildMyResume from "./components/BuildMyResume";
import UpdateResumeDialog from "./components/UpdateResumeDialog";
import AppInfoCard from "./components/AppInfoCard";

function App() {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const navigate = useNavigate();

  const handleResumeLoaded = (resumeData, mobile) => {
    setShowUpdateDialog(false);
    navigate("/experience-summary", {
      state: {
        resumeData, // latest resumeData
        mobileNumber: mobile,
        showExperiencePopup: true
      }
    });
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <h1>Associate Data Center</h1>
      </header>

      {/* Main Content */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="App-container">
              {/* Sidebar */}
              <div className="App-sidebar">
                <h2>User Menu</h2>
                <ul>
                  <li>
                    <Link to="/resume-form">
                      <button>Build My Resume</button>
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => setShowUpdateDialog(true)}>
                      Update My Resume
                    </button>
                  </li>
                  <li>
                    <button onClick={() => alert("Explore IT Maps clicked!")}>
                      Explore IT Maps
                    </button>
                  </li>
                  <li>
                    <button onClick={() => alert("Tech Skills Reports clicked!")}>
                      Tech Skills Reports
                    </button>
                  </li>
                </ul>
              </div>

              {/* Welcome Message */}
              <div className="App-main">
                <p>Welcome! Please select an option from the sidebar to get started.</p>
                <AppInfoCard />
              </div>
              {/* Render the UpdateResumeDialog here */}
              <UpdateResumeDialog
                open={showUpdateDialog}
                onClose={() => setShowUpdateDialog(false)}
                onResumeLoaded={handleResumeLoaded}
              />
            </div>
          }
        />
        <Route path="/resume-form" element={<ResumeForm />} />
        <Route path="/experience-summary" element={<ExperienceSummary />} />
        <Route path="/projects-summary" element={<ProjectsSummary />} />
        <Route path="/build-my-resume" element={<BuildMyResume />}>
          <Route path="projects-summary" element={<ProjectsSummary />} />
          <Route path="experience-summary" element={<ExperienceSummary />} />
        </Route>
        <Route path="/summarize" element={<Summarize />} />
      </Routes>
    </div>
  );
}

export default App;