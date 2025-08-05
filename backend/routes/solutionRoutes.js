const express = require('express');
const { body } = require('express-validator');
const {
  createSolution,
  getSolutions,
  getSolution,
  updateSolution,
  deleteSolution,
  analyzeCode,
  getMySolutions
} = require('../controllers/solutionController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateCreateSolution = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('problemId')
    .trim()
    .notEmpty()
    .withMessage('Problem ID is required'),
  body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'typescript', 'csharp', 'go', 'rust', 'php', 'ruby'])
    .withMessage('Please provide a valid programming language'),
  body('originalCode')
    .trim()
    .notEmpty()
    .withMessage('Original code is required')
];

const validateUpdateSolution = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('language')
    .optional()
    .isIn(['javascript', 'python', 'java', 'cpp', 'typescript', 'csharp', 'go', 'rust', 'php', 'ruby'])
    .withMessage('Please provide a valid programming language'),
  body('originalCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Original code cannot be empty if provided')
];

const validateAnalyzeCode = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required'),
  body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'typescript', 'csharp', 'go', 'rust', 'php', 'ruby'])
    .withMessage('Please provide a valid programming language')
];

// @route   POST /api/solutions
// @desc    Create new solution with AI analysis
// @access  Private
router.post('/', protect, validateCreateSolution, createSolution);

// @route   GET /api/solutions
// @desc    Get all solutions (with pagination and filtering)
// @access  Public
router.get('/', optionalAuth, getSolutions);

// @route   GET /api/solutions/:id
// @desc    Get single solution
// @access  Public
router.get('/:id', optionalAuth, getSolution);

// @route   PUT /api/solutions/:id
// @desc    Update solution
// @access  Private
router.put('/:id', protect, validateUpdateSolution, updateSolution);

// @route   DELETE /api/solutions/:id
// @desc    Delete solution
// @access  Private
router.delete('/:id', protect, deleteSolution);

// @route   POST /api/solutions/analyze
// @desc    Get real-time code analysis
// @access  Public
router.post('/analyze', validateAnalyzeCode, analyzeCode);

// @route   GET /api/solutions/user/me
// @desc    Get user's solutions
// @access  Private
router.get('/user/me', protect, getMySolutions);

module.exports = router; 