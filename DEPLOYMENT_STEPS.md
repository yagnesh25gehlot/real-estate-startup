# 🚀 Railway Deployment Guide

## 📋 Prerequisites

- GitHub account
- Railway account (we'll create this)
- Domain from Namecheap (for custom domain)

---

## 🎯 Step 1: Push Code to GitHub

### 1.1 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name: `real-estate-platform`
4. Make it **Public**
5. Don't initialize with README
6. Click "Create repository"

### 1.2 Push Your Code
```bash
# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/real-estate-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**✅ Step 1 Complete!** Your code is on GitHub.

---

## 🚂 Step 2: Set Up Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Sign in with GitHub
5. Authorize Railway access

### 2.2 Deploy Your App
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Find and select your `real-estate-platform` repository
4. Click "Deploy Now"
5. Wait for build to complete (2-5 minutes)

**✅ Step 2 Complete!** Your app is deployed on Railway.

---

## 🗄️ Step 3: Add PostgreSQL Database

### 3.1 Create Database
1. In your Railway project dashboard
2. Click "New Service"
3. Select "Database" → "PostgreSQL"
4. Wait for database to be ready (green status)

### 3.2 Get Database URL
1. Click on your PostgreSQL service
2. Go to "Connect" tab
3. Copy the "Postgres Connection URL"

**✅ Step 3 Complete!** Database is ready.

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Access Variables
1. In Railway dashboard, click on your main app service
2. Go to "Variables" tab
3. Add these variables one by one:

### 4.2 Required Variables
```env
# Database (use the URL from Step 3)
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

**✅ Step 4 Complete!** Environment variables configured.

---

## 🔄 Step 5: Run Database Setup

### 5.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

### 5.2 Connect and Setup Database
```bash
# Login to Railway
railway login

# Link to your project
railway link

# Connect to your app service
railway shell

# In the Railway shell, run:
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

**✅ Step 5 Complete!** Database is set up.

---

## 🌐 Step 6: Configure Custom Domain

### 6.1 Get Railway Domain
1. In Railway dashboard, go to your app service
2. Click "Settings" tab
3. Copy the generated domain (e.g., `your-app-name.railway.app`)

### 6.2 Configure Namecheap DNS
1. Go to [namecheap.com](https://namecheap.com)
2. Sign in → "Domain List" → "Manage" your domain
3. Go to "Advanced DNS" tab
4. Add CNAME Record:
   - **Type**: `CNAME Record`
   - **Host**: `www` (or leave empty for root domain)
   - **Value**: `your-app-name.railway.app`
   - **TTL**: `Automatic`

### 6.3 Add Domain to Railway
1. Back in Railway dashboard
2. Go to "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain: `yourdomain.com`
5. Click "Add"

### 6.4 Wait for DNS Propagation
- DNS changes take 5-30 minutes
- Check at: [whatsmydns.net](https://whatsmydns.net)

**✅ Step 6 Complete!** Custom domain configured.

---

## 🧪 Step 7: Test Your Application

### 7.1 Basic Functionality Test
1. Visit your domain: `https://yourdomain.com`
2. Test:
   - [ ] Homepage loads
   - [ ] User registration
   - [ ] User login
   - [ ] Property listing
   - [ ] Property creation
   - [ ] File uploads

### 7.2 Admin Access Test
1. Go to: `https://yourdomain.com/admin`
2. Login with:
   - Email: `admin@example.com`
   - Password: `YourSecureAdminPassword123!`

### 7.3 Health Check
```bash
curl https://yourdomain.com/health
```
Should return: `{"status":"OK","timestamp":"..."}`

**✅ Step 7 Complete!** Your app is working.

---

## 📊 Step 8: Monitor and Manage

### 8.1 View Logs
```bash
railway logs
```

### 8.2 Open Dashboard
```bash
railway open
```

### 8.3 Check Status
```bash
railway status
```

**✅ Step 8 Complete!** You can monitor your app.

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
