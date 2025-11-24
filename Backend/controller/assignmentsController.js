const Assignments = require('../models/Assignments');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// Create a new assignment by professor for a course they are assigned to
exports.createAssignment = async (req, res) => {
  try {
    console.log('Received createAssignment req.body:', req.body); // Debug log to check form fields
    const { title, dueDate, courseId } = req.body;

    // Validate dueDate presence and format
    if (!dueDate || dueDate.trim() === '') {
      return res.status(400).json({ message: 'dueDate is required and cannot be empty.' });
    }

    // Convert dueDate string to ISO string or Date object (keep as ISO string for DB insert)
    const dueDateISO = new Date(dueDate);
    if (isNaN(dueDateISO.getTime())) {
      return res.status(400).json({ message: 'Invalid dueDate format.' });
    }

    // Check user role
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Only professors can add assignments' });
    }

    // Fetch the course
    const course = await Course.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ensure professor is assigned to the course
    if (!course.professorUuid || !req.user.uuid || course.professorUuid.toLowerCase() !== req.user.uuid.toLowerCase()) {
      console.log('Authorization failed in createAssignment:', {
        courseProfessorUuid: course.professorUuid,
        userUuid: req.user.uuid
      });
      return res.status(403).json({ message: 'Unauthorized to add assignment to this course' });
    }

    // Handle file upload
    let filePath = null;
    if (req.file) {
      filePath = req.file.path;
    }

    // Create the assignment with correct DB column names
    const assignment = await Assignments.createAssignment({
      title,
      dueDate: dueDateISO.toISOString(),
      status: 'Pending',
      filePath,
      courseId: course.uuid,
      professorId: req.user.uuid
    });

    return res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ message: error.message });
  }
};
