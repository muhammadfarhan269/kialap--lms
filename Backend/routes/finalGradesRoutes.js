const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const verifyRole = require('../middleware/verifyRole');
const { upsertFinalGrades, getFinalGradesByCourse } = require('../controller/finalGradesController');

router.use(verifyJWT);
router.post('/', verifyRole('professor'), upsertFinalGrades);
router.get('/course/:courseId', verifyRole('professor'), getFinalGradesByCourse);

module.exports = router;
