# StudentHub Setup Guide

Complete setup instructions for deploying StudentHub.

## Pre-Deployment Checklist

### 1. Environment Variables
Create `.env.local` with all required variables:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_min_32_chars
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
ADMIN_IDS=admin_user_id
NODE_ENV=production
```

### 2. MongoDB Setup

#### Using MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Add database user with strong password
4. Get connection string
5. Update `MONGODB_URI` in `.env.local`

#### Indexes Required
The schema already includes indexes for:
- Category and date (products listing)
- Seller ID (seller's products)
- Full-text search (title, description)
- User email (unique)
- Register number (unique)

### 3. Razorpay Integration

1. Sign up at [Razorpay](https://razorpay.com)
2. Get API keys from dashboard
3. Add keys to environment variables
4. Verify in test mode first

### 4. College Email Verification

Update the email validation in `/app/api/auth/register/route.ts`:

```typescript
// Replace with your college domains
const validDomains = ["@college.edu", "@university.ac.in"];
const isValidEmail = validDomains.some(domain => email.endsWith(domain));
```

### 5. Admin Setup

1. Create admin user account through normal registration
2. Get the MongoDB `_id` of admin user
3. Add to `ADMIN_IDS` environment variable
4. Admin can now access `/admin/dashboard`

## First-Time Setup

```bash
# 1. Clone and install
git clone <repo>
cd studenthub
npm install

# 2. Create .env.local
cp .env.example .env.local
# Edit with your values

# 3. Run development server
npm run dev

# 4. Visit http://localhost:3000

# 5. Register test account
# Use valid college email format

# 6. Test admin dashboard
# Login as admin and go to /admin/dashboard
```

## Testing the Platform

### 1. Student Registration
- Register with college email
- Verify account creation
- Check JWT token in cookies

### 2. Product Listing
- Create test product
- Verify admin approval system
- Test filters and search

### 3. Wallet System
- Add funds to wallet
- Verify balance updates
- Test purchase transaction

### 4. Order & Rental
- Buy a product
- Test rental with duration
- Verify order status

### 5. Reviews
- Add review after purchase
- Verify rating update
- Check verified purchase badge

## Performance Optimization

### Database
- Indexes are auto-created by schema
- Use MongoDB Atlas for best performance
- Enable connection pooling

### Frontend
- Next.js will optimize images
- Static generation for home page
- ISR for product listings

### Backend
- JWT tokens cached in cookies
- Database connections pooled
- API responses compressed

## Security Hardening

### Before Production

1. **Change JWT Secret**
```bash
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Enable HTTPS**
- Vercel auto-enables HTTPS
- Use trusted certificate on self-hosted

3. **Update CORS**
In next.config.mjs if needed:
```js
headers: async () => [
  {
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
    ],
  },
],
```

4. **Environment Variables**
- Never commit `.env.local`
- Use `.env.example` for reference
- Rotate secrets quarterly

5. **Rate Limiting**
Add to API routes if needed:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Check MONGODB_URI, verify IP whitelist in Atlas

### JWT Token Invalid
```
Error: Invalid token
```
**Solution**: Ensure JWT_SECRET matches between requests, check cookie settings

### Images Not Loading
```
404 on image URLs
```
**Solution**: Implement image storage (Vercel Blob, AWS S3, Cloudinary)

### Razorpay Integration Issues
```
Error: Missing API key
```
**Solution**: Verify RAZORPAY keys in environment, check Razorpay account status

## Monitoring & Analytics

### Key Metrics to Track
- User registration rate
- Product listings per day
- Transaction success rate
- Average order value
- Seller satisfaction score

### Logging
Enable in production:
```typescript
// Add to API routes
console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
```

### Error Tracking
Consider adding Sentry or similar:
```bash
npm install @sentry/nextjs
```

## Scaling Considerations

### Database
- MongoDB sharding for >1M users
- Read replicas for analytics
- Archive old orders monthly

### API
- Implement caching (Redis)
- Async job queue (Bull, RabbitMQ)
- CDN for static assets

### Infrastructure
- Load balancing across multiple instances
- Auto-scaling based on traffic
- Separate admin/user APIs

## Maintenance

### Regular Tasks
- Monitor error rates
- Review pending product approvals
- Check system disk space
- Update dependencies monthly

### Backup Strategy
- Daily MongoDB backups
- Point-in-time recovery enabled
- Test restore process quarterly

### Updates
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test before production
npm run build
npm run dev
```

## Support & Debugging

### Enable Debug Logging
```typescript
// In .env.local
DEBUG=studenthub:*
```

### Check Logs
- Vercel: Deployment logs in dashboard
- Local: Console output in terminal
- MongoDB: Atlas logs in dashboard

### Contact & Help
- GitHub Issues for bugs
- Documentation for features
- Community forum for questions

---

**Maintenance Last Updated**: January 2026
```
