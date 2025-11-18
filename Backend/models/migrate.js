const pool = require('../config/dbConnection');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running migration...');

    // Read and execute users table SQL
    const usersSqlFilePath = path.join(__dirname, 'createUsersTable.sql');
    const usersSql = fs.readFileSync(usersSqlFilePath, 'utf8');
    await pool.query(usersSql);
    console.log('Users table created successfully!');

    // Read and execute students table SQL
    const studentsSqlFilePath = path.join(__dirname, 'createStudentsTable.sql');
    const studentsSql = fs.readFileSync(studentsSqlFilePath, 'utf8');
    await pool.query(studentsSql);
    console.log('Students table created successfully!');

    // Read and execute professors table SQL
    const professorsSqlFilePath = path.join(__dirname, 'createProfessorsTable.sql');
    const professorsSql = fs.readFileSync(professorsSqlFilePath, 'utf8');
    await pool.query(professorsSql);
    console.log('Professors table created successfully!');

    // Read and execute courses table SQL
    const coursesSqlFilePath = path.join(__dirname, 'createCoursesTable.sql');
    const coursesSql = fs.readFileSync(coursesSqlFilePath, 'utf8');
    await pool.query(coursesSql);
    console.log('Courses table created successfully!');

    const assetsSqlFilePath = path.join(__dirname, 'createAssetsTable.sql');
    const assetsSql = fs.readFileSync(assetsSqlFilePath, 'utf8');
    await pool.query(assetsSql);
    console.log('Assets table created successfully!');

    // Read and execute departments table SQL
    const departmentsSqlFilePath = path.join(__dirname, 'createDepartmentTable.sql');
    const departmentsSql = fs.readFileSync(departmentsSqlFilePath, 'utf8');
    await pool.query(departmentsSql);
    console.log('Departments table created successfully!');

    // Read and execute enrollments table SQL
    const enrollmentsSqlFilePath = path.join(__dirname, 'createEnrollmentsTable.sql');
    const enrollmentsSql = fs.readFileSync(enrollmentsSqlFilePath, 'utf8');
    await pool.query(enrollmentsSql);
    console.log('Enrollments table created successfully!');

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    // Close the pool
    await pool.end();
  }
}

runMigration();
