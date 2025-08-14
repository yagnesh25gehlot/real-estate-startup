# 🆔 **Aadhaar Image Upload - How to Access**

## ✅ **Current Server Status**
- **Backend:** `http://localhost:3001` ✅ Running
- **Frontend:** `http://localhost:5176` ✅ Running

## 🎯 **CORRECT URL TO USE**

```
http://localhost:5176/profile
```

## 📋 **How to Access Aadhaar Image Upload**

### **Step 1: Login**
```
http://localhost:5176/login
```
**Credentials:** `user1@test.com` / `AnotherPass123!`

### **Step 2: Access Profile Page**
```
http://localhost:5176/profile
```

### **Step 3: Enter Edit Mode**
1. Click the **"Edit Profile"** button (top right of the page)
2. The page will switch to edit mode

### **Step 4: Find Aadhaar Upload**
1. Scroll down to the **"Aadhaar Number"** section
2. You will see:
   - Current Aadhaar number (if any)
   - Current Aadhaar image (if uploaded)
   - **"Upload Aadhaar Image"** link (blue text with upload icon)

### **Step 5: Upload Aadhaar Image**
1. Click the **"Upload Aadhaar Image"** link
2. Select an image file of your Aadhaar card
3. Wait for upload to complete
4. You'll see a success message

## 🔍 **Why "Upload Aadhaar Image" Might Not Be Visible**

### **Reason 1: Not in Edit Mode**
- The upload link only appears when you click "Edit Profile"
- Make sure you're in edit mode

### **Reason 2: Wrong URL**
- Use: `http://localhost:5176/profile` (not 5173 or 5174)

### **Reason 3: Not Logged In**
- You must be logged in to see the profile page
- Login at: `http://localhost:5176/login`

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

## 🎯 **Aadhaar Upload Features**

### **Available in Edit Mode:**
- ✅ **Upload Aadhaar Image** - Click to upload Aadhaar card photo
- ✅ **Edit Aadhaar Number** - Update 12-digit Aadhaar number
- ✅ **Image Preview** - View uploaded Aadhaar image
- ✅ **File Validation** - Supports JPG, PNG, GIF, SVG
- ✅ **Size Limit** - Maximum 5MB

## 🔧 **Troubleshooting**

### **If "Upload Aadhaar Image" is not visible:**
1. Make sure you clicked **"Edit Profile"** button
2. Check you're on the correct URL: `http://localhost:5176/profile`
3. Ensure you're logged in
4. Scroll down to the Aadhaar section

### **If upload doesn't work:**
1. Check file size (must be under 5MB)
2. Ensure file is an image format
3. Check browser console for errors

## 🚀 **Quick Test Steps**

1. **Login:** `http://localhost:5176/login`
2. **Profile:** `http://localhost:5176/profile`
3. **Edit:** Click **"Edit Profile"** button
4. **Upload:** Click **"Upload Aadhaar Image"** link
5. **Select:** Choose an image file
6. **Save:** Click **"Save Changes"**

## ✅ **Expected Result**

After successful upload:
- ✅ Aadhaar image preview appears
- ✅ Success message shows
- ✅ Image is saved to your profile

---

## 🎯 **FINAL ANSWER**

**URL:** `http://localhost:5176/profile`

**Steps:**
1. Login with `user1@test.com` / `AnotherPass123!`
2. Click **"Edit Profile"** button
3. Scroll to Aadhaar section
4. Click **"Upload Aadhaar Image"** link
5. Select image file and save

**🎉 The Aadhaar image upload functionality is working perfectly!**
