import { useState, useEffect } from 'react'
import { propertiesApi } from '../services/api'

const DebugInfo = () => {
  const [apiStatus, setApiStatus] = useState<string>('Testing...')
  const [properties, setProperties] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('DebugInfo: Making API call...')
        const response = await propertiesApi.getAll()
        console.log('DebugInfo: API Response:', response)
        setProperties(response.data.properties || [])
        setApiStatus(`✅ API Connected - Properties loaded (${response.data.properties?.length || 0})`)
      } catch (err: any) {
        console.error('DebugInfo: API Error:', err)
        setError(err.message)
        setApiStatus('❌ API Error')
      }
    }

    testAPI()
  }, [])

  return (
    <div className="card mb-4">
      <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
      
      <div className="space-y-2">
        <p><strong>API Status:</strong> {apiStatus}</p>
        <p><strong>Properties Count:</strong> {properties.length}</p>
        <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
        
        {error && (
          <p className="text-red-600"><strong>Error:</strong> {error}</p>
        )}
        
        {properties.length > 0 && (
          <div>
            <p><strong>Sample Properties:</strong></p>
            <ul className="list-disc list-inside text-sm">
              {properties.slice(0, 3).map((prop: any) => (
                <li key={prop.id}>{prop.title} - ${prop.price}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default DebugInfo 