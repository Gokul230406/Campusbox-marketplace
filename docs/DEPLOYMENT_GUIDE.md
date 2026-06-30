# AcademiHub Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Environment variables configured

## Environment Variables
```
DATABASE_URL=postgresql://...
NODE_ENV=production
PASSWORD_SALT=your-secure-salt
```

## Setup Instructions

### 1. Database Setup
```bash
# Run the database schema script
npm run db:init
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Application
```bash
npm run build
```

### 4. Deploy to Vercel
```bash
vercel deploy
```

## Production Checklist
- [ ] Database backup configured
- [ ] Environment variables set in Vercel
- [ ] Email service configured for verification
- [ ] Payment gateway integrated
- [ ] File storage service configured
- [ ] SSL/TLS certificate installed
- [ ] Rate limiting configured
- [ ] Monitoring and logging setup

## Security Considerations
- Always use HTTPS in production
- Implement rate limiting on auth endpoints
- Use bcrypt for password hashing (upgrade from crypto)
- Enable CORS only for trusted domains
- Regular security audits
- Keep dependencies updated

## Scaling Considerations
- Add caching layer (Redis)
- Implement database connection pooling
- Use CDN for static assets
- Consider read replicas for analytics
