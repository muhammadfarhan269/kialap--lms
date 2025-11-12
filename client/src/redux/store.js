import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import professorReducer from './slices/professorSlice';
import courseReducer from './slices/courseSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    professor: professorReducer,
    course: courseReducer,
  },
});

export default store;
