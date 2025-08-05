const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Solution title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  problemId: {
    type: String,
    required: [true, 'Problem ID is required'],
    trim: true
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: ['javascript', 'python', 'java', 'cpp', 'typescript', 'csharp', 'go', 'rust', 'php', 'ruby'],
    default: 'javascript'
  },
  originalCode: {
    type: String,
    required: [true, 'Original code is required']
  },
  commentedCode: {
    type: String,
    required: [true, 'Commented code is required']
  },
  optimizedCode: {
    type: String,
    default: null
  },
  analysis: {
    algorithmType: {
      type: String,
      required: true
    },
    timeComplexity: {
      type: String,
      required: true
    },
    spaceComplexity: {
      type: String,
      required: true
    },
    approach: {
      type: String,
      required: true
    },
    keyInsights: [{
      type: String
    }],
    optimizations: [{
      type: String
    }]
  },
  optimizationDetails: {
    improvements: [{
      type: String
    }],
    complexityImprovement: {
      time: String,
      space: String
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
solutionSchema.index({ user: 1, createdAt: -1 });
solutionSchema.index({ problemId: 1, language: 1 });
solutionSchema.index({ tags: 1 });

// Virtual for comment count
solutionSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'solution',
  count: true
});

// Ensure virtuals are included in JSON output
solutionSchema.set('toJSON', { virtuals: true });
solutionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Solution', solutionSchema); 