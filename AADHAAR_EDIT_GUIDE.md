# 🆔 **Aadhaar Card Edit Functionality Guide**

## ✅ **Current Server Status**
- **Backend:** `http://localhost:3001` ✅ Running
- **Frontend:** `http://localhost:5173` ✅ Running (Single Server)

## 🎯 **Aadhaar Card Edit Features Available**

### **1. Aadhaar Number Editing**
- ✅ **Edit Aadhaar Number** - Update your 12-digit Aadhaar number
- ✅ **Form Validation** - Ensures 12-digit format
- ✅ **Real-time Display** - Shows formatted number (XXXX-XXXX-XXXX)

### **2. Aadhaar Card Image Upload**
- ✅ **Upload Aadhaar Image** - Upload photo of your Aadhaar card
- ✅ **Image Preview** - View uploaded Aadhaar card image
- ✅ **File Validation** - Supports JPG, PNG, GIF, SVG formats
- ✅ **Size Limit** - Maximum 5MB file size

## 📋 **Step-by-Step Instructions**

### **Step 1: Access Profile Page**
```
http://localhost:5173/profile
```

### **Step 2: Login (if not logged in)**
```
http://localhost:5173/login
```
**Credentials:** `user1@test.com` / `AnotherPass123!`

### **Step 3: Edit Aadhaar Information**

#### **3.1 Edit Aadhaar Number:**
1. Click the **"Edit Profile"** button (top right)
2. Find the **"Aadhaar Number"** field
3. Enter your 12-digit Aadhaar number
4. Click **"Save Changes"**

#### **3.2 Upload Aadhaar Card Image:**
1. Click the **"Edit Profile"** button (top right)
2. Scroll to the **"Aadhaar Number"** section
3. Click **"Upload Aadhaar Image"** link
4. Select an image file of your Aadhaar card
5. Wait for upload to complete

## 🎯 **Aadhaar Edit Form Details**

### **Aadhaar Number Input Field:**
```html
<input
  id="aadhaar"
  name="aadhaar"
  type="text"
  placeholder="Enter 12-digit Aadhaar number"
  maxLength={12}
/>
```

### **Aadhaar Image Upload:**
```html
<input
  id="aadhaar-image-upload"
  type="file"
  accept="image/*"
  onChange={handleAadhaarImageUpload}
/>
```

## 📱 **User Interface Features**

### **View Mode:**
- Shows current Aadhaar number in formatted display
- Displays Aadhaar card image if uploaded
- Shows "Not provided" if no data

### **Edit Mode:**
- Text input for Aadhaar number (12-digit limit)
- File upload button for Aadhaar image
- Save and Cancel buttons

### **Validation:**
- Aadhaar number must be exactly 12 digits
- Image file must be under 5MB
- Only image formats accepted

## 🔧 **API Endpoints Used**

### **Update Aadhaar Number:**
```
PUT /api/auth/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "aadhaar": "123456789012"
}
```

### **Upload Aadhaar Image:**
```
POST /api/auth/aadhaar-image
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData: aadhaarImage=<file>
```

## 🎉 **Expected Behavior**

### **When Editing Aadhaar Number:**
1. Click "Edit Profile" button
2. Aadhaar number field becomes editable
3. Enter 12-digit number
4. Click "Save Changes"
5. Success message appears
6. Number displays in formatted view

### **When Uploading Aadhaar Image:**
1. Click "Edit Profile" button
2. Click "Upload Aadhaar Image"
3. Select image file
4. Upload progress shows
5. Success message appears
6. Image preview displays

## 🚀 **Quick Test**

1. **Login:** `http://localhost:5173/login`
2. **Profile:** `http://localhost:5173/profile`
3. **Edit:** Click "Edit Profile"
4. **Aadhaar:** Update number or upload image
5. **Save:** Click "Save Changes"

## ✅ **All Aadhaar Features Working**

- ✅ **Aadhaar number editing** with 12-digit validation
- ✅ **Aadhaar image upload** with file validation
- ✅ **Image preview** functionality
- ✅ **Form validation** and error handling
- ✅ **Success notifications** for completed actions
- ✅ **Real-time updates** after save

---

## 🎯 **FINAL ANSWER**

**URL:** `http://localhost:5173/profile`

**Aadhaar Edit Features:**
- ✅ Edit 12-digit Aadhaar number
- ✅ Upload Aadhaar card image
- ✅ View Aadhaar card preview
- ✅ Form validation and error handling

**🎉 All Aadhaar card edit functionality is working perfectly!**
