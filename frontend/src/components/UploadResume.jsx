// src/components/UploadResume.jsx
import React, { useState } from "react";
import { uploadResume } from "../api/api.js";

export default function UploadResume({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF or DOCX file first.");
    setLoading(true);
    try {
      const data = await uploadResume(file);
      setResult(data);
      setFile(null);
      if (onUpload) onUpload();
    } catch (err) {
      console.error(err);
      alert("Upload failed — check backend logs and CORS.");
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    return (
      <div style={styles.resultCard}>
        <h3 style={{ marginTop: 0 }}>Analysis Result</h3>
        <div style={styles.row}><b>Name:</b> {result.name || "-"}</div>
        <div style={styles.row}><b>Email:</b> {result.email || "-"}</div>
        <div style={styles.row}><b>Phone:</b> {result.phone || "-"}</div>
        <div style={styles.row}><b>Core skills:</b> {result.core_skills || "-"}</div>
        <div style={styles.row}><b>Resume rating:</b> {result.resume_rating ?? "-"}</div>
        <div style={styles.row}><b>Improvements:</b> <div style={styles.blurb}>{result.improvement_areas || "-"}</div></div>
        <div style={styles.row}><b>Upskill suggestions:</b> <div style={styles.blurb}>{result.upskill_suggestions || "-"}</div></div>
      </div>
    );
  };

  return (
    <div>
      <h2>Upload & Analyze Resume</h2>
      <div style={styles.uploadRow}>
        <input type="file" accept=".pdf,.docx" onChange={handleFile} />
        <button onClick={handleUpload} disabled={loading} style={styles.button}>
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </div>

      

      <div style={{ marginTop: 18 }}>{renderResult()}</div>
    </div>
  );
}

const styles = {
  uploadRow: { display: "flex", gap: 12, alignItems: "center", marginTop: 10 },
  button: { padding: "8px 12px", cursor: "pointer" },
  resultCard: { border: "1px solid #ddd", padding: 14, marginTop: 12, borderRadius: 6, background: "#fff" },
  row: { marginBottom: 8 },
  blurb: { background: "#f9f9f9", padding: 8, borderRadius: 4, marginTop: 6 }
};
