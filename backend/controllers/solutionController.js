const aiCommentGenerator = require('../utils/aiCommentGenerator');
const { mockUsers } = require('../middleware/authMiddleware');

// Mock data storage
let solutionIdCounter = 1;
const mockSolutions = {};

// @desc    Create new solution with AI analysis
// @route   POST /api/solutions
// @access  Private
const createSolution = async (req, res) => {
  try {
    const { title, problemId, language, originalCode, tags } = req.body;

    // Validate required fields
    if (!title || !problemId || !language || !originalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, problemId, language, and originalCode'
      });
    }

    // Generate AI analysis
    const analysis = await aiCommentGenerator.analyzeCode(originalCode, language);

    // Create solution
    const solutionId = solutionIdCounter++;
    const solution = {
      _id: solutionId.toString(),
      user: req.user._id,
      title,
      problemId,
      language,
      originalCode,
      commentedCode: analysis.commentedCode,
      optimizedCode: analysis.optimizedCode,
      analysis: {
        algorithmType: analysis.algorithmType,
        timeComplexity: analysis.timeComplexity,
        spaceComplexity: analysis.spaceComplexity,
        approach: analysis.approach,
        keyInsights: analysis.keyInsights,
        optimizations: analysis.optimizations
      },
      optimizationDetails: analysis.optimizationDetails,
      tags: tags || [],
      isPublic: true,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockSolutions[solutionId] = solution;

    // Update user stats
    if (mockUsers[req.user._id]) {
      mockUsers[req.user._id].stats.codeSubmissions = (mockUsers[req.user._id].stats.codeSubmissions || 0) + 1;
    }

    res.status(201).json({
      success: true,
      data: solution
    });
  } catch (error) {
    console.error('Create solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during solution creation'
    });
  }
};

// @desc    Get all solutions (with pagination and filtering)
// @route   GET /api/solutions
// @access  Public
const getSolutions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { language, problemId, userId, search } = req.query;

    // Build filter
    let solutions = Object.values(mockSolutions).filter(s => s.isPublic);
    if (language) solutions = solutions.filter(s => s.language === language);
    if (problemId) solutions = solutions.filter(s => s.problemId === problemId);
    if (userId) solutions = solutions.filter(s => s.user === userId);
    if (search) {
      const searchLower = search.toLowerCase();
      solutions = solutions.filter(s => 
        s.title.toLowerCase().includes(searchLower) || 
        s.analysis.approach.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt descending
    solutions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = solutions.length;
    const paginatedSolutions = solutions.slice(skip, skip + limit);

    // Populate user info
    const solutionsWithUser = paginatedSolutions.map(s => ({
      ...s,
      user: mockUsers[s.user] ? {
        _id: mockUsers[s.user]._id,
        name: mockUsers[s.user].name,
        email: mockUsers[s.user].email
      } : null
    }));

    res.json({
      success: true,
      data: solutionsWithUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get solutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single solution
// @route   GET /api/solutions/:id
// @access  Public
const getSolution = async (req, res) => {
  try {
    const solution = mockSolutions[req.params.id];

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Increment views if not the owner
    if (!req.user || solution.user !== req.user._id) {
      solution.views = (solution.views || 0) + 1;
    }

    // Count comments (avoid circular dependency by checking if module is loaded)
    let commentCount = 0;
    try {
      const commentController = require('./commentController');
      if (commentController.mockComments) {
        commentCount = Object.values(commentController.mockComments).filter(c => c.solution === solution._id).length;
      }
    } catch (e) {
      // Module not loaded yet, commentCount will be 0
    }

    // Populate user info
    const solutionWithUser = {
      ...solution,
      user: mockUsers[solution.user] ? {
        _id: mockUsers[solution.user]._id,
        name: mockUsers[solution.user].name,
        email: mockUsers[solution.user].email,
        stats: mockUsers[solution.user].stats
      } : null,
      commentCount
    };

    res.json({
      success: true,
      data: solutionWithUser
    });
  } catch (error) {
    console.error('Get solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update solution
// @route   PUT /api/solutions/:id
// @access  Private
const updateSolution = async (req, res) => {
  try {
    const { title, originalCode, language, tags, isPublic } = req.body;

    const solution = mockSolutions[req.params.id];

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Check ownership
    if (solution.user !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this solution'
      });
    }

    // Update fields
    if (title) solution.title = title;
    if (language) solution.language = language;
    if (tags) solution.tags = tags;
    if (isPublic !== undefined) solution.isPublic = isPublic;
    solution.updatedAt = new Date();

    // If code changed, regenerate AI analysis
    if (originalCode && originalCode !== solution.originalCode) {
      const analysis = await aiCommentGenerator.analyzeCode(originalCode, language || solution.language);
      
      solution.originalCode = originalCode;
      solution.commentedCode = analysis.commentedCode;
      solution.optimizedCode = analysis.optimizedCode;
      solution.analysis = {
        algorithmType: analysis.algorithmType,
        timeComplexity: analysis.timeComplexity,
        spaceComplexity: analysis.spaceComplexity,
        approach: analysis.approach,
        keyInsights: analysis.keyInsights,
        optimizations: analysis.optimizations
      };
      solution.optimizationDetails = analysis.optimizationDetails;
    }

    // Populate user info
    const solutionWithUser = {
      ...solution,
      user: mockUsers[solution.user] ? {
        _id: mockUsers[solution.user]._id,
        name: mockUsers[solution.user].name,
        email: mockUsers[solution.user].email
      } : null
    };

    res.json({
      success: true,
      data: solutionWithUser
    });
  } catch (error) {
    console.error('Update solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during solution update'
    });
  }
};

// @desc    Delete solution
// @route   DELETE /api/solutions/:id
// @access  Private
const deleteSolution = async (req, res) => {
  try {
    const solution = mockSolutions[req.params.id];

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Check ownership
    if (solution.user !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this solution'
      });
    }

    delete mockSolutions[req.params.id];

    res.json({
      success: true,
      message: 'Solution deleted successfully'
    });
  } catch (error) {
    console.error('Delete solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during solution deletion'
    });
  }
};

// @desc    Get real-time code analysis
// @route   POST /api/solutions/analyze
// @access  Public
const analyzeCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code and language'
      });
    }

    // Use the full analysis to get commentedCode and optimizedCode
    const analysis = await aiCommentGenerator.analyzeCode(code, language);

    if (!analysis) {
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze code'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during code analysis'
    });
  }
};

// @desc    Get user's solutions
// @route   GET /api/solutions/user/me
// @access  Private
const getMySolutions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const solutions = Object.values(mockSolutions)
      .filter(s => s.user === req.user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = solutions.length;
    const paginatedSolutions = solutions.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginatedSolutions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my solutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createSolution,
  getSolutions,
  getSolution,
  updateSolution,
  deleteSolution,
  analyzeCode,
  getMySolutions,
  mockSolutions
};
