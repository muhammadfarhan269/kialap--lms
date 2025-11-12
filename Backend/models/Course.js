const pool = require('../config/dbConnection');

const createCourse = async (courseData) => {
  const {
    courseCode,
    courseName,
    department,
    professorId,
    courseDescription,
    credits = 3,
    duration = 16,
    maxStudents = 30,
    prerequisites,
    semester,
    courseType,
    classDays, 
    startTime,
    endTime,
    classroom,
    courseImage,
    courseStatus = 'active',
    enrollmentType = 'open',
    onlineAvailable = false,
    certificateOffered = false,
    recordedLectures = false,
    courseFee = 0.00,
    labFee = 0.00,
    materialFee = 0.00
  } = courseData;

  const query = `
    INSERT INTO courses (
      course_code, course_name, department, professor_id, course_description,
      credits, duration, max_students, prerequisites, semester, course_type,
      class_days, start_time, end_time, classroom, course_image, course_status,
      enrollment_type, online_available, certificate_offered, recorded_lectures,
      course_fee, lab_fee, material_fee
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24
    )
    RETURNING id, course_code, course_name, department, professor_id,
             course_description, credits, duration, max_students, prerequisites,
             semester, course_type, class_days, start_time, end_time, classroom,
             course_image, course_status, enrollment_type, online_available,
             certificate_offered, recorded_lectures, course_fee, lab_fee,
             material_fee, total_fee, created_at;
  `;

  const values = [
    courseCode, courseName, department, professorId, courseDescription,
    credits, duration, maxStudents, prerequisites, semester, courseType,
    JSON.stringify(classDays), startTime, endTime, classroom, courseImage,
    courseStatus, enrollmentType, onlineAvailable, certificateOffered,
    recordedLectures, courseFee, labFee, materialFee
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const findCourseById = async (id) => {
  const query = `
    SELECT
      c.*,
      CONCAT(p.title, ' ', p.first_name, ' ', p.last_name) as professor_name,
      p.email as professor_email,
      p.department as professor_department
    FROM courses c
    LEFT JOIN professors p ON c.professor_id = p.id
    WHERE c.id = $1
  `;
  const result = await pool.query(query, [id]);
  if (result.rows[0]) {
    result.rows[0].classDays = JSON.parse(result.rows[0].class_days || '[]');
  }
  return result.rows[0];
};

const findCourseByCode = async (courseCode) => {
  const query = `
    SELECT
      c.*,
      CONCAT(p.title, ' ', p.first_name, ' ', p.last_name) as professor_name,
      p.email as professor_email,
      p.department as professor_department
    FROM courses c
    LEFT JOIN professors p ON c.professor_id = p.id
    WHERE c.course_code = $1
  `;
  const result = await pool.query(query, [courseCode]);
  if (result.rows[0]) {
    result.rows[0].classDays = JSON.parse(result.rows[0].class_days || '[]');
  }
  return result.rows[0];
};

const getAllCourses = async (limit = 10, offset = 0, filters = {}) => {
  let whereClause = '';
  const values = [];
  let paramIndex = 1;

  if (filters.department) {
    whereClause += ` AND c.department = $${paramIndex}`;
    values.push(filters.department);
    paramIndex++;
  }

  if (filters.semester) {
    whereClause += ` AND c.semester = $${paramIndex}`;
    values.push(filters.semester);
    paramIndex++;
  }

  if (filters.courseType) {
    whereClause += ` AND c.course_type = $${paramIndex}`;
    values.push(filters.courseType);
    paramIndex++;
  }

  if (filters.status) {
    whereClause += ` AND c.course_status = $${paramIndex}`;
    values.push(filters.status);
    paramIndex++;
  }

  values.push(limit, offset);

  const query = `
    SELECT
      c.id,
      c.course_code as "courseCode",
      c.course_name as "courseName",
      c.department,
      c.credits,
      c.duration,
      c.max_students as "maxStudents",
      c.semester,
      c.course_type as "courseType",
      c.class_days as "classDays",
      c.start_time as "startTime",
      c.end_time as "endTime",
      c.classroom,
      c.course_image as "courseImage",
      c.course_status as "courseStatus",
      c.enrollment_type as "enrollmentType",
      c.online_available as "onlineAvailable",
      c.certificate_offered as "certificateOffered",
      c.recorded_lectures as "recordedLectures",
      c.total_fee as "totalFee",
      c.created_at as "createdAt",
      CONCAT(p.title, ' ', p.first_name, ' ', p.last_name) as "professorName",
      p.email as "professorEmail"
    FROM courses c
    LEFT JOIN professors p ON c.professor_id = p.id
    WHERE 1=1 ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const result = await pool.query(query, values);

  // Parse class_days JSON for each course
  result.rows.forEach(course => {
    course.classDays = JSON.parse(course.classDays || '[]');
  });

  return result.rows;
};

const updateCourse = async (id, updateData) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      // Map camelCase to snake_case for database columns
      let dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      // Special handling for classDays -> class_days
      if (key === 'classDays') {
        dbKey = 'class_days';
        values.push(JSON.stringify(updateData[key]));
      } else {
        values.push(updateData[key]);
      }

      fields.push(`${dbKey} = $${paramIndex}`);
      paramIndex++;
    }
  });

  if (fields.length === 0) return null;

  values.push(id);
  const query = `UPDATE courses SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;

  const result = await pool.query(query, values);
  if (result.rows[0]) {
    result.rows[0].classDays = JSON.parse(result.rows[0].class_days || '[]');
  }
  return result.rows[0];
};

const deleteCourse = async (id) => {
  const query = 'DELETE FROM courses WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getCoursesByProfessor = async (professorId, limit = 10, offset = 0) => {
  const query = `
    SELECT
      c.id,
      c.course_code as "courseCode",
      c.course_name as "courseName",
      c.department,
      c.credits,
      c.semester,
      c.course_type as "courseType",
      c.course_status as "courseStatus",
      c.created_at as "createdAt"
    FROM courses c
    WHERE c.professor_id = $1
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [professorId, limit, offset]);
  return result.rows;
};

const getCoursesByDepartment = async (department, limit = 10, offset = 0) => {
  const query = `
    SELECT
      c.id,
      c.course_code as "courseCode",
      c.course_name as "courseName",
      c.credits,
      c.semester,
      c.course_type as "courseType",
      c.course_status as "courseStatus",
      CONCAT(p.title, ' ', p.first_name, ' ', p.last_name) as "professorName",
      c.created_at as "createdAt"
    FROM courses c
    LEFT JOIN professors p ON c.professor_id = p.id
    WHERE c.department = $1
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [department, limit, offset]);
  return result.rows;
};

module.exports = {
  createCourse,
  findCourseById,
  findCourseByCode,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getCoursesByProfessor,
  getCoursesByDepartment
};
