import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseById, updateCourse } from '../../redux/slices/courseSlice';
import '../../css/dashboard.css';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, loading, error } = useSelector(state => state.course);

  // Form state
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    professor: '',
    courseDescription: '',
    credits: 3,
    duration: 16,
    maxStudents: 45,
    prerequisites: '',
    semester: '',
    courseType: '',
    classDays: [],
    startTime: '10:00',
    endTime: '11:30',
    classroom: '',
    courseStatus: 'active',
    enrollmentType: 'open',
    onlineAvailable: false,
    certificateOffered: false,
    recordedLectures: false,
    courseFee: 1200.0,
    labFee: 150.0,
    materialFee: 50.0,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [validated, setValidated] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch course data on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
    }
  }, [dispatch, id]);

  // Populate form when course data is loaded
  useEffect(() => {
    if (currentCourse) {
      console.log('Course data loaded:', currentCourse); // Debug log
      
      // Safely handle classDays - it comes from backend as an array or JSON string
      let classDaysArray = [];
      if (Array.isArray(currentCourse.classDays)) {
        classDaysArray = currentCourse.classDays;
      } else if (typeof currentCourse.classDays === 'string') {
        try {
          classDaysArray = JSON.parse(currentCourse.classDays);
          if (!Array.isArray(classDaysArray)) {
            classDaysArray = [];
          }
        } catch (e) {
          classDaysArray = [];
        }
      }

      setFormData(prev => ({
        ...prev,
        courseCode: currentCourse.courseCode || '',
        courseName: currentCourse.courseName || '',
        department: currentCourse.department || '',
        professor: currentCourse.professorName || '',
        courseDescription: currentCourse.courseDescription || '',
        credits: currentCourse.credits || 3,
        duration: currentCourse.duration || 16,
        maxStudents: currentCourse.maxStudents || 45,
        prerequisites: currentCourse.prerequisites || '',
        semester: currentCourse.semester || '',
        courseType: currentCourse.courseType || '',
        classDays: classDaysArray,
        startTime: currentCourse.startTime || '10:00',
        endTime: currentCourse.endTime || '11:30',
        classroom: currentCourse.classroom || '',
        courseStatus: currentCourse.courseStatus || 'active',
        enrollmentType: currentCourse.enrollmentType || 'open',
        onlineAvailable: currentCourse.onlineAvailable || false,
        certificateOffered: currentCourse.certificateOffered || false,
        recordedLectures: currentCourse.recordedLectures || false,
        courseFee: currentCourse.courseFee || 1200.0,
        labFee: currentCourse.labFee || 150.0,
        materialFee: currentCourse.materialFee || 50.0,
      }));

      if (currentCourse.courseImage) {
        setImagePreview(currentCourse.courseImage);
      }
    }
  }, [currentCourse]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle day checkbox changes
  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      classDays: prev.classDays.includes(day)
        ? prev.classDays.filter(d => d !== day)
        : [...prev.classDays, day],
    }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate total fee
  const calculateTotalFee = () => {
    return (
      parseFloat(formData.courseFee || 0) +
      parseFloat(formData.labFee || 0) +
      parseFloat(formData.materialFee || 0)
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate form
    if (formData.courseCode === '' || formData.courseName === '' || formData.department === '') {
      setValidated(true);
      setSubmitError('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);

    try {
      const updatePayload = {
        courseCode: formData.courseCode,
        courseName: formData.courseName,
        department: formData.department,
        courseDescription: formData.courseDescription,
        credits: formData.credits,
        duration: formData.duration,
        maxStudents: formData.maxStudents,
        prerequisites: formData.prerequisites,
        semester: formData.semester,
        courseType: formData.courseType,
        classDays: formData.classDays, // Will be stringified in the model
        startTime: formData.startTime,
        endTime: formData.endTime,
        classroom: formData.classroom,
        courseStatus: formData.courseStatus,
        enrollmentType: formData.enrollmentType,
        onlineAvailable: formData.onlineAvailable,
        certificateOffered: formData.certificateOffered,
        recordedLectures: formData.recordedLectures,
        courseFee: formData.courseFee,
        labFee: formData.labFee,
        materialFee: formData.materialFee,
      };

      const result = await dispatch(updateCourse({ id, courseData: updatePayload }));
      
      if (result.payload && result.payload.success) {
        // Success - show message and redirect
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/all-courses');
        }, 1500);
      } else if (result.payload && result.payload.error) {
        setSubmitError(result.payload.error);
      } else {
        setSubmitError('Failed to update course. Please try again.');
      }
    } catch (err) {
      console.error('Error updating course:', err);
      setSubmitError(err.message || 'An error occurred while updating the course');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setValidated(false);
    if (currentCourse) {
      // Reset to original course data
      setFormData(prev => ({
        ...prev,
        courseCode: currentCourse.courseCode || '',
        courseName: currentCourse.courseName || '',
        department: currentCourse.department || '',
      }));
    }
  };

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 fw-bold mb-2">Edit Course</h1>
            <p className="text-muted mb-0">
              Modify course details for {formData.courseName || 'N/A'}
            </p>
          </div>
          <div className="d-none d-md-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/course-info`)}
            >
              <i className="bi bi-eye me-2" />
              Preview
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate(`/course-info`)}
            >
              <i className="bi bi-info-circle me-2" />
              View Course Info
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Error State - Loading error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => {}} aria-label="Close"></button>
        </div>
      )}

      {/* Success Alert - Form submission success */}
      {submitSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2" />
          <strong>Success!</strong> Course updated successfully. Redirecting...
          <button type="button" className="btn-close" onClick={() => setSubmitSuccess(false)} aria-label="Close"></button>
        </div>
      )}

      {/* Error Alert - Form submission error */}
      {submitError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {submitError}
          <button type="button" className="btn-close" onClick={() => setSubmitError(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Edit Course Form */}
      {!loading && (
        <div className="dashboard-row">
          <form className={`needs-validation ${validated ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
            <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div>
                {/* Basic Information */}
                <div className="dashboard-card mb-3">
                  <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Basic Information</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <div className="dashboard-grid grid-cols-2 mb-3">
                      <div>
                        <label htmlFor="courseCode" className="form-label">
                          Course Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="courseCode"
                          value={formData.courseCode}
                          onChange={handleInputChange}
                          required
                        />
                        <div className="invalid-feedback">Please provide a valid course code.</div>
                      </div>
                      <div>
                        <label htmlFor="courseName" className="form-label">
                          Course Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="courseName"
                          value={formData.courseName}
                          onChange={handleInputChange}
                          required
                        />
                        <div className="invalid-feedback">Please provide a course name.</div>
                      </div>
                    </div>

                    <div className="dashboard-grid grid-cols-2 mb-3">
                      <div>
                        <label htmlFor="department" className="form-label">
                          Department <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Department</option>
                          <option value="cs">Computer Science</option>
                          <option value="math">Mathematics</option>
                          <option value="physics">Physics</option>
                          <option value="chemistry">Chemistry</option>
                          <option value="biology">Biology</option>
                          <option value="business">Business Administration</option>
                          <option value="engineering">Engineering</option>
                          <option value="english">English Literature</option>
                        </select>
                        <div className="invalid-feedback">Please select a department.</div>
                      </div>
                      <div>
                        <label htmlFor="professor" className="form-label">
                          Professor <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="professor"
                          value={formData.professor}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Professor</option>
                          <option value="Dr. Robert Smith">Dr. Robert Smith</option>
                          <option value="Dr. Emily Johnson">Dr. Emily Johnson</option>
                          <option value="Prof. Michael Chen">Prof. Michael Chen</option>
                          <option value="Dr. Sarah Williams">Dr. Sarah Williams</option>
                          <option value="Prof. David Brown">Prof. David Brown</option>
                          <option value="Dr. Jennifer Garcia">Dr. Jennifer Garcia</option>
                        </select>
                        <div className="invalid-feedback">Please select a professor.</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="courseDescription" className="form-label">
                        Course Description
                      </label>
                      <textarea
                        className="form-control"
                        id="courseDescription"
                        rows="4"
                        value={formData.courseDescription}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="dashboard-grid grid-cols-3 mb-3">
                      <div>
                        <label htmlFor="credits" className="form-label">
                          Credits <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="credits"
                          min="1"
                          max="6"
                          value={formData.credits}
                          onChange={handleInputChange}
                          required
                        />
                        <div className="invalid-feedback">Credits must be between 1 and 6.</div>
                      </div>
                      <div>
                        <label htmlFor="duration" className="form-label">
                          Duration (weeks) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="duration"
                          min="1"
                          max="52"
                          value={formData.duration}
                          onChange={handleInputChange}
                          required
                        />
                        <div className="invalid-feedback">Duration must be between 1 and 52 weeks.</div>
                      </div>
                      <div>
                        <label htmlFor="maxStudents" className="form-label">
                          Max Students
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="maxStudents"
                          min="1"
                          max="500"
                          value={formData.maxStudents}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="prerequisites" className="form-label">
                        Prerequisites
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="prerequisites"
                        value={formData.prerequisites}
                        onChange={handleInputChange}
                      />
                      <small className="text-muted">Enter prerequisite course codes separated by commas</small>
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="dashboard-card mb-3">
                  <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Schedule Information</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <div className="dashboard-grid grid-cols-2 mb-3">
                      <div>
                        <label htmlFor="semester" className="form-label">
                          Semester <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="semester"
                          value={formData.semester}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Semester</option>
                          <option value="fall2025">Fall 2025</option>
                          <option value="spring2025">Spring 2025</option>
                          <option value="summer2025">Summer 2025</option>
                        </select>
                        <div className="invalid-feedback">Please select a semester.</div>
                      </div>
                      <div>
                        <label htmlFor="courseType" className="form-label">
                          Course Type <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="courseType"
                          value={formData.courseType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Type</option>
                          <option value="core">Core Course</option>
                          <option value="elective">Elective</option>
                          <option value="lab">Laboratory</option>
                          <option value="seminar">Seminar</option>
                        </select>
                        <div className="invalid-feedback">Please select a course type.</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Class Days <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex flex-wrap gap-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                          <div className="form-check" key={day}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={day.toLowerCase()}
                              checked={formData.classDays.includes(day)}
                              onChange={() => handleDayChange(day)}
                            />
                            <label className="form-check-label" htmlFor={day.toLowerCase()}>
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="dashboard-grid grid-cols-2 mb-3">
                      <div>
                        <label htmlFor="startTime" className="form-label">
                          Start Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          id="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          required
                        />
                        <div className="invalid-feedback">Please select a start time.</div>
                      </div>
                      <div>
                        <label htmlFor="endTime" className="form-label">
                          End Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          id="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          required
                        />
                        <div className="invalid-feedback">Please select an end time.</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="classroom" className="form-label">
                        Classroom/Location
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="classroom"
                        value={formData.classroom}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Student Enrollment */}
                <div className="dashboard-card mb-3">
                  <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Current Enrollment</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <div className="dashboard-grid grid-cols-2 mb-3">
                      <div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Enrolled Students</span>
                          <strong>42 / {formData.maxStudents}</strong>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: '93%' }}
                            aria-valuenow="93"
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Average Attendance</span>
                          <strong>89%</strong>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <div
                            className="progress-bar bg-info"
                            role="progressbar"
                            style={{ width: '89%' }}
                            aria-valuenow="89"
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-info" role="alert">
                      <i className="bi bi-info-circle me-2" />
                      <strong>Note:</strong> There are 3 pending enrollment requests for this course.{' '}
                      <a href="#review">Review requests</a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {/* Course Image */}
                <div className="dashboard-card mb-3">
                  <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Course Image</h5>
                  </div>
                  <div className="dashboard-card-body text-center">
                    {(() => {
                      // Create a default placeholder SVG
                      const defaultSvg = encodeURIComponent(`
                        <svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'>
                          <rect width='100%' height='100%' fill='%23e5e7eb' />
                          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14'>No Image Available</text>
                        </svg>
                      `);
                      return (
                        <img
                          src={imagePreview || `data:image/svg+xml;charset=UTF-8,${defaultSvg}`}
                          alt="Course Thumbnail"
                          className="img-fluid rounded mb-3"
                          id="courseImagePreview"
                          style={{ maxHeight: '300px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            const svg = encodeURIComponent(`
                              <svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'>
                                <rect width='100%' height='100%' fill='%23e5e7eb' />
                                <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14'>No Image</text>
                              </svg>
                            `);
                            e.currentTarget.src = `data:image/svg+xml;charset=UTF-8,${svg}`;
                          }}
                        />
                      );
                    })()}
                    <div className="mb-3">
                      <label htmlFor="courseImage" className="form-label">
                        Change Image
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="courseImage"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <small className="text-muted">Recommended size: 800x500px</small>
                    </div>
                  </div>
                </div>

                {/* Course Settings */}
                <div className="dashboard-card mb-3">
                  <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Course Settings</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <div className="mb-3">
                      <label htmlFor="courseStatus" className="form-label">
                        Status
                      </label>
                      <select
                        className="form-select"
                        id="courseStatus"
                        value={formData.courseStatus}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="enrollmentType" className="form-label">
                        Enrollment Type
                      </label>
                      <select
                        className="form-select"
                        id="enrollmentType"
                        value={formData.enrollmentType}
                        onChange={handleInputChange}
                      >
                        <option value="open">Open Enrollment</option>
                        <option value="approval">Requires Approval</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="onlineAvailable"
                        checked={formData.onlineAvailable}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="onlineAvailable">
                        Available Online
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="certificateOffered"
                        checked={formData.certificateOffered}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="certificateOffered">
                        Certificate Offered
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="recordedLectures"
                        checked={formData.recordedLectures}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="recordedLectures">
                        Recorded Lectures Available
                      </label>
                    </div>
                  </div>
                </div>

                {/* Fee Structure */}
                <div className="dashboard-card mb-3">
                  <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Fee Structure</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <div className="mb-3">
                      <label htmlFor="courseFee" className="form-label">
                        Course Fee ($)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="courseFee"
                        min="0"
                        step="0.01"
                        value={formData.courseFee}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="labFee" className="form-label">
                        Lab Fee ($)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="labFee"
                        min="0"
                        step="0.01"
                        value={formData.labFee}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="materialFee" className="form-label">
                        Material Fee ($)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="materialFee"
                        min="0"
                        step="0.01"
                        value={formData.materialFee}
                        onChange={handleInputChange}
                      />
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between">
                      <strong>Total Fee:</strong>
                      <strong>${calculateTotalFee().toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Course History */}
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Course History</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <div className="small text-muted mb-2">
                      <i className="bi bi-clock-history me-1" /> Last modified: 3 days ago
                    </div>
                    <div className="small text-muted mb-2">
                      <i className="bi bi-person me-1" /> Modified by: {formData.professor}
                    </div>
                    <div className="small text-muted mb-2">
                      <i className="bi bi-calendar me-1" /> Created: Sept 15, 2025
                    </div>
                    <div className="small text-muted">
                      <i className="bi bi-hash me-1" /> Course ID: #{id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="row mt-4">
              <div className="col-12">
                <hr className="my-4" />
                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitLoading}
                  >
                    <i className="bi bi-check-lg me-2" />
                    {submitLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/all-courses')}
                  >
                    <i className="bi bi-x-lg me-2" />
                    Cancel
                  </button>
                  <button
                    type="reset"
                    className="btn btn-outline-warning"
                    onClick={handleReset}
                  >
                    <i className="bi bi-arrow-clockwise me-2" />
                    Reset Form
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this course?')) {
                        // Handle delete
                        navigate('/all-courses');
                      }
                    }}
                  >
                    <i className="bi bi-trash me-2" />
                    Delete Course
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditCourse;
