import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/dashboard.css';



const Sidebar = ({ isOpen, collapsed = false }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const isActive = (path) => location.pathname === path;

  const isSubmenuActive = (submenuPaths) => submenuPaths.some(path => location.pathname === path);

  const isStudent = user?.role === 'student';
  const isProfessor = user?.role === 'professor';

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <h5>
              <i className="bi bi-mortarboard-fill"></i>
              <span>Kiaalap</span>
            </h5>
            <button className="sidebar-close" id="sidebarClose">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

      <nav className="sidebar-nav">
        {isStudent ? (
          <>
            <div className="menu-section">
              <div className="menu-section-title">Student</div>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/student-dashboard">
                    <i className="bi bi-house-door"></i>
                    <span>Overview</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/courses">
                    <i className="bi bi-book"></i>
                    <span>Courses</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/attendance">
                    <i className="bi bi-check-circle"></i>
                    <span>Attendance</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/assignments">
                    <i className="bi bi-pencil-square"></i>
                    <span>Assignments</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/grades">
                    <i className="bi bi-graph-up"></i>
                    <span>Grades</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/transcript">
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Transcript</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          </>
        ) : isProfessor ? (
          <>
            <div className="menu-section">
              <div className="menu-section-title">Professor</div>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/professor-dashboard">
                    <i className="bi bi-house-door"></i>
                    <span>Overview</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/assigned-courses">
                    <i className="bi bi-book-half"></i>
                    <span>Assigned Courses</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/professor-grades">
                    <i className="bi bi-graph-up"></i>
                    <span>Grades</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/professor/assignments">
                    <i className="bi bi-pencil-square"></i>
                    <span>Assignments of Students</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/professor/attendance">
                    <i className="bi bi-check-circle"></i>
                    <span>Attendance of Students</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="menu-section">
              <div className="menu-section-title">Main</div>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/dashboard', '/dashboard-1', '/dashboard-2', '/analytics', '/widgets']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#dashboardSubmenu" aria-expanded={isSubmenuActive(['/dashboard', '/dashboard-1', '/dashboard-2', '/analytics', '/widgets'])}>
                    <i className="bi bi-speedometer2"></i>
                    <span>Dashboard</span>
                  </a>
                  <ul id="dashboardSubmenu" className={`submenu collapse ${isSubmenuActive(['/dashboard', '/dashboard-1', '/dashboard-2', '/analytics', '/widgets']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/dashboard">Dashboard v.1</NavLink></li>
                    <li><NavLink className="nav-link" to="/dashboard-1">Dashboard v.2</NavLink></li>
                    <li><NavLink className="nav-link" to="/dashboard-2">Dashboard v.3</NavLink></li>
                    <li><NavLink className="nav-link" to="/analytics">Analytics</NavLink></li>
                    <li><NavLink className="nav-link" to="/widgets">Widgets</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/events">
                    <i className="bi bi-calendar-event"></i>
                    <span>Events</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="menu-section">
              <div className="menu-section-title">Academic</div>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/all-professors', '/add-professor', '/edit-professor', '/professor-profile']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#professorsSubmenu" aria-expanded={isSubmenuActive(['/all-professors', '/add-professor', '/edit-professor', '/professor-profile'])}>
                    <i className="bi bi-person-badge"></i>
                    <span>Professors</span>
                  </a>
                  <ul id="professorsSubmenu" className={`submenu collapse ${isSubmenuActive(['/all-professors', '/add-professor', '/edit-professor', '/professor-profile']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/all-professors">All Professors</NavLink></li>
                    <li><NavLink className="nav-link" to="/add-professor">Add Professor</NavLink></li>
                    <li><NavLink className="nav-link" to="/edit-professor">Edit Professor</NavLink></li>
                    <li><NavLink className="nav-link" to="/professor-profile">Professor Profile</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/all-students', '/add-student', '/edit-student', '/student-profile']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#studentsSubmenu" aria-expanded={isSubmenuActive(['/all-students', '/add-student', '/edit-student', '/student-profile'])}>
                    <i className="bi bi-people"></i>
                    <span>Students</span>
                  </a>
                  <ul id="studentsSubmenu" className={`submenu collapse ${isSubmenuActive(['/all-students', '/add-student', '/edit-student', '/student-profile']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/all-students">All Students</NavLink></li>
                    <li><NavLink className="nav-link" to="/add-student">Add Student</NavLink></li>
                    <li><NavLink className="nav-link" to="/edit-student">Edit Student</NavLink></li>
                    <li><NavLink className="nav-link" to="/student-profile">Student Profile</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/all-courses', '/add-course', '/edit-course', '/course-info', '/course-payment']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#coursesSubmenu" aria-expanded={isSubmenuActive(['/all-courses', '/add-course', '/edit-course', '/course-info', '/course-payment'])}>
                    <i className="bi bi-book"></i>
                    <span>Courses</span>
                  </a>
                  <ul id="coursesSubmenu" className={`submenu collapse ${isSubmenuActive(['/all-courses', '/add-course', '/edit-course', '/course-info', '/course-payment']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/all-courses">All Courses</NavLink></li>
                    <li><NavLink className="nav-link" to="/add-course">Add Course</NavLink></li>
                    <li><NavLink className="nav-link" to="/edit-course">Edit Course</NavLink></li>
                    <li><NavLink className="nav-link" to="/course-info">Course Info</NavLink></li>
                    <li><NavLink className="nav-link" to="/course-payment">Course Payment</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/library-assets', '/add-library-assets', '/edit-library-assets']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#librarySubmenu" aria-expanded={isSubmenuActive(['/library-assets', '/add-library-assets', '/edit-library-assets'])}>
                    <i className="bi bi-journal-bookmark"></i>
                    <span>Library</span>
                  </a>
                  <ul id="librarySubmenu" className={`submenu collapse ${isSubmenuActive(['/library-assets', '/add-library-assets', '/edit-library-assets']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/library-assets">Library Assets</NavLink></li>
                    <li><NavLink className="nav-link" to="/add-library-assets">Add Library Asset</NavLink></li>
                    <li><NavLink className="nav-link" to="/edit-library-assets">Edit Library Asset</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/departments', '/add-department', '/edit-department']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#departmentsSubmenu" aria-expanded={isSubmenuActive(['/departments', '/add-department', '/edit-department'])}>
                    <i className="bi bi-building"></i>
                    <span>Departments</span>
                  </a>
                  <ul id="departmentsSubmenu" className={`submenu collapse ${isSubmenuActive(['/departments', '/add-department', '/edit-department']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/departments">Departments List</NavLink></li>
                    <li><NavLink className="nav-link" to="/add-department">Add Department</NavLink></li>
                    <li><NavLink className="nav-link" to="/edit-department">Edit Department</NavLink></li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="menu-section">
              <div className="menu-section-title">Communication</div>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/mailbox', '/mailbox-compose', '/mailbox-view']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#mailboxSubmenu" aria-expanded={isSubmenuActive(['/mailbox', '/mailbox-compose', '/mailbox-view'])}>
                    <i className="bi bi-envelope"></i>
                    <span>Mailbox</span>
                  </a>
                  <ul id="mailboxSubmenu" className={`submenu collapse ${isSubmenuActive(['/mailbox', '/mailbox-compose', '/mailbox-view']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/mailbox">Inbox</NavLink></li>
                    <li><NavLink className="nav-link" to="/mailbox-compose">Compose</NavLink></li>
                    <li><NavLink className="nav-link" to="/mailbox-view">View Message</NavLink></li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="menu-section">
              <div className="menu-section-title">Interface</div>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/buttons', '/alerts', '/modals', '/tabs', '/accordion']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#componentsSubmenu" aria-expanded={isSubmenuActive(['/buttons', '/alerts', '/modals', '/tabs', '/accordion'])}>
                    <i className="bi bi-layout-wtf"></i>
                    <span>Components</span>
                  </a>
                  <ul id="componentsSubmenu" className={`submenu collapse ${isSubmenuActive(['/buttons', '/alerts', '/modals', '/tabs', '/accordion']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/buttons">Buttons</NavLink></li>
                    <li><NavLink className="nav-link" to="/alerts">Alerts</NavLink></li>
                    <li><NavLink className="nav-link" to="/modals">Modals</NavLink></li>
                    <li><NavLink className="nav-link" to="/tabs">Tabs</NavLink></li>
                    <li><NavLink className="nav-link" to="/accordion">Accordion</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/basic-form-element', '/advance-form-element', '/password-meter', '/multi-upload', '/images-cropper']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#formsSubmenu" aria-expanded={isSubmenuActive(['/basic-form-element', '/advance-form-element', '/password-meter', '/multi-upload', '/images-cropper'])}>
                    <i className="bi bi-card-list"></i>
                    <span>Forms</span>
                  </a>
                  <ul id="formsSubmenu" className={`submenu collapse ${isSubmenuActive(['/basic-form-element', '/advance-form-element', '/password-meter', '/multi-upload', '/images-cropper']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/basic-form-element">Basic Forms</NavLink></li>
                    <li><NavLink className="nav-link" to="/advance-form-element">Advanced Forms</NavLink></li>
                    <li><NavLink className="nav-link" to="/password-meter">Password Meter</NavLink></li>
                    <li><NavLink className="nav-link" to="/multi-upload">File Upload</NavLink></li>
                    <li><NavLink className="nav-link" to="/images-cropper">Image Cropper</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/line-charts', '/area-charts', '/bar-charts', '/c3', '/peity', '/rounded-chart']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#chartsSubmenu" aria-expanded={isSubmenuActive(['/line-charts', '/area-charts', '/bar-charts', '/c3', '/peity', '/rounded-chart'])}>
                    <i className="bi bi-bar-chart"></i>
                    <span>Charts</span>
                  </a>
                  <ul id="chartsSubmenu" className={`submenu collapse ${isSubmenuActive(['/line-charts', '/area-charts', '/bar-charts', '/c3', '/peity', '/rounded-chart']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/line-charts">Line Charts</NavLink></li>
                    <li><NavLink className="nav-link" to="/area-charts">Area Charts</NavLink></li>
                    <li><NavLink className="nav-link" to="/bar-charts">Bar Charts</NavLink></li>
                    <li><NavLink className="nav-link" to="/c3">C3 Charts</NavLink></li>
                    <li><NavLink className="nav-link" to="/peity">Peity Charts</NavLink></li>
                    <li><NavLink className="nav-link" to="/rounded-chart">Rounded Charts</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/static-table', '/data-table']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#tablesSubmenu" aria-expanded={isSubmenuActive(['/static-table', '/data-table'])}>
                    <i className="bi bi-table"></i>
                    <span>Tables</span>
                  </a>
                  <ul id="tablesSubmenu" className={`submenu collapse ${isSubmenuActive(['/static-table', '/data-table']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/static-table">Static Tables</NavLink></li>
                    <li><NavLink className="nav-link" to="/data-table">Data Tables</NavLink></li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="menu-section">
              <div className="menu-section-title">Developer Tools</div>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/code-editor">
                    <i className="bi bi-code-slash"></i>
                    <span>Code Editor</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/preloader', '/notifications', '/tree-view']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#uiToolsSubmenu" aria-expanded={isSubmenuActive(['/preloader', '/notifications', '/tree-view'])}>
                    <i className="bi bi-tools"></i>
                    <span>UI Components</span>
                  </a>
                  <ul id="uiToolsSubmenu" className={`submenu collapse ${isSubmenuActive(['/preloader', '/notifications', '/tree-view']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/preloader">Preloaders</NavLink></li>
                    <li><NavLink className="nav-link" to="/notifications">Notifications</NavLink></li>
                    <li><NavLink className="nav-link" to="/tree-view">Tree View</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/pdf-viewer']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#viewersSubmenu" aria-expanded={isSubmenuActive(['/pdf-viewer'])}>
                    <i className="bi bi-eye"></i>
                    <span>Viewers</span>
                  </a>
                  <ul id="viewersSubmenu" className={`submenu collapse ${isSubmenuActive(['/pdf-viewer']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/pdf-viewer">PDF Viewer</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/google-map', '/data-maps']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#mapsSubmenu" aria-expanded={isSubmenuActive(['/google-map', '/data-maps'])}>
                    <i className="bi bi-map"></i>
                    <span>Maps</span>
                  </a>
                  <ul id="mapsSubmenu" className={`submenu collapse ${isSubmenuActive(['/google-map', '/data-maps']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/google-map">Interactive Maps</NavLink></li>
                    <li><NavLink className="nav-link" to="/data-maps">Data Maps</NavLink></li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="menu-section">
              <div className="menu-section-title">Pages</div>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/login', '/register', '/lock', '/password-recovery']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#authSubmenu" aria-expanded={isSubmenuActive(['/login', '/register', '/lock', '/password-recovery'])}>
                    <i className="bi bi-shield-lock"></i>
                    <span>Authentication</span>
                  </a>
                  <ul id="authSubmenu" className={`submenu collapse ${isSubmenuActive(['/login', '/register', '/lock', '/password-recovery']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/login">Login</NavLink></li>
                    <li><NavLink className="nav-link" to="/register">Register</NavLink></li>
                    <li><NavLink className="nav-link" to="/lock">Lock Screen</NavLink></li>
                    <li><NavLink className="nav-link" to="/password-recovery">Forgot Password</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className={`nav-link has-submenu ${isSubmenuActive(['/404', '/500']) ? 'active' : ''}`} href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#errorsSubmenu" aria-expanded={isSubmenuActive(['/404', '/500'])}>
                    <i className="bi bi-exclamation-triangle"></i>
                    <span>Error Pages</span>
                  </a>
                  <ul id="errorsSubmenu" className={`submenu collapse ${isSubmenuActive(['/404', '/500']) ? 'show' : ''} list-unstyled`}>
                    <li><NavLink className="nav-link" to="/404">404 Error</NavLink></li>
                    <li><NavLink className="nav-link" to="/500">500 Error</NavLink></li>
                  </ul>
                </li>
              </ul>
            </div>
          </>
        )}
      </nav>
    </aside>
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`}></div>
  </>
);
};

export default Sidebar;
