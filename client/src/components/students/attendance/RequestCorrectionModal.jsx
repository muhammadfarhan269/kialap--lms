import React, { useState } from 'react';

const requestCorrectionModalStyles = `
// Request Correction Modal Styles
.correction-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.correction-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #95a5a6;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-close:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 25px;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.record-info .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-info label {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.record-info span {
  color: #7f8c8d;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  font-size: 14px;
  font-family: inherit;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #95a5a6;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn.btn-secondary:hover {
  background-color: #7f8c8d;
}

.modal-footer {
  padding: 15px 25px;
  background-color: #f8f9fa;
  border-top: 1px solid #ecf0f1;
  border-radius: 0 0 8px 8px;
}

.modal-footer p {
  margin: 0;
  color: #7f8c8d;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .correction-modal-overlay {
    padding: 15px;
  }

  .correction-modal {
    max-width: 100%;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 15px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
`;

const RequestCorrectionModal = ({ record, courseId, onSubmit, onClose }) => {
  const [requestedStatus, setRequestedStatus] = useState('Present');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('Please provide a reason for the correction request');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        courseId,
        attendanceId: record.attendance_id,
        date: record.attendance_date,
        requestedStatus,
        reason,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="correction-modal-overlay" onClick={onClose}>
      <style>{requestCorrectionModalStyles}</style>
      <div className="correction-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Request Attendance Correction</h3>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="record-info">
            <div className="info-item">
              <label>Date:</label>
              <span>
                {new Date(record.attendance_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="info-item">
              <label>Current Status:</label>
              <span className="status-badge" style={{ color: '#f44336' }}>
                {record.status}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="requestedStatus">Requested Status:</label>
              <select
                id="requestedStatus"
                value={requestedStatus}
                onChange={(e) => setRequestedStatus(e.target.value)}
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Request:</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you request this correction..."
                rows="4"
                maxLength="500"
              />
              <div className="char-count">{reason.length}/500</div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <p>
            Your request will be reviewed by your instructor. You will receive a notification
            once it has been processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestCorrectionModal;
