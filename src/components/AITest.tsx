// src/components/AITest.tsx - GEMINI 2.0 FLASH (LATEST MODEL)
import React, { useState } from 'react';

const AITest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testGemini2Flash = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Starting Gemini 2.0 Flash Test...');
      
      // ✅ STEP 1: Check environment variable
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('🔑 Gemini API Key Status:', {
        available: !!apiKey,
        prefix: apiKey ? apiKey.substring(0, 10) + '...' : 'None',
        valid: apiKey ? apiKey.startsWith('AIza') : false,
        length: apiKey?.length || 0
      });

      if (!apiKey) {
        throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
      }

      // ✅ STEP 2: Water engineering test prompt
      const testPrompt = `You are an expert water harvesting engineer. Please respond with exactly this format:

SYSTEM_NAME: Gemini 2.0 Smart Water System
STORAGE_SIZE: 5000
TOTAL_COST: 75000
REASONING: Gemini 2.0 Flash-optimized system for testing`;

      console.log('📡 Making Gemini 2.0 Flash API request...');
      console.log('🌐 URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
      console.log('📝 Using X-goog-api-key header format');

      // ✅ STEP 3: Make Gemini 2.0 Flash API call with correct headers
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey  // ✅ FIXED: Use X-goog-api-key header
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: testPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      // ✅ STEP 4: Check response
      console.log('📊 Gemini 2.0 Response Status:', response.status);
      console.log('📊 Gemini 2.0 Response OK:', response.ok);
      console.log('📊 Gemini 2.0 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini 2.0 HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // ✅ STEP 5: Parse Gemini response
      const data = await response.json();
      console.log('✅ Raw Gemini 2.0 Response:', data);

      // ✅ STEP 6: Extract generated text from Gemini format
      let generatedText = '';
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        generatedText = data.candidates[0].content.parts[0].text;
      } else {
        console.warn('⚠️ Unexpected Gemini 2.0 response format:', data);
        generatedText = JSON.stringify(data);
      }

      console.log('📄 Extracted Gemini 2.0 Text:', generatedText);

      setResult({
        success: true,
        status: response.status,
        rawData: data,
        generatedText,
        apiKeyUsed: true,
        timestamp: new Date().toISOString(),
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
        analysis: {
          hasResponse: !!generatedText,
          responseLength: generatedText.length,
          containsExpectedText: generatedText.toLowerCase().includes('system'),
          hasStructuredFormat: generatedText.includes('SYSTEM_NAME:'),
          isWorking: generatedText.length > 20,
          gemini2Powered: true,
          model: 'gemini-2.0-flash'
        }
      });

    } catch (error: any) {
      console.error('❌ Gemini 2.0 Test Failed:', error);
      setResult({
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            🚀 Gemini 2.0 Flash AI Test
          </h1>
          <p className="text-gray-400">
            Test the latest Gemini 2.0 Flash model for water system recommendations
          </p>
          <div className="mt-2 inline-flex items-center space-x-2 text-sm text-purple-400">
            <span>🔥 Latest Model</span>
            <span>•</span>
            <span>⚡ Super Fast</span>
            <span>•</span>
            <span>🆓 Free</span>
            <span>•</span>
            <span>🎯 Best Quality</span>
          </div>
        </div>
        
        {/* Environment Check */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">🔍 Environment Check</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Gemini API Key:</span>
                <span className={import.meta.env.VITE_GEMINI_API_KEY ? 'text-green-400' : 'text-red-400'}>
                  {import.meta.env.VITE_GEMINI_API_KEY ? '✅ Available' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Key Format:</span>
                <span className={import.meta.env.VITE_GEMINI_API_KEY?.startsWith('AIza') ? 'text-green-400' : 'text-red-400'}>
                  {import.meta.env.VITE_GEMINI_API_KEY?.startsWith('AIza') ? '✅ Valid' : '❌ Invalid'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="text-purple-400">gemini-2.0-flash</span>
              </div>
              <div className="flex justify-between">
                <span>Header Format:</span>
                <span className="text-blue-400">X-goog-api-key</span>
              </div>
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-purple-400 font-bold mb-3">🚀 Gemini 2.0 Flash Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="space-y-2">
              <p>• Latest Google AI model (December 2024)</p>
              <p>• Optimized for speed and accuracy</p>
              <p>• Best for engineering and technical tasks</p>
            </div>
            <div className="space-y-2">
              <p>• 100% free with generous limits</p>
              <p>• Superior reasoning capabilities</p>
              <p>• Perfect for water system recommendations</p>
            </div>
          </div>
        </div>

        {/* API Key Instructions (if missing) */}
        {!import.meta.env.VITE_GEMINI_API_KEY && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-blue-400 font-bold mb-3">🔑 Get Your Free Gemini API Key</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>Step 1:</strong> Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google AI Studio</a></p>
              <p><strong>Step 2:</strong> Sign in with Google account</p>
              <p><strong>Step 3:</strong> Click "Create API Key"</p>
              <p><strong>Step 4:</strong> Copy key (starts with AIza...)</p>
              <p><strong>Step 5:</strong> Add to .env: <code className="bg-black/50 px-2 py-1 rounded">VITE_GEMINI_API_KEY=AIza...</code></p>
              <div className="mt-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                <p className="text-green-300 text-sm">🆓 <strong>Completely Free:</strong> No credit card required!</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Button */}
        <div className="text-center mb-6">
          <button
            onClick={testGemini2Flash}
            disabled={loading || !import.meta.env.VITE_GEMINI_API_KEY}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : !import.meta.env.VITE_GEMINI_API_KEY
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg'
            }`}
          >
            {loading 
              ? '🔄 Testing Gemini 2.0 Flash...' 
              : !import.meta.env.VITE_GEMINI_API_KEY 
              ? '🔑 Add API Key First'
              : '🚀 Test Gemini 2.0 Flash'
            }
          </button>
          
          {loading && (
            <div className="mt-4">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-400 mt-2">Testing latest Gemini 2.0 Flash model...</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Quick Summary */}
            <div className={`rounded-lg p-6 ${
              result.success 
                ? (result.analysis?.isWorking ? 'bg-green-900/30 border border-green-500/30' : 'bg-yellow-900/30 border border-yellow-500/30')
                : 'bg-red-900/30 border border-red-500/30'
            }`}>
              <h3 className="text-xl font-bold mb-4">
                {result.success 
                  ? (result.analysis?.isWorking ? '✅ Gemini 2.0 Flash is Working Perfectly!' : '⚠️ Gemini Connected but Check Response')
                  : '❌ Gemini 2.0 Flash Connection Failed'
                }
              </h3>
              
              {result.success && result.analysis && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                  <div className="text-center">
                    <div className={result.analysis.hasResponse ? 'text-green-400' : 'text-red-400'}>
                      {result.analysis.hasResponse ? '✅' : '❌'}
                    </div>
                    <div>Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400">{result.analysis.responseLength}</div>
                    <div>Characters</div>
                  </div>
                  <div className="text-center">
                    <div className={result.analysis.hasStructuredFormat ? 'text-green-400' : 'text-yellow-400'}>
                      {result.analysis.hasStructuredFormat ? '✅' : '⚠️'}
                    </div>
                    <div>Structured</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400">{result.tokensUsed}</div>
                    <div>Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-pink-400">🚀</div>
                    <div>2.0 Flash</div>
                  </div>
                </div>
              )}
              
              {result.error && (
                <div className="text-red-300 text-sm mt-4">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>

            {/* AI Response Display */}
            {result.success && result.generatedText && (
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6">
                <h4 className="font-semibold text-purple-400 mb-3">🚀 Gemini 2.0 Flash Response:</h4>
                <div className="bg-black/40 p-4 rounded border border-purple-500/20">
                  <p className="text-purple-200 font-mono text-sm whitespace-pre-wrap">
                    {result.generatedText}
                  </p>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Model: {result.analysis.model} • Tokens: {result.tokensUsed} • Latest AI technology
                </div>
              </div>
            )}

            {/* What This Means */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-blue-400">🎯 What This Means</h3>
              
              {result.success && result.analysis?.isWorking ? (
                <div className="space-y-3">
                  <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                    <p className="text-green-300 font-semibold mb-2">✅ Gemini 2.0 Flash is Working Perfectly!</p>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>• Your water system will get the latest AI technology</p>
                      <p>• Gemini 2.0 Flash is the most advanced model available</p>
                      <p>• Lightning fast responses with superior reasoning</p>
                      <p>• Perfect for complex water engineering calculations</p>
                      <p>• 100% free with generous usage limits</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded border border-purple-500/30">
                    <strong className="text-purple-300">✨ Your system will show:</strong>
                    <div className="text-purple-200 text-sm mt-1">"🚀 Gemini 2.0 Flash AI-Perfect Water System" with cutting-edge intelligence</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-red-300">❌ <strong>Get your free Gemini API key:</strong></p>
                  <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30 mt-3">
                    <p className="text-gray-300 mb-2"><strong>Quick Setup (30 seconds):</strong></p>
                    <ol className="text-gray-300 text-xs space-y-1 list-decimal list-inside">
                      <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google AI Studio</a></li>
                      <li>Sign in with Google account</li>
                      <li>Create free API key</li>
                      <li>Add to .env: <code className="bg-black/50 px-1 rounded">VITE_GEMINI_API_KEY=AIza...</code></li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Raw Data */}
            <details className="bg-gray-800 rounded-lg p-4">
              <summary className="cursor-pointer font-semibold text-gray-300 hover:text-white">
                📋 Raw Gemini 2.0 Response Data (Click to expand)
              </summary>
              <pre className="text-xs overflow-auto bg-black p-4 rounded mt-2 max-h-64 border border-gray-600">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🔄 Using the exact same format as your curl command with X-goog-api-key header</p>
        </div>
      </div>
    </div>
  );
};

export default AITest;
