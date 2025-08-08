# Property Platform - User Guide

## User Overview

As a regular user of the Property Platform, you can:
- Browse available properties
- Book properties for specific dates
- Make payments securely
- View your booking history
- Manage your account

## Getting Started

### 1. Registration
1. **Sign Up**: Register through Google OAuth or dealer signup
2. **Verify Email**: Confirm your email address
3. **Start Browsing**: Begin exploring properties

### 2. Access Your Account
- **Frontend**: http://localhost:5173
- **API Base**: http://localhost:3001/api

## Property Browsing

### View All Properties
```bash
curl http://localhost:3001/api/properties
```

### Filter Properties
```bash
# Filter by type and location
curl "http://localhost:3001/api/properties?type=HOUSE&location=New York"

# Filter by price range
curl "http://localhost:3001/api/properties?minPrice=100000&maxPrice=500000"

# Filter by status
curl "http://localhost:3001/api/properties?status=FREE"

# Combine multiple filters
curl "http://localhost:3001/api/properties?type=HOUSE&location=New York&minPrice=100000&maxPrice=500000&status=FREE"
```

### Get Property Details
```bash
curl http://localhost:3001/api/properties/<property_id>
```

### Available Property Types
```bash
curl http://localhost:3001/api/properties/types/list
```
**Returns**: HOUSE, APARTMENT, PLOT, COMMERCIAL

### Available Locations
```bash
curl http://localhost:3001/api/properties/locations/list
```

## Booking System

### Create a Booking

#### Step 1: Check Property Availability
```bash
curl "http://localhost:3001/api/bookings/property/<property_id>/available-slots?startDate=2025-08-10&endDate=2025-08-20"
```

#### Step 2: Create Booking
```bash
curl -X POST \
     -H "Authorization: Bearer <user_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "propertyId": "property_id",
       "startDate": "2025-08-10T00:00:00.000Z",
       "endDate": "2025-08-13T00:00:00.000Z",
       "amount": 1500
     }' \
     http://localhost:3001/api/bookings
```

### View Your Bookings
```bash
curl -H "Authorization: Bearer <user_token>" \
     http://localhost:3001/api/bookings/my-bookings
```

### Get Specific Booking Details
```bash
curl -H "Authorization: Bearer <user_token>" \
     http://localhost:3001/api/bookings/<booking_id>
```

### Cancel a Booking
```bash
curl -X DELETE \
     -H "Authorization: Bearer <user_token>" \
     http://localhost:3001/api/bookings/<booking_id>
```

## Payment System

### Create Payment Intent
```bash
curl -X POST \
     -H "Authorization: Bearer <user_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "bookingId": "booking_id",
       "amount": 1500,
       "currency": "usd"
     }' \
     http://localhost:3001/api/bookings/payment-intent
```

### Confirm Payment
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{
       "paymentIntentId": "pi_xxx"
     }' \
     http://localhost:3001/api/bookings/confirm-payment
```

## Property Search and Discovery

### Advanced Search Options

#### By Property Type
- **HOUSE**: Single-family homes
- **APARTMENT**: Multi-unit buildings
- **PLOT**: Land for development
- **COMMERCIAL**: Business properties

#### By Location
Search properties in specific cities or areas:
```bash
curl "http://localhost:3001/api/properties?location=New York"
```

#### By Price Range
```bash
# Properties under $300,000
curl "http://localhost:3001/api/properties?maxPrice=300000"

# Properties between $200,000 and $500,000
curl "http://localhost:3001/api/properties?minPrice=200000&maxPrice=500000"
```

#### By Status
- **FREE**: Available for booking
- **BOOKED**: Currently booked
- **SOLD**: Property sold

### Pagination
```bash
# Get first page (10 properties)
curl "http://localhost:3001/api/properties?page=1&limit=10"

# Get second page
curl "http://localhost:3001/api/properties?page=2&limit=10"
```

## User Account Management

### Authentication

#### Google OAuth Login
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "name": "John Doe",
       "picture": "https://example.com/avatar.jpg",
       "role": "USER"
     }' \
     http://localhost:3001/api/auth/google
```

#### Logout
```bash
curl -X POST \
     -H "Authorization: Bearer <user_token>" \
     http://localhost:3001/api/auth/logout
```

## Common User Workflows

### 1. Property Search and Booking Workflow

#### Step 1: Browse Properties
```bash
# Get all available properties
curl http://localhost:3001/api/properties

# Filter by your preferences
curl "http://localhost:3001/api/properties?type=HOUSE&location=New York&minPrice=200000&maxPrice=500000"
```

#### Step 2: View Property Details
```bash
curl http://localhost:3001/api/properties/<property_id>
```

#### Step 3: Check Availability
```bash
curl "http://localhost:3001/api/bookings/property/<property_id>/available-slots?startDate=2025-08-10&endDate=2025-08-20"
```

#### Step 4: Create Booking
```bash
curl -X POST \
     -H "Authorization: Bearer <user_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "propertyId": "property_id",
       "startDate": "2025-08-10T00:00:00.000Z",
       "endDate": "2025-08-13T00:00:00.000Z",
       "amount": 1500
     }' \
     http://localhost:3001/api/bookings
```

#### Step 5: Make Payment
```bash
# Create payment intent
curl -X POST \
     -H "Authorization: Bearer <user_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "bookingId": "booking_id",
       "amount": 1500,
       "currency": "usd"
     }' \
     http://localhost:3001/api/bookings/payment-intent

# Confirm payment (after Stripe payment)
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{
       "paymentIntentId": "pi_xxx"
     }' \
     http://localhost:3001/api/bookings/confirm-payment
```

### 2. Booking Management Workflow

#### View All Bookings
```bash
curl -H "Authorization: Bearer <user_token>" \
     http://localhost:3001/api/bookings/my-bookings
```

#### Filter Bookings
```bash
# By status
curl -H "Authorization: Bearer <user_token>" \
     "http://localhost:3001/api/bookings/my-bookings?status=PENDING"

# By property
curl -H "Authorization: Bearer <user_token>" \
     "http://localhost:3001/api/bookings/my-bookings?propertyId=property_id"
```

#### Cancel Booking
```bash
curl -X DELETE \
     -H "Authorization: Bearer <user_token>" \
     http://localhost:3001/api/bookings/<booking_id>
```

## Best Practices

### 1. Property Search
- **Use Filters**: Narrow down results with type, location, and price filters
- **Check Availability**: Always verify property availability before booking
- **Read Details**: Review property descriptions and images carefully
- **Compare Options**: Look at multiple properties before deciding

### 2. Booking Process
- **Plan Ahead**: Book properties well in advance for popular dates
- **Verify Dates**: Double-check start and end dates
- **Review Pricing**: Understand all costs before confirming
- **Keep Records**: Save booking confirmations and payment receipts

### 3. Payment Security
- **Use Secure Connection**: Always use HTTPS
- **Verify Amounts**: Confirm payment amounts before processing
- **Keep Tokens Secure**: Don't share your authentication tokens
- **Monitor Transactions**: Check your payment history regularly

## Troubleshooting

### Common Issues

#### Property Not Available
- Check if property status is "FREE"
- Verify your desired dates are available
- Contact property owner for more information

#### Booking Creation Failed
- Ensure you're authenticated (valid token)
- Check if property exists and is available
- Verify all required fields are provided
- Check for overlapping bookings

#### Payment Issues
- Verify payment amount is correct
- Check if Stripe is properly configured
- Ensure payment intent is created before confirmation
- Contact support for payment problems

#### Authentication Problems
- Check if your token is valid and not expired
- Re-authenticate if needed
- Verify your account is active

### Getting Help
1. **Check Documentation**: Review this guide
2. **Contact Support**: For technical issues
3. **Property Owner**: For property-specific questions

## User Tips

### 1. Efficient Property Search
- **Use Multiple Filters**: Combine type, location, and price filters
- **Save Favorites**: Keep track of interesting properties
- **Set Alerts**: Monitor for new properties in your preferred areas
- **Compare Features**: Use property details to compare options

### 2. Smart Booking
- **Book Early**: Popular properties book quickly
- **Flexible Dates**: Consider alternative dates if your first choice is unavailable
- **Read Reviews**: Check property reviews if available
- **Ask Questions**: Contact property owners for additional information

### 3. Account Security
- **Strong Passwords**: Use unique, strong passwords
- **Two-Factor Authentication**: Enable if available
- **Regular Updates**: Keep your account information current
- **Monitor Activity**: Check your booking history regularly

## Success Metrics

### Key Performance Indicators (KPIs)
1. **Properties Viewed**: Number of properties you've browsed
2. **Bookings Made**: Number of successful bookings
3. **Payment Success Rate**: Percentage of successful payments
4. **Satisfaction Rating**: Your satisfaction with booked properties

### Goal Setting
- **Short-term**: Find and book properties for upcoming trips
- **Medium-term**: Build a portfolio of favorite properties
- **Long-term**: Establish relationships with preferred property owners

## API Response Examples

### Property Listing Response
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "property_id",
        "title": "Beautiful House",
        "description": "3-bedroom house in prime location",
        "type": "HOUSE",
        "location": "New York",
        "price": 500000,
        "status": "FREE",
        "mediaUrls": ["image1.jpg", "image2.jpg"],
        "owner": {
          "id": "owner_id",
          "name": "John Doe",
          "email": "owner@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Booking Response
```json
{
  "success": true,
  "data": {
    "id": "booking_id",
    "propertyId": "property_id",
    "userId": "user_id",
    "startDate": "2025-08-10T00:00:00.000Z",
    "endDate": "2025-08-13T00:00:00.000Z",
    "status": "PENDING",
    "property": {
      "title": "Beautiful House",
      "location": "New York"
    }
  }
}
```

---

*This user guide covers all aspects of using the Property Platform as a regular user. For additional support, contact the platform administrator or refer to the troubleshooting section.* 