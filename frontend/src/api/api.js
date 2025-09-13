// src/api/api.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return res.data;
};

export const getAllResumes = async () => {
  const res = await axios.get(`${API_BASE}/resumes`);
  return res.data;
};

export const getResumeDetails = async (id) => {
  const res = await axios.get(`${API_BASE}/resume/${id}`);
  return res.data;
};

export const downloadResume = async (id) => {
  const res = await axios.get(`${API_BASE}/download/${id}`, { responseType: "blob" });
  return res.data;
};


export async function clearResumes() {
  const res = await fetch(`${API_URL}/api/resumes/clear`, {
    method: "DELETE",
  });
  return res.json();
}

