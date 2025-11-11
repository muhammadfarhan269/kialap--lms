const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controller/studentController');

// All student routes require authentication
router.use(verifyJWT);

// Create a new student (admin only)
router.post('/', verifyAdmin, createStudent);

// Get all students (admin only)
router.get('/', verifyAdmin, getAllStudents);

// Get student by ID
router.get('/:id', getStudentById);

// Update student by ID (admin only)
router.put('/:id', verifyAdmin, updateStudent);

// Delete student by ID (admin only)
router.delete('/:id', verifyAdmin, deleteStudent);

module.exports = router;
