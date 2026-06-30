# College Marketplace - Complete API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require a valid JWT token in HTTP-only cookies (automatically set on login/register).

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

Create a new college student account.

**Request Body:**
```json
{
  "email": "student@college.edu",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe",
  "registerNumber": "CS2024001",
  "department": "Computer Science",
  "collegeName": "XYZ College"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "student@college.edu",
    "firstName": "John",
    "lastName": "Doe",
    "rating": 0,
    "walletBalance": 0,
    "isVerifiedSeller": false
  }
}
```

**Error Responses:**
- 400: Missing required fields
- 409: Email or register number already registered
- 500: Internal server error

---

### Login User
**POST** `/auth/login`

Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "student@college.edu",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "student@college.edu",
    "firstName": "John",
    "lastName": "Doe",
    "rating": 4.5,
    "walletBalance": 5000,
    "isVerifiedSeller": true
  }
}
```

**Error Responses:**
- 400: Email and password required
- 401: Invalid credentials
- 500: Internal server error

---

### Logout User
**POST** `/auth/logout`

Clear authentication token.

**Response (200):**
```json
{ "message": "Logged out successfully" }
```

---

## Product Endpoints

### Get All Products
**GET** `/products`

List approved products with optional filters.

**Query Parameters:**
- `category` (optional): "Books & Notes", "Calculators", "Accessories", "Essentials", "Tech Gadgets", "Stationery"
- `type` (optional): "sell", "rent", "both"
- `page` (optional): Page number (default: 1)
- `search` (optional): Search term for title/description

**Examples:**
```
GET /api/products
GET /api/products?category=Books%20&%20Notes
GET /api/products?type=rent&page=2
GET /api/products?search=python
```

**Response (200):**
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Python Programming Book",
      "description": "Complete guide to Python",
      "category": "Books & Notes",
      "type": "both",
      "condition": "like-new",
      "price": 500,
      "rentalPrice": 50,
      "rentalDuration": 7,
      "stock": 2,
      "rating": 4.8,
      "totalReviews": 12,
      "images": ["url1", "url2"],
      "sellerId": {
        "_id": "607f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe",
        "rating": 4.5,
        "isVerifiedSeller": true
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

---

### Get Product Details
**GET** `/products/[id]`

Get detailed information about a specific product.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Python Programming Book",
  "description": "Complete guide to Python 3.x with advanced concepts",
  "category": "Books & Notes",
  "type": "both",
  "condition": "like-new",
  "price": 500,
  "rentalPrice": 50,
  "rentalDuration": 7,
  "stock": 2,
  "rating": 4.8,
  "totalReviews": 12,
  "purchaseCount": 8,
  "rentalCount": 15,
  "images": ["url1", "url2", "url3"],
  "sellerId": {
    "_id": "607f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "rating": 4.5,
    "isVerifiedSeller": true,
    "bio": "Reliable seller, fast shipping"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}
```

**Error Responses:**
- 404: Product not found

---

### Create Product
**POST** `/products` (Auth Required)

Upload a new product for sale or rent.

**Request Body:**
```json
{
  "title": "Used Calculus Textbook",
  "description": "Slightly used, covers all chapters",
  "category": "Books & Notes",
  "type": "both",
  "condition": "good",
  "price": 400,
  "rentalPrice": 30,
  "rentalDuration": 7,
  "images": ["url1", "url2"],
  "stock": 1
}
```

**Response (201):**
```json
{
  "message": "Product uploaded successfully. Awaiting admin approval.",
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Used Calculus Textbook",
    ...
    "isApproved": false
  }
}
```

**Error Responses:**
- 401: Unauthorized (not logged in)
- 400: Missing required fields
- 500: Internal server error

---

### Update Product
**PUT** `/products/[id]` (Auth Required, Seller Only)

Update your own product listing.

**Request Body:** (partial update)
```json
{
  "price": 450,
  "stock": 2,
  "description": "Updated description"
}
```

**Response (200):** Updated product object

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden (not your product)
- 404: Product not found

---

### Delete Product
**DELETE** `/products/[id]` (Auth Required, Seller Only)

Remove your product listing.

**Response (200):**
```json
{ "message": "Product deleted" }
```

---

## Order Endpoints

### Create Purchase/Rental Order
**POST** `/orders/purchase` (Auth Required)

Create a buy or rental order.

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "orderType": "purchase",
  "amount": 500,
  "rentalDays": 0
}
```

For rentals:
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "orderType": "rental",
  "amount": 210,
  "rentalDays": 7
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "607f1f77bcf86cd799439012",
    "productId": "507f1f77bcf86cd799439011",
    "buyerId": "707f1f77bcf86cd799439013",
    "sellerId": "807f1f77bcf86cd799439014",
    "orderType": "rental",
    "amount": 210,
    "rentalEndDate": "2024-02-15T10:30:00Z",
    "status": "completed",
    "createdAt": "2024-02-08T10:30:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 400: Invalid product or insufficient balance
- 404: Product not found

---

## Wallet Endpoints

### Get Wallet Balance
**GET** `/wallet/balance` (Auth Required)

Check your current wallet balance.

**Response (200):**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "balance": 5000,
  "totalSpent": 2450,
  "totalEarnings": 12000
}
```

---

### Add Funds to Wallet
**POST** `/wallet/add-funds` (Auth Required)

Add money to your wallet (demo mode - instant credit).

**Request Body:**
```json
{
  "amount": 5000,
  "paymentMethod": "card"
}
```

**Response (200):**
```json
{
  "message": "Funds added successfully",
  "newBalance": 10000,
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "607f1f77bcf86cd799439012",
    "amount": 5000,
    "type": "credit",
    "createdAt": "2024-01-20T14:22:00Z"
  }
}
```

---

## Review Endpoints

### Get Product Reviews
**GET** `/reviews?productId=[id]`

Get all reviews for a product.

**Response (200):**
```json
{
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "productId": "607f1f77bcf86cd799439012",
      "buyerId": {
        "_id": "707f1f77bcf86cd799439013",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "rating": 5,
      "comment": "Great condition, fast delivery!",
      "isVerifiedPurchase": true,
      "createdAt": "2024-01-20T14:22:00Z"
    }
  ],
  "averageRating": 4.7,
  "totalReviews": 15
}
```

---

### Post Review
**POST** `/reviews` (Auth Required)

Leave a rating and review for a product.

**Request Body:**
```json
{
  "productId": "607f1f77bcf86cd799439012",
  "rating": 5,
  "comment": "Excellent condition. Seller was very helpful!"
}
```

**Response (201):**
```json
{
  "message": "Review posted successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439011",
    "productId": "607f1f77bcf86cd799439012",
    "rating": 5,
    "comment": "Excellent condition. Seller was very helpful!",
    "isVerifiedPurchase": true,
    "createdAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 400: Invalid rating or duplicate review

---

## User Profile Endpoints

### Get User Profile
**GET** `/user/profile` (Auth Required)

Get your profile information.

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "student@college.edu",
  "firstName": "John",
  "lastName": "Doe",
  "registerNumber": "CS2024001",
  "department": "Computer Science",
  "collegeName": "XYZ College",
  "rating": 4.5,
  "totalReviews": 25,
  "walletBalance": 5000,
  "isVerifiedSeller": true,
  "profileImage": "url",
  "bio": "Trusted seller, fast delivery",
  "createdAt": "2024-01-10T10:30:00Z"
}
```

---

### Update User Profile
**PUT** `/user/profile` (Auth Required)

Update your profile information.

**Request Body:** (partial update)
```json
{
  "firstName": "Jonathan",
  "bio": "Updated bio",
  "profileImage": "new-image-url"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { ...updated user data }
}
```

---

## Admin Endpoints

### Approve/Reject Product
**PUT** `/admin/products/approval` (Admin Only)

Approve or reject a product listing.

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "approved": true,
  "rejectionReason": ""
}
```

Or rejection:
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "approved": false,
  "rejectionReason": "Image quality too low"
}
```

**Response (200):**
```json
{
  "message": "Product approved",
  "product": { ...updated product }
}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "message": "Error description",
  "status": 400
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - No permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Rate Limiting

For production, implement rate limiting:
- Authentication endpoints: 5 requests/minute per IP
- Product creation: 10 per hour per user
- General endpoints: 100 requests/minute per user

---

## Pagination

Endpoints that return lists use pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

Use `?page=2` to get next page.

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@college.edu",
    "password":"pass123",
    "firstName":"John",
    "lastName":"Doe",
    "registerNumber":"CS001",
    "department":"CS",
    "collegeName":"College"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@college.edu","password":"pass123"}'

# Get Products
curl http://localhost:3000/api/products?category=Books%20&%20Notes

# Create Product (requires auth)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -b "token=YOUR_JWT_TOKEN" \
  -d '{
    "title":"Book",
    "description":"Test",
    "category":"Books & Notes",
    "price":500
  }'
```

---

## Next Steps

1. Implement payment gateway (Razorpay, Stripe)
2. Add email verification
3. Implement file upload for product images
4. Add advanced search with Elasticsearch
5. Implement real-time notifications
6. Add dispute resolution system
7. Mobile app using React Native
