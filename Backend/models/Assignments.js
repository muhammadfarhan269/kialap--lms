const pool = require('../config/dbConnection');
const { v4: uuidv4 } = require('uuid');

// Create a new assignment
const createAssignment = async ({ title, dueDate, status = 'Pending', filePath = null, courseId, professorId }) => {
  const id = uuidv4();
  const query = `
    INSERT INTO assignments (id, title, due_date, status, file_path, course_uuid, professor_uuid, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [id, title, dueDate, status, filePath, courseId, professorId];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Find assignments by professor id, with optional additional filters & order by due_date asc
const findAssignmentsByProfessorId = async (professorId) => {
  const query = `
    SELECT a.*, c.course_code AS "courseCode", c.course_name AS "courseName"
    FROM assignments a
    LEFT JOIN courses c ON a.course_uuid = c.id
    WHERE a.professor_uuid = $1
    ORDER BY a.due_date ASC;
  `;
  const result = await pool.query(query, [professorId]);
  return result.rows;
};

// Find assignment by arbitrary filters (only supports id and professorId for now)
const findAssignment = async ({ id, professorId }) => {
  let conditions = [];
  let values = [];
  let index = 1;

  if (id) {
    conditions.push(`id = $${index++}`);
    values.push(id);
  }
  if (professorId) {
    conditions.push(`professor_uuid = $${index++}`);
    values.push(professorId);
  }

  if (conditions.length === 0) return null;

  const whereClause = conditions.join(' AND ');
  const query = `SELECT * FROM assignments WHERE ${whereClause} LIMIT 1;`;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update assignment status by id and professor_id
const updateAssignmentStatus = async (id, professorId, status) => {
  const query = `
    UPDATE assignments
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND professor_uuid = $3
    RETURNING *;
  `;
  const values = [status, id, professorId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  createAssignment,
  findAssignmentsByProfessorId,
  findAssignment,
  updateAssignmentStatus
};
