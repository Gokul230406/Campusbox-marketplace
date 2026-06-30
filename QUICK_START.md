# College Essentials Marketplace - Quick Start Guide

## Overview
This is a production-ready college-exclusive marketplace where students can buy, sell, and rent essentials like books, calculators, accessories, and notes.

## ⚡ Get Running in 5 Minutes

### Step 1: Clone & Install
```bash
# Install dependencies
npm install
```

### Step 2: Setup MongoDB
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or login
3. Create a new cluster (Free M0 tier)
4. Click "Connect" → "Drivers"
5. Copy your connection string
6. Replace `<password>` with your password
7. Add database name at the end: `/college-marketplace`

### Step 3: Create Environment File
Create `.env.local` in your project root:

```env
MONGODB_URI=mongodb+srv://your-user:your-password@cluster0.xxxxx.mongodb.net/college-marketplace
JWT_SECRET=my-random-secret-key-12345
NODE_ENV=development
```

### Step 4: Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 🎯 Test the Platform

### Create Account
1. Go to `/register`
2. Use any college email (e.g., student@college.edu)
3. Fill in details:
   - First Name: John
   - Last Name: Doe
   - Register Number: 12345
   - Department: Computer Science
   - College: Your College Name
   - Password: anything123
4. Click Register

### List a Product
1. Click "Sell" in navbar
2. Fill form:
   - Title: "Used Python Textbook"
   - Category: "Books & Notes"
   - Price: 500 (for selling)
   - Or Rental Price: 50/week (for renting)
   - Type: Both (to allow buy & rent)
   - Upload image
3. Submit (auto-approved in demo mode)

### Browse & Buy Products
1. Go to `/products`
2. Filter by category or search
3. Click product to view details
4. Choose Buy or Rent
5. Complete transaction (wallet-based for demo)

### Check Admin Panel
1. Go to `/admin/dashboard`
2. See all products awaiting approval
3. Approve/reject products

## 📁 Project Structure

```
├── models/                    # MongoDB schemas
│   ├── User.ts               # User profiles & wallets
│   ├── Product.ts            # Product listings
│   ├── Order.ts              # Transactions
│   ├── Review.ts             # Ratings & reviews
│   └── Dispute.ts            # Dispute tracking
│
├── app/
│   ├── api/                  # Backend APIs
│   │   ├── auth/             # Login, register
│   │   ├── products/         # Product CRUD
│   │   ├── orders/           # Purchase & rental
│   │   ├── wallet/           # Balance & topup
│   │   ├── reviews/          # Ratings
│   │   └── admin/            # Admin functions
│   │
│   ├── page.tsx              # Homepage
│   ├── register/page.tsx     # Sign up
│   ├── login/page.tsx        # Sign in
│   ├── products/page.tsx     # Browse items
│   ├── products/[id]/page.tsx # Item details
│   ├── sell/page.tsx         # Upload product
│   ├── dashboard/page.tsx    # User dashboard
│   ├── wallet/page.tsx       # Wallet management
│   ├── profile/page.tsx      # User profile
│   └── admin/dashboard/page.tsx # Admin panel
│
├── lib/
│   ├── mongodb.ts            # DB connection
│   ├── jwt.ts                # Token handling
│   └── auth-context.tsx      # Auth state
│
└── components/               # UI components
    ├── navbar.tsx
    └── ui/*                  # shadcn components
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List all approved products
- `GET /api/products?category=Books%20&%20Notes` - Filter by category
- `GET /api/products?type=rent` - Filter by type
- `GET /api/products/[id]` - Get product details
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/[id]` - Update product (seller only)
- `DELETE /api/products/[id]` - Delete product (seller only)

### Orders
- `POST /api/orders/purchase` - Buy or rent a product
  ```json
  {
    "productId": "xxx",
    "orderType": "purchase" | "rental",
    "rentalDays": 7,
    "amount": 500
  }
  ```

### Wallet
- `GET /api/wallet/balance` - Check user wallet balance
- `POST /api/wallet/add-funds` - Add funds
  ```json
  { "amount": 1000 }
  ```

### Reviews
- `GET /api/reviews?productId=xxx` - Get product reviews
- `POST /api/reviews` - Post a review
  ```json
  {
    "productId": "xxx",
    "rating": 5,
    "comment": "Great product!"
  }
  ```

### Admin
- `PUT /api/admin/products/approval` - Approve/reject product
  ```json
  {
    "productId": "xxx",
    "approved": true,
    "rejectionReason": ""
  }
  ```

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "College marketplace"
git push origin main

# 2. Go to Vercel.com
# 3. Import your GitHub repo
# 4. Add Environment Variables:
#    - MONGODB_URI
#    - JWT_SECRET
# 5. Deploy!
```

## ✅ Features Implemented

- [x] College-exclusive registration with email verification
- [x] Secure JWT authentication
- [x] Product listings with search & filters
- [x] Buy & Rent support with duration limits
- [x] User wallet system
- [x] Ratings & reviews
- [x] Admin approval dashboard
- [x] User profiles with seller badges
- [x] Product images support
- [x] Responsive mobile design

## 🛠️ Troubleshooting

### "MONGODB_URI not defined"
- Check `.env.local` file exists
- Verify `MONGODB_URI` is set correctly
- Restart dev server: `npm run dev`

### "Cannot connect to MongoDB"
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Ensure database name is in URI

### "Login not working"
- Clear browser cookies
- Check JWT_SECRET is set
- Verify MongoDB is accessible

### "Products not showing"
- Create a product via `/sell`
- Check admin panel to approve it
- In demo mode, products auto-approve

### CORS or Fetch Errors
- Check that API routes are in `app/api/` folder
- Verify request headers include "Content-Type: application/json"
- Check browser console for specific error

## 📚 Database Schema

Each collection is automatically created by Mongoose:

### Users Collection
- email, password, firstName, lastName
- registerNumber, department, collegeName
- profileImage, bio, rating, walletBalance
- isVerified, isVerifiedSeller

### Products Collection
- title, description, category
- price, rentalPrice, rentalDuration
- type (sell/rent/both), condition
- images, stock, rating, totalReviews
- sellerId, isApproved

### Orders Collection
- productId, buyerId, sellerId
- orderType (purchase/rental)
- amount, rentalEndDate
- status (pending/completed/cancelled)

### Reviews Collection
- productId, sellerId, buyerId
- rating (1-5), comment
- isVerifiedPurchase

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to random value
- [ ] Use HTTPS in production
- [ ] Setup MongoDB IP whitelist
- [ ] Enable email verification
- [ ] Add rate limiting to APIs
- [ ] Implement payment gateway
- [ ] Regular security audits

## 📞 Support

Having issues? Check:
1. MongoDB Atlas connection working
2. All env vars are set (.env.local)
3. Node.js version 18+
4. Browser console for errors
5. Server logs (npm run dev output)

Happy marketplace building!
