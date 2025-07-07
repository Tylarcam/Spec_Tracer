import React, { useState, useRef } from 'react';

// LayoutAnalyzerPanel: Visual Layout Analysis for Debugging
// Future extensibility: Modular API adapter, open-source model support, config system
const LayoutAnalyzerPanel = () => {
  // State management
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle screenshot upload
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshot(event.target?.result as string);
      setAnalysisResult(null);
      setGeneratedPrompt('');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Copy to clipboard utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optionally show toast/feedback
    });
  };

  // Prompt template for layout analysis
  const getPromptTemplate = () => `
Analyze this screenshot for layout issues and generate a clear prompt for AI debugging.

Focus on:
- Alignment inconsistencies
- Spacing problems
- Responsive design issues
- Visual hierarchy problems

Output format: JSON with issues_detected, generated_prompt, suggested_fixes
`;

  // OpenAI API integration (GPT-4o Mini)
  const analyzeLayoutWithAI = async (imageData: string) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setGeneratedPrompt('');
    try {
      // NOTE: Replace with your actual OpenAI API key management
      const apiKey = localStorage.getItem('logtrace-api-key') || '';
      if (!apiKey) throw new Error('Missing OpenAI API key. Configure it in settings.');
      const prompt = getPromptTemplate();
      // For now, just send the image as a base64 string in the prompt (future: use vision models or upload to a backend)
      const userPrompt = `${prompt}\nBase64 Screenshot: ${imageData.slice(0, 100)}...`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert front-end developer and layout debugger.' },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.4,
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data = await response.json();
      // Try to parse JSON from the response
      let issues = null;
      let generated = '';
      try {
        const content = data.choices[0].message.content;
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          issues = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
          generated = issues.generated_prompt || '';
        } else {
          generated = content;
        }
      } catch (err) {
        generated = data.choices[0].message.content;
      }
      setAnalysisResult(issues);
      setGeneratedPrompt(generated);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <div className="bg-slate-900 text-green-200 rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto mt-8 border border-cyan-700">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Layout Analyzer Panel</h2>
      {/* Screenshot Upload Section */}
      <div className="mb-6">
        <label className="block text-cyan-300 font-semibold mb-2">Upload Screenshot</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleScreenshotUpload}
            className="hidden"
          />
          <button
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Image
          </button>
          {screenshot && (
            <img src={screenshot} alt="Screenshot preview" className="h-16 rounded border border-cyan-700" />
          )}
        </div>
      </div>
      {/* Analyze Button */}
      <div className="mb-6">
        <button
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
          onClick={() => screenshot && analyzeLayoutWithAI(screenshot)}
          disabled={!screenshot || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Layout'}
        </button>
      </div>
      {/* Error State */}
      {error && (
        <div className="bg-red-800 text-red-200 p-3 rounded mb-4 animate-pulse">
          {error}
        </div>
      )}
      {/* Analysis Results */}
      {analysisResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">Detected Issues</h3>
          <pre className="bg-slate-800 p-3 rounded text-green-200 overflow-x-auto text-xs">
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        </div>
      )}
      {/* Generated Prompt Output */}
      {generatedPrompt && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">AI-Generated Prompt</h3>
          <div className="bg-slate-800 p-3 rounded text-green-200 mb-2 text-sm whitespace-pre-line">
            {generatedPrompt}
          </div>
          <button
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1 rounded shadow focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onClick={() => copyToClipboard(generatedPrompt)}
          >
            Copy Prompt
          </button>
        </div>
      )}
      {/* Future extensibility: Export, model config, etc. */}
    </div>
  );
};

export default LayoutAnalyzerPanel; 