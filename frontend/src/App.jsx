// src/App.jsx
import React, { useState } from "react";
import UploadResume from "./components/UploadResume.jsx";
import ResumeTable from "./components/ResumeTable.jsx";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("upload");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const onUpload = () => {
    setRefreshFlag((p) => p + 1);
    setTab("history");
  };

  return (
    <div className="app-container">
      <h1>Resume Analyzer</h1>

      <div className="tab-buttons">
        <button
          className={tab === "upload" ? "primary" : "secondary"}
          onClick={() => setTab("upload")}
        >
          Upload Resume
        </button>
        <button
          className={tab === "history" ? "primary" : "secondary"}
          onClick={() => setTab("history")}
        >
          Past Resumes
        </button>
      </div>

      <div className="content-box">
        {tab === "upload" && <UploadResume onUpload={onUpload} />}
        {tab === "history" && <ResumeTable key={refreshFlag} />}
      </div>
    </div>
  );
}
