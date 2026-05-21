const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId, role) => {
  return jwt.sign(
    { user_id: userId, role: role },
    process.env.JWT_SECRET || 'airport_management_jwt_secret_key_123456',
    { expiresIn: '24h' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    const user = await User.create({ username, password, role });
    const token = generateToken(user.user_id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = generateToken(user.user_id, user.role);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load user profile',
      error: error.message
    });
  }
};
