const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const {
  createStudent,
  findStudentById,
  findStudentByUserUuid,
  getAllStudents,
  updateStudent,
  deleteStudent
} = require('../models/Student');
const { createUser, findUserByEmail } = require('../models/User');
const pool = require('../config/dbConnection');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).single('profileImage');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRequired = (fields, body) => {
  for (const field of fields) {
    if (!body[field] || body[field].trim() === '') {
      return field;
    }
  }
  return null;
};

const validateStudentData = (data) => {
  const errors = [];

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (!data.studentId || data.studentId.trim().length < 1) {
    errors.push('Student ID is required');
  }

  if (!data.department) {
    errors.push('Department is required');
  }

  if (!data.dateOfBirth) {
    errors.push('Date of birth is required');
  }

  if (!data.gender || !['male', 'female', 'other'].includes(data.gender)) {
    errors.push('Valid gender is required');
  }

  if (!data.phone || data.phone.trim().length < 10) {
    errors.push('Valid phone number is required');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return errors;
};

const validateStudentCreationData = (data) => {
  const errors = [];

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (!data.studentId || data.studentId.trim().length < 1) {
    errors.push('Student ID is required');
  }

  if (!data.department) {
    errors.push('Department is required');
  }

  if (!data.dateOfBirth) {
    errors.push('Date of birth is required');
  }

  if (!data.gender || !['male', 'female', 'other'].includes(data.gender)) {
    errors.push('Valid gender is required');
  }

  if (!data.phone || data.phone.trim().length < 10) {
    errors.push('Valid phone number is required');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return errors;
};

const validateUserData = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.trim().length < 1) {
    errors.push('First name is required');
  }

  if (!data.lastName || data.lastName.trim().length < 1) {
    errors.push('Last name is required');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (!data.studentId || data.studentId.trim().length < 1) {
    errors.push('Student ID is required');
  }

  if (!data.department) {
    errors.push('Department is required');
  }

  return errors;
};

exports.createStudent = async (req, res) => {
  // Check if user is administrator
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ message: 'Access denied. Only administrators can add students.' });
  }

  // Handle file upload
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 2MB.' });
        }
      }
      return res.status(400).json({ message: err.message });
    }

    const studentData = {
      fullName: req.body.fullName,
      studentId: req.body.studentId,
      department: req.body.department,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      phone: req.body.phone,
      parentPhone: req.body.parentPhone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      profileImage: req.file ? req.file.filename : null,
      email: req.body.email,
      email:req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      accountStatus: req.body.accountStatus || 'active',
      role: req.body.role || 'student'
    };

    // Check for required fields that might be missing due to FormData not appending empty values
    if (studentData.department === undefined || studentData.department === null || (typeof studentData.department === 'string' && studentData.department.trim() === '')) {
      return res.status(400).json({ message: 'Department is required' });
    }

    // Validate required fields
    const missingField = validateRequired(['fullName', 'studentId', 'department', 'dateOfBirth', 'gender', 'phone', 'email', 'password', 'confirmPassword'], studentData);
    if (missingField) {
      return res.status(400).json({ message: `${missingField} is required` });
    }

    // Additional validation
    const validationErrors = validateStudentData(studentData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    // Ensure password is provided and valid
    if (!studentData.password || typeof studentData.password !== 'string' || studentData.password.trim() === '') {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Check for existing user
    const existingEmail = await findUserByEmail(studentData.email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check for existing student ID in users table
    const existingStudentIdQuery = 'SELECT * FROM users WHERE student_id = $1';
    const existingStudentIdResult = await pool.query(existingStudentIdQuery, [studentData.studentId]);
    if (existingStudentIdResult.rows.length > 0) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user first
      const nameParts = studentData.fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      const user = await createUser(firstName, lastName, studentData.email, null, hashedPassword, 'student', studentData.department, studentData.studentId, client);

      // Create student record
      const studentRecord = await createStudent({
        userUuid: user.uuid,
        fullName: studentData.fullName,
        email: studentData.email,
        studentId: studentData.studentId,
        department: studentData.department,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        phone: studentData.phone,
        parentPhone: studentData.parentPhone,
        address: studentData.address,
        city: studentData.city,
        state: studentData.state,
        postalCode: studentData.postalCode,
        profileImage: studentData.profileImage,
        accountStatus: studentData.accountStatus
      }, client);

      await client.query('COMMIT');

      // Fetch the full student data with user details joined
      const fullStudent = await findStudentById(studentRecord.id);

      // Remove password from response
      const { password, ...userResponse } = user;

      res.status(201).json({
        message: 'Student created successfully',
        user: userResponse,
        student: fullStudent
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating student:', error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  });
};

exports.getAllStudents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const students = await getAllStudents(limit, offset);
    res.json({ students });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await findStudentById(id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove password from response
    const { password, ...studentResponse } = student;
    res.json({ student: studentResponse });
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    // Check if user is administrator
    if (req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Access denied. Only administrators can update students.' });
    }

    const { id } = req.params;

    // Handle file upload
    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 2MB.' });
          }
        }
        return res.status(400).json({ message: err.message });
      }

      // First, get the student to obtain user_uuid
      const student = await findStudentById(id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const updateData = {
        fullName: req.body.fullName,
        studentId: req.body.studentId,
        department: req.body.department,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        phone: req.body.phone,
        parentPhone: req.body.parentPhone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        email: req.body.email,
        accountStatus: req.body.accountStatus,
        role: req.body.role
      };

      // Handle password update separately
      let hashedPassword = null;
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        if (req.body.password !== req.body.confirmPassword) {
          return res.status(400).json({ message: 'Passwords do not match' });
        }
        hashedPassword = await bcrypt.hash(req.body.password, 10);
      }

      // Handle profile image
      if (req.file) {
        updateData.profileImage = req.file.filename;
      }

      // Separate updates for students and users tables
      const studentUpdate = {};
      const userUpdate = {};

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && updateData[key] !== '') {
          if (key === 'email' || key === 'role') {
            userUpdate[key] = updateData[key];
          } else {
            studentUpdate[key] = updateData[key];
          }
        }
      });

      // Validate email if provided
      if (userUpdate.email && !validateEmail(userUpdate.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Check for existing email if changed
      if (userUpdate.email) {
        const existingEmail = await findUserByEmail(userUpdate.email);
        if (existingEmail && existingEmail.uuid !== student.user_uuid) {
          return res.status(400).json({ message: 'Email already registered' });
        }
      }

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Update student table
        if (Object.keys(studentUpdate).length > 0) {
          const studentFields = [];
          const studentValues = [];
          let paramIndex = 1;

          Object.keys(studentUpdate).forEach(key => {
            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            studentFields.push(`${dbKey} = $${paramIndex}`);
            studentValues.push(studentUpdate[key]);
            paramIndex++;
          });

          studentValues.push(id);
          const studentQuery = `UPDATE students SET ${studentFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`;
          await client.query(studentQuery, studentValues);
        }

        // Update user table
        if (Object.keys(userUpdate).length > 0 || hashedPassword) {
          const userFields = [];
          const userValues = [];
          let paramIndex = 1;

          Object.keys(userUpdate).forEach(key => {
            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            userFields.push(`${dbKey} = $${paramIndex}`);
            userValues.push(userUpdate[key]);
            paramIndex++;
          });

          if (hashedPassword) {
            userFields.push(`password = $${paramIndex}`);
            userValues.push(hashedPassword);
            paramIndex++;
          }

          userValues.push(student.user_uuid);
          const userQuery = `UPDATE users SET ${userFields.join(', ')} WHERE uuid = $${paramIndex}`;
          await client.query(userQuery, userValues);
        }

        await client.query('COMMIT');

        // Fetch updated student
        const updatedStudent = await findStudentById(id);

        // Remove password from response
        const { password, ...studentResponse } = updatedStudent;

        res.json({
          message: 'Student updated successfully',
          student: studentResponse
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    // Check if user is administrator
    if (req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Access denied. Only administrators can delete students.' });
    }

    const { id } = req.params;

    // Check if student exists
    const student = await findStudentById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete student
    const deletedStudent = await deleteStudent(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student deleted successfully',
      student: { id: deletedStudent.id }
    });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

