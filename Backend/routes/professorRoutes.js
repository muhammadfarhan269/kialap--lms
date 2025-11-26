const express = require('express');
const router = express.Router();
const { addProfessor, getAllProfessors, getProfessorById, updateProfessor, deleteProfessor, upload, getProfessorCourses, getEnrolledStudents } = require('../controller/professorController');
const verifyJWT = require('../middleware/verifyJWT');

// Routes for professor management
router.post('/', verifyJWT, upload, addProfessor);
router.get('/', verifyJWT, getAllProfessors);
router.get('/courses/assigned', verifyJWT, getProfessorCourses);
router.get('/:id', verifyJWT, getProfessorById);
router.put('/:id', verifyJWT, upload, updateProfessor);
router.delete('/:id', verifyJWT, deleteProfessor);

module.exports = router;
