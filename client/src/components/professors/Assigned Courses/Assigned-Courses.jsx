import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const AssignedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null); // NEW for modal
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAssignedCourses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/courses/professor/${user.uuid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },

        });
        console.log(response.data);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCourses(Array.isArray(data.data) ? data.data : []);
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

  const handleViewDetails = (course) => {
    setSelectedCourse(course);  // open modal
  };

  const closeModal = () => {
    setSelectedCourse(null);
  };

  if (loading) return <div className="text-center">Loading assigned courses...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const activeCourses = courses.filter(course => course.courseStatus === 'active');

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Assigned Courses (Table View)</h4>
        </div>

        <div className="card-body">
          {activeCourses.length === 0 ? (
            <p>No active courses assigned yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Course Image</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Credits</th>
                    <th>Semester</th>
                    <th>Type</th>
                    <th>Enrolled</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {activeCourses.map((course, index) => (
                    <tr key={course.id}>
                      <td>{index + 1}</td>
                      <td>
                        {course.courseImage ? (
                          <img
                            src={`/images/${course.courseImage}`}
                            alt={course.courseName}
                            style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                          />
                        ) : (
                          'No Image'
                        )}
                      </td>
                      <td>{course.courseName}</td>
                      <td>{course.courseCode}</td>
                      <td>{course.department}</td>
                      <td>{course.credits}</td>
                      <td>{course.semester}</td>
                      <td>{course.courseType}</td>
                      <td>{course.enrolledStudents}</td>
                      <td>
                        <span className={`badge ${course.courseStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {course.courseStatus}
                        </span>
                      </td>
                      <td>
                        {course.courseDescription
                          ? course.courseDescription.length > 80
                            ? course.courseDescription.substring(0, 80) + '...'
                            : course.courseDescription
                          : '—'}
                      </td>
                      <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleViewDetails(course)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ====================== */}
      {selectedCourse && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">{selectedCourse.courseName} – Details</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>

              <div className="modal-body">
                <div className="row">

                  <div className="col-md-4 text-center">
                    {selectedCourse.courseImage ? (
                      <img
                        src={`/images/${selectedCourse.courseImage}`}
                        alt="Course"
                        className="img-fluid rounded"
                      />
                    ) : (
                      <div className="text-muted">No Image</div>
                    )}
                  </div>

                  <div className="col-md-8">
                    <p><strong>Course Code:</strong> {selectedCourse.courseCode}</p>
                    <p><strong>Department:</strong> {selectedCourse.department}</p>
                    <p><strong>Credits:</strong> {selectedCourse.credits}</p>
                    <p><strong>Semester:</strong> {selectedCourse.semester}</p>
                    <p><strong>Course Type:</strong> {selectedCourse.courseType}</p>
                    <p><strong>Enrolled Students:</strong> {selectedCourse.enrolledStudents}</p>
                    <p><strong>Status:</strong> {selectedCourse.courseStatus}</p>
                    <p><strong>Class Days:</strong> {selectedCourse.classDays}</p>
                    <p><strong>Time:</strong> {selectedCourse.startTime} - {selectedCourse.endTime}</p>
                    <p><strong>Classroom:</strong> {selectedCourse.classroom}</p>
                    <p><strong>Description:</strong><br /> {selectedCourse.courseDescription}</p>
                    <p><strong>Total Fee:</strong> {selectedCourse.totalFee}</p>
                  </div>

                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* ================= END MODAL ================== */}

    </div>
  );
};

export default AssignedCourses;
