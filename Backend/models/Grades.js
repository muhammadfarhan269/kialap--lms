const pool = require('../config/dbConnection');

// Insert a grade record. assessmentId should be the id matching the assessmentType
const createGrade = async ({ studentUuid, courseId, assessmentType, assessmentId, score, maxScore = 100 }) => {
  const columns = ['student_uuid', 'course_id', 'score', 'max_score', 'assessment_type'];
  const values = [studentUuid, courseId, score, maxScore, assessmentType];

  // Validate assessment type
  const validTypes = ['assignment', 'quiz', 'midterm', 'final'];
  if (!validTypes.includes(assessmentType)) {
    throw new Error('Invalid assessment type');
  }

  // Add assessment_id if provided
  if (assessmentId) {
    columns.push('assessment_id');
    values.push(assessmentId);
  }

  const params = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO grades (${columns.join(', ')}) VALUES (${params}) RETURNING *;`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateGrade = async (id, updates = {}) => {
  const set = [];
  const values = [];
  let idx = 1;

  Object.keys(updates).forEach(key => {
    set.push(`${key} = $${idx++}`);
    values.push(updates[key]);
  });
  if (set.length === 0) return null;
  values.push(id);
  const query = `UPDATE grades SET ${set.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *;`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getGradesByCourse = async (courseId) => {
  const query = `SELECT * FROM grades WHERE course_id = $1 ORDER BY graded_at DESC;`;
  const result = await pool.query(query, [courseId]);
  return result.rows;
};

const getGradesByStudentCourse = async (studentUuid, courseId) => {
  const query = `SELECT * FROM grades WHERE student_uuid = $1 AND course_id = $2 ORDER BY graded_at DESC;`;
  const result = await pool.query(query, [studentUuid, courseId]);
  return result.rows;
};

const getAverageForStudentCourseByType = async (studentUuid, courseId, assessmentType) => {
  const query = `
    SELECT AVG(score) as avg_score, AVG(max_score) as avg_max
    FROM grades
    WHERE student_uuid = $1 AND course_id = $2 AND assessment_type = $3;
  `;
  const result = await pool.query(query, [studentUuid, courseId, assessmentType]);
  return result.rows[0];
};

const deleteGradesByAssessment = async (courseId, assessmentType, assessmentId) => {
  const query = `DELETE FROM grades WHERE course_id = $1 AND assessment_type = $2 AND assessment_id = $3 RETURNING *;`;
  const result = await pool.query(query, [courseId, assessmentType, assessmentId]);
  return result.rows; // return deleted rows for reporting
};

module.exports = {
  createGrade,
  updateGrade,
  getGradesByCourse,
  getGradesByStudentCourse,
  getAverageForStudentCourseByType,
  deleteGradesByAssessment
};
