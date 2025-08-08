import { useState, useEffect } from 'react'
import { propertiesApi } from '../services/api'

const TestPage = () => {
  const [status, setStatus] = useState('Testing...')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API connection...')
        const response = await propertiesApi.getAll()
        console.log('API Response:', response)
        setData(response.data)
        setStatus('✅ Success!')
      } catch (err: any) {
        console.error('API Error:', err)
        setError(err.message)
        setStatus('❌ Failed')
      }
    }

    testAPI()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="card mb-4">
        <h2 className="text-lg font-semibold mb-2">API Status</h2>
        <p className="mb-2"><strong>Status:</strong> {status}</p>
        <p className="mb-2"><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {data && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong> Found {data.properties?.length || 0} properties
          </div>
        )}
      </div>

      {data && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Properties Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default TestPage 