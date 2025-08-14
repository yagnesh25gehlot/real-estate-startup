# 🚀 Complete Railway Deployment Guide

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] A GitHub account
- [ ] A Railway account (we'll create this)
- [ ] A domain from Namecheap (we'll configure this)
- [ ] Your code ready for deployment

---

## 🎯 Step 1: Prepare Your Code for GitHub

### 1.1 Initialize Git Repository (if not already done)
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit for production deployment"
```

### 1.2 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click the "+" icon in the top right
3. Select "New repository"
4. Name it: `real-estate-platform`
5. Make it **Public** (Railway works better with public repos)
6. **Don't** initialize with README (you already have files)
7. Click "Create repository"

### 1.3 Push Code to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/real-estate-platform.git

# Push your code
git branch -M main
git push -u origin main
```

**✅ Step 1 Complete!** Your code is now on GitHub.

---

## 🚂 Step 2: Set Up Railway Account

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Sign in with your GitHub account
5. Authorize Railway to access your repositories

### 2.2 Connect Your Repository
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Find and select your `real-estate-platform` repository
4. Click "Deploy Now"

**✅ Step 2 Complete!** Railway is connected to your GitHub repository.

---

## 🗄️ Step 3: Set Up Database

### 3.1 Add PostgreSQL Service
1. In your Railway project dashboard
2. Click "New Service"
3. Select "Database" → "PostgreSQL"
4. Railway will create a PostgreSQL database
5. Wait for it to be ready (green status)

### 3.2 Get Database Connection String
1. Click on your PostgreSQL service
2. Go to "Connect" tab
3. Copy the "Postgres Connection URL"
4. It looks like: `postgresql://username:password@host:port/database`

**✅ Step 3 Complete!** Your database is ready.

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Access Environment Variables
1. In Railway dashboard, click on your main app service
2. Go to "Variables" tab
3. Click "New Variable" for each variable below

### 4.2 Add Required Variables
Add these variables one by one:

```env
# Database (use the connection string from Step 3)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret (generate a strong one)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Admin Configuration
ADMIN_PASSWORD=YourSecureAdminPassword123!
TEST_USER_PASSWORD=TestUserPass123!

# Commission Configuration
COMMISSION_LEVEL_1=10.0
COMMISSION_LEVEL_2=5.0
COMMISSION_LEVEL_3=2.5

# Booking Configuration
DEFAULT_BOOKING_DURATION_DAYS=3

# Security Configuration
PAYMENTS_MODE=mock
```

**✅ Step 4 Complete!** Environment variables are configured.

---

## 🔄 Step 5: Deploy Your Application

### 5.1 Trigger Deployment
1. Railway should automatically deploy when you connected the repository
2. If not, go to your app service and click "Deploy"
3. Wait for the build to complete (usually 2-5 minutes)

### 5.2 Check Deployment Status
1. Watch the deployment logs
2. Look for "Build completed successfully"
3. Your app will be available at: `https://your-app-name.railway.app`

### 5.3 Run Database Migrations
1. Go to your app service in Railway
2. Click "Deployments" tab
3. Click on the latest deployment
4. Click "View Logs"
5. Look for any database migration errors

If you see database errors, we'll fix them in the next step.

**✅ Step 5 Complete!** Your app is deployed.

---

## 🗃️ Step 6: Set Up Database Schema

### 6.1 Connect to Railway Shell
```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Connect to your app service
railway shell
```

### 6.2 Run Database Migrations
In the Railway shell:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed
```

### 6.3 Verify Database Setup
```bash
# Check if tables are created
npx prisma studio
```

**✅ Step 6 Complete!** Database is ready.

---

## 🌐 Step 7: Configure Custom Domain

### 7.1 Get Railway Domain
1. In Railway dashboard, go to your app service
2. Click "Settings" tab
3. Scroll to "Domains" section
4. Copy the generated domain (e.g., `your-app-name.railway.app`)

### 7.2 Configure Namecheap DNS

#### 7.2.1 Access Namecheap DNS
1. Go to [namecheap.com](https://namecheap.com)
2. Sign in to your account
3. Click "Domain List"
4. Find your domain and click "Manage"
5. Go to "Advanced DNS" tab

#### 7.2.2 Add CNAME Record
1. Click "Add New Record"
2. Set these values:
   - **Type**: `CNAME Record`
   - **Host**: `www` (or leave empty for root domain)
   - **Value**: `your-app-name.railway.app` (the Railway domain from Step 7.1)
   - **TTL**: `Automatic`
3. Click the checkmark to save

#### 7.2.3 Add Root Domain (Optional)
If you want your domain without "www":
1. Click "Add New Record" again
2. Set these values:
   - **Type**: `CNAME Record`
   - **Host**: (leave empty)
   - **Value**: `your-app-name.railway.app`
   - **TTL**: `Automatic`
3. Click the checkmark to save

### 7.3 Add Domain to Railway
1. Go back to Railway dashboard
2. In your app service, go to "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain: `yourdomain.com` (and `www.yourdomain.com` if you added both)
5. Click "Add"

### 7.4 Wait for DNS Propagation
- DNS changes can take 5-30 minutes
- Check propagation at: [whatsmydns.net](https://whatsmydns.net)
- Enter your domain and check CNAME records

**✅ Step 7 Complete!** Your custom domain is configured.

---

## 🔒 Step 8: SSL Certificate (Automatic)

Railway automatically provides SSL certificates for your custom domains. No action needed!

**✅ Step 8 Complete!** HTTPS is enabled.

---

## 🧪 Step 9: Test Your Application

### 9.1 Test Basic Functionality
1. Visit your domain: `https://yourdomain.com`
2. Test the following:
   - [ ] Homepage loads
   - [ ] User registration
   - [ ] User login
   - [ ] Property listing
   - [ ] Property creation
   - [ ] File uploads
   - [ ] Admin panel

### 9.2 Test Admin Access
1. Go to: `https://yourdomain.com/admin`
2. Login with:
   - Email: `admin@example.com`
   - Password: `YourSecureAdminPassword123!` (from Step 4)

### 9.3 Check Health Endpoint
```bash
curl https://yourdomain.com/health
```
Should return: `{"status":"OK","timestamp":"..."}`

**✅ Step 9 Complete!** Your app is working.

---

## 📊 Step 10: Monitor and Manage

### 10.1 View Logs
```bash
railway logs
```

### 10.2 Open Dashboard
```bash
railway open
```

### 10.3 Check Status
```bash
railway status
```

**✅ Step 10 Complete!** You can monitor your app.

---

## 🔄 Making Updates

### To update your code:
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update description"
   git push origin main
   ```
3. Railway automatically deploys
4. Your data is preserved

---

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Railway logs
   - Ensure all dependencies are in package.json
   - Verify Dockerfile is correct

2. **Database Connection Issues**:
   - Check DATABASE_URL in Railway variables
   - Ensure PostgreSQL service is running
   - Run migrations manually if needed

3. **Domain Not Working**:
   - Check DNS propagation at whatsmydns.net
   - Verify CNAME record in Namecheap
   - Wait 30 minutes for propagation

4. **File Uploads Not Working**:
   - Check uploads directory permissions
   - Verify file size limits
   - Check Railway storage limits

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Repository connected to Railway
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Application deployed successfully
- [ ] Database migrations run
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Application tested and working
- [ ] Admin panel accessible

---

## 💰 Cost Information

- **Free Tier**: $5 credit monthly
- **Estimated Cost**: $3-5/month for MVP
- **Scaling**: Easy to upgrade as you grow

---

**🎯 Congratulations! Your Real Estate MVP is now live at https://yourdomain.com**
