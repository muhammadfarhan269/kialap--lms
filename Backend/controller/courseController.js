const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for course image uploads
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
    cb(null, 'course-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).fields([
  { name: 'courseImage', maxCount: 1 },
  { name: 'courseCode', maxCount: 1 },
  { name: 'courseName', maxCount: 1 },
  { name: 'department', maxCount: 1 },
  { name: 'professorId', maxCount: 1 },
  { name: 'description', maxCount: 1 },
  { name: 'credits', maxCount: 1 },
  { name: 'duration', maxCount: 1 },
  { name: 'maxStudents', maxCount: 1 },
  { name: 'prerequisites', maxCount: 1 },
  { name: 'semester', maxCount: 1 },
  { name: 'courseType', maxCount: 1 },
  { name: 'classDays', maxCount: 1 },
  { name: 'startTime', maxCount: 1 },
  { name: 'endTime', maxCount: 1 },
  { name: 'classroom', maxCount: 1 },
  { name: 'status', maxCount: 1 },
  { name: 'enrollmentType', maxCount: 1 },
  { name: 'onlineAvailable', maxCount: 1 },
  { name: 'certificateOffered', maxCount: 1 },
  { name: 'recordedLectures', maxCount: 1 },
  { name: 'courseFee', maxCount: 1 },
  { name: 'labFee', maxCount: 1 },
  { name: 'materialFee', maxCount: 1 }
]);

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
  const {
    courseCode,
    courseName,
    department,
    professorId,
    description,
    credits,
    duration,
    maxStudents,
    prerequisites,
    semester,
    courseType,
    classDays,
    startTime,
    endTime,
    classroom,
    status,
    enrollmentType,
    onlineAvailable,
    certificateOffered,
    recordedLectures,
    courseFee,
    labFee,
    materialFee
  } = req.body;

  // Check if course code already exists
  const existingCourse = await Course.findCourseByCode(courseCode);
  if (existingCourse) {
    res.status(400);
    throw new Error('Course code already exists');
  }

  // Handle course image
  let courseImage = null;
  if (req.files && req.files.courseImage && req.files.courseImage[0]) {
    courseImage = req.files.courseImage[0].filename;
  }

  const courseData = {
    courseCode,
    courseName,
    department,
    professorId,
    courseDescription: description,
    credits: credits || 3,
    duration: duration || 16,
    maxStudents: maxStudents || 30,
    prerequisites,
    semester,
    courseType,
    classDays,
    startTime,
    endTime,
    classroom,
    courseImage,
    courseStatus: status || 'active',
    enrollmentType: enrollmentType || 'open',
    onlineAvailable: onlineAvailable === 'true' || onlineAvailable === true,
    certificateOffered: certificateOffered === 'true' || certificateOffered === true,
    recordedLectures: recordedLectures === 'true' || recordedLectures === true,
    courseFee: courseFee || 0.00,
    labFee: labFee || 0.00,
    materialFee: materialFee || 0.00
  };

  const course = await Course.createCourse(courseData);

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: course
  });
});

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const filters = {};
  if (req.query.department) filters.department = req.query.department;
  if (req.query.semester) filters.semester = req.query.semester;
  if (req.query.courseType) filters.courseType = req.query.courseType;
  if (req.query.status) filters.status = req.query.status;

  console.log('getCourses params:', { page, limit, offset, filters }); // DEBUG
  
  const { rows, total } = await Course.getAllCourses(limit, offset, filters);

  console.log('getAllCourses result:', { rowsCount: rows.length, total }); // DEBUG

  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total: total
    }
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findCourseById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findCourseById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if course code is being changed and if it already exists
  if (req.body.courseCode && req.body.courseCode !== course.courseCode) {
    const existingCourse = await Course.findCourseByCode(req.body.courseCode);
    if (existingCourse) {
      res.status(400);
      throw new Error('Course code already exists');
    }
  }

  const updatedCourse = await Course.updateCourse(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: updatedCourse
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findCourseById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  await Course.deleteCourse(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// @desc    Get courses by professor
// @route   GET /api/courses/professor/:professorId
// @access  Private
const getCoursesByProfessor = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const courses = await Course.getCoursesByProfessor(req.params.professorId, limit, offset);

  res.status(200).json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total: courses.length
    }
  });
});

// @desc    Get courses by department
// @route   GET /api/courses/department/:department
// @access  Private
const getCoursesByDepartment = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const courses = await Course.getCoursesByDepartment(req.params.department, limit, offset);

  res.status(200).json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total: courses.length
    }
  });
});

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCoursesByProfessor,
  getCoursesByDepartment,
  upload
};
