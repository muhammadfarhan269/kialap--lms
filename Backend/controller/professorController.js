const { createProfessor, findProfessorById, findProfessorByEmail, findProfessorByEmployeeId, findProfessorByUsername, getAllProfessors: getAllProfessorsModel, updateProfessor: updateProfessorModel, deleteProfessor: deleteProfessorModel } = require('../models/Professor');
const { createUser, findUserByEmail, findUserByUsername } = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/dbConnection');
const bcrypt = require('bcryptjs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'professor-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).fields([{ name: 'profilePhoto', maxCount: 1 }]);

const addProfessor = async (req, res) => {
  try {
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
      officeHours,
      subjects,
      bio,
      username,
      password
    } = req.body;

    // Validate phone number (must be at least 10 digits)
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    // Check if professor already exists
    const existingEmail = await findProfessorByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Professor with this email already exists' });
    }

    const existingEmployeeId = await findProfessorByEmployeeId(employeeId);
    if (existingEmployeeId) {
      return res.status(400).json({ message: 'Professor with this employee ID already exists' });
    }

    const existingUsername = await findProfessorByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Professor with this username already exists' });
    }

    // Check if user already exists
    const existingUserEmail = await findUserByEmail(email);
    if (existingUserEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingUserUsername = await findUserByUsername(username);
    if (existingUserUsername) {
      return res.status(400).json({ message: 'User with this username already exists' });
    }

    // Validate required fields
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Handle file upload
    let profileImage = null;
    if (req.files && req.files.profilePhoto && req.files.profilePhoto[0]) {
      profileImage = req.files.profilePhoto[0].filename;
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user first
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser(firstName, lastName, email, username, hashedPassword, 'professor', department, null, client);

      // Create professor
      const professorData = {
        userUuid: user.uuid,
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
        salary: salary ? parseFloat(salary) : null,
        highestDegree,
        specialization,
        university,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        experience: experience ? parseInt(experience) : null,
        office,
        officeHours,
        subjects,
        bio,
        profileImage,
        username,
        password
      };

      const newProfessor = await createProfessor(professorData, client);

      await client.query('COMMIT');

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.status(201).json({
        message: 'Professor added successfully',
        user: userResponse,
        professor: newProfessor
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding professor:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllProfessors = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const professors = await getAllProfessorsModel(parseInt(limit), parseInt(offset));
    res.json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    res.status(500).json({ message: error.message });
  }
};

const getProfessorById = async (req, res) => {
  try {
    const { id } = req.params;
    const professor = await findProfessorById(id);
    if (!professor) {
      return res.status(404).json({ message: 'Professor not found' });
    }
    res.json(professor);
  } catch (error) {
    console.error('Error fetching professor:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate phone number if provided (must be at least 10 digits)
    if (updateData.phone && updateData.phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    // Handle file upload for profile image update
    if (req.files && req.files.profilePhoto && req.files.profilePhoto[0]) {
      updateData.profileImage = req.files.profilePhoto[0].filename;
    }

    // Parse numeric fields, handle empty strings
    if (updateData.salary !== undefined) {
      updateData.salary = updateData.salary === '' ? null : parseFloat(updateData.salary);
    }
    if (updateData.graduationYear !== undefined) {
      updateData.graduationYear = updateData.graduationYear === '' ? null : parseInt(updateData.graduationYear);
    }
    if (updateData.experience !== undefined) {
      updateData.experience = updateData.experience === '' ? null : parseInt(updateData.experience);
    }

    const updatedProfessor = await updateProfessorModel(id, updateData);
    if (!updatedProfessor) {
      return res.status(404).json({ message: 'Professor not found' });
    }

    res.json({
      message: 'Professor updated successfully',
      professor: updatedProfessor
    });
  } catch (error) {
    console.error('Error updating professor:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProfessor = await deleteProfessorModel(id);
    if (!deletedProfessor) {
      return res.status(404).json({ message: 'Professor not found' });
    }
    res.json({ message: 'Professor deleted successfully' });
  } catch (error) {
    console.error('Error deleting professor:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProfessor,
  getAllProfessors,
  getProfessorById,
  updateProfessor,
  deleteProfessor,
  upload
};
