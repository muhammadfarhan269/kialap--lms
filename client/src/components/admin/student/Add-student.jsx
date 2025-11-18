import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStudent, clearError, resetSuccess } from '../../../redux/slices/studentSlice';
import { fetchDepartments } from '../../../redux/slices/departmentSlice';
import { useNavigate } from 'react-router-dom';

const AddStudent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.student);
  const { departments } = useSelector((state) => state.department);
  const { students } = useSelector((state) => state.student);

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    studentId: '',
    department: '',
    course: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    parentPhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    profileImage: null,

    // Account Information
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    accountStatus: 'active',
    role: 'student',

    // Social Information
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    website: '',
    github: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchDepartments()); // Fetch departments for the form
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // Show success message
      alert('Student created successfully! You can add another student.');
      // Reset form
      setFormData({
        fullName: '',
        studentId: '',
        department: '',
        course: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        parentPhone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        profileImage: null,
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        accountStatus: 'active',
        role: 'student',
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        website: '',
        github: '',
      });
      setActiveTab('basic');
      dispatch(resetSuccess());
    }
  }, [success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateTab = (tab) => {
    const newErrors = {};

    if (tab === 'basic') {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    } else if (tab === 'account') {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabChange = (tab) => {
    if (validateTab(activeTab)) {
      setActiveTab(tab);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const requiredFields = [
      'fullName', 'studentId', 'department', 'dateOfBirth', 'gender', 'phone',
      'email', 'username', 'password', 'confirmPassword'
    ];

    const newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fill in all required fields correctly');
      return;
    }

    // Prepare FormData for submission
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    dispatch(createStudent(submitData));
  };

  const handleCancel = () => {
    navigate('/all-students');
  };

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <h4 className="page-title">Add New Student</h4>
          <p className="text-muted">Fill in the information below to add a new student to the system</p>
        </div>
      </div>

      {/* Form Tabs */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* Tab Navigation */}
              <ul className="nav nav-tabs mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => handleTabChange('basic')}
                    type="button"
                    role="tab"
                  >
                    <i className="bi bi-person-circle me-2"></i>Basic Information
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => handleTabChange('account')}
                    type="button"
                    role="tab"
                  >
                    <i className="bi bi-shield-lock me-2"></i>Account Information
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => handleTabChange('social')}
                    type="button"
                    role="tab"
                  >
                    <i className="bi bi-share me-2"></i>Social Information
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <form onSubmit={handleSubmit}>
                {/* Basic Information Tab */}
                {activeTab === 'basic' && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="fullName" className="form-label">Full Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                          id="fullName"
                          name="fullName"
                          placeholder="Enter full name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="studentId" className="form-label">Student ID <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.studentId ? 'is-invalid' : ''}`}
                          id="studentId"
                          name="studentId"
                          placeholder="Enter student ID"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.studentId && <div className="invalid-feedback">{errors.studentId}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="department" className="form-label">Department <span className="text-danger">*</span></label>
                        <select
                          className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.departmentCode}>
                              {dept.departmentName}
                            </option>
                          ))}
                        </select>
                        {errors.department && <div className="invalid-feedback">{errors.department}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="course" className="form-label">Course</label>
                        <input
                          type="text"
                          className="form-control"
                          id="course"
                          name="course"
                          placeholder="Enter course name"
                          value={formData.course}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="dateOfBirth" className="form-label">Date of Birth <span className="text-danger">*</span></label>
                        <input
                          type="date"
                          className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="gender" className="form-label">Gender <span className="text-danger">*</span></label>
                        <select
                          className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number <span className="text-danger">*</span></label>
                        <input
                          type="tel"
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                          id="phone"
                          name="phone"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="parentPhone" className="form-label">Parent/Guardian Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="parentPhone"
                          name="parentPhone"
                          placeholder="Enter parent phone"
                          value={formData.parentPhone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="address" className="form-label">Address</label>
                        <textarea
                          className="form-control"
                          id="address"
                          name="address"
                          rows="3"
                          placeholder="Enter address"
                          value={formData.address}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="city" className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          placeholder="Enter city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="state" className="form-label">State/Province</label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          name="state"
                          placeholder="Enter state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="postalCode" className="form-label">Postal Code</label>
                        <input
                          type="text"
                          className="form-control"
                          id="postalCode"
                          name="postalCode"
                          placeholder="Enter postal code"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="profileImage" className="form-label">Profile Image</label>
                        <input
                          className="form-control"
                          type="file"
                          id="profileImage"
                          name="profileImage"
                          accept="image/*"
                          onChange={handleInputChange}
                        />
                        <div className="form-text">Accepted formats: JPG, PNG, GIF (Max 2MB)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Information Tab */}
                {activeTab === 'account' && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                          id="username"
                          name="username"
                          placeholder="Enter username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          name="password"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="accountStatus" className="form-label">Account Status</label>
                        <select
                          className="form-select"
                          id="accountStatus"
                          name="accountStatus"
                          value={formData.accountStatus}
                          onChange={handleInputChange}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="role" className="form-label">Role</label>
                        <select
                          className="form-select"
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                        >
                          <option value="student">Student</option>
                          <option value="class_rep">Class Representative</option>
                          <option value="prefect">Prefect</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Information Tab */}
                {activeTab === 'social' && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="facebook" className="form-label">Facebook Profile</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-facebook"></i></span>
                          <input
                            type="url"
                            className="form-control"
                            id="facebook"
                            name="facebook"
                            placeholder="https://facebook.com/username"
                            value={formData.facebook}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="twitter" className="form-label">Twitter Profile</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-twitter"></i></span>
                          <input
                            type="url"
                            className="form-control"
                            id="twitter"
                            name="twitter"
                            placeholder="https://twitter.com/username"
                            value={formData.twitter}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="linkedin" className="form-label">LinkedIn Profile</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-linkedin"></i></span>
                          <input
                            type="url"
                            className="form-control"
                            id="linkedin"
                            name="linkedin"
                            placeholder="https://linkedin.com/in/username"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="instagram" className="form-label">Instagram Profile</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-instagram"></i></span>
                          <input
                            type="url"
                            className="form-control"
                            id="instagram"
                            name="instagram"
                            placeholder="https://instagram.com/username"
                            value={formData.instagram}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="website" className="form-label">Personal Website</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-globe"></i></span>
                          <input
                            type="url"
                            className="form-control"
                            id="website"
                            name="website"
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="github" className="form-label">GitHub Profile</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-github"></i></span>
                          <input
                            type="url"
                            className="form-control"
                            id="github"
                            name="github"
                            placeholder="https://github.com/username"
                            value={formData.github}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="row mt-4">
                  <div className="col-12">
                    {activeTab === 'social' ? (
                      <>
                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                          <i className="bi bi-check-circle me-2"></i>
                          {loading ? 'Creating...' : 'Complete Registration'}
                        </button>
                        <button type="button" className="btn btn-success me-2" onClick={handleSubmit}>
                          <i className="bi bi-check-all me-2"></i>Save All Information
                        </button>
                      </>
                    ) : (
                      <button type="button" className="btn btn-primary me-2" onClick={() => handleTabChange(activeTab === 'basic' ? 'account' : 'social')}>
                        <i className="bi bi-arrow-right me-2"></i>Next
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      <i className="bi bi-x-circle me-2"></i>Cancel
                    </button>
                  </div>
                </div>
              </form>

              {/* Error Display */}
              {error && (
                <div className="alert alert-danger mt-3">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
