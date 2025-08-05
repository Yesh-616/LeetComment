const Solution = require('../models/Solution');
const User = require('../models/User');
const aiCommentGenerator = require('../utils/aiCommentGenerator');

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
    const solution = await Solution.create({
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
      tags: tags || []
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.codeSubmissions': 1 }
    });

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

    // Build filter object
    const filter = { isPublic: true };
    if (language) filter.language = language;
    if (problemId) filter.problemId = problemId;
    if (userId) filter.user = userId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'analysis.approach': { $regex: search, $options: 'i' } }
      ];
    }

    const solutions = await Solution.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Solution.countDocuments(filter);

    res.json({
      success: true,
      data: solutions,
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
    const solution = await Solution.findById(req.params.id)
      .populate('user', 'name email stats')
      .populate({
        path: 'commentCount',
        select: 'content author createdAt'
      });

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Increment views if not the owner
    if (!req.user || solution.user._id.toString() !== req.user._id.toString()) {
      solution.views += 1;
      await solution.save();
    }

    res.json({
      success: true,
      data: solution
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

    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Check ownership
    if (solution.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this solution'
      });
    }

    // If code changed, regenerate AI analysis
    let updatedData = {
      title: title || solution.title,
      language: language || solution.language,
      tags: tags || solution.tags,
      isPublic: isPublic !== undefined ? isPublic : solution.isPublic
    };

    if (originalCode && originalCode !== solution.originalCode) {
      const analysis = await aiCommentGenerator.analyzeCode(originalCode, language || solution.language);
      
      updatedData = {
        ...updatedData,
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
        optimizationDetails: analysis.optimizationDetails
      };
    }

    const updatedSolution = await Solution.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json({
      success: true,
      data: updatedSolution
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
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Check ownership
    if (solution.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this solution'
      });
    }

    await Solution.findByIdAndDelete(req.params.id);

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

    const solutions = await Solution.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Solution.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: solutions,
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
  getMySolutions
}; 