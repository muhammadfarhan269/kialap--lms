const pool = require('../config/dbConnection');
const bcrypt = require('bcryptjs');

const createStudent = async (studentData) => {
  const {
    fullName,
    studentId,
    department,
    course,
    dateOfBirth,
    gender,
    phone,
    parentPhone,
    address,
    city,
    state,
    postalCode,
    profileImage,
    email,
    username,
    password,
    accountStatus = 'active',
    role = 'student',
    facebook,
    twitter,
    linkedin,
    instagram,
    website,
    github
  } = studentData;

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO students (
      full_name, student_id, department, course, date_of_birth, gender, phone,
      parent_phone, address, city, state, postal_code, profile_image, email,
      username, password, account_status, role, facebook, twitter, linkedin,
      instagram, website, github
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24
    )
    RETURNING id, full_name, student_id, department, course, date_of_birth,
             gender, phone, parent_phone, address, city, state, postal_code,
             profile_image, email, username, account_status, role, facebook,
             twitter, linkedin, instagram, website, github, created_at;
  `;

  const values = [
    fullName, studentId, department, course, dateOfBirth, gender, phone,
    parentPhone, address, city, state, postalCode, profileImage, email,
    username, hashedPassword, accountStatus, role, facebook, twitter, linkedin,
    instagram, website, github
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const findStudentById = async (id) => {
  const query = 'SELECT * FROM students WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const findStudentByEmail = async (email) => {
  const query = 'SELECT * FROM students WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findStudentByStudentId = async (studentId) => {
  const query = 'SELECT * FROM students WHERE student_id = $1';
  const result = await pool.query(query, [studentId]);
  return result.rows[0];
};

const findStudentByUsername = async (username) => {
  const query = 'SELECT * FROM students WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

const getAllStudents = async (limit = 10, offset = 0) => {
  const query = 'SELECT id, full_name, student_id, department, course, date_of_birth, profile_image, email, username, account_status, role, created_at FROM students ORDER BY created_at DESC LIMIT $1 OFFSET $2';
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const updateStudent = async (id, updateData) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      // Map camelCase to snake_case for database columns
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = $${paramIndex}`);
      values.push(updateData[key]);
      paramIndex++;
    }
  });

  if (fields.length === 0) return null;

  values.push(id);
  const query = `UPDATE students SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteStudent = async (id) => {
  const query = 'DELETE FROM students WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createStudent,
  findStudentById,
  findStudentByEmail,
  findStudentByStudentId,
  findStudentByUsername,
  getAllStudents,
  updateStudent,
  deleteStudent
};
