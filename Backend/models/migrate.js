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

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    // Close the pool
    await pool.end();
  }
}

runMigration();
