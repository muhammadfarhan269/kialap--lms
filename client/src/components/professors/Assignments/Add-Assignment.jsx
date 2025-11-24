import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAssignments, createAssignment } from '../../../redux/slices/assignmentSlice';

const AddAssignment = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.assignments);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchAssignedCourses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/courses/professor/${user.uuid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(Array.isArray(data.data) ? data.data.filter(c => c.courseStatus === 'active') : []);
      } catch (err) {
        console.error(err);
        setFetchError('Failed to load courses');
      }
    };

    if (user?.uuid) {
      fetchAssignedCourses();
    }
  }, [user]);

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setSelectedCourse('');
    setFile(null);
    setFetchError(null);
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!title.trim() || !dueDate || !selectedCourse) {
      setSubmitError('Please fill all mandatory fields.');
      return;
    }
    if (file && !/\.(doc|docx|pdf)$/i.test(file.name)) {
      setSubmitError('Only Word or PDF files are allowed.');
      return;
    }

    dispatch(createAssignment({ title, dueDate, courseId: selectedCourse, file }))
      .unwrap()
      .then(() => {
        setSuccessMessage('Assignment created successfully.');
        resetForm();
        dispatch(fetchAssignments());
      })
      .catch((err) => {
        setSubmitError(err || 'Failed to create assignment.');
      });
  };

  return (
    <div className="container mt-4">
      <h3>Add Assignment</h3>
      {fetchError && <div className="alert alert-danger">{fetchError}</div>}
      {submitError && <div className="alert alert-danger">{submitError}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="mt-3" encType="multipart/form-data" noValidate>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Assignment Title *</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="dueDate" className="form-label">Due Date *</label>
          <input
            type="date"
            id="dueDate"
            className="form-control"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="course" className="form-label">Course *</label>
          <select
            id="course"
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="file" className="form-label">Upload File (Word or PDF)</label>
          <input
            type="file"
            id="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".doc,.docx,.pdf"
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Create Assignment'}
        </button>
      </form>
    </div>
  );
};

export default AddAssignment;
