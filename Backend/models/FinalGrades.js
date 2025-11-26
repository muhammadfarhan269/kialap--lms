const pool = require('../config/dbConnection');

const upsertFinalGrade = async ({ studentUuid, courseId, finalWeightedScore, weightSum, finalPercentage, letterGrade = null, professorUuid = null, notes = null }) => {
  const query = `
    INSERT INTO final_grades (student_uuid, course_id, final_weighted_score, weight_sum, final_percentage, letter_grade, professor_uuid, notes, computed_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    ON CONFLICT (student_uuid, course_id) DO UPDATE SET
      final_weighted_score = EXCLUDED.final_weighted_score,
      weight_sum = EXCLUDED.weight_sum,
      final_percentage = EXCLUDED.final_percentage,
      letter_grade = EXCLUDED.letter_grade,
      professor_uuid = EXCLUDED.professor_uuid,
      notes = EXCLUDED.notes,
      computed_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const values = [studentUuid, courseId, finalWeightedScore, weightSum, finalPercentage, letterGrade, professorUuid, notes];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getFinalGradesByCourse = async (courseId) => {
  const query = `SELECT * FROM final_grades WHERE course_id = $1 ORDER BY computed_at DESC;`;
  const result = await pool.query(query, [courseId]);
  return result.rows;
};

module.exports = {
  upsertFinalGrade,
  getFinalGradesByCourse
};
