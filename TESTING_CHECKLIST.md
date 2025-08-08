# Property Platform - Complete Testing Checklist

## 🎯 **Your Admin Account**
- **Email**: bussiness.startup.work@gmail.com
- **Role**: ADMIN
- **Token**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjZlYjJiZC1kOWViLTQ5MTgtOWM2OS04NzQ3ZDc5MmMzNDgiLCJlbWFpbCI6ImJ1c3NpbmVzcy5zdGFydHVwLndvcmtAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU0NDg1MjYxLCJleHAiOjE3NTUwOTAwNjF9.3agJ9EdT4_qy4vZN02W0EvtxzXnKEEkTaKfu6FktNQY

## 📊 **Current Test Data**
- **Users**: 8 total users
- **Properties**: 6 properties across 4 cities
- **Bookings**: 2 bookings
- **Locations**: New York, Los Angeles, Miami, Chicago
- **Property Types**: HOUSE, APARTMENT, COMMERCIAL

## 🧪 **API Testing Commands**

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Admin Dashboard
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/admin/dashboard
```

### 3. View All Properties
```bash
curl http://localhost:3001/api/properties
```

### 4. Filter Properties
```bash
# By type
curl "http://localhost:3001/api/properties?type=HOUSE"

# By location
curl "http://localhost:3001/api/properties?location=New%20York"

# By price range
curl "http://localhost:3001/api/properties?minPrice=500000&maxPrice=1000000"
```

### 5. Create New User
```bash
curl -X POST http://localhost:3001/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"email":"newuser@example.com","name":"New User","role":"USER"}'
```

### 6. Create Property (with user token)
```bash
curl -X POST http://localhost:3001/api/properties \
     -H "Authorization: Bearer USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Property","description":"Test description","type":"HOUSE","location":"Test City","price":300000}'
```

### 7. Create Booking
```bash
curl -X POST http://localhost:3001/api/bookings \
     -H "Authorization: Bearer USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"propertyId":"PROPERTY_ID","startDate":"2025-08-20T00:00:00.000Z","endDate":"2025-08-23T00:00:00.000Z","amount":2000}'
```

### 8. View User Bookings
```bash
curl -H "Authorization: Bearer USER_TOKEN" \
     http://localhost:3001/api/bookings/my-bookings
```

## 🌐 **Frontend Testing**

### 1. Access Frontend
- **URL**: http://localhost:5173
- **Expected**: Homepage with properties and stats

### 2. Test Features
- [ ] View homepage with 6 properties
- [ ] Search by location
- [ ] Filter by property type
- [ ] Filter by price range
- [ ] View property details
- [ ] Test pagination (if more than 10 properties)

### 3. Check Stats Section
- [ ] Properties Available: Shows actual count (6)
- [ ] Cities Covered: Shows "50+" (hardcoded)
- [ ] Happy Customers: Shows "1000+" (hardcoded)

## 🗄️ **Database Testing**

### 1. Check Tables
```bash
docker exec -it property_platform_db psql -U postgres -d property_platform -c "\dt"
```

### 2. Count Records
```bash
# Users
docker exec -it property_platform_db psql -U postgres -d property_platform -c "SELECT COUNT(*) FROM \"User\";"

# Properties
docker exec -it property_platform_db psql -U postgres -d property_platform -c "SELECT COUNT(*) FROM \"Property\";"

# Bookings
docker exec -it property_platform_db psql -U postgres -d property_platform -c "SELECT COUNT(*) FROM \"Booking\";"
```

### 3. View Data
```bash
# All users
docker exec -it property_platform_db psql -U postgres -d property_platform -c "SELECT id, email, name, role FROM \"User\";"

# All properties
docker exec -it property_platform_db psql -U postgres -d property_platform -c "SELECT id, title, type, location, price FROM \"Property\";"

# All bookings
docker exec -it property_platform_db psql -U postgres -d property_platform -c "SELECT id, \"propertyId\", \"userId\", status FROM \"Booking\";"
```

## 🔧 **System Management**

### 1. Check Service Status
```bash
# Check all ports
lsof -i :3001 -i :5173 -i :5432

# Health check
curl http://localhost:3001/health
```

### 2. Restart Services
```bash
# Restart backend
cd backend && npm run dev

# Restart frontend
cd frontend && npm run dev

# Restart database
docker-compose restart postgres
```

### 3. Environment Variables
```bash
# Check .env file
cat backend/.env
```

## 📝 **Test Scenarios**

### Scenario 1: New User Registration
1. Create new user via API
2. Verify user appears in database
3. Test user can create properties
4. Test user can make bookings

### Scenario 2: Property Management
1. Create property via API
2. Verify property appears in frontend
3. Test property filtering
4. Test property search

### Scenario 3: Booking Process
1. Create booking via API
2. Verify booking appears in user's bookings
3. Test booking cancellation
4. Check property availability

### Scenario 4: Admin Functions
1. View admin dashboard
2. Check pending dealers
3. Approve dealers
4. View analytics

## 🚨 **Troubleshooting**

### Common Issues
1. **Token Expired**: Get new token via login
2. **Database Connection**: Check if PostgreSQL is running
3. **Frontend Not Loading**: Check if Vite is running
4. **API Errors**: Check backend logs

### Debug Commands
```bash
# Check backend logs
tail -f backend/logs/app.log

# Check database logs
docker logs property_platform_db

# Check frontend logs (browser console)
# Open Developer Tools (F12) in browser
```

## ✅ **Testing Checklist**

### Backend APIs
- [ ] Health check endpoint
- [ ] User authentication
- [ ] Property CRUD operations
- [ ] Booking system
- [ ] Admin dashboard
- [ ] Commission system
- [ ] Error handling

### Frontend UI
- [ ] Homepage loads correctly
- [ ] Property listing displays
- [ ] Search and filters work
- [ ] Responsive design
- [ ] Navigation works

### Database
- [ ] All tables exist
- [ ] Data is being saved
- [ ] Relationships work
- [ ] Queries return correct data

### Integration
- [ ] Frontend connects to backend
- [ ] API responses are correct
- [ ] Error handling works
- [ ] Authentication flows work

## 🎯 **Next Steps**

1. **Test all scenarios** above
2. **Create more test data** if needed
3. **Test edge cases** and error conditions
4. **Performance testing** with more data
5. **Security testing** (authentication, authorization)
6. **User acceptance testing** with real users

---

*Use this checklist to systematically test all aspects of the Property Platform. Mark off items as you complete them.* 