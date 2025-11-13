import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfessors, deleteProfessor } from '../../redux/slices/professorSlice';
import { Link } from 'react-router-dom';
import '../../css/dashboard.css';

const AllProfessor = () => {
  const dispatch = useDispatch();
  const { professors, loading, error } = useSelector((state) => state.professor);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const limit = 10; // Items per page

  useEffect(() => {
    dispatch(fetchProfessors({ limit, offset: (currentPage - 1) * limit }));
  }, [dispatch, currentPage]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this professor?')) {
      dispatch(deleteProfessor(id));
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  // Compute stats
  const totalProfessors = professors.length;
  const fullTime = professors.filter(p => p.employmentType === 'Full-Time').length;
  const partTime = professors.filter(p => p.employmentType === 'Part-Time').length;
  const departments = new Set(professors.map(p => p.department)).size;

  // Featured professors (first 4)
  const featuredProfessors = professors.slice(0, 4);

  // Filtered professors
  const filteredProfessors = (professors || []).filter(p => {
    if (!p) return false;
    const name = (p.name || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const department = (p.department || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                          email.includes(searchTerm.toLowerCase()) ||
                          department.includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
                          (filter === 'full-time' && p.employmentType === 'Full-Time') ||
                          (filter === 'part-time' && p.employmentType === 'Part-Time') ||
                          (filter === 'senior' && p.position === 'Professor') ||
                          (filter === 'associate' && p.position === 'Associate Professor') ||
                          (filter === 'assistant' && p.position === 'Assistant Professor');
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredProfessors.length / limit);
  const paginatedProfessors = filteredProfessors.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="dashboard-content">
      <div className="container-fluid">
        {/* Page Header */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 font-bold">All Professors</h1>
              <p className="text-muted text-sm">Manage and view all faculty members in your institution.</p>
            </div>
            <div>
              <Link to="/add-professor" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>Add Professor
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="dashboard-row">
          <div className="dashboard-grid grid-cols-4">
            <div className="stats-card">
              <div className="stats-card-label">Total Professors</div>
              <div className="stats-card-value">{totalProfessors}</div>
              <span className="stats-card-change positive">+12 this month</span>
            </div>
            <div className="stats-card">
              <div className="stats-card-label">Full-Time</div>
              <div className="stats-card-value">{fullTime}</div>
              <span className="stats-card-change positive">+5 this month</span>
            </div>
            <div className="stats-card">
              <div className="stats-card-label">Part-Time</div>
              <div className="stats-card-value">{partTime}</div>
              <span className="stats-card-change positive">+7 this month</span>
            </div>
            <div className="stats-card">
              <div className="stats-card-label">Departments</div>
              <div className="stats-card-value">{departments}</div>
              <span className="stats-card-change neutral">No change</span>
            </div>
          </div>
        </div>

        {/* Featured Professors Cards */}
        <div className="dashboard-row">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h5 className="dashboard-card-title mb-0">Featured Professors</h5>
              <Link to="#" className="text-primary text-sm">View All</Link>
            </div>
            <div className="dashboard-card-body">
              <div className="dashboard-grid grid-cols-4 gap-4">
                {featuredProfessors.map((prof) => (
                  <div key={prof.id} className="professor-card">
                    <div className="text-center mb-3">
                      <img src={prof.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=0d6efd&color=fff`} alt={prof.name} className="rounded-circle" style={{ width: '80px', height: '80px' }} />
                    </div>
                    <div className="text-center">
                      <h6 className="mb-1">{prof.name}</h6>
                      <p className="text-muted text-sm mb-2">{prof.department}</p>
                      <div className="mb-2">
                        <span className={`badge ${prof.employmentType === 'Full-Time' ? 'bg-success' : 'bg-warning'}`}>{prof.employmentType}</span>
                      </div>
                      <div className="text-warning mb-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i key={i} className={`bi ${i < Math.floor(prof.rating || 4.5) ? 'bi-star-fill' : i < (prof.rating || 4.5) ? 'bi-star-half' : 'bi-star'}`}></i>
                        ))}
                        <span className="text-muted text-sm">({prof.rating || 4.5})</span>
                      </div>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link to={`/professor-profile/${prof.id}`} className="btn btn-sm btn-outline-primary">View</Link>
                        <Link to={`/edit-professor/${prof.id}`} className="btn btn-sm btn-outline-secondary">Edit</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Professors Table */}
        <div className="dashboard-row">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="dashboard-card-title mb-0">Professors Directory</h5>
                <div className="d-flex gap-2">
                  <div className="dropdown">
                    <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      <i className="bi bi-funnel me-1"></i>Filter
                    </button>
                    <ul className="dropdown-menu">
                      <li><a className="dropdown-item" href="#" onClick={() => setFilter('all')}>All Professors</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setFilter('full-time')}>Full-Time</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setFilter('part-time')}>Part-Time</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setFilter('senior')}>Senior Level</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setFilter('associate')}>Associate Level</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setFilter('assistant')}>Assistant Level</a></li>
                    </ul>
                  </div>
                  <div className="input-group" style={{ width: '250px' }}>
                    <input type="text" className="form-control form-control-sm" placeholder="Search professors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button className="btn btn-outline-secondary btn-sm" type="button">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="border-0">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="selectAll" />
                        </div>
                      </th>
                      <th scope="col" className="border-0">Professor</th>
                      <th scope="col" className="border-0">Department</th>
                      <th scope="col" className="border-0">Position</th>
                      <th scope="col" className="border-0">Employment Type</th>
                      <th scope="col" className="border-0">Courses</th>
                      <th scope="col" className="border-0">Rating</th>
                      <th scope="col" className="border-0">Status</th>
                      <th scope="col" className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProfessors.map((prof) => (
                      <tr key={prof.id}>
                        <td>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={prof.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=0d6efd&color=fff`} alt={prof.name} className="rounded-circle me-3" style={{ width: '40px', height: '40px' }} />
                            <div>
                              <div className="fw-medium">{prof.name}</div>
                              <small className="text-muted">{prof.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>{prof.department}</td>
                        <td>{prof.position}</td>
                        <td><span className={`badge ${prof.employmentType === 'Full-Time' ? 'bg-success' : 'bg-warning'}`}>{prof.employmentType}</span></td>
                        <td>{prof.courses || 0} courses</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-1">{prof.rating || 4.5}</span>
                            <div className="text-warning">
                              {Array.from({ length: 5 }, (_, i) => (
                                <i key={i} className={`bi ${i < Math.floor(prof.rating || 4.5) ? 'bi-star-fill' : i < (prof.rating || 4.5) ? 'bi-star-half' : 'bi-star'}`}></i>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge ${prof.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>{prof.status || 'Active'}</span></td>
                        <td>
                          <div className="dropdown">
                            <button className="btn btn-link text-decoration-none p-1" type="button" data-bs-toggle="dropdown">
                              <i className="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              <li><Link className="dropdown-item" to={`/professor-profile/${prof.id}`}><i className="bi bi-eye me-2"></i>View Profile</Link></li>
                              <li><Link className="dropdown-item" to={`/edit-professor/${prof.id}`}><i className="bi bi-pencil me-2"></i>Edit</Link></li>
                              <li><a className="dropdown-item" href="#"><i className="bi bi-envelope me-2"></i>Send Message</a></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><a className="dropdown-item text-danger" href="#" onClick={() => handleDelete(prof.id)}><i className="bi bi-trash me-2"></i>Remove</a></li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="dashboard-card-footer">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, filteredProfessors.length)} of {filteredProfessors.length} professors</small>
                </div>
                <nav aria-label="Professors pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProfessor;
