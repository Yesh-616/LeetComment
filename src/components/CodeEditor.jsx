import { useState } from 'react';
import { Sparkles, Copy, Check, Loader2, Brain } from 'lucide-react';
import { solutionsAPI } from '../services/api';

// const LANGUAGES = [
//   { id: 'javascript', name: 'JavaScript', ext: 'js' },
//   { id: 'python', name: 'Python', ext: 'py' },
//   { id: 'java', name: 'Java', ext: 'java' },
//   { id: 'cpp', name: 'C++', ext: 'cpp' },
//   { id: 'typescript', name: 'TypeScript', ext: 'ts' },
// ];

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('commented');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateAnalysis = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await solutionsAPI.analyzeCode({ code, language });
      if (result.success) {
        setAnalysis(result.data);
        setActiveTab('commented');
        // Debug: log the full analysis object to the console
        console.log('AI analysis response:', result.data);
      } else {
        setError(result.message || 'Analysis failed');
      }
    } catch (err) {
      setError('Failed to analyze code.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Your Code Solution</h3>
          {/* <select 
            name="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select> */}
        </div>
        <textarea
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code solution here..."
          className="w-full h-72 bg-gray-900 border border-gray-600 rounded-lg p-4 text-sm font-mono text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          spellCheck={false}
        />
        <button
          onClick={handleGenerateAnalysis}
          disabled={!code.trim() || isAnalyzing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Generate Analysis and Comments</span>
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      {analysis && (
        <div className="space-y-6">
          {/* Main AI-Powered Analysis */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Analysis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Approach</div>
                <div className="text-gray-900 font-medium">{analysis.approach || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Time Complexity</div>
                <div className="text-green-600 font-mono">{analysis.timeComplexity || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Space Complexity</div>
                <div className="text-blue-600 font-mono">{analysis.spaceComplexity || '-'}</div>
              </div>
            </div>
            {analysis.keyInsights && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Key Insights</div>
                <div className="text-gray-800 whitespace-pre-line">{analysis.keyInsights}</div>
              </div>
            )}
          </div>

          {/* Optimized Analysis Card (only in Optimized tab) */}
          {activeTab === 'optimized' && analysis.optimizedAnalysis && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Optimized Code Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Approach</div>
                  <div className="text-gray-900 font-medium">{analysis.optimizedAnalysis.approach || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Time Complexity</div>
                  <div className="text-green-600 font-mono">{analysis.optimizedAnalysis.timeComplexity || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Space Complexity</div>
                  <div className="text-blue-600 font-mono">{analysis.optimizedAnalysis.spaceComplexity || '-'}</div>
                </div>
              </div>
              {analysis.optimizedAnalysis.keyInsights && (
                <div className="mt-2 mb-2">
                  <div className="text-xs text-gray-600 mb-1">Key Insights</div>
                  <div className="text-gray-800 whitespace-pre-line">{Array.isArray(analysis.optimizedAnalysis.keyInsights) ? analysis.optimizedAnalysis.keyInsights.join('\n') : analysis.optimizedAnalysis.keyInsights || '-'}</div>
                </div>
              )}
            </div>
          )}

          {/* Code Area Card */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('commented')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    activeTab === 'commented' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Commented
                </button>
                {analysis.optimizedCode && (
                  <button
                    onClick={() => setActiveTab('optimized')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      activeTab === 'optimized' 
                        ? 'bg-green-500 text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Optimized
                  </button>
                )}
              </div>
              <button
                onClick={() => copyToClipboard(
                  activeTab === 'commented' ? analysis.commentedCode : analysis.optimizedCode || ''
                )}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 h-96 overflow-auto">
              {/* Optimized tab: show highlighted message if code is already optimal */}
              {activeTab === 'optimized' && analysis.optimizedMessage && analysis.optimizedMessage.trim() && analysis.optimizedCode && analysis.optimizedCode.trim() === analysis.commentedCode?.trim() ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                      <Check className="h-6 w-6 text-green-600" />
                    </span>
                  </div>
                  <div className="text-green-700 font-semibold text-lg mb-1">Already Optimized!</div>
                  <div className="text-gray-700 text-sm">{analysis.optimizedMessage}</div>
                </div>
              ) : (
                <pre className="text-sm font-mono text-white whitespace-pre-wrap">
                  {activeTab === 'commented' ? analysis.commentedCode : analysis.optimizedCode}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CodeEditor; 