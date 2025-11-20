const pool = require('../config/dbConnection');
const fs = require('fs');
const path = require('path');

async function runMigration(closePool = true) {
  try {
    console.log('Running migration...');

    // Read and execute users table SQL
    const usersSqlFilePath = path.join(__dirname, 'createUsersTable.sql');
    const usersSql = fs.readFileSync(usersSqlFilePath, 'utf8');
    await pool.query(usersSql);
    console.log('Users table created/updated successfully!');

    // Alter users table to make username nullable
    console.log('Altering users table to make username nullable...');
    await pool.query(`ALTER TABLE users ALTER COLUMN username DROP NOT NULL;`);
    console.log('Users table altered successfully!');

    // Read and execute students table SQL
    const studentsSqlFilePath = path.join(__dirname, 'createStudentsTable.sql');
    const studentsSql = fs.readFileSync(studentsSqlFilePath, 'utf8');
    await pool.query(studentsSql);
    console.log('Students table created/updated successfully!');

    // Alter students table to add user_uuid if not exists
    console.log('Altering students table...');
    await pool.query(`DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'user_uuid') THEN
            ALTER TABLE students ADD COLUMN user_uuid UUID;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'students' AND constraint_name = 'fk_user_uuid') THEN
            ALTER TABLE students ADD CONSTRAINT fk_user_uuid FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'students' AND constraint_name = 'unique_user_uuid') THEN
            ALTER TABLE students ADD CONSTRAINT unique_user_uuid UNIQUE(user_uuid);
        END IF;
    END
    $$;`);
    console.log('Students table altered successfully!');

    // Update existing students to link with users via UUID
    console.log('Updating existing student records...');
    const updateStudentsQuery = `
      UPDATE students
      SET user_uuid = users.uuid
      FROM users
      WHERE students.email = users.email AND students.user_uuid IS NULL;
    `;
    await pool.query(updateStudentsQuery);
    console.log('Existing students updated with user_uuid!');

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
    // Close the pool only if requested
    if (closePool) {
      await pool.end();
    }
  }
}

async function refreshMigration() {
  try {
    console.log('Refreshing migration...');

    // Drop all tables in reverse order to avoid dependency issues
    await pool.query('DROP TABLE IF EXISTS enrollments CASCADE;');
    await pool.query('DROP TABLE IF EXISTS departments CASCADE;');
    await pool.query('DROP TABLE IF EXISTS assets CASCADE;');
    await pool.query('DROP TABLE IF EXISTS courses CASCADE;');
    await pool.query('DROP TABLE IF EXISTS professors CASCADE;');
    await pool.query('DROP TABLE IF EXISTS students CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('All tables dropped successfully!');

    // Re-run migration
    await runMigration();
    console.log('Refresh migration completed successfully!');
  } catch (err) {
    console.error('Refresh migration failed:', err);
  } finally {
    await pool.end();
  }
}

async function rollbackMigration() {
  try {
    console.log('Rolling back migration (dropping all tables)...');

    // Drop all tables as a full rollback (since tracking individual steps is not implemented)
    await pool.query('DROP TABLE IF EXISTS enrollments CASCADE;');
    await pool.query('DROP TABLE IF EXISTS departments CASCADE;');
    await pool.query('DROP TABLE IF EXISTS assets CASCADE;');
    await pool.query('DROP TABLE IF EXISTS courses CASCADE;');
    await pool.query('DROP TABLE IF EXISTS professors CASCADE;');
    await pool.query('DROP TABLE IF EXISTS students CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('Rollback completed: all tables dropped!');
  } catch (err) {
    console.error('Rollback failed:', err);
  } finally {
    await pool.end();
  }
}

// Check command line arguments
const command = process.argv[2];
if (command === 'refresh') {
  refreshMigration();
} else if (command === 'rollback') {
  rollbackMigration();
} else {
  runMigration();
}
