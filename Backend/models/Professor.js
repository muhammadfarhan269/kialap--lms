const pool = require('../config/dbConnection');
const bcrypt = require('bcryptjs');

const createProfessor = async (professorData) => {
  const {
    title,
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    employeeId,
    department,
    position,
    employmentType,
    joiningDate,
    salary,
    highestDegree,
    specialization,
    university,
    graduationYear,
    experience,
    office,
    subjects,
    bio,
    profileImage,
    username,
    password,
    accountStatus = 'active',
    role = 'professor'
  } = professorData;

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO professors (
      title, first_name, last_name, email, phone, date_of_birth, gender, address,
      employee_id, department, position, employment_type, joining_date, salary,
      highest_degree, specialization, university, graduation_year, experience,
      office, subjects, bio, profile_image, username, password, account_status, role
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
    )
    RETURNING id, title, first_name, last_name, email, phone, date_of_birth,
             gender, address, employee_id, department, position, employment_type,
             joining_date, salary, highest_degree, specialization, university,
             graduation_year, experience, office, subjects, bio, profile_image,
             username, account_status, role, created_at;
  `;

  const values = [
    title, firstName, lastName, email, phone, dateOfBirth, gender, address,
    employeeId, department, position, employmentType, joiningDate, salary,
    highestDegree, specialization, university, graduationYear, experience,
    office, subjects, bio, profileImage, username, hashedPassword, accountStatus, role
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const findProfessorById = async (id) => {
  const query = 'SELECT * FROM professors WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const findProfessorByEmail = async (email) => {
  const query = 'SELECT * FROM professors WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findProfessorByEmployeeId = async (employeeId) => {
  const query = 'SELECT * FROM professors WHERE employee_id = $1';
  const result = await pool.query(query, [employeeId]);
  return result.rows[0];
};

const findProfessorByUsername = async (username) => {
  const query = 'SELECT * FROM professors WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

const getAllProfessors = async (limit = 10, offset = 0) => {
  const query = `
    SELECT
      id,
      CONCAT(COALESCE(title, ''), ' ', first_name, ' ', last_name) as name,
      title,
      first_name as "firstName",
      last_name as "lastName",
      employee_id as "employeeId",
      department,
      position,
      employment_type as "employmentType",
      profile_image as "avatar",
      email,
      username,
      account_status as "status",
      role,
      created_at as "createdAt"
    FROM professors
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const updateProfessor = async (id, updateData) => {
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
  const query = `UPDATE professors SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteProfessor = async (id) => {
  const query = 'DELETE FROM professors WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createProfessor,
  findProfessorById,
  findProfessorByEmail,
  findProfessorByEmployeeId,
  findProfessorByUsername,
  getAllProfessors,
  updateProfessor,
  deleteProfessor
};
