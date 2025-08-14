# User Management System - Complete Guide

## Overview

This guide covers the complete user management functionality implemented in the RealtyTopper platform, including:

- **User Profile Management** (for users themselves)
- **Admin User Management** (for administrators)
- **Image Upload Functionality** (Profile pictures and Aadhaar images)
- **CRUD Operations** (Create, Read, Update, Delete users)
- **Testing Procedures**

## 🎯 Features Implemented

### 1. User Profile Management (Self-Service)

#### Profile Information
- **Name**: Editable full name
- **Email**: Read-only (cannot be changed)
- **Mobile Number**: Editable with validation
- **Aadhaar Number**: Editable 12-digit number with validation
- **Profile Picture**: Upload and manage profile images
- **Aadhaar Image**: Upload and manage Aadhaar card images
- **Password**: Change password functionality

#### Image Upload Features
- **Profile Picture Upload**:
  - Supported formats: JPG, PNG, GIF, SVG
  - Maximum file size: 5MB
  - Automatic image resizing
  - Preview functionality
  - Error handling for invalid files

- **Aadhaar Image Upload**:
  - Same format and size restrictions
  - Secure storage in dedicated folder
  - Preview and validation
  - Admin can view uploaded images

### 2. Admin User Management

#### User CRUD Operations
- **Create Users**: Admins can create new users with all profile information
- **Read Users**: View all users with complete information
- **Update Users**: Edit any user's profile information
- **Delete Users**: Remove users (with safety checks)

#### Admin-Specific Features
- **Role Management**: Assign USER, DEALER, or ADMIN roles
- **Status Management**: Block/unblock users
- **Image Management**: Upload profile pictures and Aadhaar images for any user
- **Bulk Operations**: View and manage multiple users efficiently

### 3. Image Upload System

#### Technical Implementation
- **File Storage**: Local file system with organized folders
- **File Validation**: Type and size validation
- **Security**: Secure file naming and access control
- **Error Handling**: Comprehensive error messages
- **Progress Indicators**: Upload status feedback

#### Storage Structure
```
uploads/
├── profiles/          # Profile pictures
├── aadhaar/          # Aadhaar card images
└── properties/       # Property images (existing)
```

## 🚀 How to Use

### For Regular Users

#### 1. Access Profile Page
- Navigate to `/profile` after logging in
- View current profile information

#### 2. Edit Profile Information
- Click "Edit Profile" button
- Modify name, mobile number, and Aadhaar number
- Click "Save Changes" to update

#### 3. Upload Profile Picture
- Click the camera icon on the profile picture
- Select an image file (JPG, PNG, GIF, SVG)
- File will be automatically uploaded and displayed

#### 4. Upload Aadhaar Image
- In edit mode, click "Upload Aadhaar Image"
- Select a clear image of your Aadhaar card
- Image will be uploaded and stored securely

#### 5. Change Password
- Click "Change Password" in Security Settings
- Enter current password and new password
- Password must meet security requirements

### For Administrators

#### 1. Access Admin Users Page
- Navigate to `/admin/users` (admin access required)
- View all users in a comprehensive table

#### 2. Create New User
- Click "Add New User" button
- Fill in required information:
  - Email (required)
  - Name (required)
  - Password (optional for OAuth users)
  - Mobile number (optional)
  - Aadhaar number (optional)
  - Role (USER, DEALER, ADMIN)
- Click "Create User"

#### 3. Edit User Information
- Click the edit icon (pencil) next to any user
- Modify any field in the inline editor
- Upload profile picture or Aadhaar image
- Change user role
- Click save icon to update

#### 4. Manage User Images
- **Profile Picture**: Click camera icon when editing
- **Aadhaar Image**: Click upload button when editing
- Images are automatically processed and stored

#### 5. User Status Management
- **Block User**: Click ban icon to block user access
- **Unblock User**: Click checkmark icon to restore access
- **Delete User**: Click trash icon to permanently remove user

## 🧪 Testing the System

### Test Page
Navigate to `/test` to access the dedicated testing interface.

#### Test Features
1. **Profile Picture Upload Test**
   - Upload various image formats
   - Test file size limits
   - Verify preview functionality
   - Check error handling

2. **Aadhaar Image Upload Test**
   - Upload Aadhaar card images
   - Test validation and storage
   - Verify image display

3. **Integration Testing**
   - Test with different user roles
   - Verify admin permissions
   - Check data persistence

### Manual Testing Checklist

#### User Profile Testing
- [ ] Edit profile information
- [ ] Upload profile picture
- [ ] Upload Aadhaar image
- [ ] Change password
- [ ] View profile updates

#### Admin User Management Testing
- [ ] Create new user
- [ ] Edit existing user
- [ ] Upload images for users
- [ ] Change user roles
- [ ] Block/unblock users
- [ ] Delete users
- [ ] View all user information

#### Image Upload Testing
- [ ] Test valid image formats (JPG, PNG, GIF, SVG)
- [ ] Test invalid file types
- [ ] Test file size limits (5MB)
- [ ] Test large files (should be rejected)
- [ ] Test image preview functionality
- [ ] Test error handling

## 🔧 Technical Details

### Backend API Endpoints

#### User Profile Endpoints
```
PUT /api/auth/profile          # Update profile information
POST /api/auth/profile-picture # Upload profile picture
POST /api/auth/aadhaar-image   # Upload Aadhaar image
PUT /api/auth/password         # Change password
GET /api/auth/me               # Get current user profile
```

#### Admin User Management Endpoints
```
GET /api/admin/users                    # Get all users
GET /api/admin/users/:userId           # Get specific user
POST /api/admin/users                  # Create new user
PUT /api/admin/users/:userId           # Update user
DELETE /api/admin/users/:userId        # Delete user
POST /api/admin/users/:userId/profile-picture  # Upload profile pic for user
POST /api/admin/users/:userId/aadhaar-image    # Upload Aadhaar for user
PUT /api/admin/users/:userId/block     # Block user
PUT /api/admin/users/:userId/unblock   # Unblock user
```

### Database Schema

#### User Table
```sql
CREATE TABLE User (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255),
  mobile VARCHAR(20),
  aadhaar VARCHAR(12),
  aadhaarImage VARCHAR(500),
  profilePic VARCHAR(500),
  role ENUM('USER', 'DEALER', 'ADMIN') DEFAULT 'USER',
  status ENUM('ACTIVE', 'BLOCKED') DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### File Upload Configuration

#### Multer Configuration
```javascript
// Profile pictures
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/profiles/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});
```

## 🛡️ Security Features

### Data Validation
- **Email Validation**: Proper email format validation
- **Mobile Validation**: Indian mobile number format validation
- **Aadhaar Validation**: 12-digit number validation
- **Password Validation**: Strong password requirements
- **File Validation**: Type and size validation for uploads

### Access Control
- **Role-based Access**: Different permissions for USER, DEALER, ADMIN
- **Authentication Required**: All endpoints require valid authentication
- **Admin-only Operations**: User management restricted to admins
- **Self-service Limits**: Users can only edit their own profiles

### File Security
- **Secure File Names**: Unique, timestamped filenames
- **Type Validation**: Only image files allowed
- **Size Limits**: 5MB maximum file size
- **Organized Storage**: Separate folders for different file types

## 📱 Frontend Components

### Key Components
1. **Profile.tsx**: User profile management interface
2. **AdminUsers.tsx**: Admin user management interface
3. **TestPage.tsx**: Testing interface for image uploads

### State Management
- **React Hooks**: useState for local state management
- **Form Validation**: Real-time validation feedback
- **Error Handling**: Comprehensive error messages
- **Loading States**: Progress indicators for all operations

## 🚨 Error Handling

### Common Error Scenarios
1. **File Upload Errors**
   - Invalid file type
   - File too large
   - Network errors
   - Server errors

2. **Validation Errors**
   - Invalid email format
   - Invalid mobile number
   - Invalid Aadhaar number
   - Weak password

3. **Permission Errors**
   - Unauthorized access
   - Insufficient permissions
   - Admin-only operations

### Error Messages
- User-friendly error messages
- Toast notifications for feedback
- Console logging for debugging
- Graceful fallbacks

## 🔄 Future Enhancements

### Planned Features
1. **Image Processing**
   - Automatic image compression
   - Thumbnail generation
   - Image cropping tools

2. **Advanced User Management**
   - Bulk user operations
   - User import/export
   - Advanced filtering and search

3. **Enhanced Security**
   - Two-factor authentication
   - Session management
   - Audit logging

4. **Mobile Optimization**
   - Responsive design improvements
   - Mobile-specific upload features
   - Touch-friendly interfaces

## 📞 Support

For technical support or questions about the user management system:

1. **Check the logs** for detailed error information
2. **Review the API documentation** for endpoint details
3. **Test with the provided test page** for functionality verification
4. **Contact the development team** for additional assistance

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
