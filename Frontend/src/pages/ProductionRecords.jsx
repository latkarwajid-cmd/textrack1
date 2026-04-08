import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductionRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const downloadExcel = async () => {

  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:5000/production/export-excel",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
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

};


  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/production/records', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRecords(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch records');
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) return <div>Loading records...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Production Records</h2>
      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Beam Receive Date</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Picks</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Party Name</th>
             <th style={{ border: '1px solid #ddd', padding: '8px' }}>Sizing Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total Ends</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reed Count</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reed Space</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Warp CT</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Weft CT</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Weave Finish</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Flange No</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actual Beam</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Beam Start Date</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Loom No</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Beam Fall</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Beam Status</th>
           
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.beam_receive_date ? new Date(record.beam_receive_date).toLocaleDateString() : ''}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.picks}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.party_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.sizing_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.total_ends}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.reed_count}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.reed_space}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.warp_ct}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.weft_ct}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.weave_finish}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.flange_no}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.actual_beam}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.beam_start_date ? new Date(record.beam_start_date).toLocaleDateString() : ''}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.loom_no}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.beam_fall}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.beam_status}</td>
          
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={downloadExcel}>
  Download Excel
</button>
    </div>
  );
};

export default ProductionRecords;