# Lawn Care Education Platform - API Documentation

Base URL: `https://your-domain.com`

## Table of Contents
1. [Authentication](#authentication)
2. [User Profile](#user-profile)
3. [Payments & Subscriptions](#payments--subscriptions)
4. [Content Library](#content-library)
5. [Forum & Community](#forum--community)
6. [Expert Q&A](#expert-qa)
7. [Competitions](#competitions)
8. [Lessons](#lessons)
9. [Lawn Care](#lawn-care)
10. [Deals](#deals)
11. [Home Banners](#home-banners)
12. [Push Notifications](#push-notifications)
13. [Admin APIs](#admin-apis)

---

## Authentication

### Register (Email)
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login (Email)
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "subscriptionStatus": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Phone Login (Request OTP)
```
POST /api/auth/phone-login
```

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "OTP sent successfully",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Verify OTP
```
POST /api/auth/verify-otp
```

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "otp_code": "123456"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "phone": "+1234567890",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Social Login
```
POST /api/auth/social-login
```

**Request Body:**
```json
{
  "provider": "google",
  "access_token": "ya29.a0AfH6SMBx...",
  "provider_user_id": "123456789",
  "email": "user@gmail.com",
  "name": "John Doe",
  "avatar": "https://lh3.googleusercontent.com/..."
}
```

**Supported Providers:** `google`, `apple`, `facebook`

**Response (200):**
```json
{
  "status": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Current User
```
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "subscriptionStatus": "premium",
  "subscriptionPlan": "yearly",
  "subscriptionExpiresAt": "2025-12-31T23:59:59.000Z"
}
```

---

### Logout
```
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## User Profile

### Get Profile
```
GET /api/user/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg",
    "zipCode": "12345",
    "subscriptionStatus": "premium",
    "isNotificationEnabled": true,
    "favorite_count": 12,
    "questions_asked_count": 5,
    "contest_entries_count": 3,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update Profile
```
PUT /api/user/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1987654321",
  "avatar": "https://example.com/new-avatar.jpg",
  "zipCode": "54321",
  "isNotificationEnabled": true
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "user@example.com"
  }
}
```

---

### Register FCM Device
```
POST /api/user/device
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fcm_token": "eKz7tY8sR9M:APA91bH...",
  "device_type": "ios"
}
```

**Device Types:** `ios`, `android`, `web`

**Response (200):**
```json
{
  "status": true,
  "message": "Device registered"
}
```

---

### Unregister FCM Device
```
DELETE /api/user/device
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fcm_token": "eKz7tY8sR9M:APA91bH..."
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Device unregistered"
}
```

---

### Get User Devices
```
GET /api/user/devices
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "fcmToken": "eKz7tY8sR9M:APA91bH...",
      "deviceType": "ios",
      "isActive": true,
      "lastActiveAt": "2024-12-26T10:00:00.000Z"
    }
  ]
}
```

---

## Payments & Subscriptions

### Get Stripe Configuration
```
GET /api/stripe/config
```

**Response (200):**
```json
{
  "publishableKey": "pk_live_..."
}
```

---

### Get Stripe Products
```
GET /api/stripe/products
```

**Response (200):**
```json
{
  "products": [
    {
      "id": "prod_ABC123",
      "name": "Premium Monthly",
      "description": "Full access to all features",
      "prices": [
        {
          "id": "price_XYZ789",
          "unit_amount": 999,
          "currency": "usd",
          "interval": "month"
        }
      ]
    },
    {
      "id": "prod_DEF456",
      "name": "Premium Yearly",
      "description": "Full access - save 20%",
      "prices": [
        {
          "id": "price_UVW456",
          "unit_amount": 9999,
          "currency": "usd",
          "interval": "year"
        }
      ]
    }
  ]
}
```

---

### Create Checkout Session
```
POST /api/stripe/create-checkout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "priceId": "price_XYZ789",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_live_a1b2c3...",
  "url": "https://checkout.stripe.com/pay/cs_live_a1b2c3..."
}
```

---

### Create Customer Portal
```
POST /api/stripe/create-portal
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "returnUrl": "https://yourapp.com/account"
}
```

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

---

### Get Subscription Status
```
GET /api/stripe/subscription-status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "active",
  "plan": "yearly",
  "currentPeriodEnd": "2025-12-31T23:59:59.000Z",
  "cancelAtPeriodEnd": false
}
```

---

### Get Subscription Plans
```
GET /api/subscription-plans
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Monthly Premium",
    "description": "Full access to all premium content",
    "price": 9.99,
    "currency": "USD",
    "interval": "month",
    "stripePriceId": "price_XYZ789",
    "features": ["Unlimited lessons", "Expert Q&A", "No ads"],
    "isActive": true
  },
  {
    "id": 2,
    "name": "Yearly Premium",
    "description": "Save 20% with annual billing",
    "price": 99.99,
    "currency": "USD",
    "interval": "year",
    "stripePriceId": "price_UVW456",
    "features": ["Everything in Monthly", "Priority support"],
    "isActive": true
  }
]
```

---

### Verify In-App Purchase (iOS/Android)
```
POST /api/iap/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (iOS):**
```json
{
  "platform": "ios",
  "receipt": "MIIbngYJKoZIhvcNAQcCoIIb...",
  "productId": "com.yourapp.premium.monthly"
}
```

**Request Body (Android):**
```json
{
  "platform": "android",
  "purchaseToken": "opaque-token-from-play-store",
  "productId": "com.yourapp.premium.monthly",
  "packageName": "com.yourapp.lawncare"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Purchase verified successfully",
  "data": {
    "subscriptionStatus": "premium",
    "expiresAt": "2025-01-26T10:00:00.000Z"
  }
}
```

---

## Content Library

### Get Categories
```
GET /api/library/categories
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "Lawn Basics",
      "description": "Fundamental lawn care knowledge",
      "iconUrl": "https://example.com/icons/basics.png",
      "displayOrder": 1,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Pest Control",
      "description": "Identify and eliminate lawn pests",
      "iconUrl": "https://example.com/icons/pest.png",
      "displayOrder": 2,
      "isActive": true
    }
  ]
}
```

---

### Get Library Items
```
GET /api/library/items
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category_id | number | Filter by category |
| search_query | string | Search in title/summary |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Example:** `GET /api/library/items?category_id=1&page=1&limit=10`

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "categoryId": 1,
      "title": "Understanding Soil pH",
      "summary": "Learn how soil pH affects your lawn",
      "contentHtml": "<h1>Soil pH Basics</h1><p>...</p>",
      "imageUrl": "https://example.com/soil-ph.jpg",
      "isPremium": false,
      "viewCount": 1234,
      "displayOrder": 1,
      "is_favorite": true
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 48
  }
}
```

---

### Get Library Item Detail
```
GET /api/library/items/:id
```

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "categoryId": 1,
    "title": "Understanding Soil pH",
    "summary": "Learn how soil pH affects your lawn",
    "contentHtml": "<h1>Soil pH Basics</h1><p>Full content here...</p>",
    "imageUrl": "https://example.com/soil-ph.jpg",
    "isPremium": false,
    "viewCount": 1234,
    "category": {
      "id": 1,
      "name": "Lawn Basics"
    },
    "is_favorite": false
  }
}
```

---

### Toggle Favorite
```
POST /api/library/items/:id/favorite
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200) - Added:**
```json
{
  "status": true,
  "message": "Added to favorites",
  "is_favorite": true
}
```

**Response (200) - Removed:**
```json
{
  "status": true,
  "message": "Removed from favorites",
  "is_favorite": false
}
```

---

### Get User Favorites
```
GET /api/favorites
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "library": [
      {
        "id": 1,
        "title": "Understanding Soil pH",
        "summary": "Learn how soil pH affects your lawn",
        "imageUrl": "https://example.com/soil-ph.jpg"
      }
    ]
  }
}
```

---

## Forum & Community

### Get Forum Posts
```
GET /api/forum/posts
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Posts per page (default: 20) |
| sort_by | string | `newest` or `popular` |

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "post_id": 1,
      "author": {
        "user_id": 5,
        "user_name": "John Doe",
        "user_image": "https://example.com/avatar.jpg"
      },
      "content": "Just started my lawn renovation. Any tips for overseeding?",
      "image_urls": ["https://example.com/lawn1.jpg"],
      "likes_count": 24,
      "comments_count": 8,
      "is_liked_by_me": false,
      "created_at": "2024-12-25T15:30:00.000Z"
    }
  ]
}
```

---

### Get Single Forum Post
```
GET /api/forum/posts/:id
```

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "post_id": 1,
    "author": {
      "user_id": 5,
      "user_name": "John Doe",
      "user_image": "https://example.com/avatar.jpg"
    },
    "content": "Just started my lawn renovation. Any tips for overseeding?",
    "image_urls": ["https://example.com/lawn1.jpg"],
    "likes_count": 24,
    "comments_count": 8,
    "is_liked_by_me": true,
    "created_at": "2024-12-25T15:30:00.000Z"
  }
}
```

---

### Create Forum Post
```
POST /api/forum/posts
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Just started my lawn renovation. Any tips for overseeding?",
  "image_urls": ["https://example.com/lawn1.jpg", "https://example.com/lawn2.jpg"]
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Thread posted successfully",
  "data": {
    "post_id": 1
  }
}
```

---

### Like/Unlike Post
```
POST /api/forum/posts/:id/like
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200) - Liked:**
```json
{
  "status": true,
  "message": "Liked",
  "likes_count": 25,
  "is_liked_by_me": true
}
```

**Response (200) - Unliked:**
```json
{
  "status": true,
  "message": "Unliked",
  "likes_count": 24,
  "is_liked_by_me": false
}
```

---

### Get Post Comments
```
GET /api/forum/posts/:id/comments
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "comment_id": 1,
      "author": {
        "user_id": 3,
        "user_name": "Jane Smith",
        "user_image": "https://example.com/jane.jpg"
      },
      "content": "Great question! I recommend doing it in early fall.",
      "created_at": "2024-12-25T16:00:00.000Z"
    }
  ]
}
```

---

### Add Comment
```
POST /api/forum/posts/:id/comments
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Great question! I recommend doing it in early fall."
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Comment added",
  "data": {
    "comment_id": 1
  }
}
```

---

## Expert Q&A

### Get Public Questions
```
GET /api/expert-questions
```

**Response (200):**
```json
[
  {
    "id": 1,
    "question": "What's the best fertilizer for Bermuda grass?",
    "answer": "For Bermuda grass, I recommend a high-nitrogen fertilizer...",
    "category": "Fertilization",
    "userName": "John D.",
    "answeredAt": "2024-12-20T10:00:00.000Z"
  }
]
```

---

### Get My Questions
```
GET /api/expert-questions/my
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 5,
    "question": "Why does my lawn have brown patches?",
    "status": "pending",
    "createdAt": "2024-12-25T14:00:00.000Z"
  },
  {
    "id": 3,
    "question": "Best time to aerate my lawn?",
    "answer": "The best time to aerate depends on your grass type...",
    "status": "answered",
    "answeredAt": "2024-12-20T10:00:00.000Z"
  }
]
```

---

### Submit Question
```
POST /api/expert-questions
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "question": "What's the best way to deal with crabgrass?",
  "category": "Weed Control",
  "imageUrl": "https://example.com/my-lawn.jpg"
}
```

**Response (200):**
```json
{
  "id": 10,
  "question": "What's the best way to deal with crabgrass?",
  "status": "pending",
  "createdAt": "2024-12-26T10:00:00.000Z"
}
```

---

## Competitions

### Get All Competitions
```
GET /api/competitions
```

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Best Winter Lawn 2024",
    "description": "Show off your winter lawn care skills!",
    "prize": "$500 Gift Card",
    "prizeImageUrl": "https://example.com/prize.jpg",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "isActive": true,
    "month": 12,
    "year": 2024
  }
]
```

---

### Get Active Competition
```
GET /api/competitions/active
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Best Winter Lawn 2024",
  "description": "Show off your winter lawn care skills!",
  "prize": "$500 Gift Card",
  "startDate": "2024-12-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

---

### Get Competition Detail
```
GET /api/competitions/:id
```

**Response (200):**
```json
{
  "competition": {
    "id": 1,
    "title": "Best Winter Lawn 2024",
    "description": "Show off your winter lawn care skills!",
    "prize": "$500 Gift Card"
  },
  "entries": [
    {
      "id": 1,
      "imageUrl": "https://example.com/entry1.jpg",
      "caption": "My backyard after 3 months of care",
      "voteCount": 45,
      "user": {
        "name": "John Doe"
      }
    }
  ]
}
```

---

### Submit Competition Entry
```
POST /api/competitions/:id/entries
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/my-lawn.jpg",
  "caption": "My lawn after 6 months of dedicated care"
}
```

**Response (200):**
```json
{
  "id": 15,
  "competitionId": 1,
  "imageUrl": "https://example.com/my-lawn.jpg",
  "caption": "My lawn after 6 months of dedicated care",
  "createdAt": "2024-12-26T10:00:00.000Z"
}
```

---

### Vote for Entry
```
POST /api/entries/:id/vote
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Vote recorded",
  "voteCount": 46
}
```

---

### Get Past Winners
```
GET /api/competitions/winners
```

**Response (200):**
```json
[
  {
    "competition": {
      "id": 1,
      "title": "November Lawn of the Month",
      "month": 11,
      "year": 2024
    },
    "winner": {
      "id": 5,
      "imageUrl": "https://example.com/winning-lawn.jpg",
      "caption": "My pride and joy",
      "voteCount": 156
    },
    "user": {
      "name": "Jane Smith"
    }
  }
]
```

---

## Lessons

### Get All Lessons
```
GET /api/lessons
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| grassType | number | Filter by grass type ID |

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Introduction to Lawn Care",
    "description": "Learn the basics of maintaining a healthy lawn",
    "videoUrl": "https://example.com/video1.mp4",
    "thumbnailUrl": "https://example.com/thumb1.jpg",
    "duration": 480,
    "category": "basics",
    "isPremium": false,
    "progress": 75
  }
]
```

---

### Get Lesson Detail
```
GET /api/lessons/:id
```

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Introduction to Lawn Care",
  "description": "Learn the basics of maintaining a healthy lawn",
  "videoUrl": "https://example.com/video1.mp4",
  "thumbnailUrl": "https://example.com/thumb1.jpg",
  "duration": 480,
  "category": "basics",
  "isPremium": false,
  "progress": 75,
  "grassType": {
    "id": 1,
    "name": "Bermuda"
  }
}
```

---

### Update Lesson Progress
```
POST /api/lessons/:id/progress
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "progress": 100,
  "completed": true
}
```

**Response (200):**
```json
{
  "id": 1,
  "lessonId": 1,
  "userId": 5,
  "progress": 100,
  "completed": true
}
```

---

### Get Recent Lessons
```
GET /api/lessons/recent
```

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 3,
    "title": "Advanced Fertilization Techniques",
    "thumbnailUrl": "https://example.com/thumb3.jpg",
    "duration": 720,
    "progress": 30
  }
]
```

---

## Lawn Care

### Get Grass Types
```
GET /api/grass-types
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Bermuda Grass",
    "description": "Heat-tolerant, drought-resistant warm-season grass",
    "imageUrl": "https://example.com/bermuda.jpg",
    "climateZones": ["7", "8", "9", "10"],
    "waterNeeds": "low",
    "sunRequirement": "full"
  },
  {
    "id": 2,
    "name": "Kentucky Bluegrass",
    "description": "Popular cool-season grass with rich color",
    "imageUrl": "https://example.com/bluegrass.jpg",
    "climateZones": ["3", "4", "5", "6"],
    "waterNeeds": "high",
    "sunRequirement": "partial"
  }
]
```

---

### Get Lawn Care Plans
```
GET /api/lawn-care-plans
```

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Spring Renovation Plan",
    "description": "Complete spring lawn care schedule",
    "grassTypeId": 1,
    "isPremium": false,
    "tasks": [
      {
        "week": 1,
        "task": "Apply pre-emergent herbicide",
        "details": "Before soil temp reaches 55°F"
      }
    ]
  }
]
```

---

### Get Lawn Profiles
```
GET /api/lawn-profiles
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Front Yard",
    "grassTypeId": 1,
    "size": 2500,
    "sunExposure": "full",
    "soilType": "clay",
    "irrigationType": "sprinkler"
  }
]
```

---

### Create Lawn Profile
```
POST /api/lawn-profiles
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Backyard",
  "grassTypeId": 2,
  "size": 3000,
  "sunExposure": "partial",
  "soilType": "loam",
  "irrigationType": "drip"
}
```

**Response (200):**
```json
{
  "id": 2,
  "name": "Backyard",
  "grassTypeId": 2,
  "size": 3000,
  "userId": 5
}
```

---

### Submit Lawn Diagnosis
```
POST /api/diagnoses
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/problem-area.jpg",
  "problemType": "brown_patches",
  "description": "Brown spots appearing in multiple areas"
}
```

**Response (200):**
```json
{
  "id": 1,
  "imageUrl": "https://example.com/problem-area.jpg",
  "problemType": "brown_patches",
  "status": "pending",
  "createdAt": "2024-12-26T10:00:00.000Z"
}
```

---

## Deals

### Get All Deals
```
GET /api/deals
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| featured | boolean | Only featured deals |

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "20% Off Fertilizer",
    "description": "Use code LAWN20 at checkout",
    "imageUrl": "https://example.com/deal1.jpg",
    "dealUrl": "https://partner.com/deal",
    "discountCode": "LAWN20",
    "discountPercent": 20,
    "category": "fertilizer",
    "isFeatured": true,
    "expiresAt": "2025-01-31T23:59:59.000Z"
  }
]
```

---

### Get Deal Detail
```
GET /api/deals/:id
```

**Response (200):**
```json
{
  "id": 1,
  "title": "20% Off Fertilizer",
  "description": "Use code LAWN20 at checkout for 20% off all fertilizers",
  "imageUrl": "https://example.com/deal1.jpg",
  "dealUrl": "https://partner.com/deal",
  "discountCode": "LAWN20",
  "discountPercent": 20,
  "category": "fertilizer",
  "terms": "Valid for new customers only. Limit one per household.",
  "expiresAt": "2025-01-31T23:59:59.000Z"
}
```

---

## Home Banners

### Get Active Banners
```
GET /api/banners
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "title": "Spring Sale - 30% Off",
      "imageUrl": "https://example.com/banner1.jpg",
      "redirectUrl": "https://example.com/sale",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

## Push Notifications

Managed via Admin APIs. Users register devices using the User Device APIs above.

---

## Admin APIs

All admin APIs require authentication with an admin role.

**Headers (required for all admin APIs):**
```
Authorization: Bearer <admin-token>
```

### User Management

#### Get All Users
```
GET /api/admin/users
```

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "subscriptionStatus": "premium",
    "subscriptionPlan": "yearly",
    "subscriptionExpiresAt": "2025-12-31T23:59:59.000Z",
    "isBanned": false,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

#### Update User Role
```
PUT /api/admin/users/:id
```

**Request Body:**
```json
{
  "role": "admin"
}
```

---

#### Ban/Unban User
```
PUT /api/admin/users/:id/ban
```

**Request Body:**
```json
{
  "isBanned": true,
  "bannedReason": "Violation of community guidelines"
}
```

---

#### Update User Subscription
```
PUT /api/admin/users/:id/subscription
```

**Request Body:**
```json
{
  "subscriptionStatus": "premium",
  "subscriptionPlan": "yearly",
  "subscriptionExpiresAt": "2025-12-31"
}
```

---

#### Delete User
```
DELETE /api/admin/users/:id
```

---

### Banner Management

#### Get All Banners
```
GET /api/admin/banners
```

#### Create Banner
```
POST /api/admin/banners
```

**Request Body:**
```json
{
  "title": "Summer Sale",
  "imageUrl": "https://example.com/banner.jpg",
  "redirectUrl": "https://example.com/sale",
  "displayOrder": 1,
  "isActive": true
}
```

#### Update Banner
```
PUT /api/admin/banners/:id
```

#### Delete Banner
```
DELETE /api/admin/banners/:id
```

---

### Push Notifications

#### Get Notification History
```
GET /api/admin/push-notifications
```

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "New Lesson Available!",
    "body": "Check out our latest video on winter lawn care",
    "targetType": "all",
    "successCount": 1523,
    "failureCount": 12,
    "sentAt": "2024-12-25T10:00:00.000Z"
  }
]
```

---

#### Send Push Notification
```
POST /api/admin/push-notifications
```

**Request Body:**
```json
{
  "title": "New Feature Alert!",
  "body": "Check out our new competition feature",
  "imageUrl": "https://example.com/notification.jpg",
  "targetType": "all"
}
```

**Target Types:**
- `all` - All users with registered devices
- `premium` - Premium subscribers only
- `specific` - Specific user IDs (comma-separated)

**For specific users:**
```json
{
  "title": "Special Offer",
  "body": "Exclusive deal just for you",
  "targetType": "specific",
  "targetUserIds": "1,5,12,25"
}
```

---

### Configuration Management

#### Get All Configs
```
GET /api/admin/configs
```

**Response (200):**
```json
[
  {
    "id": 1,
    "configKey": "FIREBASE_API_KEY",
    "configValue": "AIzaSy...",
    "configType": "string",
    "description": "Firebase Web API Key",
    "isSecret": true
  }
]
```

---

#### Create Config
```
POST /api/admin/configs
```

**Request Body:**
```json
{
  "configKey": "FCM_SERVER_KEY",
  "configValue": "AAAA...",
  "configType": "string",
  "description": "Firebase Cloud Messaging Server Key",
  "isSecret": true
}
```

---

#### Update Config
```
PUT /api/admin/configs/:id
```

---

#### Delete Config
```
DELETE /api/admin/configs/:id
```

---

### Library Management

#### Categories
- `GET /api/admin/library-categories` - List all
- `POST /api/admin/library-categories` - Create
- `PUT /api/admin/library-categories/:id` - Update
- `DELETE /api/admin/library-categories/:id` - Delete

#### Items
- `GET /api/admin/library-items` - List all with category info
- `POST /api/admin/library-items` - Create
- `PUT /api/admin/library-items/:id` - Update
- `DELETE /api/admin/library-items/:id` - Delete

---

### Forum Moderation

#### Get All Posts
```
GET /api/admin/forum-posts
```

#### Update Post (Approve/Pin)
```
PUT /api/admin/forum-posts/:id
```

**Request Body:**
```json
{
  "isApproved": true,
  "isPinned": true
}
```

#### Delete Post
```
DELETE /api/admin/forum-posts/:id
```

---

### Other Admin CRUD Endpoints

| Resource | GET (list) | POST | PUT | DELETE |
|----------|------------|------|-----|--------|
| Lessons | `/api/admin/lessons` | ✓ | ✓ | ✓ |
| Deals | `/api/admin/deals` | ✓ | ✓ | ✓ |
| Plans | `/api/admin/plans` | ✓ | ✓ | ✓ |
| Grass Types | `/api/admin/grass-types` | ✓ | ✓ | ✓ |
| Competitions | `/api/admin/competitions` | ✓ | ✓ | ✓ |
| Entries | `/api/admin/entries` | - | - | ✓ |
| Diagnoses | `/api/admin/diagnoses` | - | ✓ | ✓ |
| Questions | `/api/admin/questions` | - | ✓ | ✓ |
| Testimonials | `/api/admin/testimonials` | ✓ | ✓ | ✓ |
| FAQs | `/api/admin/faqs` | ✓ | ✓ | ✓ |
| Blog | `/api/admin/blog` | ✓ | ✓ | ✓ |
| Settings | `/api/admin/settings` | - | ✓ | - |
| Subscription Plans | `/api/admin/subscription-plans` | ✓ | ✓ | ✓ |
| IAP Purchases | `/api/admin/iap-purchases` | - | - | - |

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid request body",
  "details": [
    { "path": ["email"], "message": "Invalid email format" }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to process request"
}
```

---

## Payment Flow Summary

### Stripe Web/Desktop Flow:
1. `GET /api/stripe/products` - Display available plans
2. `POST /api/stripe/create-checkout` - Create checkout session
3. User completes payment on Stripe
4. Webhook updates user subscription
5. `GET /api/stripe/subscription-status` - Verify status

### In-App Purchase Flow (iOS/Android):
1. `GET /api/subscription-plans` - Display available plans
2. User purchases via App Store/Play Store
3. `POST /api/iap/verify` - Verify receipt and activate subscription
4. `GET /api/user/profile` - Confirm subscription status

---

## Rate Limits

- Authentication endpoints: 5 requests/minute
- General API: 100 requests/minute
- Admin API: 50 requests/minute

---

*Documentation Version: 1.0*
*Last Updated: December 2024*
