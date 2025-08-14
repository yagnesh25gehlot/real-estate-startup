const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001/api';
let authToken = null;
let testUserId = null;
let testPropertyId = null;
let testBookingId = null;

// Test configuration
const testUser = {
  email: 'test@integration.com',
  password: 'TestPass123!',
  name: 'Integration Test User',
  mobile: '9876543210',
  aadhaar: '123456789012'
};

const testProperty = {
  title: 'Test Property',
  description: 'This is a test property for integration testing',
  type: 'HOUSE',
  location: 'Test City',
  address: '123 Test Street, Test City, Test State 123456',
  latitude: 12.9716,
  longitude: 77.5946,
  price: 500000
};

// Utility functions
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const createTestImage = () => {
  // Create a simple SVG test image
  const svgContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="blue"/>
    <text x="50" y="50" text-anchor="middle" fill="white">Test</text>
  </svg>`;
  
  const buffer = Buffer.from(svgContent);
  // Create a Blob-like object for FormData
  return {
    buffer,
    name: 'test-image.svg',
    type: 'image/svg+xml',
    size: buffer.length
  };
};

// Test suite
class IntegrationTests {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, testFn) {
    try {
      log(`🧪 Running test: ${name}`);
      await testFn();
      log(`✅ PASSED: ${name}`);
      this.passed++;
    } catch (error) {
      log(`❌ FAILED: ${name} - ${error.message || error}`);
      this.failed++;
    }
  }

  async runAll() {
    log('🚀 Starting Integration Tests');
    log('==================================================');

    // Health check tests
    await this.test('Health Check', this.testHealthCheck.bind(this));
    
    // Authentication tests
    await this.test('User Signup', this.testUserSignup.bind(this));
    await this.test('User Login', this.testUserLogin.bind(this));
    await this.test('Get Profile', this.testGetProfile.bind(this));
    
    // Property tests
    await this.test('Create Property', this.testCreateProperty.bind(this));
    await this.test('Get Properties', this.testGetProperties.bind(this));
    await this.test('Get Property by ID', this.testGetPropertyById.bind(this));
    await this.test('Update Property', this.testUpdateProperty.bind(this));
    
    // Booking tests
    await this.test('Create Booking', this.testCreateBooking.bind(this));
    await this.test('Get My Bookings', this.testGetMyBookings.bind(this));
    await this.test('Get Booking by ID', this.testGetBookingById.bind(this));
    
    // Admin tests
    await this.test('Admin Login', this.testAdminLogin.bind(this));
    await this.test('Get All Bookings (Admin)', this.testGetAllBookings.bind(this));
    await this.test('Approve Booking (Admin)', this.testApproveBooking.bind(this));
    await this.test('Get All Properties (Admin)', this.testGetAllProperties.bind(this));
    
    // Dealer tests
    await this.test('Dealer Signup', this.testDealerSignup.bind(this));
    await this.test('Apply for Dealer', this.testApplyForDealer.bind(this));
    
    // Profile and file upload tests
    await this.test('Upload Profile Picture', this.testUploadProfilePicture.bind(this));
    await this.test('Upload Aadhaar Image', this.testUploadAadhaarImage.bind(this));
    await this.test('Update Profile', this.testUpdateProfile.bind(this));
    
    // Property management tests
    await this.test('Delete Property', this.testDeleteProperty.bind(this));
    await this.test('Get Property Types', this.testGetPropertyTypes.bind(this));
    await this.test('Get Locations', this.testGetLocations.bind(this));

    this.printResults();
  }

  printResults() {
    log('==================================================');
    log(`🎯 Test Results: ${this.passed} passed, ${this.failed} failed`);
    log(`📊 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(2)}%`);
    
    if (this.failed > 0) {
      log('❌ Some tests failed. Please check the logs above.');
      process.exit(1);
    } else {
      log('🎉 All tests passed!');
    }
  }

  // Health check test
  async testHealthCheck() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.status || response.data.status !== 'OK') {
      throw new Error('Health check failed');
    }
  }

  // Authentication tests
  async testUserSignup() {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, testUser);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Signup failed');
    }
    testUserId = response.data.data.user.id;
    log('Created test user:', response.data.data.user.email);
  }

  async testUserLogin() {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Login failed');
    }
    
    authToken = response.data.data.token;
    log('Login successful, token received');
  }

  async testGetProfile() {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get profile failed');
    }
  }

  // Property tests
  async testCreateProperty() {
    const formData = new FormData();
    formData.append('title', testProperty.title);
    formData.append('description', testProperty.description);
    formData.append('type', testProperty.type);
    formData.append('location', testProperty.location);
    formData.append('address', testProperty.address);
    formData.append('latitude', testProperty.latitude.toString());
    formData.append('longitude', testProperty.longitude.toString());
    formData.append('price', testProperty.price.toString());
    
    // Add a test image
    const imageBuffer = createTestImage();
    formData.append('mediaFiles', imageBuffer, 'test-image.svg');

    const response = await axios.post(`${API_BASE_URL}/properties`, formData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Create property failed');
    }
    
    testPropertyId = response.data.data.id;
    log('Created test property:', testPropertyId);
  }

  async testGetProperties() {
    const response = await axios.get(`${API_BASE_URL}/properties`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get properties failed');
    }
    
    const properties = response.data.data.properties;
    if (!Array.isArray(properties)) {
      throw new Error('Properties should be an array');
    }
    
    log(`Found ${properties.length} properties`);
  }

  async testGetPropertyById() {
    const response = await axios.get(`${API_BASE_URL}/properties/${testPropertyId}`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get property by ID failed');
    }
    
    const property = response.data.data;
    if (property.id !== testPropertyId) {
      throw new Error('Property ID mismatch');
    }
  }

  async testUpdateProperty() {
    const updateData = {
      title: 'Updated Test Property',
      price: 600000
    };

    const response = await axios.put(`${API_BASE_URL}/properties/${testPropertyId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Update property failed');
    }
    
    if (response.data.data.title !== updateData.title) {
      throw new Error('Property title not updated');
    }
  }

  // Booking tests
  async testCreateBooking() {
    const bookingData = {
      propertyId: testPropertyId,
      paymentRef: 'TEST_PAYMENT_REF_123'
    };

    const response = await axios.post(`${API_BASE_URL}/bookings/create`, bookingData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Create booking failed');
    }
    
    testBookingId = response.data.data.id;
    log('Created test booking:', testBookingId);
  }

  async testGetMyBookings() {
    const response = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get my bookings failed');
    }
    
    const bookings = response.data.data;
    if (!Array.isArray(bookings)) {
      throw new Error('Bookings should be an array');
    }
    
    log(`Found ${bookings.length} bookings for user`);
  }

  async testGetBookingById() {
    const response = await axios.get(`${API_BASE_URL}/bookings/${testBookingId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get booking by ID failed');
    }
    
    const booking = response.data.data;
    if (booking.id !== testBookingId) {
      throw new Error('Booking ID mismatch');
    }
  }

  // Admin tests
  async testAdminLogin() {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'bussinessstatupwork@gmail.com',
      password: 'Nikku@25'
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Admin login failed');
    }
    
    authToken = response.data.data.token;
    log('Admin login successful');
  }

  async testGetAllBookings() {
    const response = await axios.get(`${API_BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get all bookings failed');
    }
    
    const bookings = response.data.data.bookings;
    if (!Array.isArray(bookings)) {
      throw new Error('Bookings should be an array');
    }
    
    log(`Admin found ${bookings.length} total bookings`);
  }

  async testApproveBooking() {
    const response = await axios.put(`${API_BASE_URL}/bookings/${testBookingId}/approve`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Approve booking failed');
    }
    
    log('Booking approved successfully');
  }

  async testGetAllProperties() {
    const response = await axios.get(`${API_BASE_URL}/properties/admin/all`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get all properties failed');
    }
    
    const properties = response.data.data.properties;
    if (!Array.isArray(properties)) {
      throw new Error('Properties should be an array');
    }
    
    log(`Admin found ${properties.length} total properties`);
  }

  // Dealer tests
  async testDealerSignup() {
    const dealerData = {
      email: 'dealer@test.com',
      password: 'DealerPass123!',
      name: 'Test Dealer',
      mobile: '9876543211',
      aadhaar: '123456789013',
      referralCode: 'TESTREF123'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/dealer-signup`, dealerData);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Dealer signup failed');
    }
    
    log('Dealer signup successful');
  }

  async testApplyForDealer() {
    // First login as regular user
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    const userToken = loginResponse.data.data.token;
    
    const response = await axios.post(`${API_BASE_URL}/auth/apply-dealer`, {
      referralCode: 'TESTREF123'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Apply for dealer failed');
    }
    
    log('Applied for dealer successfully');
  }

  // File upload tests
  async testUploadProfilePicture() {
    const imageBuffer = createTestImage();
    const formData = new FormData();
    formData.append('profilePic', imageBuffer, 'profile-test.svg');

    const response = await axios.post(`${API_BASE_URL}/auth/profile-picture`, formData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Upload profile picture failed');
    }
    
    log('Profile picture uploaded successfully');
  }

  async testUploadAadhaarImage() {
    const imageBuffer = createTestImage();
    const formData = new FormData();
    formData.append('aadhaarImage', imageBuffer, 'aadhaar-test.svg');

    const response = await axios.post(`${API_BASE_URL}/auth/aadhaar-image`, formData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Upload aadhaar image failed');
    }
    
    log('Aadhaar image uploaded successfully');
  }

  async testUpdateProfile() {
    const updateData = {
      name: 'Updated Test User',
      mobile: '9876543212'
    };

    const response = await axios.put(`${API_BASE_URL}/auth/profile`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Update profile failed');
    }
    
    if (response.data.data.name !== updateData.name) {
      throw new Error('Profile name not updated');
    }
  }

  // Property management tests
  async testDeleteProperty() {
    const response = await axios.delete(`${API_BASE_URL}/properties/${testPropertyId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Delete property failed');
    }
    
    log('Property deleted successfully');
  }

  async testGetPropertyTypes() {
    const response = await axios.get(`${API_BASE_URL}/properties/types/list`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get property types failed');
    }
    
    const types = response.data.data;
    if (!Array.isArray(types)) {
      throw new Error('Property types should be an array');
    }
    
    log(`Found ${types.length} property types`);
  }

  async testGetLocations() {
    const response = await axios.get(`${API_BASE_URL}/properties/locations/list`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get locations failed');
    }
    
    const locations = response.data.data;
    if (!Array.isArray(locations)) {
      throw new Error('Locations should be an array');
    }
    
    log(`Found ${locations.length} locations`);
  }
}

// Run the tests
async function runTests() {
  const tests = new IntegrationTests();
  await tests.runAll();
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTests;
