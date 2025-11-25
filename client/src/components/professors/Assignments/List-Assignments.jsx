import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignmentsByProfessor, deleteAssignment } from '../../../redux/slices/assignmentSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../../css/dashboard.css';

const ListAssignments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const { assignmentsByProfessor = [], loading, error } = useSelector((state) => state.assignment);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.uuid) dispatch(fetchAssignmentsByProfessor(user.uuid));
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreate = () => {
    navigate('/add-assignment');
  };

  const handleDeleteClick = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAssignmentId) {
      dispatch(deleteAssignment(selectedAssignmentId));
      setShowConfirmModal(false);
      setSelectedAssignmentId(null);
      toast.success('Assignment deleted successfully!');
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setSelectedAssignmentId(null);
    toast.info('Delete cancelled');
  };

  const apiBase = 'http://localhost:5000';

  return (
    <div className="list-assignments-container">
      <div className="list-header">
        <h2>Assignments</h2>
        <button className="btn btn-primary" onClick={handleCreate}>Create Assignment</button>
      </div>

      {loading && <p>Loading assignments...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && assignmentsByProfessor.length === 0 && (
        <p>No assignments found. Click "Create Assignment" to add one.</p>
      )}

      {!loading && assignmentsByProfessor.length > 0 && (
        <div className="table-responsive">
          <table className="assignments-table">
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
              {assignmentsByProfessor.map((a) => (
                <tr key={a.uuid || a.id}>
                  <td>{a.title}</td>
                  <td>{a.courseName || ''}</td>
                  <td>{new Date(a.dueDate).toLocaleString()}</td>
                  <td>{a.status}</td>
                  <td>
                    {a.filePath ? (
                      <a href={`${apiBase}/assignments/${a.filePath}`} target="_blank" rel="noreferrer">Download</a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary" 
                      onClick={() => navigate(`/add-assignment?id=${a.id}`)}
                      title="Edit assignment"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleDeleteClick(a.id)}
                      title="Delete assignment"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Delete Assignment</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this assignment? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .list-assignments-container { padding: 20px; }
        .list-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .assignments-table { width:100%; border-collapse:collapse; }
        .assignments-table th, .assignments-table td { padding:10px; border:1px solid #e6e6e6; text-align:left; }
        .assignments-table th { background:#fafafa; }
        .table-responsive { overflow:auto; }
        .error-text { color: #c00; }
        .muted { color:#888; }
        
        /* Modal Styles */
        .confirmation-modal-overlay {
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
        
        .confirmation-modal {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 350px;
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
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
          font-weight: 600;
        }
        
        .modal-body {
          padding: 20px;
          color: #555;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .modal-body p {
          margin: 0;
        }
        
        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #e6e6e6;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .modal-footer .btn {
          padding: 8px 16px;
          font-size: 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .btn-secondary {
          background: #e6e6e6;
          color: #333;
        }
        
        .btn-secondary:hover {
          background: #d6d6d6;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn-danger:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
};

export default ListAssignments;
