const { generateToken, mockUsers } = require('../middleware/authMiddleware');

// Mock data storage
let userIdCounter = 1;

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = Object.values(mockUsers).find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const userId = userIdCounter++;
    const user = {
      _id: userId.toString(),
      name,
      email,
      stats: {
        codeSubmissions: 0,
        commentsPosted: 0,
        upvotesReceived: 0
      },
      isActive: true,
      createdAt: new Date()
    };

    mockUsers[userId] = user;

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // In API-only mode, accept any password
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = mockUsers[req.user._id];
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = mockUsers[req.user._id];

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = Object.values(mockUsers).find(u => u.email === email && u._id !== user._id);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user
    user.name = name || user.name;
    user.email = email || user.email;
    user.avatar = avatar !== undefined ? avatar : user.avatar;

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    // In API-only mode, just return success
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

// @desc    Get user stats
// @route   GET /api/auth/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const user = mockUsers[req.user._id];
    res.json({
      success: true,
      data: {
        stats: user.stats,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUserStats
};
