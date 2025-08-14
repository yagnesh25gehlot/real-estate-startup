# 🔄 Quick Update Guide

## Making Code Changes (Data-Safe Process)

### 1. Make Your Changes Locally
```bash
# Edit your files
# Test locally if needed
npm run dev
```

### 2. Commit and Push
```bash
git add .
git commit -m "Your update description"
git push origin main
```

### 3. Railway Auto-Deploys
- Railway automatically detects the push
- Builds and deploys your changes
- **Your data is preserved** (database + files)

### 4. Verify Deployment
```bash
# Check deployment status
railway status

# View logs if needed
railway logs

# Open your app
railway open
```

## 🛡️ Data Safety Guarantees

### What's Preserved During Updates:
- ✅ **Database data** (users, properties, bookings)
- ✅ **File uploads** (images, documents)
- ✅ **Environment variables**
- ✅ **Domain settings**
- ✅ **SSL certificates**

### What Gets Updated:
- 🔄 **Application code**
- 🔄 **Dependencies**
- 🔄 **Build artifacts**

## 🚨 Emergency Rollback

If something goes wrong:
```bash
# View deployment history
railway deployments

# Rollback to previous version
railway rollback

# Or redeploy specific commit
railway up --detach
```

## 📊 Monitoring Updates

### Check Deployment Health:
```bash
# Health check
curl https://yourdomain.com/health

# View real-time logs
railway logs --follow

# Check service status
railway status
```

## 🔧 Common Update Scenarios

### Adding New Features:
1. Code locally
2. Test thoroughly
3. Push to GitHub
4. Railway auto-deploys
5. Verify in production

### Database Schema Changes:
1. Create new migration: `npx prisma migrate dev --name your_migration`
2. Push code changes
3. Railway auto-deploys
4. Migration runs automatically
5. Data preserved

### Environment Variable Changes:
1. Update in Railway dashboard
2. Redeploy: `railway up`
3. No data loss

### File Upload Changes:
1. Update upload logic
2. Push changes
3. Existing files remain intact
4. New uploads use updated logic

## 💡 Pro Tips

### Before Pushing:
- ✅ Test locally
- ✅ Check for syntax errors
- ✅ Verify database migrations
- ✅ Test file uploads

### After Deployment:
- ✅ Check health endpoint
- ✅ Test key features
- ✅ Monitor logs for errors
- ✅ Verify file uploads work

### Best Practices:
- 🔄 Deploy during low traffic
- 📝 Use descriptive commit messages
- 🧪 Test in staging if possible
- 📊 Monitor after deployment

## 🆘 Quick Commands Reference

```bash
# Deploy manually
railway up

# View logs
railway logs

# Open dashboard
railway open

# Check status
railway status

# Rollback
railway rollback

# Connect to service
railway shell
```

---

**🎯 Your updates are safe and your data is protected!**
