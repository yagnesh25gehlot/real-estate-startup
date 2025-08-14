# 🆔 **Aadhaar Picture Upload & Edit Guide**

## ✅ **Current Server Status**
- **Backend:** `http://localhost:3001` ✅ Running
- **Frontend:** `http://localhost:5175` ✅ Running

## 🎯 **CORRECT URL TO USE**

```
http://localhost:5175/profile
```

## 📋 **How to Add/Edit Aadhaar Picture**

### **Step 1: Login**
```
http://localhost:5175/login
```
**Credentials:** `user1@test.com` / `AnotherPass123!`

### **Step 2: Access Profile Page**
```
http://localhost:5175/profile
```

### **Step 3: Enter Edit Mode**
1. Click the **"Edit Profile"** button (top right of the page)
2. The page will switch to edit mode

### **Step 4: Find Aadhaar Section**
1. Scroll down to the **"Aadhaar Number"** section
2. You will see:
   - Current Aadhaar number (if any)
   - Current Aadhaar picture (if uploaded)
   - **"Upload Aadhaar Image"** link (blue text with upload icon)

### **Step 5: Upload/Edit Aadhaar Picture**
1. Click the **"Upload Aadhaar Image"** link
2. Select an image file of your Aadhaar card
3. Wait for upload to complete
4. You'll see a success message

## 🎯 **Aadhaar Picture Options**

### **Option 1: Add New Aadhaar Picture**
- If no Aadhaar picture exists:
  1. Click **"Upload Aadhaar Image"**
  2. Select image file
  3. Click **"Save Changes"**

### **Option 2: Edit/Replace Existing Aadhaar Picture**
- If Aadhaar picture already exists:
  1. Click **"Upload Aadhaar Image"** (this will replace the existing one)
  2. Select new image file
  3. Click **"Save Changes"**

### **Option 3: Remove Aadhaar Picture**
- To remove the Aadhaar picture:
  1. Upload a blank/transparent image
  2. Or contact admin to remove it

## 📱 **Visual Guide**

### **View Mode (Default):**
```
┌─────────────────────────────────┐
│ Profile Information             │
│ ┌─────────────────────────────┐ │
│ │ Aadhaar Number: 1234-5678-9012 │ │
│ │ [Aadhaar Picture Preview]   │ │
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
│ │ [Aadhaar Picture Preview]   │ │
│ │                             │ │
│ │ 📤 Upload Aadhaar Image ← This │ │
│ │                             │ │
│ │ [Save Changes] [Cancel]     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🎯 **Aadhaar Picture Features**

### **Available in Edit Mode:**
- ✅ **Upload Aadhaar Picture** - Click to upload Aadhaar card photo
- ✅ **Edit Aadhaar Number** - Update 12-digit Aadhaar number
- ✅ **Picture Preview** - View uploaded Aadhaar picture
- ✅ **File Validation** - Supports JPG, PNG, GIF, SVG
- ✅ **Size Limit** - Maximum 5MB
- ✅ **Replace Picture** - Upload new picture to replace existing one

## 🔧 **Troubleshooting**

### **If "Upload Aadhaar Image" is not visible:**
1. Make sure you clicked **"Edit Profile"** button
2. Check you're on the correct URL: `http://localhost:5175/profile`
3. Ensure you're logged in
4. Scroll down to the Aadhaar section

### **If upload doesn't work:**
1. Check file size (must be under 5MB)
2. Ensure file is an image format (JPG, PNG, GIF, SVG)
3. Check browser console for errors
4. Try refreshing the page

### **If picture doesn't display:**
1. Check if the image file is valid
2. Try uploading a different image
3. Check browser console for errors

## 🚀 **Quick Test Steps**

1. **Login:** `http://localhost:5175/login`
2. **Profile:** `http://localhost:5175/profile`
3. **Edit:** Click **"Edit Profile"** button
4. **Upload:** Click **"Upload Aadhaar Image"** link
5. **Select:** Choose an image file
6. **Save:** Click **"Save Changes"**

## ✅ **Expected Result**

After successful upload:
- ✅ Aadhaar picture preview appears
- ✅ Success message shows
- ✅ Picture is saved to your profile
- ✅ Picture displays in view mode

## 🎯 **File Requirements**

### **Supported Formats:**
- JPG/JPEG
- PNG
- GIF
- SVG

### **Size Limits:**
- Maximum: 5MB
- Recommended: 1-2MB for faster upload

### **Image Quality:**
- Clear, readable Aadhaar card image
- Good lighting
- All text visible

---

## 🎯 **FINAL ANSWER**

**URL:** `http://localhost:5175/profile`

**Steps to Add/Edit Aadhaar Picture:**
1. Login with `user1@test.com` / `AnotherPass123!`
2. Click **"Edit Profile"** button
3. Scroll to Aadhaar section
4. Click **"Upload Aadhaar Image"** link
5. Select image file and save

**🎉 The Aadhaar picture upload and edit functionality is working perfectly!**
