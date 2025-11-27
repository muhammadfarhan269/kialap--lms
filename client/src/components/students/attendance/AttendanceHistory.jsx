import React, { useState } from 'react';
import axios from 'axios';
import { getStatusColor, getStatusLabel } from '../../../utils/attendanceUtils';
import RequestCorrectionModal from './RequestCorrectionModal';

const attendanceHistoryStyles = `
// Attendance History Styles
.attendance-history {
  padding: 20px 0;
}

.history-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.history-controls .search-box {
  flex: 1;
  min-width: 250px;
}

.history-controls .search-box input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.history-controls .search-box input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.history-controls .filter-controls {
  display: flex;
  gap: 10px;
}

.history-controls .filter-controls select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.history-controls .filter-controls select:focus {
  outline: none;
  border-color: #3498db;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
  font-size: 16px;
}

.history-table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.history-table thead {
  background-color: #34495e;
  color: white;
}

.history-table thead th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
}

.history-table tbody tr {
  border-bottom: 1px solid #ecf0f1;
  transition: all 0.3s ease;
}

.history-table tbody tr:hover {
  background-color: #f8f9fa;
}

.history-table tbody tr.status-absent td {
  color: #c0392b;
}

.history-table tbody tr.status-present td {
  color: #27ae60;
}

.history-table td {
  padding: 15px;
  font-size: 14px;
}

.history-table td.date-cell {
  font-weight: 600;
  color: #2c3e50;
}

.history-table td.status-cell .status-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.history-table td.time-cell {
  font-family: monospace;
}

.history-table td.notes-cell {
  color: #7f8c8d;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-table td.actions-cell .btn-action {
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.history-table td.actions-cell .btn-action:hover {
  background-color: #2980b9;
}

.history-table td.actions-cell .btn-action.btn-request {
  background-color: #e74c3c;
}

.history-table td.actions-cell .btn-action.btn-request:hover {
  background-color: #c0392b;
}

@media (max-width: 768px) {
  .history-controls {
    flex-direction: column;
  }

  .history-controls .search-box {
    min-width: 100%;
  }

  .history-controls .filter-controls {
    width: 100%;
    flex-direction: column;
  }

  .history-table-wrapper {
    font-size: 12px;
  }

  .history-table thead th {
    padding: 10px;
    font-size: 11px;
  }

  .history-table tbody td {
    padding: 10px;
    font-size: 12px;
  }
}
`;

const AttendanceHistory = ({ attendance, onRefresh, courseId }) => {
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sort and filter attendance
  const filteredAttendance = attendance
    .filter((record) => filterStatus === 'All' || record.status === filterStatus)
    .filter((record) => {
      const dateStr = new Date(record.attendance_date).toLocaleDateString();
      return dateStr.includes(searchTerm);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.attendance_date) - new Date(a.attendance_date);
        case 'date-asc':
          return new Date(a.attendance_date) - new Date(b.attendance_date);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const handleRequestCorrection = (record) => {
    setSelectedRecord(record);
    setShowCorrectionModal(true);
  };

  const handleCorrectionSubmit = async (correctionData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/attendance/student/request-correction', correctionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Correction request submitted successfully');
      setShowCorrectionModal(false);
      setSelectedRecord(null);
      onRefresh();
    } catch (error) {
      console.error('Error submitting correction:', error);
      alert(error.response?.data?.message || 'Failed to submit correction request');
    }
  };

  return (
    <div className="attendance-history">
      <style>{attendanceHistoryStyles}</style>
      <div className="history-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
            <option value="Excused">Excused</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {filteredAttendance.length === 0 ? (
        <div className="no-data">
          <p>📭 No attendance records found</p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Time</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => (
                <tr key={record.attendance_id} className={`status-${record.status.toLowerCase()}`}>
                  <td className="date-cell">
                    {new Date(record.attendance_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="status-cell">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(record.status) }}
                    >
                      {getStatusLabel(record.status)}
                    </span>
                  </td>
                  <td className="time-cell">
                    {record.attendance_date
                      ? new Date(record.attendance_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="notes-cell">{record.note || '-'}</td>
                  <td className="actions-cell">
                    {record.status === 'Absent' && (
                      <button
                        className="btn-action btn-request"
                        onClick={() => handleRequestCorrection(record)}
                        title="Request correction for this record"
                      >
                        📝 Request Correction
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCorrectionModal && selectedRecord && (
        <RequestCorrectionModal
          record={selectedRecord}
          courseId={courseId}
          onSubmit={handleCorrectionSubmit}
          onClose={() => setShowCorrectionModal(false)}
        />
      )}
    </div>
  );
};

export default AttendanceHistory;
