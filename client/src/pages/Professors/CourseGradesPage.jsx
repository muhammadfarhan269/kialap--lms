import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../layouts/Layout';
import MultiAssessmentSection from '../../components/professors/grades/MultiAssessmentSection';
import FinalGradesSection from '../../components/professors/grades/FinalGradesSection';
import { fetchEnrolledStudents } from '../../redux/slices/enrolledStudentsSlice';
import { fetchGradesByCourse } from '../../redux/slices/gradesSlice';

const CourseGradesPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: students, loading: studentsLoading } = useSelector(state => state.enrolledStudents || {});
  const { list: grades, loading: gradesLoading } = useSelector(state => state.grades || {});
  const [courseDetails, setCourseDetails] = useState(null);
  const [customColumns, setCustomColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [courseGrades, setCourseGrades] = useState({});

  useEffect(() => {
    if (courseId) {
      dispatch(fetchEnrolledStudents(courseId));
      dispatch(fetchGradesByCourse(courseId));
      fetchCourseDetails();
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    if (grades && grades.length > 0) {
      const gradesByStudent = {};
      grades.forEach(grade => {
        if (!gradesByStudent[grade.student_uuid]) {
          gradesByStudent[grade.student_uuid] = {};
        }
        gradesByStudent[grade.student_uuid][grade.assessment_type] = grade;
      });
      setCourseGrades(gradesByStudent);
    }
  }, [grades]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCourseDetails(data);
    } catch (err) {
      console.error('Error fetching course:', err);
    }
  };

  const handleAddCustomColumn = () => {
    if (newColumnName.trim()) {
      setCustomColumns([...customColumns, { id: Date.now(), name: newColumnName }]);
      setNewColumnName('');
    }
  };

  const handleRemoveCustomColumn = (columnId) => {
    setCustomColumns(customColumns.filter(col => col.id !== columnId));
  };

  if (studentsLoading) {
    return (
      <Layout>
        <div className="container">
          <p>Loading course and students...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          ← Back to Courses
        </button>
        {/* Assessment Sections */}
        <div className="mb-4">
          <div className="mb-3">
            <MultiAssessmentSection
              assessmentType="assignment"
              students={students}
              courseId={courseId}
              initialGrades={courseGrades}
            />
          </div>
          <div className="mb-3">
            <MultiAssessmentSection
              assessmentType="quiz"
              students={students}
              courseId={courseId}
              initialGrades={courseGrades}
            />
          </div>
          <div className="mb-3">
            <MultiAssessmentSection
              assessmentType="midterm"
              students={students}
              courseId={courseId}
              initialGrades={courseGrades}
            />
          </div>
          <div className="mb-3">
            <MultiAssessmentSection
              assessmentType="final"
              students={students}
              courseId={courseId}
              initialGrades={courseGrades}
            />
          </div>
        </div>

        {/* Final Grades Section */}
        <div className="mb-4">
          <FinalGradesSection
            students={students}
            courseId={courseId}
            courseGrades={courseGrades}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CourseGradesPage;
