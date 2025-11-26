const asyncHandler = require('express-async-handler');
const FinalGrades = require('../models/FinalGrades');

// POST /api/final-grades
// Expect body: { grades: [ { studentUuid, courseId, finalWeightedScore, weightSum, finalPercentage, letterGrade } ], professorUuid? }
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
    const row = await FinalGrades.upsertFinalGrade({
      studentUuid,
      courseId,
      finalWeightedScore,
      weightSum,
      finalPercentage,
      letterGrade,
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

module.exports = { upsertFinalGrades, getFinalGradesByCourse };
