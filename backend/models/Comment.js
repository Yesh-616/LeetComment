const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  solution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot be more than 2000 characters']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  userVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vote: {
      type: String,
      enum: ['up', 'down'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
commentSchema.index({ solution: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// Virtual for total votes
commentSchema.virtual('totalVotes').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for vote ratio
commentSchema.virtual('voteRatio').get(function() {
  const total = this.upvotes + this.downvotes;
  return total > 0 ? (this.upvotes / total * 100).toFixed(1) : 0;
});

// Method to add vote
commentSchema.methods.addVote = function(userId, voteType) {
  const existingVoteIndex = this.userVotes.findIndex(vote => 
    vote.user.toString() === userId.toString()
  );

  if (existingVoteIndex !== -1) {
    const existingVote = this.userVotes[existingVoteIndex];
    
    // Remove existing vote
    if (existingVote.vote === 'up') this.upvotes--;
    else this.downvotes--;
    
    // Remove vote if same type, otherwise change vote
    if (existingVote.vote === voteType) {
      this.userVotes.splice(existingVoteIndex, 1);
    } else {
      this.userVotes[existingVoteIndex].vote = voteType;
      this.userVotes[existingVoteIndex].createdAt = new Date();
      if (voteType === 'up') this.upvotes++;
      else this.downvotes++;
    }
  } else {
    // Add new vote
    this.userVotes.push({ user: userId, vote: voteType });
    if (voteType === 'up') this.upvotes++;
    else this.downvotes++;
  }
  
  return this.save();
};

// Method to get user's vote
commentSchema.methods.getUserVote = function(userId) {
  const vote = this.userVotes.find(vote => 
    vote.user.toString() === userId.toString()
  );
  return vote ? vote.vote : null;
};

// Ensure virtuals are included in JSON output
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema); 