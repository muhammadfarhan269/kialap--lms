import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllStudents } from '../../../redux/slices/studentSlice';
import { fetchDepartments } from '../../../redux/slices/departmentSlice';


const AllStudents = () => {
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector((state) => state.student);
  const { departments } = useSelector((state) => state.department);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  const studentsPerPage = 12; // Assuming 4 columns x 3 rows

  useEffect(() => {
    dispatch(fetchAllStudents({ limit: 100, offset: 0 })); // Fetch more students for client-side filtering
    dispatch(fetchDepartments()); // Fetch departments for filtering
  }, [dispatch]);

  // Create list of departments that have students
  useEffect(() => {
    if (students.length > 0) {
      const uniqueDepartments = [...new Set(students.map(student => student.department))];
      setAvailableDepartments(uniqueDepartments);
    }
  }, [students]);

  useEffect(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (selectedDepartment !== 'All Departments') {
      filtered = filtered.filter(student => student.department.toLowerCase() === selectedDepartment.toLowerCase());
    }

    // Filter by year (assuming year is derived from student_id or another field)
    if (selectedYear !== 'All Years') {
      // This is a placeholder - you might need to adjust based on your data structure
      filtered = filtered.filter(student => {
        // Assuming student_id contains year info, e.g., "CS2024001" for 2024
        const year = student.student_id.substring(2, 6);
        return year === selectedYear.replace(' Year', '');
      });
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [students, searchTerm, selectedDepartment, selectedYear]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };



  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="container-fluid">
          <div className="alert alert-danger">
            Failed to load students. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="container-fluid">
        {/* Page Header */}
        <div className="dashboard-row">
          <div className="dashboard-grid grid-cols-1">
            <div className="dashboard-card">
              <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h4 className="dashboard-card-title mb-0">All Students</h4>
                <Link to="/add-student" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>Add New Student
                </Link>
              </div>
              <div className="dashboard-card-body">
                {/* Search and Filter */}
                <div className="row gx-3 gy-2 mb-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-search"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option>All Departments</option>
                      {availableDepartments.map(dept => {
                        const departmentInfo = departments.find(d => d.departmentCode === dept);
                        return (
                          <option key={dept} value={dept}>
                            {departmentInfo ? departmentInfo.departmentName : dept}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option>All Years</option>
                      <option>First Year</option>
                      <option>Second Year</option>
                      <option>Third Year</option>
                      <option>Fourth Year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="row">
          {currentStudents.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No students found.</div>
            </div>
          ) : (
            currentStudents.map(student => {
              const age = calculateAge(student.date_of_birth);
              const profileImage = student.profile_image
                ? `http://localhost:5000/images/${student.profile_image}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&background=6366f1&color=fff`;

              return (
                <div key={student.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <div className="dashboard-card h-100">
                    <div className="dashboard-card-body text-center">
                      <img
                        src={profileImage}
                        alt={student.full_name}
                        className="rounded-circle mb-3"
                        width="100"
                        height="100"
                        loading="lazy"
                      />
                      <h5 className="mb-1">{student.full_name}</h5>
                      <p className="text-muted mb-2">{student.department}</p>
                      <p className="text-muted small mb-3"><strong>Age:</strong> {age} Years</p>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link to={`/student-profile/${student.id}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye"></i> View
                        </Link>
                        <Link to={`/edit-student/${student.id}`} className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-pencil"></i> Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="row mt-4">
            <div className="col-12">
              <nav aria-label="Student pagination">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {renderPagination()}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default AllStudents;
