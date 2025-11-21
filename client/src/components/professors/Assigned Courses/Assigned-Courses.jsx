import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AssignedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAssignedCourses = async () => {
      try {
        const response = await axios.get(`/api/courses/professor/${user.uuid}`);
        console.log('Fetching courses for professor UUID:',response);
        setCourses(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (err) {
        setError('Failed to fetch assigned courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.uuid) {
      fetchAssignedCourses();
    }
  }, [user]);

  const handleViewDetails = (courseId) => {
    // Navigate to course details page or open modal
    console.log('View details for course:', courseId);
    // You can implement navigation here, e.g., using react-router
    // navigate(`/course-details/${courseId}`);
  };

  if (loading) {
    return <div className="text-center">Loading assigned courses...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Assigned Courses</h4>
            </div>
            <div className="card-body">
              {courses.length === 0 ? (
                <p>No courses assigned yet.</p>
              ) : (
                <div className="row">
                  {courses.map((course) => (
                    <div key={course.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100">
                        {course.courseImage && (
                          <img
                            src={`/images/${course.courseImage}`}
                            className="card-img-top"
                            alt={course.courseName}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">{course.courseName}</h5>
                          <p className="card-text">
                            <strong>Code:</strong> {course.courseCode}<br />
                            <strong>Department:</strong> {course.department}<br />
                            <strong>Credits:</strong> {course.credits}<br />
                            <strong>Semester:</strong> {course.semester}<br />
                            <strong>Type:</strong> {course.courseType}<br />
                            <strong>Enrolled Students:</strong> {course.enrolledStudents}<br />
                            <strong>Status:</strong>{' '}
                            <span className={`badge ${course.courseStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {course.courseStatus}
                            </span>
                          </p>
                          {course.courseDescription && (
                            <p className="card-text flex-grow-1">
                              <strong>Description:</strong> {course.courseDescription.length > 100
                                ? `${course.courseDescription.substring(0, 100)}...`
                                : course.courseDescription}
                            </p>
                          )}
                          <button
                            className="btn btn-primary mt-auto"
                            onClick={() => handleViewDetails(course.id)}
                          >
                            View Details
                          </button>
                        </div>
                        <div className="card-footer text-muted">
                          Created: {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedCourses;
