import { MessageCircle, ThumbsUp, Reply, User } from 'lucide-react';

export const AuthPrompt = ({ action, onLogin, onSignup }) => {
  const getActionText = () => {
    switch (action) {
      case 'comment': return 'post comments';
      case 'vote': return 'vote on comments';
      case 'reply': return 'reply to comments';
      default: return 'participate in discussions';
    }
  };

  const getIcon = () => {
    switch (action) {
      case 'comment': return <MessageCircle className="h-8 w-8 text-blue-400" />;
      case 'vote': return <ThumbsUp className="h-8 w-8 text-green-400" />;
      case 'reply': return <Reply className="h-8 w-8 text-purple-400" />;
      default: return <User className="h-8 w-8 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Join the Community</h3>
      <p className="text-slate-400 mb-6">
        Sign in to {getActionText()} and engage with other developers in the community.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={onSignup}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Create Account
        </button>
      </div>
      <p className="text-slate-500 text-sm mt-4">
        💡 You can still use AI code commenting without an account
      </p>
    </div>
  );
};

export default AuthPrompt; 