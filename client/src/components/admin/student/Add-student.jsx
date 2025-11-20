import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStudent, clearError, resetSuccess } from '../../../redux/slices/studentSlice';
import { fetchDepartments } from '../../../redux/slices/departmentSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    password: 'password123',
    confirmPassword: 'password123',
    accountStatus: 'active',
    role: 'student',
  });

  const [errors, setErrors] = useState({});
  const [showNotAllowedIcon, setShowNotAllowedIcon] = useState(false);

  useEffect(() => {
    dispatch(fetchDepartments()); // Fetch departments for the form
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // Reset form
      setFormData({
        fullName: '',
        studentId: '',
        department: '',
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
        password: 'password123',
        confirmPassword: 'password123',
        accountStatus: 'active',
        role: 'student',
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
    // Auto-fill confirmPassword when password changes
    if (name === 'password') {
      setFormData(prev => ({ ...prev, confirmPassword: value }));
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
      'email', 'password', 'confirmPassword'
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
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const submitData = new FormData();
Object.keys(formData).forEach(key => {
  if (formData[key] !== null && formData[key] !== '') {
    submitData.append(key, formData[key]);
  }
});



    try {
      await dispatch(createStudent(submitData)).unwrap();
      toast.success('Student created successfully!');
    } catch (err) {
      toast.error(err.message || 'Error creating student');
    }
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
                            <option key={dept.id} value={dept.departmentName}>
                              {dept.departmentName}
                            </option>
                          ))}
                        </select>
                        {errors.department && <div className="invalid-feedback">{errors.department}</div>}
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

                    <div className="col-md-6 password-field">
                      <label htmlFor="password" className="form-label">Password <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          name="password"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          disabled
                        />
                        <span className="input-group-text not-allowed-icon" style={{display: showNotAllowedIcon ? 'block' : 'none'}}>
                          <i className="bi bi-x-circle text-danger" title="Password is fixed and cannot be changed"></i>
                        </span>
                      </div>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
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
                          disabled
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



                {/* Action Buttons */}
                <div className="row mt-4">
                  <div className="col-12">
                    {activeTab === 'account' ? (
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
                      <button type="button" className="btn btn-primary me-2" onClick={() => handleTabChange('account')}>
                        <i className="bi bi-arrow-right me-2"></i>Next
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      <i className="bi bi-x-circle me-2"></i>Cancel
                    </button>
                  </div>
                </div>
              </form>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;