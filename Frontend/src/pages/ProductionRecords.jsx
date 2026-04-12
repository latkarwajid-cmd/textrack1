import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Production.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://textrack1-2.onrender.com";

const ProductionRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const downloadExcel = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/production/export-excel`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "production.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Failed to download Excel");
    }
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/production/records`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecords(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to fetch records"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading)
    return <div className="status-message">Loading records...</div>;

  if (error)
    return <div className="status-message error">{error}</div>;

  return (
    <div className="records-container">
      <div className="records-header">
        <h2>Your Production Records</h2>

        <button className="download-btn" onClick={downloadExcel}>
          Download Excel 📥
        </button>
      </div>

      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th>Beam Receive</th>
                <th>Picks</th>
                <th>Party</th>
                <th>Sizing</th>
                <th>Total Ends</th>
                <th>Reed Count</th>
                <th>Reed Space</th>
                <th>Warp CT</th>
                <th>Weft CT</th>
                <th>Weave Finish</th>
                <th>Flange</th>
                <th>Actual Beam</th>
                <th>Start Date</th>
                <th>Loom No</th>
                <th>Beam Fall</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td>
                    {record.beam_receive_date
                      ? new Date(
                          record.beam_receive_date
                        ).toLocaleDateString()
                      : ""}
                  </td>
                  <td>{record.picks}</td>
                  <td>{record.party_name}</td>
                  <td>{record.sizing_name}</td>
                  <td>{record.total_ends}</td>
                  <td>{record.reed_count}</td>
                  <td>{record.reed_space}</td>
                  <td>{record.warp_ct}</td>
                  <td>{record.weft_ct}</td>
                  <td>{record.weave_finish}</td>
                  <td>{record.flange_no}</td>
                  <td>{record.actual_beam}</td>
                  <td>
                    {record.beam_start_date
                      ? new Date(
                          record.beam_start_date
                        ).toLocaleDateString()
                      : ""}
                  </td>
                  <td>{record.loom_no}</td>
                  <td>{record.beam_fall}</td>
                  <td>{record.beam_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductionRecords;