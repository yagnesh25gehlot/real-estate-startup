# Property Platform - Dealer Guide

## Dealer Overview

As a dealer in the Property Platform, you can:
- List properties for sale
- Earn commissions through the MLM structure
- Build a referral network
- Track your earnings and performance

## Getting Started

### 1. Registration Process
1. **Sign Up**: Register as a dealer through the platform
2. **Admin Approval**: Wait for admin approval (usually within 24 hours)
3. **Start Earning**: Begin listing properties and building your network

### 2. Access Your Account
- **Frontend**: http://localhost:5173
- **API Base**: http://localhost:3001/api

## Property Management

### Listing a Property

#### Via API
```bash
# Create property listing
curl -X POST \
     -H "Authorization: Bearer <dealer_token>" \
     -F "title=Beautiful House" \
     -F "description=3-bedroom house in prime location" \
     -F "type=HOUSE" \
     -F "location=New York" \
     -F "price=500000" \
     -F "mediaFiles=@image1.jpg" \
     -F "mediaFiles=@image2.jpg" \
     http://localhost:3001/api/properties
```

#### Property Types Available
- **HOUSE**: Single-family homes
- **APARTMENT**: Multi-unit buildings
- **PLOT**: Land for development
- **COMMERCIAL**: Business properties

#### Property Status
- **FREE**: Available for booking
- **BOOKED**: Currently booked
- **SOLD**: Property sold

### Managing Your Properties

#### View Your Properties
```bash
curl -H "Authorization: Bearer <dealer_token>" \
     "http://localhost:3001/api/properties?dealerId=<your_dealer_id>"
```

#### Update Property
```bash
curl -X PUT \
     -H "Authorization: Bearer <dealer_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Updated Property Title",
       "price": 550000,
       "status": "SOLD"
     }' \
     http://localhost:3001/api/properties/<property_id>
```

#### Delete Property
```bash
curl -X DELETE \
     -H "Authorization: Bearer <dealer_token>" \
     http://localhost:3001/api/properties/<property_id>
```

## Commission System

### How Commissions Work
The platform uses a Multi-Level Marketing (MLM) structure:

- **Level 1**: Direct sales (10% commission)
- **Level 2**: Sales from your referrals (5% commission)
- **Level 3**: Sales from your referrals' referrals (2.5% commission)

### Tracking Your Commissions

#### View Your Commissions
```bash
curl -H "Authorization: Bearer <dealer_token>" \
     http://localhost:3001/api/dealers/my-commissions
```

#### Get Your Stats
```bash
curl -H "Authorization: Bearer <dealer_token>" \
     http://localhost:3001/api/dealers/stats/<your_dealer_id>
```

#### View Your Hierarchy
```bash
curl -H "Authorization: Bearer <dealer_token>" \
     http://localhost:3001/api/dealers/hierarchy/<your_dealer_id>
```

### Commission Calculation Example
If you sell a property for $500,000:
- **Your Commission**: $50,000 (10%)
- **Your Referral's Commission**: $25,000 (5%)
- **Your Referral's Referral's Commission**: $12,500 (2.5%)

## Network Building

### Referral System

#### Your Referral Code
Each dealer gets a unique referral code. Share this with potential dealers to build your network.

#### Find Dealer by Referral Code
```bash
curl http://localhost:3001/api/dealers/referral/<referral_code>
```

#### View Your Network Tree
```bash
curl -H "Authorization: Bearer <dealer_token>" \
     "http://localhost:3001/api/dealers/tree/<your_dealer_id>?maxDepth=3"
```

### Building Your Downline
1. **Share Your Referral Code** with potential dealers
2. **Help Them Register** using your code
3. **Support Their Success** to maximize your earnings
4. **Track Performance** through the analytics

## Property Analytics

### View Property Performance
```bash
# Get all properties with filters
curl -H "Authorization: Bearer <dealer_token>" \
     "http://localhost:3001/api/properties?type=HOUSE&location=New York&minPrice=100000&maxPrice=1000000"
```

### Property Types Available
```bash
curl http://localhost:3001/api/properties/types/list
```

### Locations Available
```bash
curl http://localhost:3001/api/properties/locations/list
```

## Booking Management

### View Property Bookings
```bash
curl -H "Authorization: Bearer <dealer_token>" \
     http://localhost:3001/api/bookings/my-bookings
```

### Check Property Availability
```bash
curl "http://localhost:3001/api/bookings/property/<property_id>/available-slots?startDate=2025-08-10&endDate=2025-08-20"
```

## Best Practices

### 1. Property Listings
- **High-Quality Photos**: Upload clear, professional images
- **Detailed Descriptions**: Include all relevant property details
- **Accurate Pricing**: Set competitive but profitable prices
- **Regular Updates**: Keep listings current and accurate

### 2. Network Building
- **Active Recruitment**: Continuously recruit new dealers
- **Support Your Team**: Help your referrals succeed
- **Training**: Provide guidance to new dealers
- **Communication**: Stay in touch with your network

### 3. Commission Optimization
- **Focus on High-Value Properties**: Target premium properties
- **Build Strong Networks**: Quality over quantity in referrals
- **Monitor Performance**: Track your earnings regularly
- **Diversify**: List different types of properties

## Common Workflows

### 1. New Property Listing Workflow
1. **Prepare Property Details**
   - Title, description, type, location, price
   - High-quality photos and videos

2. **Create Listing**
   ```bash
   curl -X POST \
        -H "Authorization: Bearer <dealer_token>" \
        -F "title=Your Property Title" \
        -F "description=Detailed description" \
        -F "type=HOUSE" \
        -F "location=City, State" \
        -F "price=500000" \
        -F "mediaFiles=@photo1.jpg" \
        http://localhost:3001/api/properties
   ```

3. **Monitor Performance**
   - Track views and inquiries
   - Update pricing if needed
   - Respond to booking requests

### 2. Network Building Workflow
1. **Generate Referral Code**
   - Your unique code is automatically generated

2. **Recruit New Dealers**
   - Share your referral code
   - Help them register
   - Guide them through the process

3. **Support Your Team**
   - Provide training and support
   - Monitor their performance
   - Celebrate their successes

### 3. Commission Tracking Workflow
1. **Daily Check**
   ```bash
   curl -H "Authorization: Bearer <dealer_token>" \
        http://localhost:3001/api/dealers/my-commissions
   ```

2. **Weekly Review**
   - Analyze performance trends
   - Identify opportunities
   - Plan improvements

3. **Monthly Planning**
   - Set goals for next month
   - Review network growth
   - Plan property acquisitions

## Troubleshooting

### Common Issues

#### Property Not Listing
- Check if admin approval is required
- Verify all required fields are filled
- Ensure images are in correct format (JPG, PNG)

#### Commission Not Showing
- Verify property sale is confirmed
- Check commission calculation
- Contact admin if issues persist

#### Network Issues
- Verify referral codes are correct
- Check if new dealers are approved
- Monitor hierarchy structure

### Getting Help
1. **Check Documentation**: Review this guide
2. **Contact Admin**: For approval and system issues
3. **Technical Support**: For platform problems

## Performance Tips

### 1. Property Optimization
- **SEO-Friendly Titles**: Use descriptive, searchable titles
- **Quality Images**: Professional photos increase interest
- **Detailed Descriptions**: Include all relevant details
- **Regular Updates**: Keep listings fresh and current

### 2. Network Growth
- **Active Recruitment**: Continuously find new dealers
- **Quality Training**: Invest in your team's success
- **Regular Communication**: Stay connected with your network
- **Performance Tracking**: Monitor and optimize results

### 3. Commission Maximization
- **High-Value Properties**: Focus on premium listings
- **Strong Networks**: Build quality referral relationships
- **Market Knowledge**: Stay informed about market trends
- **Customer Service**: Provide excellent service to buyers

## Success Metrics

### Key Performance Indicators (KPIs)
1. **Property Listings**: Number of active properties
2. **Sales Volume**: Total property sales value
3. **Commission Earnings**: Monthly commission income
4. **Network Size**: Number of active referrals
5. **Conversion Rate**: Properties sold vs. listed

### Goal Setting
- **Short-term**: Weekly property listings and sales
- **Medium-term**: Monthly commission targets
- **Long-term**: Network growth and passive income

---

*This dealer guide covers all aspects of being a successful dealer on the Property Platform. For additional support, contact your admin or refer to the troubleshooting section.* 