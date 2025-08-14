import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAuth = () => {
  const { user, loading, isAuthenticated, login } = useAuth();

  const simulateAdminLogin = () => {
    const adminUser = {
      id: '01bfde72-b1ee-4df6-9868-8da3cc858f85',
      email: 'admin@propertyplatform.com',
      name: 'System Administrator',
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(adminUser));
    
    window.location.reload();
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Current Status:</h2>
        
        <div className="space-y-2">
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? 'Present' : 'None'}</p>
        </div>

        {user && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">User Details:</h3>
            <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Local Storage:</h3>
          <p><strong>User:</strong> {localStorage.getItem('user') ? 'Present' : 'None'}</p>
          <p><strong>User Data:</strong> {localStorage.getItem('user') ? 'Present' : 'None'}</p>
        </div>

        <div className="mt-4 space-x-4">
          <button 
            onClick={simulateAdminLogin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Simulate Admin Login
          </button>
          
          <button 
            onClick={clearAuth}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Auth
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>

        {isAuthenticated && user?.role === 'ADMIN' && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <h3 className="font-semibold mb-2">Admin Access:</h3>
            <a 
              href="/admin" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Go to Admin Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAuth;
