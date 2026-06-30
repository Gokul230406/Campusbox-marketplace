# AcademiHub API Documentation

## Overview
Complete REST API for the college project marketplace platform.

## Authentication
All endpoints (except auth) require an `Authorization: Bearer <token>` header.

### Register
- **POST** `/api/auth/register`
- **Body**: `{ email, password, firstName, lastName, registerNumber, department, collegeName }`
- **Response**: `{ userId, message }`

### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user, message }`

### Logout
- **POST** `/api/auth/logout`
- **Response**: `{ message }`

## Projects

### Upload Project
- **POST** `/api/projects/upload`
- **Body**: FormData with project data and files
- **Response**: `{ projectId, message }`

### Get Project
- **GET** `/api/projects/[id]`
- **Response**: Project details with seller info and reviews

### List Projects
- **GET** `/api/projects?category=...&type=...&sort=...`
- **Response**: Array of projects with pagination

### Update Project
- **PUT** `/api/projects/[id]`
- **Requires**: Admin or project owner
- **Response**: Updated project

### Delete Project
- **DELETE** `/api/projects/[id]`
- **Requires**: Admin or project owner
- **Response**: `{ message }`

## Orders & Transactions

### Create Order (Buy/Rent)
- **POST** `/api/orders`
- **Body**: `{ projectId, type: 'sale' | 'rental', rentalDays }`
- **Response**: `{ orderId, paymentUrl }`

### Get User Orders
- **GET** `/api/orders/user`
- **Response**: Array of orders

### Update Order Status
- **PUT** `/api/orders/[id]/status`
- **Requires**: Admin or involved parties
- **Body**: `{ status }`
- **Response**: Updated order

## Wallet

### Get Wallet Balance
- **GET** `/api/wallet`
- **Response**: `{ balance, currency }`

### Add Funds
- **POST** `/api/wallet/add-funds`
- **Body**: `{ amount }`
- **Response**: `{ transactionId, message }`

### Withdraw Funds
- **POST** `/api/wallet/withdraw`
- **Body**: `{ amount, bankDetails }`
- **Response**: `{ transactionId, message }`

### Get Transactions
- **GET** `/api/wallet/transactions`
- **Response**: Array of transactions

## Reviews & Ratings

### Create Review
- **POST** `/api/reviews`
- **Body**: `{ orderId, rating, comment, reviewType }`
- **Response**: `{ reviewId, message }`

### Get Reviews
- **GET** `/api/reviews?projectId=...&userId=...`
- **Response**: Array of reviews

## Admin

### Get Pending Projects
- **GET** `/api/admin/projects/pending`
- **Requires**: Admin role
- **Response**: Array of pending projects

### Approve Project
- **POST** `/api/admin/projects/[id]/approve`
- **Requires**: Admin role
- **Body**: `{ notes }`
- **Response**: `{ message }`

### Reject Project
- **POST** `/api/admin/projects/[id]/reject`
- **Requires**: Admin role
- **Body**: `{ reason }`
- **Response**: `{ message }`

### Get Disputes
- **GET** `/api/admin/disputes`
- **Requires**: Admin role
- **Response**: Array of disputes

### Resolve Dispute
- **POST** `/api/admin/disputes/[id]/resolve`
- **Requires**: Admin role
- **Body**: `{ resolution, winner }`
- **Response**: `{ message }`

## Error Responses
All errors follow this format:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **500**: Server Error
