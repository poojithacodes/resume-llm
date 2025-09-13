// src/components/ResumeDetailsModal.jsx
import React from "react";

export default function ResumeDetailsModal({ resume, onClose }) {
  if (!resume) return null;

  // Show long text in paragraphs
  const renderParagraphs = (s) => (s ? s.split(/;\s*/).map((p, i) => <li key={i}>{p}</li>) : null);

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Resume Details</h3>
          <button onClick={onClose} style={modalStyles.closeBtn}>Close</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Filename:</strong> {resume.filename}<br/>
          <strong>Name:</strong> {resume.name || "-"}<br/>
          <strong>Email:</strong> {resume.email || "-"}<br/>
          <strong>Phone:</strong> {resume.phone || "-"}<br/>
          <strong>Core skills:</strong> {resume.core_skills || "-"}<br/>
          <strong>Resume rating:</strong> {resume.resume_rating ?? "-"}
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Improvement areas:</strong>
          <ul>{renderParagraphs(resume.improvement_areas)}</ul>
        </div>

        <div style={{ marginTop: 8 }}>
          <strong>Upskill suggestions:</strong>
          <ul>{renderParagraphs(resume.upskill_suggestions)}</ul>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Raw extracted text (truncated):</strong>
          <div style={{ maxHeight: 160, overflow: "auto", background: "#fafafa", padding: 8, borderRadius: 4 }}>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{(resume.raw_text || "").slice(0, 500)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { width: "720px", maxHeight: "85vh", overflowY: "auto", background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
  closeBtn: { background: "#eaeaea", border: "none", padding: "6px 10px", cursor: "pointer", borderRadius: 4 }
};
