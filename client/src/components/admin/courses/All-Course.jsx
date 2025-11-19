import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../../redux/slices/courseSlice';
import '../../../css/dashboard.css';

const AllCourse = () => {
		const navigate = useNavigate();
		const dispatch = useDispatch();
		const { courses, loading, error, pagination } = useSelector(state => state.course);
		const [currentPage, setCurrentPage] = useState(pagination?.page ?? 1);
		const [limit, setLimit] = useState(pagination?.limit ?? 6);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [filters, setFilters] = useState({
		department: '',
		semester: '',
		status: '',
	});
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [showModal, setShowModal] = useState(false);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500); // 500ms delay

		return () => clearTimeout(timer);
	}, [searchTerm]);

		// fetch courses when page, limit, or filters change
		useEffect(() => {
			const offset = (currentPage - 1) * limit;
			// Build query params with filters
			const params = {
				limit,
				offset,
				...(filters.department && { department: filters.department }),
				...(filters.semester && { semester: filters.semester }),
				...(filters.status && { status: filters.status }),
				...(debouncedSearchTerm && { search: debouncedSearchTerm }),
			};
			dispatch(fetchCourses(params));
		}, [dispatch, currentPage, limit, filters, debouncedSearchTerm]);

		// DOM effects for lazy loading images and checkbox behavior when courses change
		useEffect(() => {
			// Lazy load images that are not immediately visible
			const images = document.querySelectorAll('img[src*="unsplash"], img[src*="ui-avatars"], img[src*="/images/"]');
			images.forEach(img => {
				if (!img.hasAttribute('loading')) {
					img.setAttribute('loading', 'lazy');
				}
			});

			// Select all checkbox functionality
			const selectAll = document.getElementById('selectAll');
			const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');

			const onSelectAllChange = function () {
				checkboxes.forEach(checkbox => {
					checkbox.checked = this.checked;
				});
			};

			const onCheckboxChange = function () {
				const allChecked = Array.from(checkboxes).every(cb => cb.checked);
				const someChecked = Array.from(checkboxes).some(cb => cb.checked);

				if (selectAll) {
					selectAll.checked = allChecked;
					selectAll.indeterminate = !allChecked && someChecked;
				}
			};

			if (selectAll) selectAll.addEventListener('change', onSelectAllChange);
			checkboxes.forEach(cb => cb.addEventListener('change', onCheckboxChange));

			// PerformanceObserver for LCP (non-critical)
			let observer;
			if ('PerformanceObserver' in window) {
				try {
					observer = new PerformanceObserver((list) => {
						for (const entry of list.getEntries()) {
							console.log('LCP:', entry.startTime, 'ms');
						}
					});
					observer.observe({ type: 'largest-contentful-paint', buffered: true });
				} catch (e) {
					// ignore
				}
			}

			return () => {
				if (selectAll) selectAll.removeEventListener('change', onSelectAllChange);
				checkboxes.forEach(cb => cb.removeEventListener('change', onCheckboxChange));
				if (observer && observer.disconnect) observer.disconnect();
			};
		}, [courses]);

	// Handle filter changes
	const handleFilterChange = (e) => {
		const { id, value } = e.target;
		setFilters(prev => ({
			...prev,
			[id.replace('Filter', '')]: value,
		}));
		// Reset to page 1 when filter changes
		setCurrentPage(1);
	};

	// Handle search
	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		// Reset to page 1 when search changes
		setCurrentPage(1);
	};

	// Handle clear filters
	const handleClearFilters = () => {
		setFilters({
			department: '',
			semester: '',
			status: '',
		});
		setSearchTerm('');
		setCurrentPage(1);
	};

	// Handle delete course
	const handleDelete = (id) => {
		if (window.confirm('Are you sure you want to delete this course?')) {
			dispatch(deleteCourse(id));
		}
	};

	// Handle view course details
	const handleViewCourse = (course) => {
		setSelectedCourse(course);
		setShowModal(true);
	};

	// Close modal
	const closeModal = () => {
		setShowModal(false);
		setSelectedCourse(null);
	};

	return (
		<div className="container-fluid">
			{/* Error Alert */}
			{error && (
				<div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
					<i className="bi bi-exclamation-triangle me-2" />
					<strong>Error:</strong> {error}
					<button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
				</div>
			)}

			{/* Page Header */}
			<div className="mb-3">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						<h1 className="h3 font-bold mb-1">All Courses</h1>
						<p className="text-muted">Manage your institution's course catalog</p>
					</div>
					<div>
						<button className="btn btn-primary" onClick={() => navigate('/add-course')}>
							<i className="bi bi-plus-circle me-2" /> Add New Course
						</button>
						<button className="btn btn-outline-secondary ms-2">
							<i className="bi bi-download me-2" /> Export
						</button>
					</div>
				</div>
			</div>

		{/* Stats Row (dynamic) */}
		{(() => {
			// Ensure courses is an array
			const courseArray = Array.isArray(courses) ? courses : [];
			const totalCourses = pagination?.total ?? courseArray.length;
			const activeCourses = courseArray.filter(c => (c.courseStatus || '').toLowerCase() === 'active').length;
			const totalCapacity = courseArray.reduce((sum, c) => sum + (Number(c.maxStudents) || 0), 0);
			const avgCapacity = courseArray.length ? Math.round(totalCapacity / courseArray.length) : 0;

			return (
				<div className="dashboard-grid grid-cols-4 mb-3">
					<div className="stats-card">
						<div className="stats-card-label">Total Courses</div>
						<div className="stats-card-value">{totalCourses}</div>
						<span className="stats-card-change positive">{totalCourses > 0 ? `·` : ''}</span>
					</div>
					<div className="stats-card">
						<div className="stats-card-label">Active Courses</div>
						<div className="stats-card-value">{activeCourses}</div>
						<span className="stats-card-change positive">{activeCourses > 0 ? `·` : ''}</span>
					</div>
					<div className="stats-card">
						<div className="stats-card-label">Total Capacity</div>
						<div className="stats-card-value">{totalCapacity}</div>
						<span className="stats-card-change positive">capacity</span>
					</div>
					<div className="stats-card">
						<div className="stats-card-label">Avg. Capacity</div>
						<div className="stats-card-value">{avgCapacity}</div>
						<span className="stats-card-change negative">per course</span>
					</div>
				</div>
			);
		})()}			{/* Filters Row */}
			<div className="dashboard-card mb-3">
				<div className="dashboard-grid grid-cols-4 mb-3">
					<div>
						<label htmlFor="departmentFilter" className="form-label small">Department</label>
						<select 
							className="form-select" 
							id="departmentFilter"
							value={filters.department}
							onChange={handleFilterChange}
						>
							<option value="">All Departments</option>
							<option value="cs">Computer Science</option>
							<option value="math">Mathematics</option>
							<option value="physics">Physics</option>
							<option value="chemistry">Chemistry</option>
							<option value="biology">Biology</option>
						</select>
					</div>
					<div>
						<label htmlFor="semesterFilter" className="form-label small">Semester</label>
						<select 
							className="form-select" 
							id="semesterFilter"
							value={filters.semester}
							onChange={handleFilterChange}
						>
							<option value="">All Semesters</option>
							<option value="fall2025">Fall 2025</option>
							<option value="spring2025">Spring 2025</option>
							<option value="summer2025">Summer 2025</option>
						</select>
					</div>
					<div>
						<label htmlFor="statusFilter" className="form-label small">Status</label>
						<select 
							className="form-select" 
							id="statusFilter"
							value={filters.status}
							onChange={handleFilterChange}
						>
							<option value="">All Status</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="completed">Completed</option>
						</select>
					</div>
					<div>
						<label htmlFor="searchFilter" className="form-label small">Search</label>
						<input 
							type="text" 
							className="form-control" 
							id="searchFilter" 
							placeholder="Search courses..."
							value={searchTerm}
							onChange={handleSearch}
						/>
					</div>
				</div>
			</div>

			{/* Courses Table */}
			<div className="dashboard-card">
				<div className="table-responsive">
					<table className="table table-hover align-middle">
						<thead>
							<tr>
								<th scope="col">
									<input className="form-check-input" type="checkbox" id="selectAll" />
								</th>
								<th scope="col">Course Code</th>
								<th scope="col">Course Name</th>
								<th scope="col">Department</th>
								<th scope="col">Professor</th>
								<th scope="col">Credits</th>
								<th scope="col">Students</th>
								<th scope="col">Status</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{/* Dynamic rows from Redux store */}
							{loading ? (
								<tr>
									<td colSpan={9} className="text-center py-4">
										<div className="spinner-border text-primary" role="status">
											<span className="visually-hidden">Loading...</span>
										</div>
									</td>
								</tr>
							) : error ? (
								<tr>
									<td colSpan={9} className="text-center text-danger py-4">{error}</td>
								</tr>
							) : (courses && courses.length > 0) ? (
								courses.map(course => {
									let imgSrc;
									if (course.courseImage) {
										const ci = String(course.courseImage).trim();
										if (/^https?:\/\//i.test(ci) || /^\/\//.test(ci)) {
											imgSrc = ci;
										} else if (ci.startsWith('/')) {
											imgSrc = ci;
										} else {
											imgSrc = `http://localhost:5000/images/${ci}`;
										}
									} else {
										imgSrc = `https://images.unsplash.com/photo-1522227802361-1a7a9d6f0f6b?w=50&h=50&fit=crop`;
									}
									const professorName = course.professorName || 'Unknown';
									const studentsCount = course.maxStudents ?? 0;
									const progressPct = studentsCount ? 0 : 0; // replace with actual enrolled/ max if available
									const status = (course.courseStatus || '').toLowerCase();
									const statusClass = status === 'active' ? 'bg-success' : status === 'full' ? 'bg-warning' : status === 'inactive' ? 'bg-secondary' : 'bg-secondary';

									return (
										<tr key={course.id}>
											<td><input className="form-check-input" type="checkbox" /></td>
											<td className="fw-semibold">{course.courseCode}</td>
											<td>
												<div className="d-flex align-items-center">
													<img src={imgSrc} alt="Course" className="rounded me-3" width="40" height="40" loading="lazy" />
													<div>
														<div className="fw-semibold">{course.courseName}</div>
														<small className="text-muted">
															{(() => {
																try {
																	const cd = course.classDays;
																	if (Array.isArray(cd)) return cd.join(', ');
																	if (typeof cd === 'string') {
																		// try parse JSON string
																		const parsed = JSON.parse(cd);
																		if (Array.isArray(parsed)) return parsed.join(', ');
																	}
																} catch (e) {
																	// ignore parse errors
																}
																return course.semester || '';
															})()}
														</small>
													</div>
												</div>
											</td>
											<td>{course.department}</td>
											<td>
												<div className="d-flex align-items-center">
													<img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(professorName)}&background=6366f1&color=fff`} alt="Professor" className="rounded-circle me-2" width="30" height="30" loading="lazy" />
													<span>{professorName}</span>
												</div>
											</td>
											<td>{course.credits}</td>
											<td>
												<div className="d-flex align-items-center">
													<span>{studentsCount}</span>
													<div className="progress ms-2" style={{ width: 60, height: 6 }}>
														<div className={`progress-bar bg-success`} role="progressbar" style={{ width: `${progressPct}%` }} aria-valuenow={progressPct} aria-valuemin="0" aria-valuemax="100" />
													</div>
												</div>
											</td>
											<td><span className={`badge ${statusClass}`}>{course.courseStatus || 'N/A'}</span></td>
											<td>
												<div className="dropdown">
													<button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
														<i className="bi bi-three-dots-vertical" />
													</button>
													<ul className="dropdown-menu">
														<li><button className="dropdown-item" onClick={() => handleViewCourse(course)}><i className="bi bi-eye me-2" /> View</button></li>
														<li><button className="dropdown-item" onClick={() => navigate(`/edit-course/${course.id}`)}><i className="bi bi-pencil me-2" /> Edit</button></li>
														<li><a className="dropdown-item" href="#"><i className="bi bi-people me-2" /> Students</a></li>
														<li><hr className="dropdown-divider" /></li>
														<li><a className="dropdown-item text-danger" href="#" onClick={() => handleDelete(course.id)}><i className="bi bi-trash me-2" /> Delete</a></li>
													</ul>
												</div>
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan={9} className="text-center py-4">No courses found.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
					<div className="d-flex justify-content-between align-items-center mt-3">
						<div>
							{(() => {
								const total = pagination?.total ?? (courses ? courses.length : 0);
								const offset = (currentPage - 1) * limit;
								const start = total === 0 ? 0 : offset + 1;
								const end = Math.min(offset + (courses ? courses.length : 0), total);
								return <p className="text-muted mb-0">Showing {start} to {end} of {total} entries</p>;
							})()}
						</div>
						<nav aria-label="Page navigation">
							<ul className="pagination mb-0">
								{(() => {
									const total = pagination?.total ?? (courses ? courses.length : 0);
									const totalPages = Math.max(1, Math.ceil(total / limit));
									const pages = [];
									for (let p = 1; p <= totalPages; p++) pages.push(p);

									const goto = (p) => (e) => {
										e.preventDefault();
										if (p < 1 || p > totalPages) return;
										setCurrentPage(p);
									};

									return (
										<>
											<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
												<a className="page-link" href="#" onClick={goto(currentPage - 1)}>Previous</a>
											</li>
											{pages.map(p => (
												<li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`} aria-current={p === currentPage ? 'page' : undefined}>
													<a className="page-link" href="#" onClick={goto(p)}>{p}</a>
												</li>
											))}
											<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
												<a className="page-link" href="#" onClick={goto(currentPage + 1)}>Next</a>
											</li>
										</>
									);
								})()}
							</ul>
						</nav>
				</div>
			</div>

			{/* Course Details Modal */}
			{showModal && selectedCourse && (
				<div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Course Details</h5>
								<button type="button" className="btn-close" onClick={closeModal}></button>
							</div>
							<div className="modal-body">
								<div className="row">
									<div className="col-md-4">
										<img
											src={selectedCourse.courseImage ? (
												/^https?:\/\//i.test(selectedCourse.courseImage) || /^\/\//.test(selectedCourse.courseImage) ?
												selectedCourse.courseImage :
												selectedCourse.courseImage.startsWith('/') ?
												selectedCourse.courseImage :
												`http://localhost:5000/images/${selectedCourse.courseImage}`
											) : 'https://images.unsplash.com/photo-1522227802361-1a7a9d6f0f6b?w=200&h=200&fit=crop'}
											alt="Course"
											className="img-fluid rounded mb-3"
											style={{ width: '100%', height: '200px', objectFit: 'cover' }}
										/>
									</div>
									<div className="col-md-8">
										<h4>{selectedCourse.courseName}</h4>
										<p className="text-muted">{selectedCourse.courseCode}</p>
										<div className="row">
											<div className="col-sm-6">
												<p><strong>Department:</strong> {selectedCourse.department}</p>
												<p><strong>Professor:</strong> {selectedCourse.professorName || 'Unknown'}</p>
												<p><strong>Credits:</strong> {selectedCourse.credits}</p>
											</div>
											<div className="col-sm-6">
												<p><strong>Semester:</strong> {selectedCourse.semester}</p>
												<p><strong>Status:</strong> <span className={`badge ${selectedCourse.courseStatus?.toLowerCase() === 'active' ? 'bg-success' : selectedCourse.courseStatus?.toLowerCase() === 'inactive' ? 'bg-secondary' : 'bg-warning'}`}>{selectedCourse.courseStatus || 'N/A'}</span></p>
												<p><strong>Max Students:</strong> {selectedCourse.maxStudents || 0}</p>
											</div>
										</div>
										{selectedCourse.classDays && (
											<p><strong>Class Days:</strong> {(() => {
												try {
													const cd = selectedCourse.classDays;
													if (Array.isArray(cd)) return cd.join(', ');
													if (typeof cd === 'string') {
														const parsed = JSON.parse(cd);
														if (Array.isArray(parsed)) return parsed.join(', ');
													}
												} catch (e) {
													// ignore parse errors
												}
												return 'N/A';
											})()}</p>
										)}
										{selectedCourse.description && (
											<div>
												<strong>Description:</strong>
												<p>{selectedCourse.description}</p>
											</div>
										)}
									</div>
								</div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
								<button type="button" className="btn btn-primary" onClick={() => { closeModal(); navigate(`/edit-course/${selectedCourse.id}`); }}>Edit Course</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AllCourse;
