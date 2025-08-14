# 🔒 Security & Deployment Guide

## 🚨 Critical Security Fixes Implemented

### 1. **Authentication & Authorization**
- ✅ **JWT Security Enhanced**: Reduced token expiration to 1 hour in production
- ✅ **Password Security**: Increased bcrypt salt rounds to 14 in production
- ✅ **Token Validation**: Added issuer and audience validation
- ✅ **User Status Check**: Added active status verification
- ✅ **Weak Password Detection**: Blocked common weak passwords

### 2. **Input Validation & Sanitization**
- ✅ **Email Validation**: Strict email format validation
- ✅ **Password Validation**: Strong password requirements
- ✅ **Input Sanitization**: Removed dangerous characters and XSS vectors
- ✅ **File Upload Security**: Strict file type and size validation
- ✅ **Request Sanitization**: Removed prototype pollution vectors

### 3. **API Security**
- ✅ **Rate Limiting**: Implemented per-IP rate limiting (100 req/15min in production)
- ✅ **Auth Rate Limiting**: Stricter limits for auth endpoints (5 req/15min)
- ✅ **CORS Security**: Restricted to allowed origins only
- ✅ **Security Headers**: Enhanced CSP, HSTS, XSS protection
- ✅ **Error Handling**: Removed sensitive data from error responses

### 4. **File Upload Security**
- ✅ **File Type Validation**: Only allowed image/document types
- ✅ **File Size Limits**: 10MB for images, 5MB for documents
- ✅ **Filename Sanitization**: Prevented path traversal attacks
- ✅ **Secure File Storage**: Random filename generation

### 5. **Environment & Configuration**
- ✅ **Removed Hardcoded Passwords**: All credentials now use environment variables
- ✅ **Secure Defaults**: Strong default passwords for admin/test users
- ✅ **Environment Separation**: Different security levels for dev/prod
- ✅ **Credential File Removal**: Deleted exposed admin credentials file

## 🚀 Pre-Deployment Security Checklist

### Environment Variables Setup
```bash
# Required for Production
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
DATABASE_URL=<production-database-url>
FRONTEND_URL=<your-production-domain>

# Admin Credentials (Set these!)
ADMIN_PASSWORD=<strong-admin-password>
TEST_USER_PASSWORD=<strong-test-password>

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_REGION=<your-aws-region>
AWS_S3_BUCKET=<your-bucket-name>

# Stripe (if using)
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>

# Email (if using)
MAILGUN_API_KEY=<your-mailgun-key>
MAILGUN_DOMAIN=<your-mailgun-domain>
```

### Generate Strong JWT Secret
```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Security
```bash
# 1. Use strong database password
# 2. Enable SSL connections
# 3. Restrict database access by IP
# 4. Regular backups
# 5. Update database regularly
```

### Server Security
```bash
# 1. Use HTTPS only
# 2. Enable firewall
# 3. Regular security updates
# 4. Monitor logs
# 5. Set up intrusion detection
```

## 🔧 Deployment Steps

### 1. **Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env with production values
nano .env
```

### 2. **Database Migration**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (only once)
npm run seed
```

### 3. **Build Application**
```bash
# Install dependencies
npm install

# Build backend
cd backend && npm run build

# Build frontend
cd ../frontend && npm run build
```

### 4. **Docker Deployment**
```bash
# Build and start with Docker
docker-compose -f docker-compose.prod.yml up --build -d
```

### 5. **SSL Certificate**
```bash
# Install Certbot for Let's Encrypt
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com
```

## 🛡️ Security Monitoring

### 1. **Log Monitoring**
- Monitor authentication attempts
- Track failed login attempts
- Monitor file uploads
- Watch for unusual API usage

### 2. **Rate Limiting Alerts**
- Set up alerts for rate limit violations
- Monitor for brute force attempts
- Track API usage patterns

### 3. **Database Monitoring**
- Monitor database connections
- Track slow queries
- Watch for unusual data access patterns

### 4. **File Upload Monitoring**
- Monitor file upload sizes
- Track file type distribution
- Watch for suspicious upload patterns

## 🔍 Security Testing

### 1. **Authentication Testing**
```bash
# Test weak password rejection
curl -X POST http://yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test"}'

# Test rate limiting
for i in {1..10}; do
  curl -X POST http://yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### 2. **File Upload Testing**
```bash
# Test invalid file type
curl -X POST http://yourdomain.com/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test" \
  -F "mediaFiles=@malicious.exe"

# Test oversized file
# Create a file larger than 10MB and try to upload
```

### 3. **API Security Testing**
```bash
# Test CORS
curl -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://yourdomain.com/api/auth/login

# Test SQL injection (should be blocked)
curl -X GET "http://yourdomain.com/api/properties?search='; DROP TABLE users; --"
```

## 🚨 Incident Response

### 1. **Security Breach Response**
1. **Immediate Actions**
   - Change admin passwords
   - Revoke all JWT tokens
   - Check server logs
   - Monitor for unusual activity

2. **Investigation**
   - Review access logs
   - Check database for unauthorized changes
   - Analyze file uploads
   - Review API usage patterns

3. **Recovery**
   - Restore from backup if needed
   - Update security measures
   - Notify users if necessary
   - Document incident

### 2. **Regular Security Audits**
- Monthly security reviews
- Quarterly penetration testing
- Annual security assessments
- Regular dependency updates

## 📋 Post-Deployment Checklist

- [ ] HTTPS is enabled and working
- [ ] All environment variables are set
- [ ] Database is secured and backed up
- [ ] Rate limiting is working
- [ ] File upload restrictions are active
- [ ] Error messages don't expose sensitive data
- [ ] Admin password has been changed
- [ ] Monitoring and logging are set up
- [ ] SSL certificate is valid and auto-renewing
- [ ] Firewall rules are configured
- [ ] Regular backups are scheduled
- [ ] Security headers are present
- [ ] CORS is properly configured
- [ ] JWT tokens expire correctly
- [ ] File upload validation is working

## 🔐 Additional Security Recommendations

### 1. **Web Application Firewall (WAF)**
- Consider using Cloudflare or AWS WAF
- Block malicious requests
- Protect against DDoS attacks

### 2. **Two-Factor Authentication**
- Implement 2FA for admin accounts
- Use TOTP or SMS verification
- Require 2FA for sensitive operations

### 3. **API Key Management**
- Use API keys for external integrations
- Rotate keys regularly
- Monitor key usage

### 4. **Data Encryption**
- Encrypt sensitive data at rest
- Use TLS 1.3 for data in transit
- Implement field-level encryption for PII

### 5. **Regular Updates**
- Keep dependencies updated
- Monitor security advisories
- Apply security patches promptly

## 📞 Emergency Contacts

- **Security Team**: security@yourdomain.com
- **System Administrator**: admin@yourdomain.com
- **Hosting Provider**: [Your hosting provider support]
- **SSL Certificate Provider**: [Let's Encrypt/Your SSL provider]

---

**⚠️ IMPORTANT**: This guide should be reviewed and updated regularly. Security is an ongoing process, not a one-time setup.
