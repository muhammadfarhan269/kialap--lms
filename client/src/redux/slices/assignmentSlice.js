import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  assignments: [],
  loading: false,
  error: null,
};

// Fetch assignments for logged-in professor
export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('accessToken'); // Get token from localStorage
      const response = await axios.get('/api/assignments', {
        headers: {
          Authorization: `Bearer ${token}`, // Add token here
        },
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch assignments';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new assignment
export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (assignmentData, thunkAPI) => {
    try {
      const token = localStorage.getItem('accessToken'); // Get token from localStorage
      const formData = new FormData();
      formData.append('title', assignmentData.title);
      formData.append('dueDate', assignmentData.dueDate);
      formData.append('courseId', assignmentData.courseId);
      if (assignmentData.file) {
        formData.append('file', assignmentData.file);
      }

      const response = await axios.post('/api/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Add token here
        },
      });

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to create assignment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update assignment status
export const updateAssignmentStatus = createAsyncThunk(
  'assignments/updateAssignmentStatus',
  async ({ assignmentId, status }, thunkAPI) => {
    try {
      const token = localStorage.getItem('accessToken'); // Get token
      const response = await axios.put(
        `/api/assignments/${assignmentId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token here
          },
        }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update assignment status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(action.payload);
        state.error = null;
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAssignmentStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateAssignmentStatus.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAssignmentStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default assignmentSlice.reducer;
