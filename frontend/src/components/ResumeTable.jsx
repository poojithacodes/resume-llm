// src/components/ResumeTable.jsx
import React, { useEffect, useState } from "react";
import {
  getAllResumes,
  getResumeDetails,
  downloadResume,
  clearResumes,

} from "../api/api.js";

import ResumeDetailsModal from "./ResumeDetailsModal.jsx";

export default function ResumeTable() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllResumes();
      setRows(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDetails = async (id) => {
    try {
      const details = await getResumeDetails(id);
      setSelected(details);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch details.");
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const blob = await downloadResume(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert("Download failed.");
    }
  };

  

  const handleClearAll = async () => {
    if (!window.confirm("⚠️ This will remove ALL resumes. Continue?")) return;
    try {
      await clearResumes();
      setRows([]);
    } catch (e) {
      console.error(e);
      alert("Clear all failed.");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2>Past Uploaded Resumes</h2>
        {rows.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : rows.length === 0 ? (
        <p>No resumes uploaded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 8 }}>#</th>
              <th>Filename</th>
              <th>Name</th>
              <th>Email</th>
              <th>Skills</th>
              <th>Rating</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>{idx + 1}</td>
                <td style={{ padding: 8 }}>{r.filename}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.core_skills}</td>
                <td>{r.resume_rating ?? "-"}</td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() => openDetails(r.id)}
                    style={{ marginRight: 6 }}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleDownload(r.id, r.filename)}
                    style={{ marginRight: 6 }}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <ResumeDetailsModal
          resume={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
