const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const {
  createStudent,
  findStudentById,
  findStudentByEmail,
  findStudentByStudentId,
  findStudentByUsername,
  getAllStudents,
  updateStudent,
  deleteStudent
} = require('../models/Student');

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

  if (!data.username || data.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return errors;
};

exports.createStudent = async (req, res) => {
  try {
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
        course: req.body.course,
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
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        accountStatus: req.body.accountStatus || 'active',
        role: req.body.role || 'student',
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        linkedin: req.body.linkedin,
        instagram: req.body.instagram,
        website: req.body.website,
        github: req.body.github
      };

      // Validate required fields
      const missingField = validateRequired(['fullName', 'studentId', 'department', 'dateOfBirth', 'gender', 'phone', 'email', 'username', 'password', 'confirmPassword'], studentData);
      if (missingField) {
        return res.status(400).json({ message: `${missingField} is required` });
      }

      // Additional validation
      const validationErrors = validateStudentData(studentData);
      if (validationErrors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
      }

      // Check for existing student
      const existingEmail = await findStudentByEmail(studentData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const existingStudentId = await findStudentByStudentId(studentData.studentId);
      if (existingStudentId) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }

      const existingUsername = await findStudentByUsername(studentData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Create student
      const student = await createStudent(studentData);

      // Remove password from response
      const { password, ...studentResponse } = student;

      res.status(201).json({
        message: 'Student created successfully',
        student: studentResponse
      });
    });
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
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

      const updateData = {
        fullName: req.body.fullName,
        studentId: req.body.studentId,
        department: req.body.department,
        course: req.body.course,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        phone: req.body.phone,
        parentPhone: req.body.parentPhone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        email: req.body.email,
        username: req.body.username,
        accountStatus: req.body.accountStatus,
        role: req.body.role,
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        linkedin: req.body.linkedin,
        instagram: req.body.instagram,
        website: req.body.website,
        github: req.body.github
      };

      // Handle password update separately
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        if (req.body.password !== req.body.confirmPassword) {
          return res.status(400).json({ message: 'Passwords do not match' });
        }
        updateData.password = await bcrypt.hash(req.body.password, 10);
      }

      // Handle profile image
      if (req.file) {
        updateData.profileImage = req.file.filename;
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      // Validate email if provided
      if (updateData.email && !validateEmail(updateData.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Check for existing email/username if changed
      if (updateData.email) {
        const existingEmail = await findStudentByEmail(updateData.email);
        if (existingEmail && existingEmail.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Email already registered' });
        }
      }

      if (updateData.username) {
        const existingUsername = await findStudentByUsername(updateData.username);
        if (existingUsername && existingUsername.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }

      // Update student
      const updatedStudent = await updateStudent(id, updateData);

      if (!updatedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Remove password from response
      const { password, ...studentResponse } = updatedStudent;

      res.json({
        message: 'Student updated successfully',
        student: studentResponse
      });
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

