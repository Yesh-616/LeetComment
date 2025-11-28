const { mockUsers } = require('../middleware/authMiddleware');
const { mockSolutions } = require('./solutionController');

// Mock data storage
let commentIdCounter = 1;
const mockComments = {};

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
    const solution = mockSolutions[solutionId];
    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // If this is a reply, check if parent comment exists
    if (parentCommentId) {
      const parentComment = mockComments[parentCommentId];
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Create comment
    const commentId = commentIdCounter++;
    const comment = {
      _id: commentId.toString(),
      solution: solutionId,
      author: req.user._id,
      content,
      parentComment: parentCommentId || null,
      replies: [],
      upvotes: 0,
      downvotes: 0,
      userVotes: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockComments[commentId] = comment;

    // If this is a reply, add to parent's replies
    if (parentCommentId) {
      const parentComment = mockComments[parentCommentId];
      if (parentComment) {
        parentComment.replies = parentComment.replies || [];
        parentComment.replies.push(commentId.toString());
      }
    }

    // Update user stats
    if (mockUsers[req.user._id]) {
      mockUsers[req.user._id].stats.commentsPosted = (mockUsers[req.user._id].stats.commentsPosted || 0) + 1;
    }

    // Populate author info
    const commentWithAuthor = {
      ...comment,
      author: mockUsers[req.user._id] ? {
        _id: mockUsers[req.user._id]._id,
        name: mockUsers[req.user._id].name,
        email: mockUsers[req.user._id].email
      } : null
    };

    res.status(201).json({
      success: true,
      data: commentWithAuthor
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
    const solution = mockSolutions[solutionId];
    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Get top-level comments (not replies)
    let comments = Object.values(mockComments).filter(c => 
      c.solution === solutionId && 
      !c.parentComment && 
      !c.isDeleted
    );

    // Sort by createdAt descending
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = comments.length;
    const paginatedComments = comments.slice(skip, skip + limit);

    // Populate author and replies
    const commentsWithDetails = paginatedComments.map(comment => {
      const replies = (comment.replies || [])
        .map(replyId => mockComments[replyId])
        .filter(r => r && !r.isDeleted)
        .map(reply => ({
          ...reply,
          author: mockUsers[reply.author] ? {
            _id: mockUsers[reply.author]._id,
            name: mockUsers[reply.author].name,
            email: mockUsers[reply.author].email
          } : null,
          userVote: req.user ? getUserVote(reply, req.user._id) : null
        }));

      return {
        ...comment,
        author: mockUsers[comment.author] ? {
          _id: mockUsers[comment.author]._id,
          name: mockUsers[comment.author].name,
          email: mockUsers[comment.author].email
        } : null,
        replies,
        userVote: req.user ? getUserVote(comment, req.user._id) : null
      };
    });

    res.json({
      success: true,
      data: commentsWithDetails,
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

// Helper function to get user vote
const getUserVote = (comment, userId) => {
  const vote = comment.userVotes.find(v => v.user === userId);
  return vote ? vote.vote : null;
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

    const comment = mockComments[req.params.id];

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.author !== req.user._id) {
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
    comment.updatedAt = new Date();

    // Populate author info
    const commentWithAuthor = {
      ...comment,
      author: mockUsers[comment.author] ? {
        _id: mockUsers[comment.author]._id,
        name: mockUsers[comment.author].name,
        email: mockUsers[comment.author].email
      } : null
    };

    res.json({
      success: true,
      data: commentWithAuthor
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
    const comment = mockComments[req.params.id];

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.author !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Soft delete - mark as deleted instead of removing
    comment.isDeleted = true;
    comment.updatedAt = new Date();

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

    const comment = mockComments[req.params.id];

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
    const existingVoteIndex = comment.userVotes.findIndex(v => v.user === req.user._id);

    if (existingVoteIndex !== -1) {
      const existingVote = comment.userVotes[existingVoteIndex];
      
      // Remove existing vote
      if (existingVote.vote === 'up') comment.upvotes--;
      else comment.downvotes--;
      
      // Remove vote if same type, otherwise change vote
      if (existingVote.vote === voteType) {
        comment.userVotes.splice(existingVoteIndex, 1);
      } else {
        comment.userVotes[existingVoteIndex].vote = voteType;
        comment.userVotes[existingVoteIndex].createdAt = new Date();
        if (voteType === 'up') comment.upvotes++;
        else comment.downvotes++;
      }
    } else {
      // Add new vote
      comment.userVotes.push({ user: req.user._id, vote: voteType, createdAt: new Date() });
      if (voteType === 'up') comment.upvotes++;
      else comment.downvotes++;
    }

    // Update author's upvotes received if upvoted
    if (voteType === 'up' && mockUsers[comment.author]) {
      mockUsers[comment.author].stats.upvotesReceived = (mockUsers[comment.author].stats.upvotesReceived || 0) + 1;
    }

    // Populate author info
    const commentWithAuthor = {
      ...comment,
      author: mockUsers[comment.author] ? {
        _id: mockUsers[comment.author]._id,
        name: mockUsers[comment.author].name,
        email: mockUsers[comment.author].email
      } : null
    };

    res.json({
      success: true,
      data: commentWithAuthor
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
    const comment = mockComments[req.params.id];

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Populate replies
    const replies = (comment.replies || [])
      .map(replyId => mockComments[replyId])
      .filter(r => r && !r.isDeleted)
      .map(reply => ({
        ...reply,
        author: mockUsers[reply.author] ? {
          _id: mockUsers[reply.author]._id,
          name: mockUsers[reply.author].name,
          email: mockUsers[reply.author].email
        } : null,
        userVote: req.user ? getUserVote(reply, req.user._id) : null
      }));

    const commentWithDetails = {
      ...comment,
      author: mockUsers[comment.author] ? {
        _id: mockUsers[comment.author]._id,
        name: mockUsers[comment.author].name,
        email: mockUsers[comment.author].email
      } : null,
      replies,
      userVote: req.user ? getUserVote(comment, req.user._id) : null
    };

    res.json({
      success: true,
      data: commentWithDetails
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

    let comments = Object.values(mockComments).filter(c => 
      c.author === req.user._id && !c.isDeleted
    );

    // Sort by createdAt descending
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = comments.length;
    const paginatedComments = comments.slice(skip, skip + limit);

    // Populate solution info
    const commentsWithSolution = paginatedComments.map(comment => ({
      ...comment,
      solution: mockSolutions[comment.solution] ? {
        _id: mockSolutions[comment.solution]._id,
        title: mockSolutions[comment.solution].title,
        problemId: mockSolutions[comment.solution].problemId
      } : null
    }));

    res.json({
      success: true,
      data: commentsWithSolution,
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
  getMyComments,
  mockComments
};
