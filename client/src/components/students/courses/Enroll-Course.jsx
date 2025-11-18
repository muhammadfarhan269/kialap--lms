
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

  useEffect(() => {
    // Fetch all courses
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
    if (window.confirm('Are you sure you want to drop this course?')) {
      try {
        await dispatch(unenrollFromCourse(enrollmentId)).unwrap();
        // Refresh enrollments and courses after successful unenrollment
        dispatch(fetchStudentEnrollments());
        dispatch(fetchCourses({ limit: 100, offset: 0 }));
      } catch (error) {
        console.error('Unenrollment failed:', error);
      }
    }
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
  const totalEnrolledStudents = courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0);

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
        <div className="col-md-6">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-book fs-1"></i>
                </div>
                <div>
                  <h5 className="card-title mb-1">Total Courses</h5>
                  <h2 className="mb-0">{totalCourses}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-people fs-1"></i>
                </div>
                <div>
                  <h5 className="card-title mb-1">Total Enrolled Students</h5>
                  <h2 className="mb-0">{totalEnrolledStudents}</h2>
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
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              Operation completed successfully!
              <button type="button" className="btn-close" onClick={() => dispatch(clearSuccess())}></button>
            </div>
          </div>
        </div>
      )}

      {(coursesError || enrollmentError) && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {coursesError || enrollmentError}
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
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Department</th>
                        <th>Professor</th>
                        <th>Credits</th>
                        <th>Students</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td>
                            <code>{course.courseCode}</code>
                          </td>
                          <td>
                            <strong>{course.courseName}</strong>
                            {course.courseDescription && (
                              <div className="small text-muted mt-1">
                                {course.courseDescription.length > 50
                                  ? `${course.courseDescription.substring(0, 50)}...`
                                  : course.courseDescription}
                              </div>
                            )}
                          </td>
                          <td>{course.department}</td>
                          <td>{course.professorName || 'TBD'}</td>
                          <td>{course.credits}</td>
                          <td>{getEnrollmentCount(course)}</td>
                          <td>
                            {isEnrolled(course.id) ? (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  const enrollment = enrollments.find(e => e.course_id === course.id && e.status === 'active');
                                  if (enrollment) handleUnenroll(enrollment.id);
                                }}
                                disabled={enrollmentLoading}
                              >
                                <i className="bi bi-dash-circle me-1"></i>
                                Drop
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleEnroll(course.id)}
                                disabled={enrollmentLoading}
                              >
                                <i className="bi bi-plus-circle me-1"></i>
                                Enroll
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
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Department</th>
                        <th>Professor</th>
                        <th>Credits</th>
                        <th>Students</th>
                        <th>Actions</th>
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
                              <i className="bi bi-dash-circle me-1"></i>
                              Drop
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
    </div>
  );
};

export default EnrollCourse;
