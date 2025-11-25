const Assignment = require('../models/Assignments');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/dbConnection');

// Configure multer for assignment file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/assignments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow PDF and Word files
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word files are allowed!'), false);
    }
  }
}).single('assignmentFile');

// Wrap upload so multer errors are forwarded to Express error handler
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      // Multer error or file validation error
      return next(err);
    }
    next();
  });
};

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Professor
const createAssignment = asyncHandler(async (req, res) => {
  const { title, dueDate, status = 'Pending', courseId } = req.body;
  const professorUuid = req.user.uuid; // From JWT token

  // Validate required fields
  if (!title || title.trim() === '') {
    res.status(400);
    throw new Error('Assignment title is required');
  }
  if (!dueDate) {
    res.status(400);
    throw new Error('Due date is required');
  }
  if (!courseId) {
    res.status(400);
    throw new Error('Course is required');
  }

  // Verify course belongs to this professor
  const course = await Course.findCourseById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.professorUuid !== professorUuid) {
    res.status(403);
    throw new Error('You are not authorized to create assignments for this course');
  }

  // Debug logging for file upload
  let filePath = null;
  if (req.file) {
    filePath = req.file.filename;
    console.log('Assignment file uploaded:', req.file.filename, 'original name:', req.file.originalname);
  } else {
    console.log('No file uploaded for assignment');
  }

  const assignmentData = {
    title: title.trim(),
    dueDate,
    status,
    filePath,
    courseId,
    professorUuid
  };

  const assignment = await Assignment.createAssignment(assignmentData);

  res.status(201).json({
    success: true,
    message: 'Assignment created successfully',
    data: assignment
  });
});

// @desc    Get all assignments for a professor
// @route   GET /api/assignments/professor/:professorUuid
// @access  Private/Professor
const getAssignmentsByProfessor = asyncHandler(async (req, res) => {
  const { professorUuid } = req.params;
  const requestingUserUuid = req.user.uuid;

  // Verify professor can only access their own assignments
  if (professorUuid !== requestingUserUuid && req.user.role !== 'administrator') {
    res.status(403);
    throw new Error('You are not authorized to view these assignments');
  }

  const assignments = await Assignment.findAssignmentsByProfessorId(professorUuid);

  res.status(200).json({
    success: true,
    data: assignments
  });
});

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private/Professor
const getAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const professorUuid = req.user.uuid;

  const assignment = await Assignment.findAssignmentById(id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Verify authorization
  if (assignment.professorUuid !== professorUuid && req.user.role !== 'administrator') {
    res.status(403);
    throw new Error('You are not authorized to view this assignment');
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment status
// @route   PUT /api/assignments/:id/status
// @access  Private/Professor
const updateAssignmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const professorUuid = req.user.uuid;

  // Validate status
  const validStatuses = ['Pending', 'Submitted', 'Late', 'Graded'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const assignment = await Assignment.updateAssignmentStatus(id, professorUuid, status);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found or you are not authorized');
  }

  res.status(200).json({
    success: true,
    message: 'Assignment status updated successfully',
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Professor
const updateAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const professorUuid = req.user.uuid;

  // Verify assignment exists and belongs to professor
  const assignment = await Assignment.findAssignmentById(id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  if (assignment.professorUuid !== professorUuid && req.user.role !== 'administrator') {
    res.status(403);
    throw new Error('You are not authorized to update this assignment');
  }

  // Update assignment
  const updatedAssignment = await Assignment.updateAssignment(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: updatedAssignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Professor
const deleteAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const professorUuid = req.user.uuid;

  const assignment = await Assignment.findAssignmentById(id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  if (assignment.professorUuid !== professorUuid && req.user.role !== 'administrator') {
    res.status(403);
    throw new Error('You are not authorized to delete this assignment');
  }

  await Assignment.deleteAssignment(id, professorUuid);

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

// @desc    Get assignments for a specific course
// @route   GET /api/assignments/course/:courseId
// @access  Private/Professor
const getAssignmentsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const professorUuid = req.user.uuid;

  // Verify course belongs to professor
  const course = await Course.findCourseById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.professorUuid !== professorUuid && req.user.role !== 'administrator') {
    res.status(403);
    throw new Error('You are not authorized to view assignments for this course');
  }

  // Get assignments for course
  const query = `
    SELECT 
      a.id,
      a.uuid,
      a.title,
      a.due_date as "dueDate",
      a.status,
      a.file_path as "filePath",
      a.course_id as "courseId",
      a.professor_uuid as "professorUuid",
      a.created_at as "createdAt",
      a.updated_at as "updatedAt",
      c.course_code as "courseCode", 
      c.course_name as "courseName"
    FROM assignments a
    LEFT JOIN courses c ON a.course_id = c.id
    WHERE a.course_id = $1
    ORDER BY a.due_date ASC;
  `;

  const result = await pool.query(query, [courseId]);

  res.status(200).json({
    success: true,
    data: result.rows
  });
});

module.exports = {
  createAssignment,
  getAssignmentsByProfessor,
  getAssignment,
  updateAssignmentStatus,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByCourse,
  upload: uploadMiddleware
};
