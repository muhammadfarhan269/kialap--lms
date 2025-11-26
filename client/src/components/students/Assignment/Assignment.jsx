import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileAlt, FaDownload, FaUpload, FaTimes, FaClock } from 'react-icons/fa';

const Assignment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  
  const apiBase = 'http://localhost:5000';

  // Fetch student's enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.warn('No access token found in localStorage');
          throw new Error('Not authenticated');
        }
        const response = await fetch(`${apiBase}/api/enrollments/student`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch enrolled courses');
        
        const data = await response.json();
        const enrollments = data.data || [];
        console.debug('Fetched enrollments:', enrollments);
        // Only include active enrollments
        const courseIds = enrollments
          .filter(e => (e.status || '').toLowerCase() === 'active')
          .map(enrollment => enrollment.course_id || enrollment.courseId);
        setEnrolledCourseIds(courseIds);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        toast.error('Failed to fetch enrolled courses');
      }
    };

    if (user?.uuid) {
      fetchEnrolledCourses();
    }
  }, [user]);

  // Fetch all assignments from professors
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.warn('No access token found in localStorage');
          throw new Error('Not authenticated');
        }
        
        // Fetch assignments for each enrolled course
        const allAssignments = [];
        
        for (const courseId of enrolledCourseIds) {
          try {
            const response = await fetch(`${apiBase}/api/assignments/course/${courseId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              allAssignments.push(...(data.data || []));
            }
          } catch (err) {
            console.error(`Error fetching assignments for course ${courseId}:`, err);
          }
        }
        
        setAssignments(allAssignments);
        setError(null);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err.message || 'Failed to load assignments');
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    if (enrolledCourseIds.length > 0) {
      fetchAssignments();
    }
  }, [enrolledCourseIds]);

  const handleUploadClick = (assignment) => {
    if (assignment.status === 'Submitted' || assignment.studentSubmissionStatus === 'Submitted') {
      toast.info('You have already submitted this assignment');
      return;
    }
    setSelectedAssignment(assignment);
    setSubmissionFile(null);
    setShowUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, Word, etc.)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and Word files are allowed!');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB!');
        return;
      }
      
      setSubmissionFile(file);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionFile) {
      toast.error('Please select a file before submitting');
      return;
    }

    try {
      setSubmittingId(selectedAssignment.id);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('You must be logged in to submit assignments');
        return;
      }
      
      const formData = new FormData();
      formData.append('submissionFile', submissionFile);
      formData.append('submissionStatus', 'Submitted');

      // Use assignments submit endpoint which stores submission and returns result
      const response = await fetch(`${apiBase}/api/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to submit assignment');
      
      toast.success('Assignment submitted successfully!');
      setShowUploadModal(false);
      setSelectedAssignment(null);
      setSubmissionFile(null);

      // Update local assignment studentSubmissionStatus to 'Submitted' so UI reflects change immediately
      setAssignments(prev => prev.map(a => (a.id === selectedAssignment.id ? { ...a, studentSubmissionStatus: 'Submitted' } : a)));
      
    } catch (err) {
      console.error('Error submitting assignment:', err);
      toast.error(err.message || 'Failed to submit assignment');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDownload = (filePath) => {
    if (filePath) {
      window.open(`${apiBase}/assignments/${filePath}`, '_blank');
    } else {
      toast.info('No file available for download');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'Submitted':
        return <span className="badge bg-success">Submitted</span>;
      case 'Late':
        return <span className="badge bg-danger">Late</span>;
      case 'Graded':
        return <span className="badge bg-info">Graded</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="assignment-container">
      <div className="assignment-header d-flex align-items-center justify-content-between flex-wrap">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box bg-primary text-white d-flex align-items-center justify-content-center rounded" style={{ width:56, height:56 }}>
            <FaFileAlt />
          </div>
          <div>
            <h2 className="mb-0">My Assignments</h2>
            <p className="subtitle mb-0">Assignments assigned by your professors</p>
          </div>
        </div>
        <div className="ms-auto mt-2 mt-sm-0">
          <small className="text-muted">{assignments.length} assignment(s)</small>
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading assignments...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && assignments.length === 0 && (
        <div className="alert alert-info">
          No assignments available. You may not be enrolled in any courses yet.
        </div>
      )}

      {!loading && assignments.length > 0 && (
        <div className="table-responsive">
          <table className="assignments-table table table-striped table-hover" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id || assignment.uuid}>
                  <td data-label="Title">{assignment.title}</td>
                  <td data-label="Course">{assignment.courseName || 'N/A'}</td>
                  <td data-label="Due Date">{new Date(assignment.dueDate).toLocaleString()}</td>
                  <td data-label="Status">{getStatusBadge(assignment.studentSubmissionStatus || assignment.status)}</td>
                  <td data-label="File">
                    {assignment.filePath ? (
                      <button
                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                        onClick={() => handleDownload(assignment.filePath)}
                      >
                        <FaDownload /> <span className="ms-2 d-none d-sm-inline">Download</span>
                      </button>
                    ) : (
                      <span className="muted d-inline-flex align-items-center"><FaFileAlt className="me-2"/> —</span>
                    )}
                  </td>
                  <td data-label="Actions">
                    <button
                      className="btn btn-sm btn-primary d-flex align-items-center"
                      onClick={() => handleUploadClick(assignment)}
                      disabled={assignment.status === 'Graded' || assignment.studentSubmissionStatus === 'Submitted'}
                    >
                      <FaUpload /> <span className="ms-2 d-none d-sm-inline">Submit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Submission Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-between">
              <h3 className="mb-0"><FaUpload className="me-2"/> Submit Assignment</h3>
              <button 
                className="close-btn"
                onClick={() => setShowUploadModal(false)}
                aria-label="Close upload modal"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select File to Upload</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="submissionFile"
                    className="file-input"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx"
                  />
                  <label htmlFor="submissionFile" className="file-input-label d-flex align-items-center gap-2">
                    <FaFileAlt /> {submissionFile ? `Selected: ${submissionFile.name}` : 'Choose PDF or Word file'}
                  </label>
                </div>
                <small className="form-helper">
                  Allowed formats: PDF, Word (.doc, .docx) - Max size: 10MB
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary d-flex align-items-center"
                onClick={handleSubmitAssignment}
                disabled={submittingId === selectedAssignment?.id || !submissionFile}
              >
                {submittingId === selectedAssignment?.id ? (<><FaClock className="me-2"/> Submitting...</>) : (<><FaUpload className="me-2"/> Submit Assignment</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .assignment-container {
          padding: 20px;
          background-color: #f5f5f5;
          min-height: 100vh;
        }

        .assignment-header {
          margin-bottom: 30px;
        }

        .assignment-header h2 {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .alert-info {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .table-responsive {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: auto;
        }

        .assignments-table {
          width: 100%;
          border-collapse: collapse;
        }

        .assignments-table th {
          background: #f9f9f9;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e6e6e6;
          color: #333;
        }

        .assignments-table td {
          padding: 12px;
          border-bottom: 1px solid #e6e6e6;
        }

        .assignments-table tbody tr:hover {
          background: #fafafa;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .bg-warning { background: #ffc107; color: #333; }
        .bg-success { background: #28a745; color: white; }
        .bg-danger { background: #dc3545; color: white; }
        .bg-info { background: #17a2b8; color: white; }
        .bg-secondary { background: #6c757d; color: white; }

        .btn {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-sm {
          padding: 6px 10px;
          font-size: 12px;
        }

        .btn-link {
          background: transparent;
          color: #007bff;
          text-decoration: underline;
          padding: 0;
        }

        .btn-link:hover {
          color: #0056b3;
        }

        .muted {
          color: #888;
        }

        /* Responsive stacked rows for assignments table */
        @media (max-width: 575px) {
          .assignments-table thead { display: none; }
          .assignments-table, .assignments-table tbody, .assignments-table tr, .assignments-table td { display: block; width: 100%; }
          .assignments-table tr { margin-bottom: 0.75rem; border: 1px solid #e9ecef; border-radius: .25rem; padding: .5rem; }
          .assignments-table td { text-align: right; padding-left: 50%; position: relative; border: none; }
          .assignments-table td::before { content: attr(data-label); position: absolute; left: 0; width: 45%; padding-left: .75rem; font-weight: 600; text-align: left; }
          .d-none.d-sm-inline { display: none !important; }
          .modal-content { width: 94%; max-width: 94%; }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          min-width: 400px;
          max-width: 500px;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e6e6e6;
          background: #f9f9f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
          font-weight: 600;
        }

        .close-btn {
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .close-btn:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #e6e6e6;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          background: #f9f9f9;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
        }

        .file-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border: 2px dashed #ddd;
          border-radius: 4px;
          padding: 10px;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.2s;
        }

        .file-input-wrapper:hover {
          border-color: #007bff;
          background: #f0f8ff;
        }

        .file-input {
          display: none;
        }

        .file-input-label {
          flex: 1;
          font-size: 14px;
          color: #666;
          cursor: pointer;
        }

        .form-helper {
          display: block;
          font-size: 12px;
          color: #999;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
};

export default Assignment;
