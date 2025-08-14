const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('🔍 Testing JWT token generation and verification...');
console.log('🔍 JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('🔍 JWT_SECRET length:', process.env.JWT_SECRET?.length);

const testUser = {
  id: '57705c8c-dc4b-4234-aaaf-95e8d12330ed',
  email: 'bussinessstatupwork@gmail.com',
  role: 'ADMIN'
};

const payload = {
  userId: testUser.id,
  email: testUser.email,
  role: testUser.role,
  iat: Math.floor(Date.now() / 1000),
};

console.log('🔍 Payload:', payload);

try {
  // Generate token
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'property-platform',
      audience: 'property-platform-users'
    }
  );
  
  console.log('✅ Token generated successfully');
  console.log('🔍 Token length:', token.length);
  
  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'property-platform',
    audience: 'property-platform-users'
  });
  
  console.log('✅ Token verified successfully');
  console.log('🔍 Decoded payload:', decoded);
  console.log('🔍 Decoded type:', typeof decoded);
  console.log('🔍 Decoded keys:', Object.keys(decoded));
  console.log('🔍 userId:', decoded.userId);
  console.log('🔍 email:', decoded.email);
  console.log('🔍 role:', decoded.role);
  
} catch (error) {
  console.error('❌ Error:', error);
}
