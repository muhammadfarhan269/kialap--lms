import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Async thunks
export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_BASE_URL}/assets`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create asset');
    }
  }
);

export const getAssets = createAsyncThunk(
  'assets/getAssets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_BASE_URL}/assets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
    }
  }
);

export const getAsset = createAsyncThunk(
  'assets/getAsset',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/assets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset');
    }
  }
);

export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Sending update request for asset ID:', id);
      console.log('FormData contents:');
      if (data && typeof data.entries === 'function') {
        for (let [key, value] of data.entries()) {
          console.log(key, value);
        }
      } else {
        console.log('Data is not FormData:', data);
      }
      const response = await axios.put(`${API_BASE_URL}/assets/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Update asset error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset');
    }
  }
);

export const deleteAsset = createAsyncThunk(
  'assets/deleteAsset',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`${API_BASE_URL}/assets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete asset');
    }
  }
);

// Slice
const assetsSlice = createSlice({
  name: 'assets',
  initialState: {
    assets: [],
    currentAsset: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAsset: (state) => {
      state.currentAsset = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Asset
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets.unshift(action.payload.data);
        state.pagination.total += 1;
        toast.success('Asset created successfully!');
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to create asset: ${action.payload}`);
      })

      // Get Assets
      .addCase(getAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Asset
      .addCase(getAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAsset = action.payload.data;
      })
      .addCase(getAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Asset
      .addCase(updateAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assets.findIndex(asset => asset.id === action.payload.data.id);
        if (index !== -1) {
          state.assets[index] = action.payload.data;
        }
        if (state.currentAsset && state.currentAsset.id === action.payload.data.id) {
          state.currentAsset = action.payload.data;
        }
        toast.success('Asset updated successfully!');
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Asset
      .addCase(deleteAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = state.assets.filter(asset => asset.id !== action.meta.arg);
        state.pagination.total -= 1;
        toast.success('Asset deleted successfully!');
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentAsset, setPagination } = assetsSlice.actions;
export default assetsSlice.reducer;
