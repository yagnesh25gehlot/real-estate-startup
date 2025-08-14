# 🆔 Aadhaar Image Upload - End-to-End Guide

## 📋 **Overview**

This guide covers the complete Aadhaar image upload functionality implemented across the real estate platform. Users can upload Aadhaar images during signup and manage them from their profile page.

## 🎯 **Features Implemented**

### ✅ **Signup Pages**
- **Regular Signup** (`/signup`) - Aadhaar image upload during registration
- **Dealer Signup** (`/dealer-signup`) - Aadhaar image upload during dealer registration

### ✅ **Profile Management**
- **Profile Page** (`/profile`) - View, upload, and update Aadhaar images
- **Image Preview** - See uploaded Aadhaar images
- **Image Replacement** - Update existing Aadhaar images

### ✅ **Backend Support**
- **File Upload** - Secure file handling with validation
- **Storage** - Organized file storage in `/uploads/aadhaar/`
- **Database** - Aadhaar image URLs stored in user records

## 🚀 **How to Use**

### **1. During Signup (Regular User)**

**URL:** `http://localhost:5174/signup`

1. Fill in your basic information (name, email, mobile, etc.)
2. **Aadhaar Number** (optional) - Enter your 12-digit Aadhaar number
3. **Aadhaar Card Image** (optional) - Click the upload area to select an image
4. Complete the signup process

**Features:**
- ✅ File type validation (JPG, PNG, GIF, SVG)
- ✅ File size limit (5MB)
- ✅ Image preview before upload
- ✅ Remove image option
- ✅ Optional field (not required for signup)

### **2. During Dealer Signup**

**URL:** `http://localhost:5174/dealer-signup`

1. Fill in dealer information (name, email, mobile, etc.)
2. **Aadhaar Number** (optional) - Enter your 12-digit Aadhaar number
3. **Aadhaar Card Image** (optional) - Click the upload area to select an image
4. Enter referral code (optional)
5. Submit dealer application

**Features:**
- ✅ Same validation as regular signup
- ✅ Aadhaar image stored with dealer application
- ✅ Admin can view Aadhaar image during approval process

### **3. Profile Management**

**URL:** `http://localhost:5174/profile`

#### **View Current Aadhaar Image**
- Navigate to your profile page
- Scroll to the "Aadhaar Number" section
- View your uploaded Aadhaar image (if any)

#### **Upload New Aadhaar Image**
1. Click **"📤 Upload Aadhaar Image"** button
2. Select an image file from your device
3. Wait for upload to complete
4. See success message

#### **Update Existing Aadhaar Image**
1. Click **"Update Image"** button
2. Select a new image file
3. The old image will be replaced
4. See success message

#### **View Full Image**
1. Click **"View Full"** button
2. Image opens in a modal overlay
3. Click anywhere to close

#### **Edit Mode Features**
1. Click **"Edit Profile"** button
2. Scroll to Aadhaar section
3. Upload/update Aadhaar image
4. Save changes

## 🔧 **Technical Implementation**

### **Frontend Components**

#### **Signup Pages**
- **File Input** - Hidden file input with custom styling
- **Preview** - Image preview with remove option
- **Validation** - File type and size validation
- **FormData** - Multipart form data for file upload

#### **Profile Page**
- **Image Display** - Current Aadhaar image with fallback
- **Upload Button** - Styled upload button with loading state
- **Modal View** - Full-size image viewing
- **Edit Integration** - Aadhaar image management in edit mode

### **Backend API Endpoints**

#### **Signup Endpoints**
```typescript
POST /api/auth/signup
POST /api/auth/dealer-signup
```
- Accept multipart form data
- Handle Aadhaar image upload
- Store image URL in database

#### **Profile Management**
```typescript
POST /api/auth/aadhaar-image
PUT /api/auth/profile
GET /api/auth/me
```
- Upload new Aadhaar image
- Update profile information
- Retrieve user profile with Aadhaar image

### **File Storage**
- **Directory:** `backend/uploads/aadhaar/`
- **Naming:** `timestamp-random-filename.ext`
- **Validation:** Image files only, 5MB limit
- **Security:** Unique filenames prevent conflicts

## 📱 **User Experience**

### **Upload Process**
1. **Click Upload** - User clicks upload button
2. **File Selection** - File picker opens
3. **Validation** - File type and size checked
4. **Preview** - Image preview shown
5. **Upload** - File uploaded to server
6. **Success** - Success message displayed

### **Error Handling**
- **Invalid File Type** - "Please select a valid image file"
- **File Too Large** - "Image size should be less than 5MB"
- **Upload Failed** - "Failed to upload Aadhaar image"
- **Network Error** - Automatic retry with user notification

### **Loading States**
- **Uploading** - Button shows "Uploading..." text
- **Disabled State** - Button disabled during upload
- **Progress** - Visual feedback during file processing

## 🔒 **Security Features**

### **File Validation**
- **Type Check** - Only image files allowed
- **Size Limit** - Maximum 5MB per file
- **Extension Check** - Valid image extensions only

### **Storage Security**
- **Unique Names** - Prevents filename conflicts
- **Organized Structure** - Separate directories for different file types
- **Access Control** - Files served through controlled endpoints

### **Data Protection**
- **Optional Field** - Aadhaar image not required for account creation
- **User Control** - Users can upload/remove their own images
- **Admin Access** - Admins can view images for verification

## 🎨 **UI/UX Design**

### **Upload Interface**
- **Drag & Drop Area** - Visual upload zone
- **File Preview** - Thumbnail of selected image
- **Remove Button** - X button to remove selected file
- **Progress Indicator** - Upload progress feedback

### **Profile Display**
- **Thumbnail View** - Small preview in profile
- **Full View** - Modal for detailed viewing
- **Update Options** - Clear upload/update buttons
- **Status Indicators** - Shows if image is uploaded

### **Responsive Design**
- **Mobile Friendly** - Works on all screen sizes
- **Touch Optimized** - Easy touch interaction
- **Accessible** - Proper labels and ARIA attributes

## 🧪 **Testing Checklist**

### **Signup Testing**
- [ ] Upload valid image during signup
- [ ] Try invalid file types (rejected)
- [ ] Try files larger than 5MB (rejected)
- [ ] Complete signup without Aadhaar image
- [ ] Test both regular and dealer signup

### **Profile Testing**
- [ ] View existing Aadhaar image
- [ ] Upload new Aadhaar image
- [ ] Update existing Aadhaar image
- [ ] View full-size image
- [ ] Test edit mode functionality

### **Error Testing**
- [ ] Network failure during upload
- [ ] Invalid file selection
- [ ] Server error responses
- [ ] File corruption handling

## 🚀 **Quick Start**

### **For Users**
1. **Signup:** Go to `/signup` or `/dealer-signup`
2. **Upload:** Click Aadhaar image upload area
3. **Select:** Choose an image file
4. **Complete:** Finish registration process
5. **Manage:** Use profile page to update images

### **For Developers**
1. **Backend:** Ensure upload directories exist
2. **Frontend:** Check API endpoints are accessible
3. **Database:** Verify Aadhaar image fields exist
4. **Testing:** Run through the testing checklist

## 📞 **Support**

### **Common Issues**
- **Upload Fails** - Check file size and type
- **Image Not Showing** - Verify file path and permissions
- **Profile Not Loading** - Check authentication status

### **File Requirements**
- **Formats:** JPG, PNG, GIF, SVG
- **Size:** Maximum 5MB
- **Quality:** Clear, readable images recommended

---

**🎉 The Aadhaar image upload feature is now fully functional across all signup and profile pages!**
