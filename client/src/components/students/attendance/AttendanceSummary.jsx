import React from 'react';
import { getAttendanceStatus, getAttendanceMetrics } from '../../../utils/attendanceUtils';
import { generateAttendancePDF, downloadPDF } from '../../../services/pdfExportService';

const attendanceSummaryStyles = `
.attendance-summary {
  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h3 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-export {
      padding: 10px 16px;
      background-color: #27ae60;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        background-color: #229954;
      }
    }
  }

  .status-card {
    display: flex;
    align-items: center;
    gap: 30px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 10px;
    border-left: 5px solid;
    margin-bottom: 30px;

    .status-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: bold;
      color: white;
    }

    .status-info {
      flex: 1;

      h2 {
        margin: 0 0 10px 0;
        font-size: 48px;
      }

      .status-label {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .metric-card {
      padding: 20px;
      background-color: #ecf0f1;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      &.present {
        border-left: 4px solid #27ae60;
      }

      &.absent {
        border-left: 4px solid #e74c3c;
      }

      &.late {
        border-left: 4px solid #f39c12;
      }

      &.excused {
        border-left: 4px solid #3498db;
      }

      .metric-label {
        font-size: 12px;
        color: #7f8c8d;
        margin-bottom: 10px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .metric-value {
        font-size: 32px;
        font-weight: bold;
        color: #2c3e50;
      }
    }
  }
}

.status-success {
  color: #27ae60;
}

.status-info {
  color: #3498db;
}

.status-warning {
  color: #f39c12;
}

.status-danger {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .attendance-summary .status-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .attendance-summary .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
  }

  .attendance-summary .metrics-grid .metric-card {
    padding: 15px;
  }
}
`;

const AttendanceSummary = ({ statistics, attendance }) => {
  const metrics = getAttendanceMetrics(attendance);
  const statusInfo = getAttendanceStatus(metrics.percentage);

  const handleExportPDF = async () => {
    try {
      // Get user and course info (you'd need to pass these as props or fetch them)
      const studentData = {
        firstName: localStorage.getItem('firstName') || 'Student',
        lastName: localStorage.getItem('lastName') || '',
        studentId: localStorage.getItem('userId'),
        email: localStorage.getItem('userEmail'),
        courseName: 'Course Name', // Would be passed from parent
        courseCode: 'COURSE-CODE',
      };

      const blob = generateAttendancePDF(studentData, attendance, metrics);
      downloadPDF(blob, `Attendance_Certificate_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="attendance-summary">
      <style>{attendanceSummaryStyles}</style>
      <div className="summary-header">
        <h3>Attendance Overview</h3>
        <button className="btn-export" onClick={handleExportPDF}>
          📥 Export Certificate
        </button>
      </div>

      <div className="status-card" style={{ borderColor: statusInfo.bgColor }}>
        <div className="status-icon" style={{ backgroundColor: statusInfo.bgColor }}>
          {metrics.percentage >= 75 ? '✓' : '⚠'}
        </div>
        <div className="status-info">
          <h2>{metrics.percentage}%</h2>
          <p className={`status-label status-${statusInfo.color}`}>{statusInfo.status}</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Sessions</div>
          <div className="metric-value">{metrics.totalSessions}</div>
        </div>

        <div className="metric-card present">
          <div className="metric-label">Present</div>
          <div className="metric-value">{metrics.presentCount}</div>
        </div>

        <div className="metric-card absent">
          <div className="metric-label">Absent</div>
          <div className="metric-value">{metrics.absentCount}</div>
        </div>

        <div className="metric-card late">
          <div className="metric-label">Late</div>
          <div className="metric-value">{metrics.lateCount}</div>
        </div>

        <div className="metric-card excused">
          <div className="metric-label">Excused</div>
          <div className="metric-value">{metrics.excusedCount}</div>
        </div>
      </div>

      {metrics.percentage < 75 && (
        <div className="alert alert-warning">
          ⚠️ Your attendance is below 75%. Please contact your instructor to improve your attendance.
        </div>
      )}

      {metrics.percentage < 60 && (
        <div className="alert alert-danger">
          🚨 Your attendance is critical. You may be at risk of failing this course.
        </div>
      )}
    </div>
  );
};

export default AttendanceSummary;
