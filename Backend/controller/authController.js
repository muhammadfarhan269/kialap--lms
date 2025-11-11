const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/mailService');
const { createUser, findUserByEmail, updateRefreshToken, findUserByRefreshToken, clearRefreshToken, updateResetToken, findUserByResetToken, clearResetToken, updatePassword } = require('../models/User');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRole = (role) => {
  const allowedRoles = ['student', 'professor', 'staff member', 'administrator'];
  return allowedRoles.includes(role);
};

const validateRequired = (fields, body) => {
  for (const field of fields) {
    if (!body[field] || body[field].trim() === '') {
      return field;
    }
  }
  return null;
};

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, role } = req.body;

    const missingField = validateRequired(['firstName', 'lastName', 'email', 'username', 'password', 'role'], req.body);
    if (missingField) return res.status(400).json({ message: `${missingField} is required` });

    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });

    if (!validateRole(role)) return res.status(400).json({ message: 'Invalid role. Allowed roles: student, professor, staff member, administrator' });

    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(firstName, lastName, email, username, hashedPassword, role);

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const missingField = validateRequired(['email', 'password'], req.body);
    if (missingField) return res.status(400).json({ message: `${missingField} is required` });

    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { UserInfo: { id: user.id, email: user.email, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    await updateRefreshToken(user.id, refreshToken);

    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;
    const user = await findUserByRefreshToken(refreshToken);
    if (!user) return res.status(403).json({ message: 'Forbidden' });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err || user.email !== decoded.email) return res.status(403).json({ message: 'Forbidden' });

      const accessToken = jwt.sign(
        { UserInfo: { id: user.id, email: user.email, role: user.role } },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ accessToken });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;
    const user = await findUserByRefreshToken(refreshToken);
    if (user) await clearRefreshToken(user.id);

    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const missingField = validateRequired(['email'], req.body);
    if (missingField) return res.status(400).json({ message: `${missingField} is required` });

    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await updateResetToken(user.id, resetToken, expires);

    const resetLink = `http://localhost:5173/password-recovery?token=${resetToken}`;

    await sendPasswordResetEmail(user, resetLink);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const missingField = validateRequired(['token', 'password'], req.body);
    if (missingField) return res.status(400).json({ message: `${missingField} is required` });

    const user = await findUserByResetToken(token);
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await updatePassword(user.id, hashedPassword);
    await clearResetToken(user.id);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
