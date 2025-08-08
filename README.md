# Property Dealing Platform MVP

A full-stack property dealing platform with MLM dealer hierarchy, booking system, and payment integration.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Media Storage**: AWS S3
- **Auth**: NextAuth.js (Google OAuth)
- **Payments**: Stripe API
- **Notifications**: Nodemailer + Mailgun
- **Deployment**: Docker

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- AWS S3 bucket
- Stripe account
- Mailgun account

### 1. Clone and Setup

```bash
git clone <repository-url>
cd real-estate-startup
```

### 2. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Fill in your environment variables (see Environment Variables section below).

### 3. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Generate Prisma client
cd ../backend && npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with admin user
npm run seed
```

### 4. Start Development Servers

```bash
# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Admin credentials: Check console output or `/admin-credentials.txt`

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/property_platform"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-property-media-bucket"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mailgun
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="your-mailgun-domain"

# App Configuration
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

```env
VITE_API_URL="http://localhost:3001"
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## Database Schema

The platform uses a sophisticated schema with:

- **Users**: Basic user accounts with roles (USER, DEALER, ADMIN)
- **Dealers**: MLM hierarchy with parent-child relationships
- **Properties**: Property listings with status tracking
- **Bookings**: Time slot reservations with payment integration
- **Payments**: Stripe payment records
- **Commissions**: MLM commission tracking

## Key Features

### 1. Authentication & Authorization
- Google OAuth integration
- Role-based access control
- JWT token management

### 2. Property Management
- CRUD operations for properties
- Media upload to S3
- Search and filtering
- Status tracking (FREE, BOOKED, SOLD)

### 3. Booking System
- Configurable time slots (default: 3 days)
- Stripe payment integration
- Automatic status updates

### 4. MLM Dealer System
- Hierarchical dealer structure
- Referral code system
- Commission calculations
- Admin approval workflow

### 5. Admin Dashboard
- Dealer approval interface
- Transaction monitoring
- Commission configuration
- Property management

### 6. Notifications
- Email notifications via Mailgun
- Booking confirmations
- Commission earnings alerts
- Dealer approval requests

## Payment Testing

Use Stripe test cards:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Expiry**: 4000 0000 0000 0069

## S3 Bucket Configuration

1. Create an S3 bucket for media storage
2. Configure CORS policy:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT"],
        "AllowedOrigins": ["http://localhost:5173"],
        "ExposeHeaders": []
    }
]
```

3. Set bucket permissions for public read access
4. Update environment variables with your bucket details

## Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

## Development Commands

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run seed         # Seed database with admin user
npx prisma studio    # Open Prisma Studio
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - Logout

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status

### Dealers
- `GET /api/dealers` - List dealers
- `POST /api/dealers` - Create dealer (requires approval)
- `PUT /api/dealers/:id/approve` - Approve dealer

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `POST /api/admin/commission-config` - Update commission rates

## Commission Structure

The platform supports configurable commission percentages:

- Level 1: Direct referral (default: 10%)
- Level 2: Second level (default: 5%)
- Level 3: Third level (default: 2.5%)

Commissions are calculated automatically when properties are sold.

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **S3 Uploads**: Verify AWS credentials and bucket permissions
3. **Stripe Payments**: Check webhook configuration and test keys
4. **Email Notifications**: Verify Mailgun API key and domain

### Logs

```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs postgres
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 