import { useState } from 'react';
import CodeEditor from './components/CodeEditor';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Code Editor</h1>
        <p className="text-center text-gray-500 mb-6">Paste your code below and get instant AI-powered analysis and comments.</p>
        <CodeEditor />
      </div>
    </div>
  );
}

export default App; 