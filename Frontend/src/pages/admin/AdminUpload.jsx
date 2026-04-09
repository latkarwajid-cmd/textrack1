import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";

function AdminUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://textrack1-2.onrender.com/production/upload-excel",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ File uploaded successfully");
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server error during upload");
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-title">Admin Panel</div>
        <AdminNavbar />
      </aside>

      <main className="admin-main">
        <h2>Upload Excel / PDF File</h2>

        <div className="admin-card">
          <input
            type="file"
            accept=".xlsx,.pdf"
            onChange={handleFileChange}
          />

          <br /><br />

          <button onClick={handleUpload}>
            Upload File
          </button>

          <p>{message}</p>
        </div>
      </main>
    </div>
  );
}

export default AdminUpload;