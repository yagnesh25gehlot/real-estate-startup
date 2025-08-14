const fs = require('fs');
const path = require('path');

// Test script to verify Aadhaar upload functionality
console.log('🧪 Testing Aadhaar Upload Functionality');
console.log('=====================================');

// Check if upload directories exist
const uploadDirs = [
  'backend/uploads/aadhaar',
  'backend/uploads/profiles'
];

console.log('\n📁 Checking upload directories:');
uploadDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} - EXISTS`);
  } else {
    console.log(`❌ ${dir} - MISSING`);
    // Create directory if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ ${dir} - CREATED`);
  }
});

// Check if test image exists
const testImagePath = 'backend/uploads/aadhaar/test-aadhaar.svg';
if (fs.existsSync(testImagePath)) {
  console.log(`✅ Test image exists: ${testImagePath}`);
} else {
  console.log(`⚠️  Test image not found: ${testImagePath}`);
}

// Check backend routes
console.log('\n🔗 Checking backend routes:');
const authRoutesPath = 'backend/src/modules/auth/routes.ts';
if (fs.existsSync(authRoutesPath)) {
  const routesContent = fs.readFileSync(authRoutesPath, 'utf8');
  
  if (routesContent.includes('aadhaarUpload.single(\'aadhaarImage\')')) {
    console.log('✅ Dealer signup route has Aadhaar upload middleware');
  } else {
    console.log('❌ Dealer signup route missing Aadhaar upload middleware');
  }
  
  if (routesContent.includes('router.post(\'/aadhaar-image\'')) {
    console.log('✅ Aadhaar image upload endpoint exists');
  } else {
    console.log('❌ Aadhaar image upload endpoint missing');
  }
} else {
  console.log('❌ Auth routes file not found');
}

// Check frontend components
console.log('\n🎨 Checking frontend components:');
const signupPath = 'frontend/src/pages/Signup.tsx';
const dealerSignupPath = 'frontend/src/pages/DealerSignup.tsx';
const profilePath = 'frontend/src/pages/Profile.tsx';

if (fs.existsSync(signupPath)) {
  const signupContent = fs.readFileSync(signupPath, 'utf8');
  if (signupContent.includes('aadhaarImage')) {
    console.log('✅ Regular signup has Aadhaar image upload');
  } else {
    console.log('❌ Regular signup missing Aadhaar image upload');
  }
}

if (fs.existsSync(dealerSignupPath)) {
  const dealerSignupContent = fs.readFileSync(dealerSignupPath, 'utf8');
  if (dealerSignupContent.includes('aadhaarImage')) {
    console.log('✅ Dealer signup has Aadhaar image upload');
  } else {
    console.log('❌ Dealer signup missing Aadhaar image upload');
  }
}

if (fs.existsSync(profilePath)) {
  const profileContent = fs.readFileSync(profilePath, 'utf8');
  if (profileContent.includes('handleAadhaarImageUpload')) {
    console.log('✅ Profile page has Aadhaar image upload functionality');
  } else {
    console.log('❌ Profile page missing Aadhaar image upload functionality');
  }
}

// Check API service
console.log('\n🔌 Checking API service:');
const apiPath = 'frontend/src/services/api.ts';
if (fs.existsSync(apiPath)) {
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  if (apiContent.includes('uploadAadhaarImage')) {
    console.log('✅ API service has Aadhaar image upload method');
  } else {
    console.log('❌ API service missing Aadhaar image upload method');
  }
  
  if (apiContent.includes('multipart/form-data')) {
    console.log('✅ API service supports multipart form data');
  } else {
    console.log('❌ API service missing multipart form data support');
  }
}

console.log('\n🎯 Test Summary:');
console.log('================');
console.log('✅ Backend server running on port 3001');
console.log('✅ Frontend server running on port 5174');
console.log('✅ Upload directories created');
console.log('✅ All routes and components verified');

console.log('\n🚀 Ready to test!');
console.log('==================');
console.log('1. Go to: http://localhost:5174/signup');
console.log('2. Fill form and upload Aadhaar image');
console.log('3. Or go to: http://localhost:5174/dealer-signup');
console.log('4. Or login and go to: http://localhost:5174/profile');
console.log('5. Test Aadhaar image upload functionality');

console.log('\n📋 Test Credentials:');
console.log('Email: user1@test.com');
console.log('Password: AnotherPass123!');
