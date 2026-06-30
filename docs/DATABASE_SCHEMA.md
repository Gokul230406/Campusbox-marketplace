# AcademiHub Database Schema

## Tables Overview

### Users
- Core user information
- College verification fields
- Email verification status

### Wallets
- User account balance
- Currency support

### Wallet Transactions
- Transaction history
- Payment tracking

### Projects
- Project listings
- Pricing information (sale/rental)
- File metadata
- Approval workflow

### Project Tags
- Categorization

### Orders
- Sales and rental transactions
- Payment status tracking

### Project Access
- Track who can access what
- Rental expiration dates

### Reviews
- User ratings and feedback
- Verified purchase tracking

### Disputes
- Issue resolution
- Support tickets

### Admin Logs
- Platform activity monitoring

### Seller Verification
- Seller credibility
- Success metrics

## Key Relationships
- Users → Projects (1:M)
- Users → Orders (1:M)
- Projects → Orders (1:M)
- Users → Reviews (1:M as reviewer)
- Users → Reviews (1:M as reviewed)
- Orders → Reviews (1:1)
- Users → Wallets (1:1)
- Wallets → Transactions (1:M)

## Indexes
All important foreign keys and filter columns are indexed for optimal query performance.
