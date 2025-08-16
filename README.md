# 🏠 Real Estate Platform

A modern real estate platform built with Node.js, React, and PostgreSQL, designed for property listings, bookings, and dealer management.

## 🚀 Quick Deploy on Railway

This application is optimized for deployment on Railway. Follow the deployment guide below to get your platform live in minutes.

### Prerequisites
- GitHub account
- Railway account (free tier available)
- Domain from Namecheap (optional, for custom domain)

## 📋 Features

- **Property Management**: List, edit, and manage properties
- **User Authentication**: Secure login/signup with JWT
- **Booking System**: Property viewing appointments
- **Dealer Network**: Multi-level commission system
- **Admin Panel**: Complete administrative control
- **File Uploads**: Local file storage for images
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Authentication**: JWT tokens
- **File Storage**: Local file system
- **Deployment**: Railway

## 📖 Documentation

- [Deployment Guide](DEPLOYMENT_STEPS.md) - Complete Railway deployment instructions
- [Environment Variables](env.production.example) - Production configuration template

## 🔧 Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd real-estate-startup

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

## 📄 License

This project is licensed under the MIT License.

---

**Ready to deploy?** Check out the [Deployment Guide](DEPLOYMENT_STEPS.md) for step-by-step Railway deployment instructions. 