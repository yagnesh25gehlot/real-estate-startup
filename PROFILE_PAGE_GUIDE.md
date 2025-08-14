# 📱 Profile Page User Guide

## 🎯 **Correct URL for Profile Page**

**❌ Wrong URL:** `http://localhost:5173/profile`  
**✅ Correct URL:** `http://localhost:5174/profile`

## 🔐 **Login Required**

To access the Profile page, you need to be logged in. Use these credentials:

### **Test User Credentials:**
- **Email:** `user1@test.com`
- **Password:** `AnotherPass123!`

### **Admin Credentials:**
- **Email:** `admin@propertyplatform.com`
- **Password:** `admin123456`

## 📋 **Available Edit Functionality**

The Profile page includes **complete edit functionality** for:

### ✅ **Profile Information**
- **Full Name** - Edit your name
- **Mobile Number** - Update your mobile number
- **Aadhaar Number** - Edit your 12-digit Aadhaar number
- **Email** - Display only (cannot be changed)

### ✅ **Profile Picture**
- **Upload** - Click the camera icon to upload a new profile picture
- **Preview** - See your current profile picture
- **Supported formats:** JPG, PNG, GIF, SVG
- **Size limit:** 5MB

### ✅ **Aadhaar Card Image**
- **Upload** - Click "Upload Aadhaar Image" to upload Aadhaar card photo
- **Preview** - View your uploaded Aadhaar image
- **Supported formats:** JPG, PNG, GIF, SVG
- **Size limit:** 5MB

### ✅ **Password Management**
- **Change Password** - Update your password with validation
- **Password requirements:** 8+ characters, uppercase, lowercase, number, special character

## 🎮 **How to Use**

### **1. Access the Profile Page**
```
http://localhost:5174/profile
```

### **2. Edit Profile Information**
1. Click the **"Edit Profile"** button
2. Update your **Name**, **Mobile Number**, or **Aadhaar Number**
3. Click **"Save Changes"**

### **3. Upload Profile Picture**
1. Click the **camera icon** on your profile picture
2. Select an image file
3. Wait for upload to complete

### **4. Upload Aadhaar Image**
1. Click **"Upload Aadhaar Image"** (visible in edit mode)
2. Select an image file
3. Wait for upload to complete

### **5. Change Password**
1. Click **"Change Password"** in Security Settings
2. Enter current password
3. Enter new password (meets requirements)
4. Confirm new password
5. Click **"Update Password"**

## 🔧 **Troubleshooting**

### **If you can't access the page:**
1. Make sure you're using the correct URL: `http://localhost:5174/profile`
2. Ensure you're logged in
3. Check that both frontend and backend servers are running

### **If uploads don't work:**
1. Check file size (must be under 5MB)
2. Ensure file is an image format
3. Check internet connection
4. Try refreshing the page

### **If you can't log in:**
1. Use the correct credentials listed above
2. Make sure the backend server is running on port 3001
3. Check browser console for errors

## 📱 **Mobile Responsive**

The Profile page is fully responsive and works on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones

## 🎯 **Quick Test Steps**

1. **Login:** Go to `http://localhost:5174/login`
2. **Access Profile:** Go to `http://localhost:5174/profile`
3. **Test Edit:** Click "Edit Profile" and update information
4. **Test Upload:** Upload a profile picture and Aadhaar image
5. **Test Password:** Change your password

## 🚀 **All Features Working**

✅ **Profile editing** - Name, mobile, Aadhaar number  
✅ **Image uploads** - Profile picture and Aadhaar image  
✅ **Password management** - Secure password change  
✅ **Real-time validation** - Form validation and error handling  
✅ **Responsive design** - Works on all devices  
✅ **File validation** - Type and size checking  

---

**🎉 The Profile page has complete edit functionality for all requested features!**
