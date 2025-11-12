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

// Async thunk for adding a professor
export const addProfessor = createAsyncThunk(
  'professor/addProfessor',
  async (professorData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch('http://localhost:5000/api/professors', {
        method: 'POST',
        body: professorData,
        credentials: 'include',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add professor' }));
        throw new Error(errorData.message || 'Failed to add professor');
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching all professors
export const fetchProfessors = createAsyncThunk(
  'professor/fetchProfessors',
  async ({ limit = 10, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      const result = await apiCall(`http://localhost:5000/api/professors?${params}`);

      // Normalize response shapes to { professors: [], total }
      if (Array.isArray(result)) {
        return { professors: result, total: result.length };
      }
      if (result && Array.isArray(result.professors)) {
        return { professors: result.professors, total: result.total ?? result.count ?? result.professors.length };
      }
      if (result && Array.isArray(result.rows)) {
        return { professors: result.rows, total: result.total ?? result.count ?? result.rows.length };
      }
      if (result && Array.isArray(result.data)) {
        return { professors: result.data, total: result.total ?? result.count ?? result.data.length };
      }
      // If API returned a single professor object, wrap it into an array
      if (result && typeof result === 'object') {
        return { professors: [result], total: 1 };
      }
      return { professors: [], total: 0 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching a single professor
export const fetchProfessorById = createAsyncThunk(
  'professor/fetchProfessorById',
  async (id, { rejectWithValue }) => {
    try {
      return await apiCall(`http://localhost:5000/api/professors/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating a professor
export const updateProfessor = createAsyncThunk(
  'professor/updateProfessor',
  async ({ id, professorData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`http://localhost:5000/api/professors/${id}`, {
        method: 'PUT',
        body: professorData,
        credentials: 'include',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update professor' }));
        throw new Error(errorData.message || 'Failed to update professor');
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting a professor
export const deleteProfessor = createAsyncThunk(
  'professor/deleteProfessor',
  async (id, { rejectWithValue }) => {
    try {
      await apiCall(`http://localhost:5000/api/professors/${id}`, { method: 'DELETE' });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const professorSlice = createSlice({
  name: 'professor',
  initialState: {
    professors: [],
    currentProfessor: null,
    loading: false,
    error: null,
    success: false,
    total: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetCurrentProfessor: (state) => {
      state.currentProfessor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Professor
      .addCase(addProfessor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addProfessor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.professors.push(action.payload.professor);
      })
      .addCase(addProfessor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Professors
      .addCase(fetchProfessors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfessors.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload should be normalized to { professors: [], total }
        if (action.payload && Array.isArray(action.payload.professors)) {
          state.professors = action.payload.professors;
          state.total = action.payload.total ?? action.payload.professors.length;
        } else if (Array.isArray(action.payload)) {
          state.professors = action.payload;
          state.total = action.payload.length;
        } else {
          state.professors = [];
          state.total = 0;
        }
      })
      .addCase(fetchProfessors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Professor by ID
      .addCase(fetchProfessorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfessorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfessor = action.payload;
      })
      .addCase(fetchProfessorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Professor
      .addCase(updateProfessor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfessor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.professors.findIndex(p => p.id === action.payload.professor.id);
        if (index !== -1) {
          state.professors[index] = action.payload.professor;
        }
        if (state.currentProfessor?.id === action.payload.professor.id) {
          state.currentProfessor = action.payload.professor;
        }
      })
      .addCase(updateProfessor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Professor
      .addCase(deleteProfessor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfessor.fulfilled, (state, action) => {
        state.loading = false;
        state.professors = state.professors.filter(p => p.id !== action.payload);
        if (state.currentProfessor?.id === action.payload) {
          state.currentProfessor = null;
        }
      })
      .addCase(deleteProfessor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetCurrentProfessor } = professorSlice.actions;
export default professorSlice.reducer;
