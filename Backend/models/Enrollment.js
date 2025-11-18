const pool = require('../config/dbConnection');

const enrollStudentInCourse = async (studentId, courseId) => {
  const query = `
    INSERT INTO enrollments (student_id, course_id, enrollment_date, status)
    VALUES ($1, $2, CURRENT_TIMESTAMP, 'active')
    RETURNING id, student_id, course_id, enrollment_date, status;
  `;
  const result = await pool.query(query, [studentId, courseId]);
  return result.rows[0];
};

const unenrollStudentFromCourse = async (studentId, courseId) => {
  const query = `
    UPDATE enrollments
    SET status = 'dropped'
    WHERE student_id = $1 AND course_id = $2 AND status = 'active'
    RETURNING id, student_id, course_id, status;
  `;
  const result = await pool.query(query, [studentId, courseId]);
  return result.rows[0];
};

const findEnrollmentById = async (id) => {
  const query = `SELECT * FROM enrollments WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const unenrollStudentFromCourseById = async (id) => {
  const query = `
    UPDATE enrollments
    SET status = 'dropped'
    WHERE id = $1 AND status = 'active'
    RETURNING id, student_id, course_id, status;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getEnrollmentsByStudent = async (studentId) => {
  const query = `
    SELECT
      e.id,
      e.student_id,
      e.course_id,
      e.enrollment_date,
      e.status,
      e.grade,
      c.course_code as "courseCode",
      c.course_name as "courseName",
      c.department,
      c.credits,
      c.semester,
      c.course_type as "courseType",
      CONCAT(p.title, ' ', p.first_name, ' ', p.last_name) as "professorName"
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN professors p ON c.professor_id = p.id
    WHERE e.student_id = $1
    ORDER BY e.enrollment_date DESC;
  `;
  const result = await pool.query(query, [studentId]);
  return result.rows;
};

const getEnrollmentsByCourse = async (courseId) => {
  const query = `
    SELECT
      e.id,
      e.student_id,
      e.course_id,
      e.enrollment_date,
      e.status,
      e.grade,
      s.full_name as "studentName",
      s.student_id as "studentId",
      s.email as "studentEmail",
      s.department as "studentDepartment"
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    WHERE e.course_id = $1
    ORDER BY e.enrollment_date DESC;
  `;
  const result = await pool.query(query, [courseId]);
  return result.rows;
};

const isStudentEnrolled = async (studentId, courseId) => {
  const query = `
    SELECT id, status FROM enrollments
    WHERE student_id = $1 AND course_id = $2;
  `;
  const result = await pool.query(query, [studentId, courseId]);
  return result.rows[0];
};

const getEnrollmentCount = async (courseId) => {
  const query = `
    SELECT COUNT(*)::int as count FROM enrollments
    WHERE course_id = $1 AND status = 'active';
  `;
  const result = await pool.query(query, [courseId]);
  return result.rows[0].count;
};

module.exports = {
  enrollStudentInCourse,
  unenrollStudentFromCourse,
  findEnrollmentById,
  unenrollStudentFromCourseById,
  getEnrollmentsByStudent,
  getEnrollmentsByCourse,
  isStudentEnrolled,
  getEnrollmentCount
};
