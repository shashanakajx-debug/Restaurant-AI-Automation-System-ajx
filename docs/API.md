# API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require authentication via NextAuth.js session.

### Headers
```
Authorization: Bearer <session-token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /auth/signin
User login endpoint (handled by NextAuth.js)

#### POST /auth/signout
User logout endpoint (handled by NextAuth.js)

#### GET /auth/session
Get current user session

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "admin" | "staff" | "customer"
  },
  "expires": "string"
}
```

### Menu

#### GET /menu
Get all menu items

**Query Parameters:**
- `category` (string, optional) - Filter by category
- `search` (string, optional) - Search in name and description
- `active` (boolean, optional) - Filter by active status
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": 12.99,
      "category": "string",
      "tags": ["string"],
      "imageUrl": "string",
      "active": true,
      "restaurantId": "string",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /menu/[id]
Get menu item by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": 12.99,
    "category": "string",
    "tags": ["string"],
    "imageUrl": "string",
    "active": true,
    "restaurantId": "string",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /admin/menu
Create new menu item (Admin only)

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": 12.99,
  "category": "string",
  "tags": ["string"],
  "imageUrl": "string",
  "active": true
}
```

#### PUT /admin/menu/[id]
Update menu item (Admin only)

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": 12.99,
  "category": "string",
  "tags": ["string"],
  "imageUrl": "string",
  "active": true
}
```

#### DELETE /admin/menu/[id]
Delete menu item (Admin only)

### Orders

#### GET /orders
Get user orders

**Query Parameters:**
- `status` (string, optional) - Filter by order status
- `page` (number, optional) - Page number
- `limit` (number, optional) - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "customerInfo": {
        "name": "string",
        "email": "string",
        "phone": "string"
      },
      "items": [
        {
          "menuItemId": "string",
          "name": "string",
          "price": 12.99,
          "quantity": 2,
          "specialInstructions": "string"
        }
      ],
      "subtotal": 25.98,
      "tax": 2.08,
      "tip": 5.00,
      "total": 33.06,
      "status": "pending",
      "paymentStatus": "completed",
      "paymentMethod": "card",
      "specialInstructions": "string",
      "estimatedTime": 30,
      "restaurantId": "string",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /orders
Create new order

**Request Body:**
```json
{
  "customerInfo": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "items": [
    {
      "menuItemId": "string",
      "quantity": 2,
      "specialInstructions": "string"
    }
  ],
  "specialInstructions": "string",
  "paymentMethod": "card"
}
```

#### GET /orders/[id]
Get order by ID

#### PUT /orders/[id]/status
Update order status (Admin/Staff only)

**Request Body:**
```json
{
  "status": "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
}
```

### AI

#### POST /ai/chat
Chat with AI assistant

**Request Body:**
```json
{
  "message": "string",
  "sessionId": "string",
  "context": {
    "currentOrder": ["string"],
    "preferences": ["string"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "string",
    "recommendations": [
      {
        "menuItemId": "string",
        "name": "string",
        "description": "string",
        "price": 12.99,
        "imageUrl": "string",
        "confidence": 0.95,
        "reasons": ["string"]
      }
    ],
    "intent": "string",
    "confidence": 0.95
  }
}
```

#### POST /ai/recommendations
Get AI recommendations based on preferences

**Request Body:**
```json
{
  "preferences": ["vegetarian", "spicy"],
  "dietaryRestrictions": ["gluten-free"],
  "budget": 50.00,
  "partySize": 2
}
```

#### POST /ai/reviews
Generate AI response to review

**Request Body:**
```json
{
  "review": {
    "rating": 3,
    "comment": "string",
    "customerName": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "string",
    "sentiment": "positive" | "negative" | "neutral",
    "suggestedActions": ["string"],
    "priority": "low" | "medium" | "high"
  }
}
```

### Admin

#### GET /admin/dashboard
Get dashboard statistics (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 5000.00,
    "averageOrderValue": 33.33,
    "pendingOrders": 5,
    "completedOrders": 145,
    "popularItems": [
      {
        "menuItemId": "string",
        "name": "string",
        "quantity": 25
      }
    ],
    "recentOrders": []
  }
}
```

#### GET /admin/analytics
Get analytics data (Admin only)

**Query Parameters:**
- `period` (string) - Time period: "day", "week", "month", "year"
- `startDate` (string) - Start date (ISO string)
- `endDate` (string) - End date (ISO string)

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 5000.00,
      "growth": 15.5,
      "chart": []
    },
    "orders": {
      "total": 150,
      "growth": 8.2,
      "chart": []
    },
    "customers": {
      "total": 75,
      "new": 12,
      "returning": 63
    },
    "popularItems": [],
    "peakHours": []
  }
}
```

### Payments

#### POST /payments/stripe/create-intent
Create Stripe payment intent

**Request Body:**
```json
{
  "amount": 3333,
  "currency": "usd",
  "orderId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "string"
  }
}
```

#### POST /webhooks/stripe
Stripe webhook endpoint

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- General endpoints: 100 requests per 15 minutes
- AI endpoints: 20 requests per 15 minutes
- Authentication endpoints: 10 requests per 15 minutes

## Webhooks

### Stripe Webhooks
The application listens for the following Stripe webhook events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## SDKs and Libraries

### JavaScript/TypeScript
```typescript
import { RestaurantAPI } from '@restaurant-ai/sdk';

const api = new RestaurantAPI({
  baseURL: 'https://your-domain.com/api',
  apiKey: 'your-api-key'
});

// Get menu items
const menuItems = await api.menu.list();

// Create order
const order = await api.orders.create({
  customerInfo: { name: 'John Doe', email: 'john@example.com' },
  items: [{ menuItemId: 'item-1', quantity: 2 }]
});
```

## Support

For API support, please contact:
- Email: api-support@restaurant-ai.com
- Documentation: https://docs.restaurant-ai.com
- Status Page: https://status.restaurant-ai.com
