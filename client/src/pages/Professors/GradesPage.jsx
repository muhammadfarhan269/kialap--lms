import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const GradesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/professor/${user?.uuid}/grades`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch grades');
        }

        const data = await response.json();
        setGrades(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.uuid) {
      fetchGrades();
    }
  }, [user]);

  if (loading) return <div>Loading grades...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!grades.length) return <div>No grades to display.</div>;

  return (
    <div className="container">
      <h3>Professor Grades</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Course</th>
            <th>Student</th>
            <th>Grade</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade, index) => (
            <tr key={grade.id || index}>
              <td>{index + 1}</td>
              <td>{grade.courseName || grade.course}</td>
              <td>{grade.studentName || grade.student}</td>
              <td>{grade.grade}</td>
              <td>{grade.comments || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradesPage;
