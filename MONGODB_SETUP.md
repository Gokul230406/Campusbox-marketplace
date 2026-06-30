# MongoDB Setup Guide for College Marketplace

## Option 1: MongoDB Atlas (Recommended for Beginners)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Register" or "Sign In"
3. Create account with email or Google

### Step 2: Create a Cluster
1. Once logged in, click "Create"
2. Choose "Shared" (Free tier M0)
3. Select your region (choose closest to you or production location)
4. Click "Create Deployment"
5. Wait 2-3 minutes for cluster creation

### Step 3: Set Database Password
1. In the "Security" section, click "Database Access"
2. Click "Add Database User"
3. Username: any username (e.g., `dbuser`)
4. Password: generate secure password
5. Save credentials safely
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" tab
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific server IPs
5. Click "Confirm"

### Step 5: Get Connection String
1. Go back to "Clusters"
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Select "Node.js" and latest version
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `myFirstDatabase` with `college-marketplace`

Example connection string:
```
mongodb+srv://dbuser:mypassword@cluster0.xxxxx.mongodb.net/college-marketplace?retryWrites=true&w=majority
```

### Step 6: Add to `.env.local`
```env
MONGODB_URI=mongodb+srv://dbuser:mypassword@cluster0.xxxxx.mongodb.net/college-marketplace
```

---

## Option 2: MongoDB Community Edition (Local)

### Installation on Windows
1. Download from https://www.mongodb.com/try/download/community
2. Run installer
3. Check "Install MongoDB Compass" (GUI)
4. Complete installation
5. MongoDB runs on `localhost:27017`

Connection string:
```
mongodb://localhost:27017/college-marketplace
```

### Installation on macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community

# Connection string:
# mongodb://localhost:27017/college-marketplace
```

### Installation on Linux (Ubuntu)
```bash
# Add MongoDB repository
curl https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Connection string:
# mongodb://localhost:27017/college-marketplace
```

---

## Database Collections Overview

The application automatically creates these collections:

### users
Stores all student and seller accounts
```json
{
  "_id": ObjectId,
  "email": "string",
  "password": "hashed_string",
  "firstName": "string",
  "lastName": "string",
  "registerNumber": "string",
  "department": "string",
  "collegeName": "string",
  "rating": number,
  "walletBalance": number,
  "isVerifiedSeller": boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### products
Product listings
```json
{
  "_id": ObjectId,
  "title": "string",
  "description": "string",
  "category": "string",
  "price": number,
  "rentalPrice": number,
  "sellerId": ObjectId,
  "type": "sell|rent|both",
  "condition": "new|like-new|good|fair",
  "images": [string],
  "stock": number,
  "isApproved": boolean,
  "rating": number,
  "createdAt": Date
}
```

### orders
Purchase and rental transactions
```json
{
  "_id": ObjectId,
  "productId": ObjectId,
  "buyerId": ObjectId,
  "sellerId": ObjectId,
  "orderType": "purchase|rental",
  "amount": number,
  "rentalEndDate": Date,
  "status": "pending|completed|cancelled",
  "createdAt": Date
}
```

### reviews
Ratings and comments
```json
{
  "_id": ObjectId,
  "productId": ObjectId,
  "buyerId": ObjectId,
  "sellerId": ObjectId,
  "rating": number,
  "comment": "string",
  "isVerifiedPurchase": boolean,
  "createdAt": Date
}
```

### disputes
Dispute tracking
```json
{
  "_id": ObjectId,
  "orderId": ObjectId,
  "reportedBy": ObjectId,
  "reason": "string",
  "status": "open|resolved|rejected",
  "resolution": "string",
  "createdAt": Date
}
```

---

## Backup & Restore

### Backup with MongoDB Atlas
1. Go to "Backup" tab
2. Click "Enable Backup"
3. Automatic backups run daily
4. Download backup if needed

### Backup MongoDB Locally
```bash
# Export all data
mongodump --db college-marketplace --out ./backup

# Import backup
mongorestore --db college-marketplace ./backup/college-marketplace
```

---

## Monitoring & Performance

### View Database Stats
```bash
# Connect to MongoDB
mongosh

# Select database
use college-marketplace

# View collections
show collections

# View collection size
db.products.estimatedDocumentCount()

# View indexes
db.products.getIndexes()
```

### Common Queries for Testing
```bash
# Find all approved products
db.products.find({ isApproved: true })

# Find products by category
db.products.find({ category: "Books & Notes" })

# Find user by email
db.users.findOne({ email: "student@college.edu" })

# Count total orders
db.orders.countDocuments()

# View recent reviews
db.reviews.find().sort({ createdAt: -1 }).limit(10)
```

---

## Troubleshooting MongoDB

### "ECONNREFUSED 127.0.0.1:27017"
- MongoDB is not running
- Start: `mongod` (local) or verify MongoDB Atlas connection

### "Cannot connect to Atlas"
- Check username/password in connection string
- Verify IP whitelist allows your IP
- Ensure database name is correct

### "Collection already exists" error
- This is normal, Mongoose handles existing collections

### Performance Issues
- Create indexes on frequently queried fields
- Monitor connection pool usage
- Limit query results with pagination

---

## Security Best Practices

1. **Change default credentials** - Don't use simple passwords
2. **IP Whitelist** - Only allow necessary IPs
3. **Enable Authentication** - Always require password
4. **Use HTTPS** - Encrypt data in transit
5. **Regular backups** - Daily automatic backups
6. **Monitor access** - Check Atlas activity logs
7. **Rotate passwords** - Change credentials regularly
8. **Update MongoDB** - Keep version current

---

## Production Checklist

- [ ] Use MongoDB Atlas (or managed service)
- [ ] Enable encryption at rest
- [ ] Setup automatic backups
- [ ] Configure IP whitelist
- [ ] Use strong database password
- [ ] Enable database auditing
- [ ] Monitor database performance
- [ ] Plan database capacity
- [ ] Setup monitoring alerts
