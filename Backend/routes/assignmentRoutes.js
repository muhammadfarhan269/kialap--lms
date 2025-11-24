const express = require('express');
const router = express.Router();

const assignmentsController = require('../controller/assignmentsController');
const verifyJWT = require('../middleware/verifyJWT'); // assuming JWT middleware for auth
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/assignments');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only doc, docx, pdf files
  if (!file.originalname.match(/\.(doc|docx|pdf)$/)) {
    return cb(new Error('Only Word or PDF files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

router.use(verifyJWT);

// Create assignment with file upload
router.post('/',
  upload.single('file'),
  assignmentsController.createAssignment
);

// Get all assignments for professor
router.get('/', assignmentsController.getAssignmentsByProfessor);

// Update assignment status
router.put('/:assignmentId/status', assignmentsController.updateAssignmentStatus);

// Get submitted assessments for an assignment
router.get('/:assignmentId/submissions', assignmentsController.getSubmittedAssessments);

module.exports = router;
