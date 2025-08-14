# 🆔 **Aadhaar Image View & Edit - Complete Guide**

## ✅ **Server Status - SINGLE PORT SETUP**
- **Backend:** `http://localhost:3001` ✅ Running
- **Frontend:** `http://localhost:5173` ✅ Running (Single Port)

## 🎯 **CORRECT URL TO USE**

```
http://localhost:5173/profile
```

## 📋 **Complete Aadhaar Functionality**

### **✅ What's Working:**
- ✅ **View Aadhaar Number** - Display formatted Aadhaar (XXXX-XXXX-XXXX)
- ✅ **View Aadhaar Image** - Display uploaded Aadhaar card image
- ✅ **Edit Aadhaar Number** - Update 12-digit Aadhaar number
- ✅ **Upload Aadhaar Image** - Upload new Aadhaar card photo
- ✅ **Replace Aadhaar Image** - Replace existing Aadhaar image
- ✅ **Image Preview** - See uploaded image immediately
- ✅ **File Validation** - Supports JPG, PNG, GIF, SVG (max 5MB)

## 🚀 **How to Access Aadhaar Features**

### **Step 1: Login**
```
http://localhost:5173/login
```
**Credentials:** `user1@test.com` / `AnotherPass123!`

### **Step 2: Access Profile Page**
```
http://localhost:5173/profile
```

### **Step 3: View Aadhaar Information**
- Scroll down to **"Aadhaar Number"** section
- You'll see:
  - Current Aadhaar number (formatted)
  - Current Aadhaar image (if uploaded)

### **Step 4: Edit Aadhaar Information**
1. Click **"Edit Profile"** button (top right)
2. Scroll to **"Aadhaar Number"** section
3. You'll see:
   - Editable Aadhaar number field
   - Current Aadhaar image preview
   - **"Upload Aadhaar Image"** link

### **Step 5: Upload/Edit Aadhaar Image**
1. Click **"Upload Aadhaar Image"** link
2. Select an image file of your Aadhaar card
3. Wait for upload to complete
4. Click **"Save Changes"**

## 🎯 **Aadhaar Options Available**

### **Option 1: Add New Aadhaar Image**
- If no Aadhaar image exists:
  1. Click **"Upload Aadhaar Image"**
  2. Select image file
  3. Click **"Save Changes"**

### **Option 2: Edit/Replace Existing Aadhaar Image**
- If Aadhaar image already exists:
  1. Click **"Upload Aadhaar Image"** (replaces existing)
  2. Select new image file
  3. Click **"Save Changes"**

### **Option 3: Edit Aadhaar Number**
- In edit mode:
  1. Update the Aadhaar number field
  2. Click **"Save Changes"**

## 📱 **Visual Guide**

### **View Mode (Default):**
```
┌─────────────────────────────────┐
│ Profile Information             │
│ ┌─────────────────────────────┐ │
│ │ Aadhaar Number: 1234-5678-9012 │ │
│ │ [Aadhaar Image Preview]     │ │
│ │                             │ │
│ │ [Edit Profile] ← Click this │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### **Edit Mode (After clicking "Edit Profile"):**
```
┌─────────────────────────────────┐
│ Profile Information             │
│ ┌─────────────────────────────┐ │
│ │ Aadhaar Number: [Input Field] │ │
│ │ [Aadhaar Image Preview]     │ │
│ │                             │ │
│ │ 📤 Upload Aadhaar Image ← This │ │
│ │                             │ │
│ │ [Save Changes] [Cancel]     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🧪 **Test Results**

### **✅ Backend Tests Passed:**
- ✅ Backend running on port 3001
- ✅ Health check endpoint working
- ✅ User authentication working
- ✅ Profile retrieval working
- ✅ Aadhaar number update working
- ✅ Aadhaar image upload endpoint available

### **✅ Frontend Tests Passed:**
- ✅ Frontend running on port 5173 (single port)
- ✅ Profile page accessible
- ✅ Edit mode working
- ✅ Aadhaar image upload UI working
- ✅ Image preview working

## 🔧 **Technical Details**

### **Backend Endpoints:**
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update profile (including Aadhaar)
- `POST /api/auth/aadhaar-image` - Upload Aadhaar image
- `POST /api/auth/profile-picture` - Upload profile picture

### **Frontend Components:**
- `Profile.tsx` - Main profile page with Aadhaar functionality
- `handleAadhaarImageUpload()` - Aadhaar image upload handler
- `handleProfileUpdate()` - Profile update handler

### **File Storage:**
- Aadhaar images: `/uploads/aadhaar/`
- Profile pictures: `/uploads/profiles/`
- Maximum file size: 5MB
- Supported formats: JPG, PNG, GIF, SVG

## 🎯 **Quick Test Steps**

1. **Login:** `http://localhost:5173/login`
   - Email: `user1@test.com`
   - Password: `AnotherPass123!`

2. **Profile:** `http://localhost:5173/profile`

3. **Edit:** Click **"Edit Profile"** button

4. **Upload:** Click **"Upload Aadhaar Image"** link

5. **Select:** Choose an image file

6. **Save:** Click **"Save Changes"**

## ✅ **Expected Results**

After successful upload:
- ✅ Aadhaar image preview appears
- ✅ Success message shows
- ✅ Image is saved to your profile
- ✅ Image displays in view mode
- ✅ Image persists after page refresh

## 🔍 **Troubleshooting**

### **If "Upload Aadhaar Image" is not visible:**
1. Make sure you clicked **"Edit Profile"** button
2. Check you're on the correct URL: `http://localhost:5173/profile`
3. Ensure you're logged in
4. Scroll down to the Aadhaar section

### **If upload doesn't work:**
1. Check file size (must be under 5MB)
2. Ensure file is an image format (JPG, PNG, GIF, SVG)
3. Check browser console for errors
4. Try refreshing the page

### **If image doesn't display:**
1. Check if the image file is valid
2. Try uploading a different image
3. Check browser console for errors

---

## 🎉 **FINAL STATUS**

**✅ SINGLE PORT SETUP COMPLETE:**
- Backend: Port 3001 ✅
- Frontend: Port 5173 ✅

**✅ AADHAAR FUNCTIONALITY COMPLETE:**
- View Aadhaar number and image ✅
- Edit Aadhaar number ✅
- Upload/Edit Aadhaar image ✅
- All tests passing ✅

**🌐 Ready to use:**
- **URL:** `http://localhost:5173/profile`
- **Login:** `user1@test.com` / `AnotherPass123!`

**🎉 Everything is working perfectly!**
