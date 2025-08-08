# 🚀 Property Platform - Quick Start Guide

## ✅ Current Status
Both frontend and backend are now running successfully!

- **Frontend**: http://localhost:5173 ✅
- **Backend**: http://localhost:3001 ✅
- **Database**: PostgreSQL with test data ✅

## 🎯 Quick Access

### **1. Homepage**
```
http://localhost:5173
```
- Browse properties
- Use filters
- View property details

### **2. Login**
```
http://localhost:5173/login
```
- Click "Continue with Google" 
- Uses admin account: `bussiness.startup.work@gmail.com`
- Redirects to admin dashboard

### **3. Admin Dashboard**
```
http://localhost:5173/admin
```
- View platform statistics
- Manage properties and users
- Monitor bookings and revenue

### **4. Property Management**
```
http://localhost:5173/sell
```
- Create new properties
- Upload images
- Set pricing and details

## 🔧 Starting the Application

### **Option 1: Use the Startup Script (Recommended)**
```bash
./start-app.sh
```

### **Option 2: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🛑 Stopping the Application
```bash
pkill -f "npm run dev"
```

## 📊 Test Data Available
- **Users**: 4 (including admin)
- **Properties**: 7 test properties
- **Locations**: New York, Los Angeles, Miami, Chicago
- **Types**: HOUSE, APARTMENT, COMMERCIAL

## 🔍 Testing Checklist

### **Frontend Testing**
- [ ] Homepage loads with properties
- [ ] Filters work (type, location, price)
- [ ] Login redirects to admin dashboard
- [ ] Admin dashboard shows statistics
- [ ] Property creation form works
- [ ] Property details page loads

### **API Testing**
```bash
# Test properties API
curl http://localhost:3001/api/properties

# Test health check
curl http://localhost:3001/health

# Test admin dashboard (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/dashboard
```

## 🐛 Troubleshooting

### **Frontend Not Loading**
```bash
# Check if frontend is running
lsof -i :5173

# Restart frontend
cd frontend && npm run dev
```

### **Backend Not Responding**
```bash
# Check if backend is running
lsof -i :3001

# Restart backend
cd backend && npm run dev
```

### **Database Issues**
```bash
# Check database connection
docker exec -it property_platform_db psql -U postgres -d property_platform -c "SELECT COUNT(*) FROM \"User\";"
```

## 📱 Admin Account Details
- **Email**: bussiness.startup.work@gmail.com
- **Role**: ADMIN
- **Name**: Business Admin

## 🎉 Ready to Test!
Your application is now fully functional. Visit http://localhost:5173 to start exploring! 