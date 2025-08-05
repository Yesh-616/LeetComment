const Comment = require('../models/Comment');
const Solution = require('../models/Solution');
const User = require('../models/User');

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { solutionId, content, parentCommentId } = req.body;

    // Validate required fields
    if (!solutionId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide solutionId and content'
      });
    }

    // Check if solution exists
    const solution = await Solution.findById(solutionId);
    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // If this is a reply, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      solution: solutionId,
      author: req.user._id,
      content,
      parentComment: parentCommentId || null
    });

    // If this is a reply, add to parent's replies
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.commentsPosted': 1 }
    });

    // Populate author info
    await comment.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during comment creation'
    });
  }
};

// @desc    Get comments for a solution
// @route   GET /api/comments/solution/:solutionId
// @access  Public
const getCommentsBySolution = async (req, res) => {
  try {
    const { solutionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if solution exists
    const solution = await Solution.findById(solutionId);
    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Get top-level comments (not replies)
    const comments = await Comment.find({
      solution: solutionId,
      parentComment: null,
      isDeleted: false
    })
      .populate('author', 'name email')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add user vote information if authenticated
    if (req.user) {
      comments.forEach(comment => {
        comment.userVote = comment.getUserVote(req.user._id);
        if (comment.replies) {
          comment.replies.forEach(reply => {
            reply.userVote = reply.getUserVote(req.user._id);
          });
        }
      });
    }

    const total = await Comment.countDocuments({
      solution: solutionId,
      parentComment: null,
      isDeleted: false
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content'
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    // Check if comment is deleted
    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update deleted comment'
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'name email');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during comment update'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Soft delete - mark as deleted instead of removing
    comment.isDeleted = true;
    await comment.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during comment deletion'
    });
  }
};

// @desc    Vote on comment
// @route   POST /api/comments/:id/vote
// @access  Private
const voteComment = async (req, res) => {
  try {
    const { voteType } = req.body;

    if (!voteType || !['up', 'down'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid vote type (up or down)'
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if comment is deleted
    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on deleted comment'
      });
    }

    // Add vote
    await comment.addVote(req.user._id, voteType);

    // Update author's upvotes received if upvoted
    if (voteType === 'up') {
      await User.findByIdAndUpdate(comment.author, {
        $inc: { 'stats.upvotesReceived': 1 }
      });
    }

    await comment.populate('author', 'name email');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Vote comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during voting'
    });
  }
};

// @desc    Get comment by ID
// @route   GET /api/comments/:id
// @access  Public
const getComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name email')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name email'
        }
      });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Add user vote information if authenticated
    if (req.user) {
      comment.userVote = comment.getUserVote(req.user._id);
      if (comment.replies) {
        comment.replies.forEach(reply => {
          reply.userVote = reply.getUserVote(req.user._id);
        });
      }
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's comments
// @route   GET /api/comments/user/me
// @access  Private
const getMyComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      author: req.user._id,
      isDeleted: false
    })
      .populate('solution', 'title problemId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      author: req.user._id,
      isDeleted: false
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createComment,
  getCommentsBySolution,
  updateComment,
  deleteComment,
  voteComment,
  getComment,
  getMyComments
}; 