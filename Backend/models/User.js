const pool = require('../config/dbConnection');

const createUser = async (firstName, lastName, email, username, password, role) => {
  const query = `
    INSERT INTO users (first_name, last_name, email, username, password, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, first_name, last_name, email, username, role;
  `;
  const values = [firstName, lastName, email, username, password, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const updateRefreshToken = async (userId, refreshToken) => {
  const query = 'UPDATE users SET refresh_token = $1 WHERE id = $2';
  await pool.query(query, [refreshToken, userId]);
};

const findUserByRefreshToken = async (refreshToken) => {
  const query = 'SELECT * FROM users WHERE refresh_token = $1';
  const result = await pool.query(query, [refreshToken]);
  return result.rows[0];
};

const clearRefreshToken = async (userId) => {
  const query = 'UPDATE users SET refresh_token = NULL WHERE id = $1';
  await pool.query(query, [userId]);
};

const updateResetToken = async (userId, resetToken, expires) => {
  const query = 'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3';
  await pool.query(query, [resetToken, expires, userId]);
};

const findUserByResetToken = async (resetToken) => {
  const query = 'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()';
  const result = await pool.query(query, [resetToken]);
  return result.rows[0];
};

const clearResetToken = async (userId) => {
  const query = 'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1';
  await pool.query(query, [userId]);
};

const updatePassword = async (userId, hashedPassword) => {
  const query = 'UPDATE users SET password = $1 WHERE id = $2';
  await pool.query(query, [hashedPassword, userId]);
};

module.exports = { createUser, findUserByEmail, updateRefreshToken, findUserByRefreshToken, clearRefreshToken, updateResetToken, findUserByResetToken, clearResetToken, updatePassword };
