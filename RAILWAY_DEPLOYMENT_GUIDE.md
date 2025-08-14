# 🚀 Railway Deployment Guide

## Overview
This guide will help you deploy your Real Estate MVP to Railway, a modern platform that's perfect for MVPs with its easy deployment, persistent data, and budget-friendly pricing.

## 🎯 Why Railway?

- **💰 Budget-friendly**: Free tier with $5 credit monthly
- **🔗 Easy domain setup**: Simple custom domain attachment
- **💾 Persistent data**: PostgreSQL with automatic backups
- **🔄 Zero-downtime deployments**: Git-based deployments
- **📁 File persistence**: Automatic volume management
- **🚀 Fast setup**: Deploy in minutes, not hours

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **Domain from Namecheap**: Your custom domain

## 🚀 Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub with all the files we created:
- `railway.json`
- `Dockerfile`
- Updated `package.json` files
- Updated backend code

### 2. Deploy to Railway

#### Option A: Using the Deployment Script
```bash
./deploy.sh
```

#### Option B: Manual Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link

# Deploy
railway up
```

### 3. Set Up Database

1. **Add PostgreSQL Service**:
   - Go to Railway Dashboard
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically provide the connection string

2. **Configure Environment Variables**:
   - Go to your app service
   - Click "Variables" tab
   - Add the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret (generate a strong one)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App Configuration
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://yourdomain.com"

# Admin Configuration
ADMIN_PASSWORD="YourSecureAdminPassword123!"
TEST_USER_PASSWORD="TestUserPass123!"

# Commission Configuration
COMMISSION_LEVEL_1=10.0
COMMISSION_LEVEL_2=5.0
COMMISSION_LEVEL_3=2.5

# Booking Configuration
DEFAULT_BOOKING_DURATION_DAYS=3

# Security Configuration
PAYMENTS_MODE="mock"
```

### 4. Run Database Migrations

```bash
# Connect to your Railway service
railway shell

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

### 5. Set Up Custom Domain

1. **In Railway Dashboard**:
   - Go to your app service
   - Click "Settings" tab
   - Scroll to "Domains" section
   - Click "Generate Domain" or "Add Domain"

2. **In Namecheap**:
   - Log into your Namecheap account
   - Go to "Domain List" → Your domain → "Manage"
   - Go to "Advanced DNS"
   - Add a CNAME record:
     - **Host**: `www` (or leave empty for root domain)
     - **Value**: `your-app-name.railway.app`
     - **TTL**: Automatic

3. **Wait for DNS Propagation** (5-30 minutes)

### 6. Configure SSL (Automatic)

Railway automatically provides SSL certificates for your custom domains.

## 🔄 Making Code Changes

### Easy Update Process

1. **Make your changes locally**
2. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

3. **Railway automatically deploys** (if connected to GitHub)
   - Or manually deploy: `railway up`

### Data Persistence

Your data is **automatically preserved** because:
- **Database**: PostgreSQL data is stored in Railway's persistent volumes
- **File uploads**: Stored in Railway's persistent file system
- **Environment variables**: Stored securely in Railway dashboard

## 📊 Monitoring & Management

### View Logs
```bash
railway logs
```

### Open Dashboard
```bash
railway open
```

### Check Service Status
```bash
railway status
```

### Scale Resources
- Go to Railway Dashboard
- Click on your service
- Adjust CPU/Memory as needed

## 💰 Cost Management

### Free Tier Limits
- **$5 credit monthly**
- **512MB RAM per service**
- **Shared CPU**
- **1GB storage**

### Estimated Monthly Cost (MVP)
- **App Service**: ~$2-3/month
- **PostgreSQL**: ~$1-2/month
- **Total**: ~$3-5/month

### Cost Optimization Tips
1. **Use free tier initially**
2. **Monitor usage in dashboard**
3. **Scale down during low traffic**
4. **Use Railway's usage alerts**

## 🔒 Security Best Practices

### Environment Variables
- ✅ Use strong JWT secrets
- ✅ Never commit `.env` files
- ✅ Use Railway's secure variable storage

### Database Security
- ✅ Railway automatically secures PostgreSQL
- ✅ Connection strings are encrypted
- ✅ Automatic backups included

### Application Security
- ✅ HTTPS enforced automatically
- ✅ Security headers configured
- ✅ Rate limiting enabled
- ✅ CORS properly configured

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   # Check build logs
   railway logs
   
   # Test build locally
   npm run build
   ```

2. **Database Connection Issues**:
   ```bash
   # Check DATABASE_URL in Railway dashboard
   # Ensure PostgreSQL service is running
   railway logs
   ```

3. **Domain Not Working**:
   - Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
   - Verify CNAME record in Namecheap
   - Wait 30 minutes for propagation

4. **File Uploads Not Working**:
   - Check uploads directory permissions
   - Verify file size limits
   - Check Railway storage limits

### Getting Help

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Support**: Available in dashboard

## 📈 Scaling Up

### When to Scale
- **High traffic**: Increase CPU/Memory
- **Large file uploads**: Increase storage
- **Database performance**: Upgrade PostgreSQL plan

### Scaling Commands
```bash
# View current resources
railway status

# Scale up (via dashboard recommended)
railway open
```

## 🎉 Success Checklist

- [ ] App deployed to Railway
- [ ] Database connected and migrated
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Admin user created
- [ ] File uploads working
- [ ] Monitoring set up
- [ ] Backup strategy confirmed

## 📞 Support

If you encounter any issues:
1. Check Railway logs: `railway logs`
2. Review this guide
3. Check Railway documentation
4. Join Railway Discord community

---

**🎯 Your MVP is now live and ready for users!**
