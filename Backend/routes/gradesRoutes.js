const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const verifyRole = require('../middleware/verifyRole');
const { createGrade, updateGrade, getGradesByCourse, getStudentGradesForCourse, getEnrolledStudents, deleteGradesByAssessment, getStudentAllCoursesGrades, getWeightedTotals } = require('../controller/gradesController');

router.use(verifyJWT);
router.post('/', verifyRole('professor'), createGrade);
router.put('/:id', verifyRole('professor'), updateGrade);
router.get('/course/:courseId', verifyRole('professor'), getGradesByCourse);
router.get('/enrolled/:courseId', verifyRole('professor'), getEnrolledStudents);
router.get('/student/:studentUuid/course/:courseId', verifyRole('professor'), getStudentGradesForCourse);
// Get weighted totals for all assessment types for a student in a course
router.get('/weighted-totals/:studentUuid/:courseId', getWeightedTotals);
// allow authenticated students to fetch their own courses + grades
router.get('/student/:studentUuid/all-courses', getStudentAllCoursesGrades);
router.delete('/assessment/:courseId/:assessmentType/:assessmentId', verifyRole('professor'), deleteGradesByAssessment);

module.exports = router;
