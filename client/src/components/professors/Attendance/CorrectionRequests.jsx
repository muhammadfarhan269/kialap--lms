import React, { useState } from 'react';
import axios from 'axios';

const correctionRequestsStyles = `
.correction-requests {
  padding: 20px 0;
}

.corrections-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.corrections-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 10px 20px;
  background-color: white;
  border: 2px solid #bdc3c7;
  border-radius: 5px;
  color: #7f8c8d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.filter-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
  font-size: 16px;
}

.corrections-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.correction-card {
  padding: 20px;
  background-color: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.correction-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.correction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.student-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 16px;
}

.student-info .email {
  margin: 0;
  color: #7f8c8d;
  font-size: 13px;
}

.date-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-info .date {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status-badge.status-pending {
  background-color: #f39c12;
}

.status-badge.status-approved {
  background-color: #27ae60;
}

.status-badge.status-rejected {
  background-color: #e74c3c;
}

.correction-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.detail-row .label {
  font-weight: 600;
  color: #2c3e50;
}

.detail-row .value {
  color: #7f8c8d;
}

.correction-reason {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.correction-reason p {
  margin: 0 0 8px 0;
  font-size: 13px;
}

.correction-reason strong {
  color: #2c3e50;
}

.reason-text {
  color: #555 !important;
  line-height: 1.6;
}

.rejection-note {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #fadbd8;
  border-left: 4px solid #c0392b;
  border-radius: 5px;
}

.rejection-note p {
  margin: 0 0 8px 0;
  font-size: 13px;
}

.rejection-note strong {
  color: #c0392b;
}

.correction-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.btn-success {
  background-color: #27ae60;
  color: white;
}

.btn.btn-success:hover {
  background-color: #229954;
}

.btn.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn.btn-danger:hover {
  background-color: #c0392b;
}

.btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.rejection-form {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  margin-top: 10px;
}

.rejection-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  margin-bottom: 10px;
  resize: vertical;
  min-height: 80px;
}

.rejection-form textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn.btn-secondary:hover {
  background-color: #7f8c8d;
}

@media (max-width: 768px) {
  .correction-header {
    flex-direction: column;
    gap: 10px;
  }

  .date-info {
    text-align: left;
  }

  .correction-actions,
  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
`;

const CorrectionRequests = ({ corrections, courseId, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [expandedId, setExpandedId] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [processing, setProcessing] = useState(null);

  const filteredCorrections = corrections.filter((c) => c.status === filterStatus);

  const handleApprove = async (correctionId) => {
    try {
      setProcessing(correctionId);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(
        `http://localhost:5000/api/attendance/professor/approve-correction/${correctionId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Correction approved successfully');
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve correction');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (correctionId) => {
    try {
      setProcessing(correctionId);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(
        `http://localhost:5000/api/attendance/professor/reject-correction/${correctionId}`,
        { remarks: remarks[correctionId] || '' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Correction rejected');
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject correction');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="correction-requests">
      <style>{correctionRequestsStyles}</style>
      <div className="corrections-header">
        <h3>Attendance Correction Requests</h3>

        <div className="filter-tabs">
          {['Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredCorrections.length === 0 ? (
        <div className="no-data">
          <p>📭 No {filterStatus.toLowerCase()} correction requests</p>
        </div>
      ) : (
        <div className="corrections-list">
          {filteredCorrections.map((correction) => (
            <div key={correction.correction_id} className="correction-card">
              <div className="correction-header">
                <div className="student-info">
                  <h4>{correction.first_name} {correction.last_name}</h4>
                  <p className="email">{correction.student_email}</p>
                </div>
                <div className="date-info">
                  <span className="date">
                    {new Date(correction.correction_date).toLocaleDateString()}
                  </span>
                  <span className={`status-badge status-${correction.status.toLowerCase()}`}>
                    {correction.status}
                  </span>
                </div>
              </div>

              <div className="correction-details">
                <div className="detail-row">
                  <span className="label">Current Status:</span>
                  <span className="value" style={{ color: '#f44336' }}>
                    {correction.current_status || 'Not Recorded'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Requested Status:</span>
                  <span className="value" style={{ color: '#4caf50' }}>
                    {correction.requested_status}
                  </span>
                </div>
              </div>

              <div className="correction-reason">
                <p>
                  <strong>Reason:</strong>
                </p>
                <p className="reason-text">{correction.reason}</p>
              </div>

              {correction.status === 'Pending' && (
                <div className="correction-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(correction.correction_id)}
                    disabled={processing === correction.correction_id}
                  >
                    {processing === correction.correction_id ? '⏳ Processing...' : '✓ Approve'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => setExpandedId(
                      expandedId === correction.correction_id ? null : correction.correction_id
                    )}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}

              {correction.status === 'Rejected' && correction.rejection_remarks && (
                <div className="rejection-note">
                  <p>
                    <strong>Rejection Remarks:</strong>
                  </p>
                  <p>{correction.rejection_remarks}</p>
                </div>
              )}

              {expandedId === correction.correction_id && correction.status === 'Pending' && (
                <div className="rejection-form">
                  <textarea
                    placeholder="Add remarks (optional)..."
                    value={remarks[correction.correction_id] || ''}
                    onChange={(e) =>
                      setRemarks({
                        ...remarks,
                        [correction.correction_id]: e.target.value,
                      })
                    }
                    maxLength="300"
                  />
                  <div className="form-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setExpandedId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(correction.correction_id)}
                      disabled={processing === correction.correction_id}
                    >
                      {processing === correction.correction_id ? '⏳ Processing...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorrectionRequests;
