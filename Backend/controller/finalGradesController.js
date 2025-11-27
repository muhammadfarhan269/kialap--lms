const asyncHandler = require('express-async-handler');
const FinalGrades = require('../models/FinalGrades');

// POST /api/final-grades
// Expect body: { grades: [ { studentUuid, courseId, finalWeightedScore, weightSum, finalPercentage, letterGrade? } ], professorUuid? }
const upsertFinalGrades = asyncHandler(async (req, res) => {
  const { grades } = req.body;
  // professorUuid should come from the authenticated user
  const professorUuidFromReq = req.user && (req.user.uuid || req.user.userUuid || null);
  if (!Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ success: false, message: 'grades array required' });
  }

  const saved = [];
  for (const g of grades) {
    const { studentUuid, courseId, finalWeightedScore, weightSum, finalPercentage, letterGrade } = g;
    if (!studentUuid || !courseId || finalWeightedScore === undefined || weightSum === undefined || finalPercentage === undefined) {
      continue; // skip invalid entries
    }
    // Letter grade will be auto-calculated in the model if not provided
    const row = await FinalGrades.upsertFinalGrade({
      studentUuid,
      courseId,
      finalWeightedScore,
      weightSum,
      finalPercentage,
      letterGrade: letterGrade || null,  // Pass null if not provided so model can auto-calculate
      professorUuid: professorUuidFromReq
    });
    saved.push(row);
  }

  res.status(200).json({ success: true, data: saved });
});

// GET /api/final-grades/course/:courseId
const getFinalGradesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const rows = await FinalGrades.getFinalGradesByCourse(courseId);
  res.json({ success: true, data: rows });
});



// GET /api/final-grades/student/:studentUuid/summary
const getFinalGradesByStudent = asyncHandler(async (req, res) => {
  const { studentUuid } = req.params;
  const requester = req.user && (req.user.uuid || req.user.userUuid || null);
  const role = req.user && req.user.role;
  if (!requester) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (requester !== studentUuid && role !== 'professor' && role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const rows = await FinalGrades.getFinalGradesByStudent(studentUuid);
  res.json({ success: true, data: rows });
});

module.exports = { upsertFinalGrades, getFinalGradesByCourse, getFinalGradesByStudent };
