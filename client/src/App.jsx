import React from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LockPage from './pages/auth/LockPage'
import Logout from './components/auth/Logout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Error404 from './components/error/404'
import Error500 from './components/error/500'
import Layout from './pages/layouts/Layout'
import AddStudentPage from './pages/student/AddStudentPage'
import AllStudentPage from './pages/student/AllStudentPage'
import EditStudentPage from './pages/student/EditStudentPage'
function App() {

  return (
      <Router>
        <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password-recovery" element={<ForgotPasswordPage />} />
        <Route path="/lock" element={<LockPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><div>Dashboard v.1</div></Layout></ProtectedRoute>} />
        <Route path="/dashboard-1" element={<ProtectedRoute><Layout><div>Dashboard v.2</div></Layout></ProtectedRoute>} />
        <Route path="/dashboard-2" element={<ProtectedRoute><Layout><div>Dashboard v.3</div></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Layout><div>Analytics</div></Layout></ProtectedRoute>} />
        <Route path="/widgets" element={<ProtectedRoute><Layout><div>Widgets</div></Layout></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Layout><div>Events</div></Layout></ProtectedRoute>} />
        <Route path="/all-professors" element={<ProtectedRoute><Layout><div>All Professors</div></Layout></ProtectedRoute>} />
        <Route path="/add-professor" element={<ProtectedRoute><Layout><div>Add Professor</div></Layout></ProtectedRoute>} />
        <Route path="/edit-professor" element={<ProtectedRoute><Layout><div>Edit Professor</div></Layout></ProtectedRoute>} />
        <Route path="/professor-profile" element={<ProtectedRoute><Layout><div>Professor Profile</div></Layout></ProtectedRoute>} />
        <Route path="/all-students" element={<ProtectedRoute><AllStudentPage /></ProtectedRoute>} />
        <Route path="/add-student" element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>} />
        <Route path="/edit-student/:id" element={<ProtectedRoute><EditStudentPage /></ProtectedRoute>} />
        <Route path="/student-profile" element={<ProtectedRoute><Layout><div>Student Profile</div></Layout></ProtectedRoute>} />
        <Route path="/all-courses" element={<ProtectedRoute><Layout><div>All Courses</div></Layout></ProtectedRoute>} />
        <Route path="/add-course" element={<ProtectedRoute><Layout><div>Add Course</div></Layout></ProtectedRoute>} />
        <Route path="/edit-course" element={<ProtectedRoute><Layout><div>Edit Course</div></Layout></ProtectedRoute>} />
        <Route path="/course-info" element={<ProtectedRoute><Layout><div>Course Info</div></Layout></ProtectedRoute>} />
        <Route path="/course-payment" element={<ProtectedRoute><Layout><div>Course Payment</div></Layout></ProtectedRoute>} />
        <Route path="/library-assets" element={<ProtectedRoute><Layout><div>Library Assets</div></Layout></ProtectedRoute>} />
        <Route path="/add-library-assets" element={<ProtectedRoute><Layout><div>Add Library Asset</div></Layout></ProtectedRoute>} />
        <Route path="/edit-library-assets" element={<ProtectedRoute><Layout><div>Edit Library Asset</div></Layout></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute><Layout><div>Departments List</div></Layout></ProtectedRoute>} />
        <Route path="/add-department" element={<ProtectedRoute><Layout><div>Add Department</div></Layout></ProtectedRoute>} />
        <Route path="/edit-department" element={<ProtectedRoute><Layout><div>Edit Department</div></Layout></ProtectedRoute>} />
        <Route path="/mailbox" element={<ProtectedRoute><Layout><div>Inbox</div></Layout></ProtectedRoute>} />
        <Route path="/mailbox-compose" element={<ProtectedRoute><Layout><div>Compose</div></Layout></ProtectedRoute>} />
        <Route path="/mailbox-view" element={<ProtectedRoute><Layout><div>View Message</div></Layout></ProtectedRoute>} />
        <Route path="/buttons" element={<ProtectedRoute><Layout><div>Buttons</div></Layout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Layout><div>Alerts</div></Layout></ProtectedRoute>} />
        <Route path="/modals" element={<ProtectedRoute><Layout><div>Modals</div></Layout></ProtectedRoute>} />
        <Route path="/tabs" element={<ProtectedRoute><Layout><div>Tabs</div></Layout></ProtectedRoute>} />
        <Route path="/accordion" element={<ProtectedRoute><Layout><div>Accordion</div></Layout></ProtectedRoute>} />
        <Route path="/basic-form-element" element={<ProtectedRoute><Layout><div>Basic Forms</div></Layout></ProtectedRoute>} />
        <Route path="/advance-form-element" element={<ProtectedRoute><Layout><div>Advanced Forms</div></Layout></ProtectedRoute>} />
        <Route path="/password-meter" element={<ProtectedRoute><Layout><div>Password Meter</div></Layout></ProtectedRoute>} />
        <Route path="/multi-upload" element={<ProtectedRoute><Layout><div>File Upload</div></Layout></ProtectedRoute>} />
        <Route path="/images-cropper" element={<ProtectedRoute><Layout><div>Image Cropper</div></Layout></ProtectedRoute>} />
        <Route path="/line-charts" element={<ProtectedRoute><Layout><div>Line Charts</div></Layout></ProtectedRoute>} />
        <Route path="/area-charts" element={<ProtectedRoute><Layout><div>Area Charts</div></Layout></ProtectedRoute>} />
        <Route path="/bar-charts" element={<ProtectedRoute><Layout><div>Bar Charts</div></Layout></ProtectedRoute>} />
        <Route path="/c3" element={<ProtectedRoute><Layout><div>C3 Charts</div></Layout></ProtectedRoute>} />
        <Route path="/peity" element={<ProtectedRoute><Layout><div>Peity Charts</div></Layout></ProtectedRoute>} />
        <Route path="/rounded-chart" element={<ProtectedRoute><Layout><div>Rounded Charts</div></Layout></ProtectedRoute>} />
        <Route path="/static-table" element={<ProtectedRoute><Layout><div>Static Tables</div></Layout></ProtectedRoute>} />
        <Route path="/data-table" element={<ProtectedRoute><Layout><div>Data Tables</div></Layout></ProtectedRoute>} />
        <Route path="/code-editor" element={<ProtectedRoute><Layout><div>Code Editor</div></Layout></ProtectedRoute>} />
        <Route path="/preloader" element={<ProtectedRoute><Layout><div>Preloaders</div></Layout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Layout><div>Notifications</div></Layout></ProtectedRoute>} />
        <Route path="/tree-view" element={<ProtectedRoute><Layout><div>Tree View</div></Layout></ProtectedRoute>} />
        <Route path="/pdf-viewer" element={<ProtectedRoute><Layout><div>PDF Viewer</div></Layout></ProtectedRoute>} />
        <Route path="/google-map" element={<ProtectedRoute><Layout><div>Interactive Maps</div></Layout></ProtectedRoute>} />
        <Route path="/data-maps" element={<ProtectedRoute><Layout><div>Data Maps</div></Layout></ProtectedRoute>} />
        <Route path="/login" element={<ProtectedRoute><Layout><div>Login</div></Layout></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute><Layout><div>Register</div></Layout></ProtectedRoute>} />
        <Route path="/lock" element={<ProtectedRoute><Layout><div>Lock Screen</div></Layout></ProtectedRoute>} />
        <Route path="/password-recovery" element={<ProtectedRoute><Layout><div>Forgot Password</div></Layout></ProtectedRoute>} />
        <Route path="/404" element={<Error404 />} />
        <Route path="/500" element={<Error500 />} />
        </Routes>
      </Router>
  )
}

export default App
