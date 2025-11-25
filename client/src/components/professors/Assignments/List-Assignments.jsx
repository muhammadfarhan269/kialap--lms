import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignmentsByProfessor, deleteAssignment } from '../../../redux/slices/assignmentSlice';
import { useNavigate } from 'react-router-dom';
import '../../../css/dashboard.css';

const ListAssignments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { assignmentsByProfessor = [], loading, error } = useSelector((state) => state.assignment);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.uuid) dispatch(fetchAssignmentsByProfessor(user.uuid));
  }, [dispatch, user]);

  const handleCreate = () => {
    navigate('/add-assignment');
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
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this assignment?')) {
                          dispatch(deleteAssignment(a.id));
                        }
                      }}
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

      <style>{`
        .list-assignments-container { padding: 20px; }
        .list-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .assignments-table { width:100%; border-collapse:collapse; }
        .assignments-table th, .assignments-table td { padding:10px; border:1px solid #e6e6e6; text-align:left; }
        .assignments-table th { background:#fafafa; }
        .table-responsive { overflow:auto; }
        .error-text { color: #c00; }
        .muted { color:#888; }
      `}</style>
    </div>
  );
};

export default ListAssignments;
