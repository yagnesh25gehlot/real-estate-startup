import React, { useState } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const TestLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testLogin = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing login...');
      const response = await authApi.login({
        email: 'bussiness.statup.work@gmail.com',
        password: 'Nikku@25'
      });
      
      console.log('✅ Login test successful:', response.data);
      const { user, token } = response.data.data;
      
      console.log('🧪 Storing in localStorage...');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('🧪 localStorage check:');
      console.log('- user exists:', !!localStorage.getItem('user'));
      console.log('- user value:', localStorage.getItem('user'));
      
      setResult({
        success: true,
        data: response.data,
        user: response.data.data.user.email,
        role: response.data.data.user.role,
                  localStorage: {
            user: !!localStorage.getItem('user')
          }
      });
      toast.success('Login test successful!');
    } catch (error: any) {
      console.error('❌ Login test failed:', error);
      setResult({
        success: false,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Login test failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const checkLocalStorage = () => {
    const user = localStorage.getItem('user');
    
    console.log('🔍 Current localStorage:');
    console.log('- user:', user);
    
    setResult({
      localStorage: {
        user: !!user,
        userValue: user
      }
    });
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('user');
    console.log('🧹 localStorage cleared');
    setResult({ message: 'localStorage cleared' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Login Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
            <p><strong>Full API URL:</strong> {`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`}</p>
            <p><strong>Test Email:</strong> bussiness.statup.work@gmail.com</p>
            <p><strong>Test Password:</strong> Nikku@25</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <button
              onClick={testLogin}
              disabled={isLoading}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button
              onClick={checkLocalStorage}
              className="w-full btn btn-secondary"
            >
              Check localStorage
            </button>
            
            <button
              onClick={clearLocalStorage}
              className="w-full btn btn-danger"
            >
              Clear localStorage
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className="bg-gray-100 rounded p-4">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestLogin;
