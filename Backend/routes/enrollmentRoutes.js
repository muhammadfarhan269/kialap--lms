const express = require('express');
const router = express.Router();
const {
  enrollStudent,
  unenrollStudent,
  getStudentEnrollments,
  getCourseEnrollments,
  checkEnrollment
} = require('../controller/enrollmentController');

const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyStudent = require('../middleware/verifyStudent');

// All routes require authentication
router.use(verifyJWT);

// Student routes - allow both student role and any authenticated user
router.post('/', verifyStudent, enrollStudent);
router.delete('/:id', verifyStudent, unenrollStudent);
router.get('/student', getStudentEnrollments);  // Allow any authenticated user
router.get('/check/:courseId', checkEnrollment);  // Allow any authenticated user

// Admin/Professor routes for viewing enrollments
router.get('/course/:courseId', verifyAdmin, getCourseEnrollments);

module.exports = router;
