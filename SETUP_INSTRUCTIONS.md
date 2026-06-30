# College Marketplace - Setup Instructions

## Quick Start Guide

This is a fully functional college-exclusive marketplace for buying, selling, and renting student essentials built with Next.js, MongoDB, and JWT authentication.

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)

### Step 1: Get MongoDB URI
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster (free tier M0 is perfect for testing)
4. Click "Connect" on your cluster
5. Choose "Drivers" and select Node.js
6. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname`)
7. Replace `<password>` with your database password
8. Add the database name at the end: `/college-marketplace`

### Step 2: Setup Environment Variables
1. Rename `.env.local.example` to `.env.local`
2. Add your MongoDB URI: `MONGODB_URI=mongodb+srv://...`
3. Add a JWT Secret (or keep the default for development)

```bash
# Example .env.local
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/college-marketplace
JWT_SECRET=my-super-secret-key-12345
NODE_ENV=development
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Step 5: Test the Marketplace

**Create an Account:**
- Go to /register
- Use any college email (e.g., student@college.edu)
- Fill in: First name, Last name, Register number, Department, College name
- Password: anything (min 6 chars)

**Create a Product:**
- Click "Sell" in navbar
- Fill in product details
- Choose: Buy, Rent, or Both
- Submit (auto-approved for demo)

**Browse Products:**
- Visit /products
- Filter by category, condition, or price
- Click on a product to view details

**Admin Dashboard:**
- Visit /admin/dashboard
- See all products and approvals
- Manage users and disputes

## Project Structure

```
├── models/           # MongoDB schemas
│   ├── User.ts      # User/seller profiles
│   ├── Product.ts   # Product listings
│   ├── Order.ts     # Purchase/rental orders
│   ├── Review.ts    # Ratings & reviews
│   └── Dispute.ts   # Dispute tracking
├── lib/
│   ├── mongodb.ts   # MongoDB connection
│   ├── jwt.ts       # JWT token handling
│   └── auth-context.tsx # React auth state
├── app/api/         # Backend APIs
│   ├── auth/        # Login, register, logout
│   ├── products/    # Product CRUD
│   ├── orders/      # Purchase & rental
│   ├── wallet/      # Wallet balance & top-up
│   ├── reviews/     # Ratings & comments
│   └── admin/       # Admin approvals
└── app/             # Frontend pages
    ├── page.tsx     # Homepage
    ├── products/    # Product listing
    ├── register/    # Sign up
    ├── login/       # Sign in
    ├── sell/        # Upload product
    ├── dashboard/   # User dashboard
    ├── wallet/      # Wallet management
    └── admin/       # Admin panel
```

## Key Features Implemented

✅ College-exclusive with email verification
✅ Secure JWT authentication
✅ Product listings with filtering
✅ Buy & Rent support
✅ User wallet system
✅ Ratings & reviews
✅ Admin approval panel
✅ Responsive design
✅ Search functionality
✅ User profiles

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List all products
- `GET /api/products/[id]` - Get product details
- `POST /api/products` - Create product (seller only)

### Orders
- `POST /api/orders/purchase` - Buy or rent a product

### Wallet
- `GET /api/wallet/balance` - Check balance
- `POST /api/wallet/add-funds` - Add funds (demo mode)

### Reviews
- `GET /api/reviews` - Get product reviews
- `POST /api/reviews` - Leave a review

### Admin
- `PUT /api/admin/products/approval` - Approve/reject products

## Troubleshooting

**"MONGODB_URI not defined" error:**
- Ensure .env.local file exists with MONGODB_URI

**"Cannot connect to MongoDB":**
- Check your MongoDB Atlas credentials
- Ensure IP whitelist includes your computer (or use 0.0.0.0/0 for all)
- Verify database name in connection string

**Products not showing:**
- Create a product via /sell
- Check that product approval status (in demo mode, auto-approved)

**Login not working:**
- Verify .env.local has JWT_SECRET set
- Clear browser cookies and try again

## Deployment

To deploy to Vercel:

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas URI
   - `JWT_SECRET` - Random secret string
   - `NODE_ENV` - production
5. Deploy!

## Security Checklist

- [ ] Change JWT_SECRET to a random string
- [ ] Enable MongoDB Atlas firewall rules
- [ ] Use HTTPS in production
- [ ] Add email verification
- [ ] Implement rate limiting
- [ ] Add payment gateway integration
- [ ] Regular security audits

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Check browser console for error messages
4. Check server logs: `npm run dev` output

Happy selling and renting!
