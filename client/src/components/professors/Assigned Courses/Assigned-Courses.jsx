import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEye, FaImage, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';

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

  // Inject small responsive styles for the table and modal (one-time)
  useEffect(() => {
    const id = 'assigned-courses-responsive-styles';
    if (typeof document === 'undefined' || document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      .assigned-courses-table img { width: 100px; height: 64px; object-fit: cover; }
      .assigned-courses-table td, .assigned-courses-table th { vertical-align: middle; }
      @media (max-width: 991px) {
        .assigned-courses-table img { width: 80px; height: 56px; }
      }
      @media (max-width: 575px) {
        .assigned-courses-table thead { display: none; }
        .assigned-courses-table, .assigned-courses-table tbody, .assigned-courses-table tr, .assigned-courses-table td { display: block; width: 100%; }
        .assigned-courses-table tr { margin-bottom: 0.75rem; border: 1px solid #e9ecef; border-radius: .25rem; padding: .5rem; }
        .assigned-courses-table td { text-align: right; padding-left: 50%; position: relative; }
        .assigned-courses-table td::before { content: attr(data-label); position: absolute; left: 0; width: 45%; padding-left: .75rem; font-weight: 600; text-align: left; }
      }
      /* Make modal wider on large screens */
      .modal-xl { max-width: 1100px; }
    `;
    document.head.appendChild(style);
  }, []);

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
              <table className="table table-bordered table-striped table-hover assigned-courses-table">
                <thead className="table-dark">
                  <tr>
                    <th style={{ minWidth: 40 }}>#</th>
                    <th style={{ minWidth: 120 }}>Course Image</th>
                    <th style={{ minWidth: 220 }}>Name</th>
                    <th style={{ minWidth: 120 }}>Code</th>
                    <th style={{ minWidth: 160 }}>Department</th>
                    <th style={{ minWidth: 80 }}>Credits</th>
                    <th style={{ minWidth: 100 }}>Semester</th>
                    <th style={{ minWidth: 100 }}>Type</th>
                    <th style={{ minWidth: 100 }}>Enrolled</th>
                    <th style={{ minWidth: 100 }}>Status</th>
                    <th style={{ minWidth: 220 }}>Description</th>
                    <th style={{ minWidth: 140 }}>Created At</th>
                    <th style={{ minWidth: 120, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {activeCourses.map((course, index) => (
                    <tr key={course.id}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="Course Image">
                        {course.courseImage ? (
                          <img
                            src={`/images/${course.courseImage}`}
                            alt={course.courseName}
                            className="rounded"
                          />
                        ) : (
                          <div className="text-muted d-flex align-items-center"><FaImage className="me-2"/> No Image</div>
                        )}
                      </td>
                      <td data-label="Name">{course.courseName}</td>
                      <td data-label="Code">{course.courseCode}</td>
                      <td data-label="Department">{course.department}</td>
                      <td data-label="Credits">{course.credits}</td>
                      <td data-label="Semester">{course.semester}</td>
                      <td data-label="Type">{course.courseType}</td>
                      <td data-label="Enrolled">{course.enrolledStudents}</td>
                      <td data-label="Status">
                        <span className={`badge ${course.courseStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {course.courseStatus}
                        </span>
                      </td>
                      <td data-label="Description">
                        {course.courseDescription
                          ? course.courseDescription.length > 80
                            ? course.courseDescription.substring(0, 80) + '...'
                            : course.courseDescription
                          : '—'}
                      </td>
                      <td data-label="Created At">{new Date(course.createdAt).toLocaleDateString()}</td>
                      <td data-label="Action" className="text-center">
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                          onClick={() => handleViewDetails(course)}
                          title={`View ${course.courseName}`}
                        >
                          <FaEye /> <span className="ms-2 d-none d-sm-inline">View</span>
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
          <div className="modal-dialog modal-xl">
            <div className="modal-content">

              <div className="modal-header d-flex align-items-center">
                <h5 className="modal-title">{selectedCourse.courseName} – Details</h5>
                <button className="btn-close ms-auto" onClick={closeModal} aria-label="Close"></button>
              </div>

              <div className="modal-body">
                <div className="row gy-3">

                  <div className="col-12 col-md-4 text-center">
                    {selectedCourse.courseImage ? (
                      <img
                        src={`/images/${selectedCourse.courseImage}`}
                        alt="Course"
                        className="img-fluid rounded mb-2"
                        style={{ maxHeight: 220, width: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="text-muted d-flex align-items-center justify-content-center" style={{ height: 160 }}>
                        <FaImage className="me-2" /> No Image
                      </div>
                    )}
                    <div className="mt-2 d-flex justify-content-center gap-2">
                      <span className="badge bg-info text-dark"><FaCalendarAlt className="me-1"/> {selectedCourse.semester}</span>
                      <span className="badge bg-primary">{selectedCourse.credits} credits</span>
                    </div>
                  </div>

                  <div className="col-12 col-md-8">
                    <div className="row">
                      <div className="col-12 col-sm-6"><p><strong>Course Code:</strong> {selectedCourse.courseCode}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Department:</strong> {selectedCourse.department}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Credits:</strong> {selectedCourse.credits}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Semester:</strong> {selectedCourse.semester}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Course Type:</strong> {selectedCourse.courseType}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Enrolled Students:</strong> {selectedCourse.enrolledStudents}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Status:</strong> {selectedCourse.courseStatus}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Class Days:</strong> {selectedCourse.classDays}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Time:</strong> {selectedCourse.startTime} - {selectedCourse.endTime}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Classroom:</strong> {selectedCourse.classroom}</p></div>
                      <div className="col-12"><p><strong>Description:</strong><br /> {selectedCourse.courseDescription}</p></div>
                      <div className="col-12 col-sm-6"><p><strong>Total Fee:</strong> {selectedCourse.totalFee}</p></div>
                    </div>
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
