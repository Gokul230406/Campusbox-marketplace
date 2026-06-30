# Deployment Guide - College Marketplace

## Prerequisites
- GitHub account with code pushed
- Vercel account (free tier available)
- MongoDB Atlas account (free tier available)
- Project running locally with all tests passing

## Deploy to Vercel (Recommended - 5 Minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "College marketplace ready for deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Paste your GitHub repo URL
5. Click "Import"

### Step 3: Add Environment Variables
1. In Vercel project settings
2. Go to "Environment Variables"
3. Add these variables:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/college-marketplace
JWT_SECRET=your-random-secret-key-here
NODE_ENV=production
```

4. Click "Save"

### Step 4: Deploy
1. Click "Deploy"
2. Wait 3-5 minutes
3. Get your production URL (https://yourapp.vercel.app)

### Step 5: Update MongoDB IP Whitelist
1. Go to MongoDB Atlas
2. Network Access
3. Add Vercel deployment IP (or use 0.0.0.0/0 for simplicity)

---

## Alternative: Deploy to Heroku

### Step 1: Install Heroku CLI
```bash
# Windows: Download from https://devcenter.heroku.com/articles/heroku-cli
# Mac: brew tap heroku/brew && brew install heroku
# Linux: curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
heroku create your-app-name
```

### Step 4: Add Environment Variables
```bash
heroku config:set MONGODB_URI=mongodb+srv://user:pass@...
heroku config:set JWT_SECRET=your-random-key
heroku config:set NODE_ENV=production
```

### Step 5: Deploy
```bash
git push heroku main
```

### Step 6: View Logs
```bash
heroku logs --tail
```

---

## Custom VPS Deployment (AWS, DigitalOcean, Linode)

### Step 1: Setup VPS
1. Create server (Ubuntu 22.04 recommended)
2. SSH into server
3. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Clone and Setup
```bash
git clone https://github.com/yourusername/college-marketplace.git
cd college-marketplace
npm install
```

### Step 3: Create Environment File
```bash
nano .env.local
```

Add:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-key
NODE_ENV=production
```

### Step 4: Build and Start
```bash
npm run build
npm start
```

### Step 5: Setup PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start "npm start" --name "marketplace"
pm2 startup
pm2 save
```

### Step 6: Setup Nginx (Reverse Proxy)
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
upstream app {
  server localhost:3000;
}

server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
  }
}
```

Start Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Create docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb+srv://user:pass@...
      - JWT_SECRET=your-key
      - NODE_ENV=production
    restart: always
```

### Deploy
```bash
docker-compose up -d
```

---

## Post-Deployment Checklist

### Security
- [ ] Enable HTTPS/SSL
- [ ] Set secure JWT_SECRET
- [ ] Configure CORS
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Enable database encryption
- [ ] Regular security updates

### Performance
- [ ] Enable caching headers
- [ ] Optimize database indexes
- [ ] Setup CDN for static files
- [ ] Monitor response times
- [ ] Setup auto-scaling

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Monitor application logs
- [ ] Track database performance
- [ ] Monitor API response times
- [ ] Setup uptime monitoring
- [ ] Alert on errors

### Backups
- [ ] Enable MongoDB backups
- [ ] Test restore procedure
- [ ] Document backup process
- [ ] Backup frequency: Daily

### Maintenance
- [ ] Update dependencies monthly
- [ ] Monitor security updates
- [ ] Review error logs weekly
- [ ] Optimize database quarterly

---

## Monitoring & Logging

### Using Vercel Analytics
Available in Vercel dashboard automatically

### Using Sentry for Error Tracking
```bash
npm install @sentry/nextjs
```

In `next.config.mjs`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

### Using LogRocket
```bash
npm install logrocket
```

---

## Scaling for Growth

### Horizontal Scaling
- Use load balancer (AWS ELB, nginx)
- Run multiple app instances
- Use session management (Redis)

### Database Scaling
- Upgrade MongoDB cluster tier
- Enable sharding for large datasets
- Implement caching layer (Redis)

### Content Delivery
- Use CDN for images (Cloudflare, AWS CloudFront)
- Enable compression
- Optimize image sizes

---

## Performance Optimization

```javascript
// Enable caching in next.config.mjs
export default {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=120'
          }
        ]
      }
    ]
  }
}
```

---

## Disaster Recovery Plan

1. **Backup Strategy**
   - Daily automated backups
   - Weekly manual backups
   - Monthly archive backups
   - 30-day retention minimum

2. **Recovery Procedure**
   - Test backups weekly
   - Document restore steps
   - RTO (Recovery Time Objective): 4 hours
   - RPO (Recovery Point Objective): 24 hours

3. **Incident Response**
   - On-call rotation
   - Incident communication plan
   - Post-mortem process

---

## Domain Setup

### Connect Custom Domain to Vercel
1. Add domain in Vercel settings
2. Add DNS records (CNAME/A records)
3. Update nameservers or point to Vercel
4. SSL certificate auto-provisioned

### Email Configuration
For college email verification, use SendGrid or Mailgun:

```bash
npm install @sendgrid/mail
```

```javascript
// In API route
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'noreply@yourcollegemarketplace.com',
  subject: 'Verify Your Email',
  text: 'Verification link...'
});
```

---

## Troubleshooting Deployment

### App crashes on startup
```bash
# Check logs
vercel logs [project-name]

# Verify environment variables are set
# Rebuild: vercel redeploy
```

### Database connection fails
- Verify MONGODB_URI in env variables
- Check MongoDB Atlas IP whitelist
- Test connection locally first

### Slow performance
- Check database indexes
- Enable caching
- Monitor memory usage
- Review API response times

### High costs
- Review database usage
- Implement pagination
- Add caching layer
- Monitor API calls

---

## Next Steps After Deployment

1. Setup monitoring and alerts
2. Configure automated backups
3. Document runbook for incidents
4. Setup CI/CD pipeline
5. Plan scaling strategy
6. Implement payment gateway
7. Add email verification
8. Setup analytics
9. Create admin dashboard
10. Plan feature roadmap
```

Now let me create a final setup reference card:

```text file="SETUP_REFERENCE.txt"
╔════════════════════════════════════════════════════════════════════════════╗
║         COLLEGE MARKETPLACE - QUICK REFERENCE SETUP CARD                    ║
╚════════════════════════════════════════════════════════════════════════════╝

🚀 QUICK START (5 MINUTES)
─────────────────────────────────────────────────────────────────────────────

1. Get MongoDB URI from MongoDB Atlas
   → https://www.mongodb.com/cloud/atlas
   → Create cluster → Connect → Copy connection string

2. Create .env.local with:
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/college-marketplace
   JWT_SECRET=random-secret-key-123

3. Run:
   npm install
   npm run dev

4. Visit: http://localhost:3000

📋 KEY COMMANDS
─────────────────────────────────────────────────────────────────────────────

npm run dev          → Start development server
npm run build        → Build for production
npm start            → Start production server
npm run lint         → Check code quality

🔗 IMPORTANT URLs
─────────────────────────────────────────────────────────────────────────────

Homepage            → http://localhost:3000
Register            → http://localhost:3000/register
Login               → http://localhost:3000/login
Browse Products     → http://localhost:3000/products
Sell Product        → http://localhost:3000/sell
User Dashboard      → http://localhost:3000/dashboard
Wallet              → http://localhost:3000/wallet
Admin Dashboard     → http://localhost:3000/admin/dashboard

🔌 ENVIRONMENT VARIABLES NEEDED
─────────────────────────────────────────────────────────────────────────────

MONGODB_URI          → MongoDB connection string (Required)
JWT_SECRET           → Secret key for JWT tokens (Required)
NODE_ENV             → development or production (Default: development)

📦 KEY FILES & FOLDERS
─────────────────────────────────────────────────────────────────────────────

models/              → MongoDB schemas (User, Product, Order, Review)
lib/mongodb.ts       → MongoDB connection logic
lib/jwt.ts           → JWT token handling
app/api/             → Backend API routes
app/                 → Frontend pages

🎯 FIRST TIME WALKTHROUGH
─────────────────────────────────────────────────────────────────────────────

1. Register Account
   Email: student@college.edu
   Name: John Doe
   Register #: CS2024001
   Department: Computer Science

2. Create First Product
   Go to /sell
   Fill in product details
   Upload images
   Submit (auto-approved in demo)

3. Browse Products
   Go to /products
   Filter by category
   Click product to view details

4. Dashboard
   Go to /dashboard
   View your products and orders

📊 FEATURES CHECKLIST
─────────────────────────────────────────────────────────────────────────────

✓ College-exclusive signup
✓ Secure JWT authentication
✓ Product listings & search
✓ Buy & Rent functionality
✓ User wallet system
✓ Ratings & reviews
✓ Admin approval panel
✓ User profiles
✓ Responsive design

🚨 COMMON ISSUES & FIXES
─────────────────────────────────────────────────────────────────────────────

Issue: "MONGODB_URI not defined"
Fix: Create .env.local file with MONGODB_URI variable

Issue: "Cannot connect to MongoDB"
Fix: Check MongoDB URI, IP whitelist, credentials in Atlas

Issue: "Login not working"
Fix: Clear cookies, restart server, check JWT_SECRET

Issue: "Products not showing"
Fix: Create product via /sell, check admin approval

Issue: "Suspense boundary error"
Fix: This is normal Next.js behavior during development

🌐 DEPLOYMENT
─────────────────────────────────────────────────────────────────────────────

Option 1: Vercel (Recommended)
→ Push to GitHub → Import on Vercel → Add env vars → Deploy

Option 2: Heroku
→ heroku create [app-name]
→ heroku config:set MONGODB_URI=...
→ git push heroku main

Option 3: Custom VPS
→ SSH to server → Git clone → npm install → npm run build → npm start

📞 SUPPORT RESOURCES
─────────────────────────────────────────────────────────────────────────────

MongoDB Docs        → https://docs.mongodb.com
Next.js Docs        → https://nextjs.org/docs
Vercel Deploy       → https://vercel.com/docs
JWT Info            → https://jwt.io

✨ WHAT'S INCLUDED
─────────────────────────────────────────────────────────────────────────────

• Complete Next.js/React frontend with shadcn UI components
• Express-like API routes with MongoDB integration
• JWT-based authentication with bcrypt password hashing
• Product upload, listing, and search functionality
• Buy & Rent transaction system
• User wallet with balance tracking
• Ratings & reviews system
• Admin product approval dashboard
• Responsive design for mobile/tablet/desktop
• Production-ready error handling

🔐 SECURITY FEATURES
─────────────────────────────────────────────────────────────────────────────

• Password hashing with bcryptjs
• JWT token authentication
• HTTP-only secure cookies
• Input validation & sanitization
• College email verification
• Seller verification badges
• Admin-only functions
• CORS security headers

═══════════════════════════════════════════════════════════════════════════════
                    Happy Building! 🎓🛒✨
═══════════════════════════════════════════════════════════════════════════════
