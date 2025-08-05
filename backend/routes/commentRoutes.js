const express = require('express');
const { body } = require('express-validator');
const {
  createComment,
  getCommentsBySolution,
  updateComment,
  deleteComment,
  voteComment,
  getComment,
  getMyComments
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateCreateComment = [
  body('solutionId')
    .isMongoId()
    .withMessage('Please provide a valid solution ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content must be between 1 and 2000 characters'),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid parent comment ID')
];

const validateUpdateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content must be between 1 and 2000 characters')
];

const validateVote = [
  body('voteType')
    .isIn(['up', 'down'])
    .withMessage('Vote type must be either "up" or "down"')
];

// @route   POST /api/comments
// @desc    Create new comment
// @access  Private
router.post('/', protect, validateCreateComment, createComment);

// @route   GET /api/comments/solution/:solutionId
// @desc    Get comments for a solution
// @access  Public
router.get('/solution/:solutionId', optionalAuth, getCommentsBySolution);

// @route   GET /api/comments/:id
// @desc    Get comment by ID
// @access  Public
router.get('/:id', optionalAuth, getComment);

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private
router.put('/:id', protect, validateUpdateComment, updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private
router.delete('/:id', protect, deleteComment);

// @route   POST /api/comments/:id/vote
// @desc    Vote on comment
// @access  Private
router.post('/:id/vote', protect, validateVote, voteComment);

// @route   GET /api/comments/user/me
// @desc    Get user's comments
// @access  Private
router.get('/user/me', protect, getMyComments);

module.exports = router; 