import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import ResumeForm from "./components/ResumeForm";
import ExperienceSummary from "./components/ExperienceSummary";
import ProjectsSummary from "./components/ProjectsSummary";
import Summarize from "./components/Summarize";
import BuildMyResume from "./components/BuildMyResume";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Header */}
        <header className="App-header">
          <h1>Associate Data Center</h1>
        </header>

        {/* Main Content */}
        <Routes>
          {/* Main Page */}
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
                      <Link to="/resume-form">
                        <button>Update My Resume</button>
                      </Link>
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
                </div>
              </div>
            }
          />

          {/* Resume Form Page */}
          <Route path="/resume-form" element={<ResumeForm />} />

          {/* Nested Routes for Build My Resume */}
          <Route path="/build-my-resume" element={<BuildMyResume />}>
            <Route path="projects-summary" element={<ProjectsSummary />} />
            <Route path="experience-summary" element={<ExperienceSummary />} />
          </Route>

          {/* Summarize Page */}
          <Route path="/summarize" element={<Summarize />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;