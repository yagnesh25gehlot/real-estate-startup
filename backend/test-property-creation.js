const axios = require('axios');

async function testPropertyCreation() {
  try {
    console.log('Testing property creation...');
    
    const testProperty = {
      title: 'Test Property',
      description: 'This is a test property for sale',
      type: 'APARTMENT',
      location: 'Test Location',
      address: '123 Test Street, Test City, Test State 12345',
      price: 500000,
      latitude: 12.9716,
      longitude: 77.5946
    };

    const response = await axios.post('http://localhost:3001/api/properties', testProperty, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will be handled by the auth middleware
      }
    });

    console.log('✅ Property creation successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Property creation failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testPropertyCreation();
