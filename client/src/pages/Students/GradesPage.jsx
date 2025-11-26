import React, { useState } from 'react';
import Layout from '../layouts/Layout';
import MyGrades from '../../components/students/grades/MyGrades';

const GradesPage = () => {
  const [courseId, setCourseId] = useState('');

  return (
    <Layout>
      <div className="container">
        <h3>My Grades</h3>
        <div className="mb-3">
          <label>Course ID (optional)</label>
          <input className="form-control" value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="Enter course id to view course summary" />
        </div>

        <MyGrades courseId={courseId} />
      </div>
    </Layout>
  );
};

export default GradesPage;
