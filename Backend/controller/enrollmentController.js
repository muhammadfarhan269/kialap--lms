const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');

// @desc    Enroll student in a course
// @route   POST /api/enrollments
// @access  Private/Student
const enrollStudent = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id; // This is the user ID from JWT (users table)

  if (!courseId) {
    res.status(400);
    throw new Error('Course ID is required');
  }

  // Find the student record using the user email. If the corresponding students
  // row does not exist but the authenticated user has role 'student', create a
  // minimal students record so the enrollment APIs work for legacy/migrated users.
  let student = await Student.findStudentByEmail(req.user.email);
  if (!student) {
    if (req.user && req.user.role === 'student') {
      try {
        student = await Student.createMinimalStudent({ fullName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || null, email: req.user.email, username: req.user.email.split('@')[0] });
      } catch (err) {
        console.error('Failed to create minimal student record:', err);
      }
    }
  }

  if (!student) {
    res.status(404);
    throw new Error('Student record not found. Please contact administrator.');
  }

  const studentId = student.id; // This is the actual student ID from students table

  // Check if course exists and is active
  const course = await Course.findCourseById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.courseStatus !== 'active') {
    res.status(400);
    throw new Error('Course is not available for enrollment');
  }

  // Check if student is already enrolled
  const existingEnrollment = await Enrollment.isStudentEnrolled(studentId, courseId);
  if (existingEnrollment) {
    if (existingEnrollment.status === 'active') {
      res.status(400);
      throw new Error('Student is already enrolled in this course');
    } else if (existingEnrollment.status === 'dropped') {
      // Re-enroll if previously dropped
      const reenrollQuery = `
        UPDATE enrollments SET status = 'active', enrollment_date = CURRENT_TIMESTAMP
        WHERE student_id = $1 AND course_id = $2
        RETURNING id, student_id, course_id, enrollment_date, status;
      `;
      const reenrollResult = await require('../config/dbConnection').query(reenrollQuery, [studentId, courseId]);
      res.status(200).json({
        success: true,
        message: 'Successfully re-enrolled in course',
        data: reenrollResult.rows[0]
      });
      return;
    }
  }

  // Check enrollment count
  const enrollmentCount = await Enrollment.getEnrollmentCount(courseId);
  if (enrollmentCount >= course.maxStudents) {
    res.status(400);
    throw new Error('Course is full');
  }

  const enrollment = await Enrollment.enrollStudentInCourse(studentId, courseId);

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course',
    data: enrollment
  });
});

// @desc    Unenroll student from a course
// @route   DELETE /api/enrollments/:id
// @access  Private/Student
const unenrollStudent = asyncHandler(async (req, res) => {
  const { id } = req.params; // This is the enrollment ID
  const userId = req.user.id; // This is the user ID from JWT (users table)

  // Find the student record using the user email. If the corresponding students
  // row does not exist but the authenticated user has role 'student', create a
  // minimal students record so the enrollment APIs work for legacy/migrated users.
  let student = await Student.findStudentByEmail(req.user.email);
  if (!student) {
    if (req.user && req.user.role === 'student') {
      try {
        student = await Student.createMinimalStudent({ fullName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || null, email: req.user.email, username: req.user.email.split('@')[0] });
      } catch (err) {
        console.error('Failed to create minimal student record:', err);
      }
    }
  }

  if (!student) {
    res.status(404);
    throw new Error('Student record not found. Please contact administrator.');
  }

  const studentId = student.id; // This is the actual student ID from students table

  // Check if enrollment exists and is active, and belongs to the student
  const existingEnrollment = await Enrollment.findEnrollmentById(id);
  if (!existingEnrollment || existingEnrollment.student_id !== studentId || existingEnrollment.status !== 'active') {
    res.status(404);
    throw new Error('Active enrollment not found');
  }

  const enrollment = await Enrollment.unenrollStudentFromCourseById(id);

  res.status(200).json({
    success: true,
    message: 'Successfully unenrolled from course',
    data: enrollment
  });
});

// @desc    Get student's enrollments
// @route   GET /api/enrollments/student
// @access  Private/Student
const getStudentEnrollments = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    res.status(403);
    throw new Error('Access denied. Student role required.');
  }

  const userId = req.user.id; // This is the user ID from JWT (users table)

  // Find the student record using the user email. If the corresponding students
  // row does not exist but the authenticated user has role 'student', create a
  // minimal students record so the enrollment APIs work for legacy/migrated users.
  let student = await Student.findStudentByEmail(req.user.email);
  if (!student) {
    if (req.user && req.user.role === 'student') {
      try {
        student = await Student.createMinimalStudent({ fullName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || null, email: req.user.email, username: req.user.email.split('@')[0] });
      } catch (err) {
        console.error('Failed to create minimal student record:', err);
      }
    }
  }

  if (!student) {
    res.status(404);
    throw new Error('Student record not found. Please contact administrator.');
  }

  const studentId = student.id; // This is the actual student ID from students table

  const enrollments = await Enrollment.getEnrollmentsByStudent(studentId);

  res.status(200).json({
    success: true,
    data: enrollments
  });
});

// @desc    Get course enrollments (for professors/admins)
// @route   GET /api/enrollments/course/:courseId
// @access  Private
const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const enrollments = await Enrollment.getEnrollmentsByCourse(courseId);

  res.status(200).json({
    success: true,
    data: enrollments
  });
});

// @desc    Check if student is enrolled in course
// @route   GET /api/enrollments/check/:courseId
// @access  Private/Student
const checkEnrollment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    res.status(403);
    throw new Error('Access denied. Student role required.');
  }

  const { courseId } = req.params;
  const userId = req.user.id; // This is the user ID from JWT (users table)

  // Find the student record using the user email. If the corresponding students
  // row does not exist but the authenticated user has role 'student', create a
  // minimal students record so the enrollment APIs work for legacy/migrated users.
  let student = await Student.findStudentByEmail(req.user.email);
  if (!student) {
    if (req.user && req.user.role === 'student') {
      try {
        student = await Student.createMinimalStudent({ fullName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || null, email: req.user.email, username: req.user.email.split('@')[0] });
      } catch (err) {
        console.error('Failed to create minimal student record:', err);
      }
    }
  }

  if (!student) {
    res.status(404);
    throw new Error('Student record not found. Please contact administrator.');
  }

  const studentId = student.id; // This is the actual student ID from students table

  const enrollment = await Enrollment.isStudentEnrolled(studentId, courseId);

  res.status(200).json({
    success: true,
    enrolled: !!enrollment && enrollment.status === 'active',
    status: enrollment ? enrollment.status : null
  });
});

module.exports = {
  enrollStudent,
  unenrollStudent,
  getStudentEnrollments,
  getCourseEnrollments,
  checkEnrollment
};
