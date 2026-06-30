# StudentHub - College Essentials Marketplace

A comprehensive online marketplace platform for college students to buy, sell, and rent student essentials including books, calculators, accessories, and more.

## Features

### For Students (Buyers & Sellers)
- **College-Exclusive**: Verified students only using college email, register number, and department
- **Flexible Trading**: Buy items permanently or rent for limited periods
- **Secure Authentication**: JWT-based authentication with secure HTTP-only cookies
- **User Profiles**: Complete profile management with seller verification badges
- **Product Listings**: Upload and manage product listings with images, pricing, and conditions
- **Search & Filters**: Advanced search by category, type (buy/rent), and condition
- **Wallet System**: Integrated wallet for seamless transactions
- **Ratings & Reviews**: Build trust with verified purchase reviews
- **Rental Management**: Automatic rental period tracking with time-based access

### For Admins
- **Product Approval**: Review and approve/reject product listings before going live
- **User Management**: Monitor seller verification and platform activity
- **Dispute Resolution**: Handle customer complaints and transaction issues
- **Platform Analytics**: Track users, products, transactions, and revenue

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (React)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs

### Database
- **Database**: MongoDB
- **Query**: Native MongoDB driver (no ORM)

### Payment Integration
- **Payment Gateway**: Razorpay (ready for integration)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── orders/
│   │   │   └── purchase/route.ts
│   │   ├── wallet/
│   │   │   ├── balance/route.ts
│   │   │   └── add-funds/route.ts
│   │   ├── reviews/route.ts
│   │   ├── user/
│   │   │   └── profile/route.ts
│   │   └── admin/
│   │       └── products/
│   │           └── approval/route.ts
│   ├── page.tsx (Home)
│   ├── register/page.tsx
│   ├── login/page.tsx
│   ├── products/page.tsx
│   ├── products/[id]/page.tsx
│   ├── dashboard/page.tsx
│   ├── profile/page.tsx
│   ├── sell/page.tsx
│   ├── wallet/page.tsx
│   ├── admin/dashboard/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── models/
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   ├── Review.ts
│   └── Dispute.ts
├── lib/
│   ├── mongodb.ts
│   ├── jwt.ts
│   ├── auth-context.tsx
│   └── utils.ts
├── components/
│   ├── navbar.tsx
│   └── ui/ (shadcn components)
└── public/
```

## Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (bcrypt hashed),
  firstName: string,
  lastName: string,
  registerNumber: string (unique, college ID),
  department: string,
  collegeName: string,
  profileImage: string (optional),
  bio: string (optional),
  isVerified: boolean,
  rating: number (0-5),
  totalReviews: number,
  isVerifiedSeller: boolean,
  walletBalance: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  category: string (Books & Notes, Calculators, Accessories, etc.),
  condition: string (new, like-new, good, fair),
  sellerId: ObjectId (ref to User),
  sellerName: string,
  price: number (for purchase),
  rentalPrice: number (per day),
  rentalDuration: number (max days),
  type: string (sell, rent, both),
  images: string[],
  rating: number (0-5),
  totalReviews: number,
  isApproved: boolean,
  rejectionReason: string (optional),
  purchaseCount: number,
  rentalCount: number,
  stock: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref to Product),
  buyerId: ObjectId (ref to User),
  sellerId: ObjectId (ref to User),
  orderType: string (purchase, rental),
  amount: number,
  rentalEndDate: Date (if rental),
  status: string (pending, completed, cancelled, refunded),
  paymentMethod: string (wallet, razorpay),
  transactionId: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection
```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref to Product),
  buyerId: ObjectId (ref to User),
  rating: number (1-5),
  comment: string,
  isVerifiedPurchase: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studenthub?retryWrites=true&w=majority

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Razorpay (optional, for payment integration)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin IDs (comma-separated user IDs with admin access)
ADMIN_IDS=user_id_1,user_id_2
```

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB Atlas account or local MongoDB instance
- Razorpay account (optional, for payments)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd studenthub
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login student
- `POST /api/auth/logout` - Logout student

### Products
- `GET /api/products` - Get all approved products (with filters)
- `POST /api/products` - Create new product listing
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product (seller only)
- `DELETE /api/products/[id]` - Delete product (seller only)

### Orders & Transactions
- `POST /api/orders/purchase` - Create purchase/rental order
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/add-funds` - Add funds to wallet

### Reviews
- `GET /api/reviews?productId=[id]` - Get product reviews
- `POST /api/reviews` - Add review (verified purchase)

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Admin
- `GET /api/admin/products/approval?status=pending` - Get pending products
- `POST /api/admin/products/approval` - Approve/reject product

## Authentication Flow

1. User registers with college email, register number, and department
2. Password is hashed using bcryptjs
3. JWT token generated and stored in HTTP-only cookie
4. Token verified on each protected route
5. User data synced via `/api/user/profile`

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **HTTP-Only Cookies**: Prevents XSS attacks
- **College Verification**: Email and register number validation
- **Row-Level Security**: Users can only modify their own data
- **Input Validation**: All endpoints validate input data

## Payment Integration (Razorpay)

The wallet system is ready for Razorpay integration:

1. Add Razorpay credentials to `.env.local`
2. Install Razorpay SDK: `npm install razorpay`
3. Create Razorpay order in `/api/wallet/add-funds`
4. Verify payment and update wallet balance

Example integration code will be added to the Razorpay API route.

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# OR deploy directly
vercel
```

### Deploy to Other Platforms

- Set `NODE_ENV=production`
- Ensure MongoDB is accessible
- Set all required environment variables
- Run `npm run build && npm start`

## Future Enhancements

- [ ] Email verification for college accounts
- [ ] Two-factor authentication
- [ ] Real Razorpay payment integration
- [ ] Notification system (email, SMS)
- [ ] Advanced analytics dashboard
- [ ] Item condition ratings
- [ ] Messaging between buyers and sellers
- [ ] Dispute resolution workflow
- [ ] Seller badges and achievements
- [ ] Mobile app (React Native/Flutter)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Submit an issue](https://github.com/studenthub/issues)
- Email: support@studenthub.local

## Team

Built with ❤️ for college students worldwide.

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Production Ready
