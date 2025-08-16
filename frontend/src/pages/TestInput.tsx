import React, { useState } from 'react'

const TestInput = () => {
  const [mobile, setMobile] = useState('')
  const [aadhaar, setAadhaar] = useState('')

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Input Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Mobile Number</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              console.log('Mobile input:', e.target.value, '->', value)
              setMobile(value)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter mobile number"
            maxLength={10}
          />
          <p className="text-sm text-gray-500 mt-1">Current value: "{mobile}"</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Aadhaar Number</label>
          <input
            type="text"
            value={aadhaar}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              console.log('Aadhaar input:', e.target.value, '->', value)
              setAadhaar(value)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter aadhaar number"
            maxLength={12}
          />
          <p className="text-sm text-gray-500 mt-1">Current value: "{aadhaar}"</p>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <p>Mobile: "{mobile}"</p>
          <p>Aadhaar: "{aadhaar}"</p>
        </div>
      </div>
    </div>
  )
}

export default TestInput
