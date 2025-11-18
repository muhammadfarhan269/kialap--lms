import React from 'react';

const Assignment = () => {
  // Sample assignment data - replace with actual data fetching logic
  const assignmentData = [
    {
      title: 'Math Homework 1',
      dueDate: '2023-10-15',
      status: 'Pending',
      courseName: 'Mathematics',
      fileUrl: '#', // Placeholder for download link
    },
    {
      title: 'Physics Lab Report',
      dueDate: '2023-10-20',
      status: 'Submitted',
      courseName: 'Physics',
      fileUrl: '#',
    },
    {
      title: 'Chemistry Essay',
      dueDate: '2023-10-10',
      status: 'Late',
      courseName: 'Chemistry',
      fileUrl: '#',
    },
    {
      title: 'Computer Science Project',
      dueDate: '2023-10-25',
      status: 'Graded',
      courseName: 'Computer Science',
      fileUrl: '#',
    },
  ];

  const handleUpload = (assignmentId) => {
    // Placeholder for upload logic
    alert(`Upload submission for assignment ${assignmentId}`);
  };

  const handleDownload = (fileUrl) => {
    // Placeholder for download logic
    window.open(fileUrl, '_blank');
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
    <div className="container mt-4">
      <h2 className="mb-4">Assignment List</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Assignment Title</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Course Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignmentData.map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td>{item.dueDate}</td>
                <td>{getStatusBadge(item.status)}</td>
                <td>{item.courseName}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleUpload(index)}
                  >
                    Upload Submission
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDownload(item.fileUrl)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignment;
