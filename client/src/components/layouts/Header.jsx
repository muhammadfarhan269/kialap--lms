import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const generateBreadcrumb = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(segment => segment);
    const breadcrumb = [{ title: 'Home', url: '/' }];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const title = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      breadcrumb.push({ title, url: currentPath });
    });

    return breadcrumb;
  };

  const breadcrumb = generateBreadcrumb();

  return (
    <nav className="navbar top-navbar">
      <div className="container-fluid d-flex align-items-center h-100">
        {/* Hamburger Menu */}
        <button className="hamburger-menu d-lg-none" id="sidebarToggle" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>

        {/* Breadcrumb for desktop */}
        <nav aria-label="breadcrumb" className="d-none d-lg-block ms-3">
          <ol className="breadcrumb mb-0">
            {breadcrumb.map((item, index) => (
              <li key={index} className={`breadcrumb-item ${index === breadcrumb.length - 1 ? 'active' : ''}`}>
                {index === breadcrumb.length - 1 ? (
                  item.title
                ) : (
                  <NavLink to={item.url}>{item.title}</NavLink>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Logo for mobile */}
        <div className="navbar-brand d-lg-none fw-bold me-auto">Kiaalap</div>

        {/* Spacer for desktop */}
        <div className="flex-grow-1 d-none d-lg-block"></div>

        {/* Right Actions */}
        <div className="d-flex align-items-center gap-2">
          {/* Search */}
          <div className="search-container">
            <button className="btn btn-light btn-icon" id="searchToggle" onClick={toggleSearch}>
              <i className="bi bi-search"></i>
            </button>

            <form className={`search-form ${searchOpen ? 'open' : ''}`} id="searchForm">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="form-control"
                id="searchInput"
                placeholder="Search..."
                data-bs-toggle="dropdown"
              />
              <button type="button" className="close-search" id="closeSearch" onClick={closeSearch}>
                <i className="bi bi-x-lg"></i>
              </button>

              <ul className="dropdown-menu w-100 mt-2">
                <li><a className="dropdown-item" href="#">Student Registration</a></li>
                <li><a className="dropdown-item" href="#">Course Management</a></li>
                <li><a className="dropdown-item" href="#">Grade Submission</a></li>
                <li><a className="dropdown-item" href="#">Faculty Directory</a></li>
                <li><a className="dropdown-item" href="#">Library Resources</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#">Advanced Search</a></li>
              </ul>
            </form>
          </div>

          {/* Notifications */}
          <div className="dropdown">
            <button className="btn btn-light btn-icon position-relative" data-bs-toggle="dropdown" id="notificationsToggle">
              <i className="bi bi-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>3</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" style={{ width: '320px' }}>
              <li className="dropdown-header d-flex align-items-center justify-content-between">
                <span>Notifications</span>
                <small className="text-muted">3 new</small>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item py-2" href="#">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-calendar-check text-primary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">New Event</div>
                      <div className="text-muted small">Science Fair on March 15</div>
                      <div className="text-muted small">5 minutes ago</div>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item py-2" href="#">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-check-circle text-success"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">Assignment Submitted</div>
                      <div className="text-muted small">John submitted his project</div>
                      <div className="text-muted small">2 hours ago</div>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item py-2" href="#">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-exclamation-triangle text-warning"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">System Alert</div>
                      <div className="text-muted small">Database backup completed</div>
                      <div className="text-muted small">Yesterday</div>
                    </div>
                  </div>
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item text-center" href="notifications.html">
                  <small>View all notifications</small>
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="dropdown">
            <button className="btn btn-light btn-icon" data-bs-toggle="dropdown">
              <i className="bi bi-plus-lg"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="add-student.html"><i className="bi bi-person-plus me-2"></i>Add Student</a></li>
              <li><a className="dropdown-item" href="add-course.html"><i className="bi bi-book me-2"></i>Add Course</a></li>
              <li><a className="dropdown-item" href="add-professor.html"><i className="bi bi-person-badge me-2"></i>Add Professor</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#"><i className="bi bi-calendar-plus me-2"></i>Schedule Event</a></li>
            </ul>
          </div>

          {/* User Menu */}
          <div className="dropdown">
            <button className="btn btn-light d-flex align-items-center" data-bs-toggle="dropdown">
              <div className="user-avatar me-2">
                <img
                  src={`https://ui-avatars.com/api/?name=Admin User&background=6366f1&color=fff&size=32`}
                  alt="Admin"
                  className="rounded-circle"
                  width="32"
                  height="32"
                />
              </div>
              <span className="d-none d-md-inline">{localStorage.getItem('username') || 'Admin'}</span>
              <i className="bi bi-chevron-down ms-1"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>Profile</a></li>
              <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>Settings</a></li>
              <li><a className="dropdown-item" href="#"><i className="bi bi-question-circle me-2"></i>Help Center</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="/logout"><i className="bi bi-box-arrow-right me-2"></i>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
