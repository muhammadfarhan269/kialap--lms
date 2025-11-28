
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../../redux/slices/courseSlice';
import {
  fetchStudentEnrollments,
  enrollInCourse,
  unenrollFromCourse,
  checkEnrollmentStatus,
  clearError,
  clearSuccess
} from '../../../redux/slices/enrollmentSlice';
import { toast } from 'react-toastify';
import { FaBook, FaPlusCircle, FaMinusCircle, FaCheckCircle, FaExclamationTriangle, FaCode, FaBuilding, FaUser, FaStar, FaUsers, FaEllipsisH } from 'react-icons/fa';

const EnrollCourse = () => {
  const dispatch = useDispatch();
  const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.course);
  const {
    enrollments,
    enrollmentStatus,
    loading: enrollmentLoading,
    error: enrollmentError,
    success
  } = useSelector((state) => state.enrollment);

  const [enrollmentChecks, setEnrollmentChecks] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  useEffect(() => {
    // Fetch courses (filtered by backend for students: active and created by admin)
    dispatch(fetchCourses({ limit: 100, offset: 0 }));

    // Fetch student's current enrollments
    dispatch(fetchStudentEnrollments());
  }, [dispatch]);

  useEffect(() => {
    // Clear success/error messages after 3 seconds
    if (success || enrollmentError) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, enrollmentError, dispatch]);

  const handleEnroll = async (courseId) => {
    try {
      await dispatch(enrollInCourse(courseId)).unwrap();
      // Refresh enrollments and courses after successful enrollment
      dispatch(fetchStudentEnrollments());
      dispatch(fetchCourses({ limit: 100, offset: 0 }));
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    try {
      await dispatch(unenrollFromCourse(enrollmentId)).unwrap();
      // Refresh enrollments and courses after successful unenrollment
      dispatch(fetchStudentEnrollments());
      dispatch(fetchCourses({ limit: 100, offset: 0 }));
    } catch (error) {
      console.error('Unenrollment failed:', error);
    
    }
  };

  const confirmUnenroll = async () => {
    if (selectedEnrollment) {
      await handleUnenroll(selectedEnrollment);
      setShowConfirmModal(false);
      setSelectedEnrollment(null);
    }
  };

  const cancelUnenroll = () => {
    setShowConfirmModal(false);
    setSelectedEnrollment(null);
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment =>
      enrollment.course_id === courseId && enrollment.status === 'active'
    );
  };

  const getEnrollmentCount = (course) => {
    return course.enrolledStudents || 0;
  };

  if (coursesLoading || enrollmentLoading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading courses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalCourses = courses.length;

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <h4 className="page-title">Course Enrollment</h4>
          <p className="text-muted">Browse and enroll in available courses</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center flex-column">
                <div className="fs-1 mb-2">
                  <FaBook />
                </div>
                <div>
                  <h5 className="card-title mb-1">Total Courses</h5>
                  <h2 className="mb-0">{totalCourses}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
              <FaCheckCircle className="me-2" />
              <div className="me-auto">Operation completed successfully!</div>
              <button type="button" className="btn-close" onClick={() => dispatch(clearSuccess())}></button>
            </div>
          </div>
        </div>
      )}

      {(coursesError || enrollmentError) && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
              <FaExclamationTriangle className="me-2" />
              <div className="me-auto">{coursesError || enrollmentError}</div>
              <button type="button" className="btn-close" onClick={() => dispatch(clearError())}></button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Available Courses</h5>
            </div>
            <div className="card-body">
              {courses.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-book display-4 text-muted"></i>
                  <p className="mt-2 text-muted">No courses available at the moment.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-bordered table-striped" style={{ minWidth: 1000 }}>
                    <thead className="table-light">
                      <tr>
                        <th><FaCode className="me-1"/> Course Code</th>
                        <th><FaBook className="me-1"/> Course Name</th>
                        <th><FaBuilding className="me-1"/> Department</th>
                        <th><FaUser className="me-1"/> Professor</th>
                        <th><FaStar className="me-1"/> Credits</th>
                        <th><FaUsers className="me-1"/> Students</th>
                        <th><FaEllipsisH className="me-1"/> Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td data-label="Course Code">
                            <code>{course.courseCode}</code>
                          </td>
                          <td data-label="Course Name">
                            <strong>{course.courseName}</strong>
                            {course.courseDescription && (
                              <div className="small text-muted mt-1">
                                {course.courseDescription.length > 50
                                  ? `${course.courseDescription.substring(0, 50)}...`
                                  : course.courseDescription}
                              </div>
                            )}
                          </td>
                          <td data-label="Department">{course.department}</td>
                          <td data-label="Professor">{course.professorName || 'TBD'}</td>
                          <td data-label="Credits">{course.credits}</td>
                          <td data-label="Students">{getEnrollmentCount(course)}</td>
                          <td data-label="Actions">
                            {isEnrolled(course.id) ? (
                            <button
                              className="btn btn-outline-danger btn-sm d-flex align-items-center"
                              onClick={() => {
                                const enrollment = enrollments.find(e => e.course_id === course.id && e.status === 'active');
                                if (enrollment) {
                                  setSelectedEnrollment(enrollment.id);
                                  setShowConfirmModal(true);
                                }
                              }}
                              disabled={enrollmentLoading}
                            >
                              <FaMinusCircle /> <span className="ms-2 d-none d-sm-inline">Drop</span>
                            </button>
                            ) : (
                              <button
                                className="btn btn-outline-success btn-sm d-flex align-items-center"
                                onClick={() => handleEnroll(course.id)}
                                disabled={enrollmentLoading}
                              >
                                <FaPlusCircle /> <span className="ms-2 d-none d-sm-inline">Enroll</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My Enrollments Section */}
      {enrollments.filter(e => e.status === 'active').length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">My Enrolled Courses</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-bordered table-striped">
                    <thead className="table-light">
                      <tr>
                        <th><FaCode className="me-1"/> Course Code</th>
                        <th><FaBook className="me-1"/> Course Name</th>
                        <th><FaBuilding className="me-1"/> Department</th>
                        <th><FaUser className="me-1"/> Professor</th>
                        <th><FaStar className="me-1"/> Credits</th>
                        <th><FaUsers className="me-1"/> Students</th>
                        <th><FaEllipsisH className="me-1"/> Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.filter(e => e.status === 'active').map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td>
                            <code>{enrollment.courseCode}</code>
                          </td>
                          <td>
                            <strong>{enrollment.courseName}</strong>
                          </td>
                          <td>{enrollment.department}</td>
                          <td>{enrollment.professorName || 'TBD'}</td>
                          <td>{enrollment.credits}</td>
                          <td>{enrollment.enrolled_count || 0}</td>
                          <td>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleUnenroll(enrollment.id)}
                              disabled={enrollmentLoading}
                            >
                              <FaMinusCircle /> <span className="ms-2 d-none d-sm-inline">Drop</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Course Drop</h5>
                <button type="button" className="btn-close" onClick={cancelUnenroll}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to drop this course? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelUnenroll}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmUnenroll}>
                  Drop Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        /* Mobile stacked rows for course tables */
        @media (max-width: 575px) {
          .table thead { display: none; }
          .table, .table tbody, .table tr, .table td { display: block; width: 100%; }
          .table tr { margin-bottom: 0.75rem; border: 1px solid #e9ecef; border-radius: .25rem; padding: .5rem; }
          .table td { text-align: right; padding-left: 50%; position: relative; border: none; }
          .table td::before { content: attr(data-label); position: absolute; left: 0; width: 45%; padding-left: .75rem; font-weight: 600; text-align: left; }
          .d-none.d-sm-inline { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default EnrollCourse;
