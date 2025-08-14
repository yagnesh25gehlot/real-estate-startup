import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAPI = async () => {
      try {
        // Test API health endpoint
        const healthResponse = await api.get('/health');
        console.log('Health check response:', healthResponse.data);
        
        // Test login endpoint (without credentials)
        try {
          await api.post('/auth/login', { email: 'test@test.com', password: 'test' });
        } catch (error: any) {
          console.log('Login endpoint test (expected to fail):', error.response?.status);
        }

        setDebugInfo({
          apiBaseUrl: api.defaults.baseURL,
          healthCheck: healthResponse.data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          localStorage: {
            user: !!localStorage.getItem('user'),
            token: !!localStorage.getItem('token'),
          }
        });
      } catch (error: any) {
        console.error('API check failed:', error);
        setDebugInfo({
          error: error.message,
          apiBaseUrl: api.defaults.baseURL,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    checkAPI();
  }, []);

  if (loading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-400 rounded text-sm">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-96">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default DebugInfo; 