const asyncHandler = require('express-async-handler');
const Grades = require('../models/Grades');
const pool = require('../config/dbConnection');

// POST /api/grades
const createGrade = asyncHandler(async (req, res) => {
  const { studentUuid, courseId, assessmentType, assessmentId, score, maxScore } = req.body;
  if (!studentUuid || !courseId || !assessmentType || score === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const grade = await Grades.createGrade({ studentUuid, courseId, assessmentType, assessmentId, score, maxScore });
  res.status(201).json({ success: true, data: grade });
});

// PUT /api/grades/:id
const updateGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const grade = await Grades.updateGrade(id, updates);
  if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
  res.json({ success: true, data: grade });
});

// GET /api/grades/course/:courseId
const getGradesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const grades = await Grades.getGradesByCourse(courseId);
  res.json({ success: true, data: grades });
});

// GET /api/grades/enrolled/:courseId
const getEnrolledStudents = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  const query = `
    SELECT
      e.id,
      e.user_uuid as "userUuid",
      e.course_id as "courseId",
      u.username as "studentName",
      u.email as "studentEmail",
      s.student_id as "studentId",
      s.department as "studentDepartment"
    FROM enrollments e
    JOIN users u ON e.user_uuid = u.uuid
    LEFT JOIN students s ON u.uuid = s.user_uuid
    WHERE e.course_id = $1 AND e.status = 'active'
    ORDER BY u.username ASC
  `;
  
  const result = await pool.query(query, [courseId]);
  res.json({ success: true, data: result.rows });
});

// GET /api/grades/student/:studentUuid/course/:courseId
const getStudentGradesForCourse = asyncHandler(async (req, res) => {
  const { studentUuid, courseId } = req.params;
  const grades = await Grades.getGradesByStudentCourse(studentUuid, courseId);
  res.json({ success: true, data: grades });
});

// DELETE /api/grades/assessment/:courseId/:assessmentType/:assessmentId
const deleteGradesByAssessment = asyncHandler(async (req, res) => {
  const { courseId, assessmentType, assessmentId } = req.params;
  if (!courseId || !assessmentType || !assessmentId) {
    return res.status(400).json({ success: false, message: 'Missing required parameters' });
  }
  if (typeof Grades.deleteGradesByAssessment !== 'function') {
    return res.status(501).json({ success: false, message: 'Server not configured to delete assessment grades' });
  }
  const deleted = await Grades.deleteGradesByAssessment(parseInt(courseId), assessmentType, assessmentId);
  res.json({ success: true, deletedCount: deleted.length, data: deleted });
});

module.exports = { createGrade, updateGrade, getGradesByCourse, getStudentGradesForCourse, getEnrolledStudents, deleteGradesByAssessment };
