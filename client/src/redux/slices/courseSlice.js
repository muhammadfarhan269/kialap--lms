import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper function to make API calls with fetch
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Async thunk for adding a course
export const addCourse = createAsyncThunk(
  'course/addCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        body: courseData, // FormData object
        credentials: 'include',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add course' }));
        throw new Error(errorData.message || 'Failed to add course');
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching all courses
export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async ({ limit = 10, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      return await apiCall(`http://localhost:5000/api/courses?${params}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching a single course
export const fetchCourseById = createAsyncThunk(
  'course/fetchCourseById',
  async (id, { rejectWithValue }) => {
    try {
      return await apiCall(`http://localhost:5000/api/courses/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating a course
export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      return await apiCall(`http://localhost:5000/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting a course
export const deleteCourse = createAsyncThunk(
  'course/deleteCourse',
  async (id, { rejectWithValue }) => {
    try {
      await apiCall(`http://localhost:5000/api/courses/${id}`, { method: 'DELETE' });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching courses by professor
export const fetchCoursesByProfessor = createAsyncThunk(
  'course/fetchCoursesByProfessor',
  async (professorId, { rejectWithValue }) => {
    try {
      return await apiCall(`http://localhost:5000/api/courses/professor/${professorId}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching courses by department
export const fetchCoursesByDepartment = createAsyncThunk(
  'course/fetchCoursesByDepartment',
  async (department, { rejectWithValue }) => {
    try {
      return await apiCall(`http://localhost:5000/api/courses/department/${department}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const courseSlice = createSlice({
  name: 'course',
  initialState: {
    courses: [],
    currentCourse: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Course
      .addCase(addCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.courses.push(action.payload.course);
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.courses.findIndex(c => c.id === action.payload.course.id);
        if (index !== -1) {
          state.courses[index] = action.payload.course;
        }
        if (state.currentCourse?.id === action.payload.course.id) {
          state.currentCourse = action.payload.course;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(c => c.id !== action.payload);
        if (state.currentCourse?.id === action.payload) {
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Courses by Professor
      .addCase(fetchCoursesByProfessor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesByProfessor.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCoursesByProfessor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Courses by Department
      .addCase(fetchCoursesByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCoursesByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
