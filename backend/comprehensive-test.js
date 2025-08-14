const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let adminToken = '';
let userToken = '';

async function testAllEndpoints() {
  console.log('🧪 Starting comprehensive API testing...\n');

  try {
    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@propertyplatform.com',
      password: 'admin123456'
    });
    
    if (adminLoginResponse.data.success) {
      adminToken = adminLoginResponse.data.data.token;
      console.log('✅ Admin login successful');
    } else {
      throw new Error('Admin login failed');
    }

    // Test 2: User Login
    console.log('\n2️⃣ Testing User Login...');
    const userLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user1@test.com',
      password: 'NewPassword123!'
    });
    
    if (userLoginResponse.data.success) {
      userToken = userLoginResponse.data.data.token;
      console.log('✅ User login successful');
    } else {
      throw new Error('User login failed');
    }

    // Test 3: Get All Users (Admin)
    console.log('\n3️⃣ Testing Get All Users (Admin)...');
    const usersResponse = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (usersResponse.data.success) {
      console.log(`✅ Retrieved ${usersResponse.data.data.length} users`);
    } else {
      throw new Error('Get users failed');
    }

    // Test 4: Create New User (Admin)
    console.log('\n4️⃣ Testing Create New User (Admin)...');
    const createUserResponse = await axios.post(`${API_BASE}/admin/users`, {
      email: 'testuser456@test.com',
      name: 'Test User 456',
      password: 'TestPass123!',
      mobile: '+91-9876543217',
      aadhaar: '777777777777',
      role: 'USER'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (createUserResponse.data.success) {
      const newUserId = createUserResponse.data.data.id;
      console.log('✅ User created successfully');
      console.log(`   User ID: ${newUserId}`);

      // Test 5: Update User (Admin)
      console.log('\n5️⃣ Testing Update User (Admin)...');
      const updateUserResponse = await axios.put(`${API_BASE}/admin/users/${newUserId}`, {
        name: 'Updated Test User 456',
        mobile: '+91-9876543218',
        aadhaar: '888888888888'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (updateUserResponse.data.success) {
        console.log('✅ User updated successfully');
      } else {
        throw new Error('Update user failed');
      }

      // Test 6: Upload Profile Picture (Admin)
      console.log('\n6️⃣ Testing Upload Profile Picture (Admin)...');
      const FormData = require('form-data');
      const fs = require('fs');
      
      const profileFormData = new FormData();
      profileFormData.append('profilePic', fs.createReadStream('test-image.svg'));
      
      const profileUploadResponse = await axios.post(`${API_BASE}/admin/users/${newUserId}/profile-picture`, profileFormData, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          ...profileFormData.getHeaders()
        }
      });
      
      if (profileUploadResponse.data.success) {
        console.log('✅ Profile picture uploaded successfully');
      } else {
        throw new Error('Profile picture upload failed');
      }

      // Test 7: Upload Aadhaar Image (Admin)
      console.log('\n7️⃣ Testing Upload Aadhaar Image (Admin)...');
      const aadhaarFormData = new FormData();
      aadhaarFormData.append('aadhaarImage', fs.createReadStream('test-image.svg'));
      
      const aadhaarUploadResponse = await axios.post(`${API_BASE}/admin/users/${newUserId}/aadhaar-image`, aadhaarFormData, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          ...aadhaarFormData.getHeaders()
        }
      });
      
      if (aadhaarUploadResponse.data.success) {
        console.log('✅ Aadhaar image uploaded successfully');
      } else {
        throw new Error('Aadhaar image upload failed');
      }

      // Test 8: Block User (Admin)
      console.log('\n8️⃣ Testing Block User (Admin)...');
      const blockUserResponse = await axios.put(`${API_BASE}/admin/users/${newUserId}/block`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (blockUserResponse.data.success) {
        console.log('✅ User blocked successfully');
      } else {
        throw new Error('Block user failed');
      }

      // Test 9: Unblock User (Admin)
      console.log('\n9️⃣ Testing Unblock User (Admin)...');
      const unblockUserResponse = await axios.put(`${API_BASE}/admin/users/${newUserId}/unblock`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (unblockUserResponse.data.success) {
        console.log('✅ User unblocked successfully');
      } else {
        throw new Error('Unblock user failed');
      }

      // Test 10: Delete User (Admin)
      console.log('\n🔟 Testing Delete User (Admin)...');
      const deleteUserResponse = await axios.delete(`${API_BASE}/admin/users/${newUserId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (deleteUserResponse.data.success) {
        console.log('✅ User deleted successfully');
      } else {
        throw new Error('Delete user failed');
      }
    } else {
      throw new Error('Create user failed');
    }

    // Test 11: Update User Profile (Self)
    console.log('\n1️⃣1️⃣ Testing Update User Profile (Self)...');
    const updateProfileResponse = await axios.put(`${API_BASE}/auth/profile`, {
      name: 'Alice Updated Again',
      mobile: '+91-9876543219',
      aadhaar: '999999999999'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (updateProfileResponse.data.success) {
      console.log('✅ User profile updated successfully');
    } else {
      throw new Error('Update profile failed');
    }

    // Test 12: Upload Profile Picture (Self)
    console.log('\n1️⃣2️⃣ Testing Upload Profile Picture (Self)...');
    const FormData = require('form-data');
    const fs = require('fs');
    
    const selfProfileFormData = new FormData();
    selfProfileFormData.append('profilePic', fs.createReadStream('test-image.svg'));
    
    const selfProfileUploadResponse = await axios.post(`${API_BASE}/auth/profile-picture`, selfProfileFormData, {
      headers: { 
        Authorization: `Bearer ${userToken}`,
        ...selfProfileFormData.getHeaders()
      }
    });
    
    if (selfProfileUploadResponse.data.success) {
      console.log('✅ Self profile picture uploaded successfully');
    } else {
      throw new Error('Self profile picture upload failed');
    }

    // Test 13: Upload Aadhaar Image (Self)
    console.log('\n1️⃣3️⃣ Testing Upload Aadhaar Image (Self)...');
    const selfAadhaarFormData = new FormData();
    selfAadhaarFormData.append('aadhaarImage', fs.createReadStream('test-image.svg'));
    
    const selfAadhaarUploadResponse = await axios.post(`${API_BASE}/auth/aadhaar-image`, selfAadhaarFormData, {
      headers: { 
        Authorization: `Bearer ${userToken}`,
        ...selfAadhaarFormData.getHeaders()
      }
    });
    
    if (selfAadhaarUploadResponse.data.success) {
      console.log('✅ Self Aadhaar image uploaded successfully');
    } else {
      throw new Error('Self Aadhaar image upload failed');
    }

    // Test 14: Get User Profile (Self)
    console.log('\n1️⃣4️⃣ Testing Get User Profile (Self)...');
    const getProfileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (getProfileResponse.data.success) {
      console.log('✅ User profile retrieved successfully');
      console.log(`   Name: ${getProfileResponse.data.data.name}`);
      console.log(`   Email: ${getProfileResponse.data.data.email}`);
      console.log(`   Mobile: ${getProfileResponse.data.data.mobile}`);
      console.log(`   Aadhaar: ${getProfileResponse.data.data.aadhaar}`);
      console.log(`   Profile Pic: ${getProfileResponse.data.data.profilePic ? 'Yes' : 'No'}`);
      console.log(`   Aadhaar Image: ${getProfileResponse.data.data.aadhaarImage ? 'Yes' : 'No'}`);
    } else {
      throw new Error('Get profile failed');
    }

    // Test 15: Change Password (Self)
    console.log('\n1️⃣5️⃣ Testing Change Password (Self)...');
    const changePasswordResponse = await axios.put(`${API_BASE}/auth/password`, {
      currentPassword: 'NewPassword123!',
      newPassword: 'AnotherPass123!'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (changePasswordResponse.data.success) {
      console.log('✅ Password changed successfully');
    } else {
      throw new Error('Change password failed');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Admin authentication');
    console.log('✅ User authentication');
    console.log('✅ User CRUD operations');
    console.log('✅ Image uploads (Profile & Aadhaar)');
    console.log('✅ User status management (Block/Unblock)');
    console.log('✅ Profile management');
    console.log('✅ Password management');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testAllEndpoints();
