import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const FinalGradesSection = ({ students, courseId, courseGrades }) => {
  const { current: weights } = useSelector(state => state.gradingWeights || {});
  const [finalGrades, setFinalGrades] = useState([]);
  const [savingFinals, setSavingFinals] = React.useState(false);
  
  const expandedStateKey = `expanded_final_grades_${courseId}`;
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(expandedStateKey);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(expandedStateKey, JSON.stringify(isExpanded));
  }, [isExpanded, expandedStateKey]);

  useEffect(() => {
    calculateFinalGrades();
  }, [courseGrades, weights]);

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const calculateFinalGrades = () => {
    const defaultWeights = {
      assignment_weight: 20,
      quiz_weight: 20,
      midterm_weight: 25,
      final_weight: 35
    };

    const weightConfig = weights || defaultWeights;

    const calculated = students?.map(student => {
      const studentGrades = courseGrades[student.userUuid] || {};

      // helper to read per-section localStorage grades and weights
      const loadSectionData = (section) => {
        const weightsKey = `weights_${courseId}_${section}`;
        const gradesKey = `grades_${courseId}_${section}`;
        let wObj = {};
        let gObj = {};
        try { wObj = JSON.parse(localStorage.getItem(weightsKey) || '{}'); } catch (e) { wObj = {}; }
        try { gObj = JSON.parse(localStorage.getItem(gradesKey) || '{}'); } catch (e) { gObj = {}; }
        return { wObj, gObj };
      };

      const sections = ['quiz','assignment','midterm','final'];

      // compute per-section percentages (fallback to aggregated courseGrades if no detailed data)
      let totalObtained = 0;
      let totalMarks = 0;
      let weightedSumAll = 0;
      let weightSumAll = 0;

      sections.forEach(section => {
        const { wObj, gObj } = loadSectionData(section);
        const sectionWeightSum = Object.values(wObj).reduce((a,b) => a + (parseFloat(b)||0), 0);
        weightSumAll += sectionWeightSum;

        // if detailed per-column grades exist for this student
        const studentSectionGrades = gObj[student.userUuid] || null;
        if (studentSectionGrades && sectionWeightSum > 0) {
          Object.keys(wObj).forEach(colId => {
            const w = parseFloat(wObj[colId]) || 0;
            const g = studentSectionGrades[colId];
            if (g) {
              const obt = parseFloat(g.obtainedMarks) || 0;
              const tot = parseFloat(g.totalMarks) || 0;
              totalObtained += obt;
              totalMarks += tot;
              if (tot > 0) {
                const frac = obt / tot;
                weightedSumAll += frac * w;
              }
            }
          });
        } else {
          // fallback to single aggregated grade from backend
          const agg = studentGrades[section];
          if (agg) {
            const obt = parseFloat(agg.score) || 0;
            const tot = parseFloat(agg.max_score || agg.maxScore || agg.maxScore) || parseFloat(agg.max_score) || 0;
            totalObtained += obt;
            totalMarks += tot;
            if (sectionWeightSum > 0 && tot > 0) {
              const frac = obt / tot;
              weightedSumAll += frac * sectionWeightSum;
            }
          }
        }
      });

      // compute overall percentage based on weightedSumAll vs weightSumAll
      let overallPct = 0;
      if (weightSumAll > 0) {
        overallPct = (weightedSumAll / weightSumAll) * 100;
      } else {
        // fallback: use simple totalObtained/totalMarks
        overallPct = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
      }

      // keep decimal precision for display and use decimal to compute letter grade
      const finalPercentage = parseFloat(overallPct.toFixed(2));
      const letterGrade = getLetterGrade(finalPercentage);

      // build per-section weighted displays (use raw weighted marks: (obt/tot) * weight)
      const sectionDisplays = {};
      // recompute per-section weighted values to ensure we have per-section info
      sections.forEach(section => {}); // noop placeholder - sectionDisplays were populated earlier if needed

      // Note: weightedSumAll and weightSumAll were accumulated above
      sectionDisplays['quiz'] = { weightedObtained: 0, weightSum: 0 };
      sectionDisplays['assignment'] = { weightedObtained: 0, weightSum: 0 };
      sectionDisplays['midterm'] = { weightedObtained: 0, weightSum: 0 };
      sectionDisplays['final'] = { weightedObtained: 0, weightSum: 0 };

      // Recompute per-section breakdown for display (separate loop to avoid changing previous accumulation logic)
      sections.forEach(section => {
        const { wObj, gObj } = loadSectionData(section);
        const sectionWeightSum = Object.values(wObj).reduce((a,b) => a + (parseFloat(b)||0), 0);
        let sectionWeightedObtained = 0;
        const studentSectionGrades = gObj[student.userUuid] || null;
        if (studentSectionGrades && sectionWeightSum > 0) {
          Object.keys(wObj).forEach(colId => {
            const w = parseFloat(wObj[colId]) || 0;
            const g = studentSectionGrades[colId];
            if (g && (parseFloat(g.totalMarks) || 0) > 0) {
              const obt = parseFloat(g.obtainedMarks) || 0;
              const tot = parseFloat(g.totalMarks) || 0;
              sectionWeightedObtained += (obt / tot) * w;
            }
          });
        } else {
          const agg = studentGrades[section];
          if (agg && sectionWeightSum > 0) {
            const obt = parseFloat(agg.score) || 0;
            const tot = parseFloat(agg.max_score || agg.maxScore || 0) || 0;
            if (tot > 0) sectionWeightedObtained += (obt / tot) * sectionWeightSum;
          }
        }
        sectionDisplays[section] = {
          weightedObtained: parseFloat(sectionWeightedObtained).toFixed(2),
          weightSum: parseFloat(sectionWeightSum).toFixed(2)
        };
      });

      const resolvedName = (student.studentName || student.name || `${student.firstName || ''} ${student.lastName || ''}`).trim() || 'N/A';

      return {
        studentUuid: student.userUuid,
        studentName: resolvedName,
        studentEmail: student.studentEmail || student.email || 'N/A',
        quizWeighted: `${sectionDisplays['quiz'].weightedObtained} / ${sectionDisplays['quiz'].weightSum}`,
        assignmentWeighted: `${sectionDisplays['assignment'].weightedObtained} / ${sectionDisplays['assignment'].weightSum}`,
        midtermWeighted: `${sectionDisplays['midterm'].weightedObtained} / ${sectionDisplays['midterm'].weightSum}`,
        finalWeighted: `${sectionDisplays['final'].weightedObtained} / ${sectionDisplays['final'].weightSum}`,
        totalWeightedObtained: parseFloat(weightedSumAll).toFixed(2),
        totalWeightSum: parseFloat(weightSumAll).toFixed(2),
        finalPercentage,
        letterGrade
      };
    }) || [];

    setFinalGrades(calculated);
  };

  const getGradeColor = (letterGrade) => {
    const colors = {
      'A': 'success',
      'B': 'info',
      'C': 'warning',
      'D': 'warning',
      'F': 'danger'
    };
    return colors[letterGrade] || 'secondary';
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white d-flex gap-2 align-items-center">
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          {isExpanded ? '▼ Collapse' : '▶ Expand'}
        </button>
        <h5 className="mb-0">Final Grades Summary</h5>
      </div>
      {isExpanded && (
      <div className="card-body">
        {finalGrades.length > 0 ? (
          <>
          <div className="table-responsive">
            <table className="table table-hover table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Quiz</th>
                  <th>Assignment</th>
                  <th>Midterm </th>
                  <th>Final </th>
                  <th>Total Marks</th>
                  <th>Overall </th>
                  <th>Letter Grade</th>
                </tr>
              </thead>
              <tbody>
                {finalGrades.map(grade => (
                  <tr key={grade.studentUuid}>
                    <td>
                      <strong>{grade.studentName}</strong>
                    </td>
                    <td>
                      <small className="text-muted">{grade.studentEmail}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{grade.quizWeighted}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{grade.assignmentWeighted}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{grade.midtermWeighted}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{grade.finalWeighted}</span>
                    </td>
                    <td>
                      <span className="badge bg-info text-white"><strong>{grade.totalWeightedObtained} / {grade.totalWeightSum}</strong></span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{grade.finalPercentage}%</span>
                    </td>
                    <td>
                      <span className={`badge bg-${getGradeColor(grade.letterGrade)}`} style={{ fontSize: '1rem', padding: '0.5rem 0.75rem' }}>
                        {grade.letterGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={async () => {
                // construct payload from finalGrades state
                try {
                  setSavingFinals(true);
                  const token = localStorage.getItem('accessToken');
                  const payload = {
                    grades: finalGrades.map(g => ({
                      studentUuid: g.studentUuid,
                      courseId: parseInt(courseId),
                      finalWeightedScore: parseFloat(g.totalWeightedObtained) || 0,
                      weightSum: parseFloat(g.totalWeightSum) || 0,
                      finalPercentage: parseFloat(g.finalPercentage) || 0,
                      letterGrade: g.letterGrade
                    }))
                  };
                  const res = await fetch('http://localhost:5000/api/final-grades', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                  });
                  if (!res.ok) throw new Error('Failed to save final grades');
                  const data = await res.json();
                  toast.success(`Final grades for ${finalGrades.length} student(s) saved successfully!`, {
                    position: 'bottom-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                  });
                } catch (err) {
                  toast.error(`Error saving final grades: ${err.message || err}`, {
                    position: 'bottom-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                  });
                } finally {
                  setSavingFinals(false);
                }
              }}
              disabled={savingFinals || finalGrades.length === 0}
            >
              {savingFinals ? 'Saving...' : 'Save Final Grades'}
            </button>
          </div>
          </>
        ) : (
          <p className="text-muted">No grade data available. Enter grades in the assessment sections above.</p>
        )}
      </div>
      )}
    </div>
  );
};

export default FinalGradesSection;
