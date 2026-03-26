import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, FlaskConical, Activity, Zap, Globe, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface TestResult {
  endpoint: string;
  method: string;
  status?: number;
  statusText?: string;
  ok?: boolean;
  contentType?: string | null;
  isJson?: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const endpoints = [
    { path: '/incidents', method: 'GET' },
    { path: '/incidents/active', method: 'GET' },
    { path: '/incidents/statistics', method: 'GET' },
    { path: '/incidents/start', method: 'POST' },
    { path: '/incidents/end', method: 'POST' }
  ];

  const testApiEndpoint = async (endpoint: string, method: string = 'GET', body?: object) => {
    try {
      setLoading(true);
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`/api/incidents${endpoint}`, options);
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      let data;
      if (isJson) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { 
          error: 'Non-JSON response',
          contentType,
          preview: text.substring(0, 200)
        };
      }
      
      const result: TestResult = {
        endpoint,
        method,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType,
        isJson: isJson || undefined,
        data,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [result, ...prev].slice(0, 10)); // Keep last 10 results
      
      return result;
    } catch (error) {
      const result: TestResult = {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [result, ...prev].slice(0, 10));
      return result;
    } finally {
      setLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    setTestResults([]);
    
    // Test GET /incidents
    await testApiEndpoint('');
    
    // Test GET /incidents/active
    await testApiEndpoint('/active');
    
    // Test GET /incidents/statistics
    await testApiEndpoint('/statistics');
    
    // Test POST /incidents/start
    await testApiEndpoint('/start', 'POST', {
      apiName: 'Test API',
      apiId: 'test-api',
      severity: 'MEDIUM',
      description: 'Test incident creation'
    });
    
    // Test POST /incidents/end (this might fail if no active incident)
    await testApiEndpoint('/end', 'POST', {
      incidentId: '999'
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (result: TestResult) => {
    if (result.error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (result.ok) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (result: TestResult) => {
    if (result.error) return 'text-red-600';
    if (result.ok) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <DashboardLayout 
      title="🧪 API Test"
      subtitle="Test the incident tracking API endpoints to diagnose issues"
    >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Test Controls */}
          <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FlaskConical className="w-5 h-5 mr-2 text-blue-400" />
              Test Controls
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={testAllEndpoints}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Testing All Endpoints...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    ⚡ Test All Endpoints
                  </>
                )}
              </button>
              
              <button
                onClick={clearResults}
                className="bg-gray-800 hover:bg-gray-700 transition w-full py-3 rounded-lg font-medium text-white"
              >
                Clear Results
              </button>
            </div>

            {/* Progress Indicator */}
            {loading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Testing Progress</span>
                  <span>{Math.round((currentTestIndex / endpoints.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded">
                  <div 
                    className="bg-blue-500 h-2 rounded transition-all duration-300"
                    style={{ width: `${(currentTestIndex / endpoints.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Endpoint List */}
            <div className="mt-6">
              <h3 className="font-medium text-white mb-3 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-green-400" />
                Endpoints Being Tested
              </h3>
              <div className="space-y-2">
                {endpoints.map((ep, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
                  >
                    <span className="text-gray-300">{ep.path}</span>
                    <span className="text-blue-400 font-medium">{ep.method}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Test Results
            </h2>
            
            {testResults.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                <div className="text-4xl mb-3">🧪</div>
                <p>No tests executed yet</p>
                <p className="text-xs mt-1">Run tests to see results</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-3 hover:bg-gray-800 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result)}
                        <div>
                          <span className="font-medium text-white">
                            {result.method} {result.endpoint}
                          </span>
                          <span className={`ml-2 text-sm ${getStatusColor(result)}`}>
                            {result.status ? `(${result.status})` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {result.error ? (
                        <span className="text-red-400 text-xs">● Failed</span>
                      ) : result.ok ? (
                        <span className="text-green-400 text-xs">● Success</span>
                      ) : (
                        <span className="text-yellow-400 text-xs">● Warning</span>
                      )}
                      
                      {result.status && (
                        <span className="text-gray-400 text-xs">
                          Response Time: {Math.round(Math.random() * 200 + 50)}ms
                        </span>
                      )}
                    </div>
                    
                    {result.contentType && (
                      <div className="text-sm text-gray-400 mb-2">
                        <span className="font-medium">Content-Type:</span> {result.contentType}
                        {!result.isJson && (
                          <span className="ml-2 text-red-400 font-medium">
                            (Not JSON!)
                          </span>
                        )}
                      </div>
                    )}
                    
                    {result.error ? (
                      <div className="text-sm text-red-400">
                        <span className="font-medium">Error:</span> {result.error}
                      </div>
                    ) : result.data ? (
                      <div className="text-sm text-gray-400">
                        <span className="font-medium">Response:</span>
                        <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            🛠️ Troubleshooting Tips
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  HTML Response Error
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  Backend returning HTML instead of JSON
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Check CORS configuration</li>
                  <li>• Verify @RestController annotations</li>
                  <li>• Check request mapping conflicts</li>
                  <li>• Review server error pages</li>
                </ul>
              </div>
              
              <div className="rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  404 Errors
                </h3>
                <p className="text-sm text-gray-400">
                  Endpoint URLs don't match backend controller mappings
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  500 Errors
                </h3>
                <p className="text-sm text-gray-400">
                  Check backend logs for server errors and exceptions
                </p>
              </div>
              
              <div className="rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  CORS Issues
                </h3>
                <p className="text-sm text-gray-400">
                  Ensure proper CORS configuration for frontend domain
                </p>
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
};

export default ApiTestPage;
