import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCourse, clearError, clearSuccess } from '../../../redux/slices/courseSlice';
import { fetchProfessors } from '../../../redux/slices/professorSlice';
import { useNavigate } from 'react-router-dom';
import '../../../css/dashboard.css';

const AddCourse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((state) => state.course);
  const { professors } = useSelector((state) => state.professor);

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    professorId: '',
    description: '',
    credits: 3,
    duration: 16,
    maxStudents: 30,
    prerequisites: '',
    semester: '',
    courseType: '',
    classDays: [],
    startTime: '',
    endTime: '',
    classroom: '',
    status: 'active',
    enrollmentType: 'open',
    onlineAvailable: true,
    certificateOffered: false,
    recordedLectures: false,
    courseFee: '',
    labFee: '',
    materialFee: '',
    courseImage: null,
  });

  const [imagePreview, setImagePreview] = useState('https://picsum.photos/400/250?random=1');
  const [totalFee, setTotalFee] = useState(0);

  useEffect(() => {
    dispatch(fetchProfessors());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      navigate('/all-courses');
    }
  }, [success, navigate]);

  useEffect(() => {
    const courseFee = parseFloat(formData.courseFee) || 0;
    const labFee = parseFloat(formData.labFee) || 0;
    const materialFee = parseFloat(formData.materialFee) || 0;
    setTotalFee(courseFee + labFee + materialFee);
  }, [formData.courseFee, formData.labFee, formData.materialFee]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayChange = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      classDays: checked
        ? [...prev.classDays, day]
        : prev.classDays.filter(d => d !== day)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, courseImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Append all form data
    Object.keys(formData).forEach(key => {
      if (key === 'classDays') {
        formDataToSend.append(key, formData[key].join(','));
      } else if (key === 'courseImage') {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      } else {
        formDataToSend.append(key, formData[key] || '');
      }
    });

    // Add fees as numbers
    formDataToSend.set('courseFee', parseFloat(formData.courseFee) || 0);
    formDataToSend.set('labFee', parseFloat(formData.labFee) || 0);
    formDataToSend.set('materialFee', parseFloat(formData.materialFee) || 0);

    dispatch(addCourse(formDataToSend));
  };

  const handleReset = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      department: '',
      professorId: '',
      description: '',
      credits: 3,
      duration: 16,
      maxStudents: 30,
      prerequisites: '',
      semester: '',
      courseType: '',
      classDays: [],
      startTime: '',
      endTime: '',
      classroom: '',
      status: 'active',
      enrollmentType: 'open',
      onlineAvailable: true,
      certificateOffered: false,
      recordedLectures: false,
      courseFee: '',
      labFee: '',
      materialFee: '',
      courseImage: null,
    });
    setImagePreview('https://picsum.photos/400/250?random=1');
  };

  return (
    <div className="dashboard-content">
      <div className="container-fluid">
        {/* Page Header */}
        <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 fw-bold mb-2">Add New Course</h1>
            <p className="text-muted mb-0">Create a new course for the academic curriculum</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-secondary">
              <i className="bi bi-question-circle me-2"></i>Help
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate('/all-courses')}
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Courses
            </button>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearError())}
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Course created successfully!
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearSuccess())}
          ></button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
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
                    <label htmlFor="courseCode" className="form-label text-start">
                      Course Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="courseCode"
                      name="courseCode"
                      placeholder="e.g., CS101"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="invalid-feedback">Please provide a valid course code.</div>
                  </div>
                  <div>
                    <label htmlFor="courseName" className="form-label text-start">
                      Course Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="courseName"
                      name="courseName"
                      placeholder="e.g., Introduction to Computer Science"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="invalid-feedback">Please provide a course name.</div>
                  </div>
                </div>

                <div className="dashboard-grid grid-cols-2 mb-3">
                  <div>
                    <label htmlFor="department" className="form-label text-start">
                      Department <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="department"
                      name="department"
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
                    <label htmlFor="professorId" className="form-label text-start">
                      Professor <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="professorId"
                      name="professorId"
                      value={formData.professorId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Professor</option>
                      {professors.map((professor) => (
                        <option key={professor.id} value={professor.id}>
                          {professor.name}
                        </option>
                      ))}
                    </select>
                    <div className="invalid-feedback">Please select a professor.</div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label text-start">Course Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    placeholder="Enter detailed course description..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="dashboard-grid grid-cols-3 mb-3">
                  <div>
                    <label htmlFor="credits" className="form-label text-start">
                      Credits <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="credits"
                      name="credits"
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
                      name="duration"
                      min="1"
                      max="52"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="invalid-feedback">Duration must be between 1 and 52 weeks.</div>
                  </div>
                  <div>
                    <label htmlFor="maxStudents" className="form-label text-start">Max Students</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxStudents"
                      name="maxStudents"
                      min="1"
                      max="500"
                      value={formData.maxStudents}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="prerequisites" className="form-label text-start">Prerequisites</label>
                  <input
                    type="text"
                    className="form-control"
                    id="prerequisites"
                    name="prerequisites"
                    placeholder="e.g., MATH101, CS100 (comma separated)"
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
                    <label htmlFor="semester" className="form-label text-start">
                      Semester <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Semester</option>
                      <option value="spring2025">Spring 2025</option>
                      <option value="summer2025">Summer 2025</option>
                      <option value="fall2025">Fall 2025</option>
                    </select>
                    <div className="invalid-feedback">Please select a semester.</div>
                  </div>
                  <div>
                    <label htmlFor="courseType" className="form-label text-start">
                      Course Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="courseType"
                      name="courseType"
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
                  <label className="form-label text-start">
                    Class Days <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex flex-wrap gap-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
                      <div key={day} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={day}
                          checked={formData.classDays.includes(day)}
                          onChange={(e) => handleDayChange(day, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={day}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-grid grid-cols-2 mb-3">
                  <div>
                    <label htmlFor="startTime" className="form-label text-start">
                      Start Time <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="invalid-feedback">Please select a start time.</div>
                  </div>
                  <div>
                    <label htmlFor="endTime" className="form-label text-start">
                      End Time <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="invalid-feedback">Please select an end time.</div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="classroom" className="form-label text-start">Classroom/Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="classroom"
                    name="classroom"
                    placeholder="e.g., Building A, Room 101"
                    value={formData.classroom}
                    onChange={handleInputChange}
                  />
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
                <div className="position-relative d-inline-block mb-3">
                  <img
                    src={imagePreview}
                    alt="Course Thumbnail"
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 end-0 p-2">
                    <span className="badge bg-primary">Preview</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="courseImage" className="form-label text-start">Upload Course Image</label>
                  <input
                    className="form-control"
                    type="file"
                    id="courseImage"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <small className="text-muted">JPG, PNG up to 5MB. Recommended: 800x500px</small>
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
                  <label htmlFor="status" className="form-label text-start">Status</label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="enrollmentType" className="form-label text-start">Enrollment Type</label>
                  <select
                    className="form-select"
                    id="enrollmentType"
                    name="enrollmentType"
                    value={formData.enrollmentType}
                    onChange={handleInputChange}
                  >
                    <option value="open">Open Enrollment</option>
                    <option value="approval">Requires Approval</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-start">Course Options</label>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="onlineAvailable"
                      name="onlineAvailable"
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
                      name="certificateOffered"
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
                      name="recordedLectures"
                      checked={formData.recordedLectures}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="recordedLectures">
                      Recorded Lectures Available
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Structure */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h5 className="dashboard-card-title">Fee Structure</h5>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-grid grid-cols-3 mb-3">
                  <div>
                    <label htmlFor="courseFee" className="form-label text-start">Course Fee ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="courseFee"
                      name="courseFee"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.courseFee}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="labFee" className="form-label text-start">Lab Fee ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="labFee"
                      name="labFee"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.labFee}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="materialFee" className="form-label text-start">Material Fee ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="materialFee"
                      name="materialFee"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.materialFee}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="h6 mb-0">Total Course Fee:</span>
                    <span className="h5 mb-0 text-primary fw-bold">${totalFee.toFixed(2)}</span>
                  </div>
                  <small className="text-muted">All fees are per semester</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="row">
          <div className="col-12">
            <hr className="my-4" />
            <div className="d-flex gap-3">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="bi bi-check-lg me-2"></i>
                {loading ? 'Creating Course...' : 'Create Course'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/all-courses')}>
                <i className="bi bi-x-lg me-2"></i>Cancel
              </button>
              <button type="button" className="btn btn-outline-warning" onClick={handleReset}>
                <i className="bi bi-arrow-clockwise me-2"></i>Reset Form
              </button>
              <button type="button" className="btn btn-outline-info">
                <i className="bi bi-file-text me-2"></i>Save as Draft
              </button>
            </div>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
};

export default AddCourse;
