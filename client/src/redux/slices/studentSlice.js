import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

// Async thunk for creating a student
export const createStudent = createAsyncThunk(
  'student/createStudent',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create student');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching all students
export const fetchAllStudents = createAsyncThunk(
  'student/fetchAllStudents',
  async ({ limit = 10, offset = 0 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`http://localhost:5000/api/students?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      return data.students;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching a single student by ID
export const fetchStudentById = createAsyncThunk(
  'student/fetchStudentById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch student');
      }

      return data.student;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating a student
export const updateStudent = createAsyncThunk(
  'student/updateStudent',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update student');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting a student
export const deleteStudent = createAsyncThunk(
  'student/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete student');
      }

      return { id, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    students: [],
    currentStudent: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Add the new student to the list
        state.students.push({
          ...action.payload.student,
          department: action.payload.student.department || action.payload.student.users?.department,
          student_id: action.payload.student.student_id || action.payload.student.users?.student_id
        });
        toast.success('Student created successfully!');
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        toast.error(`Failed to create student: ${action.payload}`);
      })
      .addCase(fetchAllStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
        state.error = null;
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to fetch students: ${action.payload}`);
      })
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to fetch student: ${action.payload}`);
      })
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Update the student in the students array if it exists
        const updatedStudent = action.payload.student;
        const index = state.students.findIndex(student => student.id === updatedStudent.id);
        if (index !== -1) {
          state.students[index] = updatedStudent;
        }
        state.currentStudent = updatedStudent;
        toast.success('Student updated successfully!');
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        toast.error(`Failed to update student: ${action.payload}`);
      })
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Remove the student from the students array
        state.students = state.students.filter(student => student.id !== action.payload.id);
        state.currentStudent = null;
        toast.success('Student deleted successfully!');
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        toast.error(`Failed to delete student: ${action.payload}`);
      });
  },
});

export const { clearError, resetSuccess } = studentSlice.actions;
export default studentSlice.reducer;
