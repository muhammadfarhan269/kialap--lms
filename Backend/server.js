require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./config/dbConnection');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite frontend
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from public directory
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ Database connection failed:', err);
  else console.log('✅ Database connected successfully at', res.rows[0].now);
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/professors', require('./routes/professorRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/assets', require('./routes/assetsRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));

app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
//app.use('/api/assignments', require('./routes/assignmentRoutes'));

// Global error handling middleware - must be last middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack || err.message || err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
