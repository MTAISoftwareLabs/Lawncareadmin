# LawnCare Workshop API Documentation

## Overview

This document describes the REST API endpoints for the LawnCare Workshop mobile and web application. All endpoints return JSON responses with a standard structure.

### Base URL
```
https://thelawncareworkshop.com/api
```

### Standard Response Format
```json
{
  "status": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response Format
```json
{
  "status": false,
  "error": "Error description"
}
```

### Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Table of Contents
1. [Authentication](#authentication-endpoints)
2. [User Profile](#user-profile)
3. [Lawn Profiles](#lawn-profiles)
4. [Home Screen](#home-screen)
5. [Grass Types](#grass-types)
6. [Lawn Care Plans](#lawn-care-plans)
7. [Lessons](#lessons)
8. [Deals](#deals)
9. [Calendars](#calendars)
10. [Self-Diagnosis](#self-diagnosis)
11. [Ebooks/Library](#ebookslibrary)
12. [Competitions/Contests](#competitionscontests)
13. [Forum Posts](#forum-posts)
14. [Expert Questions & Q&A](#expert-questions--qa)
15. [Direct Messaging (Chat System)](#direct-messaging-chat-system)
16. [Support Tickets](#support-tickets)
17. [Notifications](#notifications)
18. [Subscriptions & IAP](#subscriptions--iap)
19. [Device Registration (FCM)](#device-registration-fcm)
20. [File Uploads](#file-uploads)
21. [Static Content](#static-content)
22. [Admin Endpoints](#admin-endpoints)

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
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

### Login
Authenticate user and get JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
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

### Social Login
Login with Apple or Google.

**Endpoint:** `POST /api/auth/social-login`

**Request Body:**
```json
{
  "provider": "apple",
  "token": "social_auth_token",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Phone Login
Request OTP for phone login.

**Endpoint:** `POST /api/auth/phone-login`

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

### Verify OTP
Verify phone OTP.

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

### Get Current User
Get the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "subscriptionStatus": "monthly"
  }
}
```

### Logout
Log out the user.

**Endpoint:** `POST /api/auth/logout`

### Forgot Password
Request password reset email.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
Reset password with token.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword"
}
```

---

## User Profile

### Get User Profile
Get detailed user profile.

**Endpoint:** `GET /api/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+1234567890",
    "region": "Northeast",
    "grassType": "Kentucky Bluegrass",
    "avatar": "https://...",
    "subscriptionStatus": "monthly"
  }
}
```

### Update Profile
Update user profile information.

**Endpoint:** `PUT /api/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1987654321",
  "region": "Northeast",
  "grassType": "Kentucky Bluegrass"
}
```

---

## Lawn Profiles

### Get Lawn Profiles
Get user's lawn profiles.

**Endpoint:** `GET /api/lawn-profiles`

**Headers:** `Authorization: Bearer <token>`

### Create Lawn Profile
Create a new lawn profile.

**Endpoint:** `POST /api/lawn-profiles`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Front Yard",
  "grassType": "Kentucky Bluegrass",
  "zipCode": "12345",
  "size": 5000
}
```

### Update Lawn Profile
Update a lawn profile.

**Endpoint:** `PUT /api/lawn-profiles/:id`

**Headers:** `Authorization: Bearer <token>`

---

## Home Screen

### Get Home Screen Data
Aggregated endpoint for mobile app home screen.

**Endpoint:** `GET /api/home`

**Response:**
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": 1,
        "title": "Spring Sale",
        "image_url": "https://...",
        "redirect_url": "/deals",
        "display_order": 1
      }
    ],
    "expert_corner": [...],
    "tips_tricks": [...],
    "videos": [
      {
        "id": 1,
        "title": "Lawn Care 101",
        "thumbnail_url": "https://...",
        "video_url": "https://...",
        "is_pinned": true
      }
    ],
    "deals": [
      {
        "id": 1,
        "title": "Premium Fertilizer",
        "price": "29.99",
        "affiliate_link": "https://...",
        "start_date": "2026-01-01",
        "expires_at": "2026-12-31"
      }
    ],
    "testimonials": [...]
  }
}
```

---

## Grass Types

### Get All Grass Types
Get list of grass types.

**Endpoint:** `GET /api/grass-types`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "Kentucky Bluegrass",
      "type": "cool-season",
      "description": "..."
    }
  ]
}
```

---

## Lawn Care Plans

### Get Lawn Care Plans
Get lawn care plans filtered by grass type and region.

**Endpoint:** `GET /api/lawn-care-plans`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| grassType | string | Filter by grass type |
| region | string | Filter by region |

### Get Upcoming Plans
Get upcoming lawn care tasks for the user.

**Endpoint:** `GET /api/lawn-plans/upcoming`

**Headers:** `Authorization: Bearer <token>`

---

## Lessons

### Get All Lessons
Get list of video lessons.

**Endpoint:** `GET /api/lessons`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |

### Get Recent Lessons
Get recently added lessons.

**Endpoint:** `GET /api/lessons/recent`

### Get Lesson by ID
Get a specific lesson.

**Endpoint:** `GET /api/lessons/:id`

### Update Lesson Progress
Track user's progress on a lesson.

**Endpoint:** `POST /api/lessons/:id/progress`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "progress": 75,
  "completed": false
}
```

---

## Deals

### Get All Deals
Get active product deals.

**Endpoint:** `GET /api/deals`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "title": "Premium Fertilizer",
      "description": "...",
      "price": "29.99",
      "originalPrice": "39.99",
      "imageUrl": "https://...",
      "affiliateLink": "https://...",
      "startDate": "2026-01-01",
      "expiresAt": "2026-12-31",
      "isActive": true
    }
  ]
}
```

### Get Deal by ID
Get a specific deal.

**Endpoint:** `GET /api/deals/:id`

---

## Calendars

### Get All Calendars
Get lawn care calendars with events.

**Endpoint:** `GET /api/calendars`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "Spring Calendar",
      "events": [
        {
          "id": 1,
          "title": "First Mow",
          "date": "2026-03-15",
          "description": "..."
        }
      ]
    }
  ]
}
```

### Get Calendar by ID
Get a specific calendar with events.

**Endpoint:** `GET /api/calendars/:id`

---

## Self-Diagnosis

### Get All Diagnosis Flows
Get all diagnosis decision tree flows.

**Endpoint:** `GET /api/self-diagnosis`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "title": "Brown Patches",
      "description": "Diagnose brown patches in your lawn",
      "steps": [...]
    }
  ]
}
```

### Get Diagnosis Flow by ID
Get a specific diagnosis flow.

**Endpoint:** `GET /api/self-diagnosis/:id`

---

## Ebooks/Library

### Get All Ebooks
Get all ebooks/PDFs in the library.

**Endpoint:** `GET /api/ebooks`

### Get Ebook by ID
Get specific ebook details.

**Endpoint:** `GET /api/ebooks/:id`

### Get Library Categories
Get library categories.

**Endpoint:** `GET /api/library/categories`

### Get Library Items
Get library items with optional filtering.

**Endpoint:** `GET /api/library/items`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |

### Favorite Library Item
Toggle favorite on a library item.

**Endpoint:** `POST /api/library/items/:id/favorite`

**Headers:** `Authorization: Bearer <token>`

### Get Favorites
Get user's favorited items.

**Endpoint:** `GET /api/favorites`

**Headers:** `Authorization: Bearer <token>`

---

## Competitions/Contests

### Get Current Contest Info
Get info about the current active contest.

**Endpoint:** `GET /api/contest/info`

**Response:**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "title": "Best Lawn of January",
    "description": "...",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "isActive": true,
    "prizes": ["$100 Gift Card", "Premium Fertilizer Set"]
  }
}
```

### Get Contest Entries
Get entries for the current contest with voting info.

**Endpoint:** `GET /api/contest/entries`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "userId": 5,
      "userName": "John Doe",
      "imageUrl": "https://...",
      "description": "My backyard lawn",
      "voteCount": 15,
      "hasVoted": false,
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

### Submit Contest Entry
Submit an entry to the current contest.

**Endpoint:** `POST /api/contest/submit`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "imageUrl": "https://...",
  "description": "My beautiful lawn"
}
```

### Vote for Entry
Vote for a contest entry.

**Endpoint:** `POST /api/contest/entries/:id/vote`

**Headers:** `Authorization: Bearer <token>`

### Get Past Winners
Get past contest winners.

**Endpoint:** `GET /api/contest/winners`

### Get All Competitions
Get list of all competitions.

**Endpoint:** `GET /api/competitions`

### Get Active Competition
Get the currently active competition.

**Endpoint:** `GET /api/competitions/active`

---

## Forum Posts

### Get All Posts
Get forum posts with pagination.

**Endpoint:** `GET /api/posts`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Posts per page |

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "user_name": "John Doe",
      "user_avatar": "https://...",
      "content": "Check out my lawn!",
      "image_url": "https://...",
      "video_url": null,
      "like_count": 10,
      "comment_count": 3,
      "is_liked": false,
      "created_at": "2026-01-18T10:00:00.000Z"
    }
  ]
}
```

### Get Post by ID
Get a specific post with details.

**Endpoint:** `GET /api/posts/:post_id`

### Create Post
Create a new forum post.

**Endpoint:** `POST /api/posts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "My lawn is looking great!",
  "imageUrl": "https://...",
  "videoUrl": null
}
```

### Like/Unlike Post
Toggle like on a post.

**Endpoint:** `POST /api/posts/:post_id/like`

**Headers:** `Authorization: Bearer <token>`

### Get Post Comments
Get comments for a post.

**Endpoint:** `GET /api/posts/:post_id/comments`

### Add Comment
Add a comment to a post.

**Endpoint:** `POST /api/posts/:post_id/comments`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Great looking lawn!"
}
```

---

## Expert Questions & Q&A

### Get My Questions
Get questions submitted by the current user.

**Endpoint:** `GET /api/expert-questions/my`

**Headers:** `Authorization: Bearer <token>`

### Submit Question
Submit a question to experts.

**Endpoint:** `POST /api/expert-questions`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "question": "Why is my lawn turning brown?",
  "imageUrl": "https://..."
}
```

### Get Public Questions
Get publicly answered questions.

**Endpoint:** `GET /api/questions/public`

---

## Direct Messaging (Chat System)

### Get Chat List
Get list of conversations with last message info.

**Endpoint:** `GET /api/chats`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "conversationId": 1,
      "otherUser": {
        "id": 5,
        "name": "Jane Smith",
        "avatar": "https://..."
      },
      "lastMessage": "Thanks for your help!",
      "lastMessageType": "text",
      "unreadCount": 2,
      "lastMessageAt": "2026-01-18T10:30:00.000Z"
    }
  ]
}
```

### Start New Conversation
Create a new conversation or get existing one.

**Endpoint:** `POST /api/chats`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "recipientId": 5
}
```

### Get Messages
Get messages in a conversation with pagination.

**Endpoint:** `GET /api/chats/:conversationId/messages`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Messages per page |

### Send Message
Send a message in a conversation.

**Endpoint:** `POST /api/chats/:conversationId/messages`

**Headers:** `Authorization: Bearer <token>`

**Request Body (Text):**
```json
{
  "messageType": "text",
  "content": "Hello! How can I help?"
}
```

**Request Body (Image):**
```json
{
  "messageType": "image",
  "content": "Check out this lawn photo",
  "mediaUrl": "/uploads/content/photo.jpg",
  "fileName": "photo.jpg",
  "fileSize": 245000
}
```

### Upload Chat Media
Upload files for chat messages.

**Endpoint:** `POST /api/chats/upload`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

### Delete Message
Delete a message.

**Endpoint:** `DELETE /api/chats/messages/:messageId`

**Headers:** `Authorization: Bearer <token>`

### Get Unread Count
Get total unread message count.

**Endpoint:** `GET /api/chats/unread-count`

**Headers:** `Authorization: Bearer <token>`

---

## Support Tickets

### Get User's Tickets
Get support tickets for the current user.

**Endpoint:** `GET /api/support/tickets`

**Headers:** `Authorization: Bearer <token>`

### Create Support Ticket
Create a new support ticket.

**Endpoint:** `POST /api/support/tickets`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "subject": "Account issue",
  "message": "I need help with my subscription"
}
```

### Get Ticket Messages
Get messages in a support ticket.

**Endpoint:** `GET /api/support/tickets/:ticketId/messages`

**Headers:** `Authorization: Bearer <token>`

### Send Ticket Message
Send a message in a support ticket.

**Endpoint:** `POST /api/support/tickets/:ticketId/messages`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Here's more details about my issue..."
}
```

### Get Unread Support Count
Get unread support message count.

**Endpoint:** `GET /api/support/unread-count`

**Headers:** `Authorization: Bearer <token>`

### Start Support Chat
Start a direct chat with admin support.

**Endpoint:** `POST /api/support/start-chat`

**Headers:** `Authorization: Bearer <token>`

---

## Notifications

### Get Notifications
Get user's unread notifications.

**Endpoint:** `GET /api/notifications`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "title": "New Contest!",
      "message": "January lawn contest is now open",
      "type": "push",
      "imageUrl": "https://...",
      "link": "/contests",
      "isRead": false,
      "createdAt": "2026-01-18T10:00:00.000Z"
    }
  ]
}
```

### Mark Notification as Read
Mark a notification as read.

**Endpoint:** `POST /api/notifications/:id/read`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": true,
  "message": "Notification marked as read",
  "data": {
    "id": 1,
    "isRead": true,
    ...
  }
}
```

**Alternative Method:** `PUT /api/notifications/:id/read`

---

## Subscriptions & IAP

### Get Subscription Status
Get current subscription status.

**Endpoint:** `GET /api/subscription/status`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": true,
  "data": {
    "isSubscribed": true,
    "plan": "monthly",
    "expiresAt": "2026-02-18T00:00:00.000Z",
    "isTrialing": false
  }
}
```

### Get Subscription Plans
Get available subscription plans.

**Endpoint:** `GET /api/subscription/plans`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": "monthly",
      "name": "Monthly",
      "price": 9.99,
      "interval": "month",
      "features": ["All lessons", "Expert Q&A", "Contest entry"]
    },
    {
      "id": "yearly",
      "name": "Yearly",
      "price": 89.99,
      "interval": "year",
      "features": ["All lessons", "Expert Q&A", "Contest entry", "2 months free"]
    }
  ]
}
```

### Verify IAP Purchase
Verify in-app purchase from iOS/Android.

**Endpoint:** `POST /api/iap/verify`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "platform": "ios",
  "productId": "com.lawncare.monthly",
  "receiptData": "base64_receipt_data",
  "transactionId": "transaction_id"
}
```

### Restore Purchases
Restore previous IAP purchases.

**Endpoint:** `POST /api/iap/restore`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "platform": "ios",
  "receiptData": "base64_receipt_data"
}
```

### Stripe Create Checkout
Create Stripe checkout session.

**Endpoint:** `POST /api/stripe/create-checkout`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "priceId": "price_xxx",
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
```

### Stripe Customer Portal
Create Stripe customer portal session.

**Endpoint:** `POST /api/stripe/create-portal`

**Headers:** `Authorization: Bearer <token>`

---

## Device Registration (FCM)

### Register Device
Register or update FCM token for push notifications.

**Endpoint:** `POST /api/user/device`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fcm_token": "fcm_device_token_string",
  "device_type": "ios"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Device registered successfully"
}
```

### Unregister Device
Remove FCM token.

**Endpoint:** `DELETE /api/user/device`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fcm_token": "fcm_device_token_string"
}
```

### Get User Devices
Get user's registered devices.

**Endpoint:** `GET /api/user/devices`

**Headers:** `Authorization: Bearer <token>`

---

## File Uploads

### Upload Media
Upload any file (image, video, document).

**Endpoint:** `POST /api/upload/media`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file`: The file to upload

**Response:**
```json
{
  "status": true,
  "data": {
    "url": "/uploads/content/file-1705123456789.jpg",
    "fileType": "image",
    "fileName": "lawn-photo.jpg",
    "fileSize": 245000,
    "mimeType": "image/jpeg"
  }
}
```

---

## Static Content

### Get Site Settings
Get public site settings.

**Endpoint:** `GET /api/settings`

### Get Testimonials
Get customer testimonials.

**Endpoint:** `GET /api/testimonials`

### Get FAQs
Get frequently asked questions.

**Endpoint:** `GET /api/faqs`

### Get Blog Posts
Get blog posts.

**Endpoint:** `GET /api/blog`

### Get Blog Post by Slug
Get a specific blog post.

**Endpoint:** `GET /api/blog/:slug`

### Get Banners
Get active banners.

**Endpoint:** `GET /api/banners`

### Get Firebase Config
Get client-side Firebase configuration.

**Endpoint:** `GET /api/firebase-config`

**Response:**
```json
{
  "configured": true,
  "apiKey": "AIza...",
  "authDomain": "project.firebaseapp.com",
  "projectId": "project-id",
  "storageBucket": "project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123:web:abc",
  "vapidKey": "BKz..."
}
```

---

## Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` with admin role.

### Dashboard

**GET /api/admin/dashboard-stats** - Get dashboard statistics

### Users

**GET /api/admin/users** - Get all users
**PUT /api/admin/users/:id/ban** - Ban/unban user
**PUT /api/admin/users/:id/subscription** - Update user subscription

### Push Notifications

**GET /api/admin/push-notifications** - Get sent notifications history
**POST /api/admin/push-notifications** - Send push notification

**Request Body:**
```json
{
  "title": "New Contest!",
  "body": "January lawn contest is now open",
  "imageUrl": "https://...",
  "targetType": "all",
  "targetUserIds": null,
  "actionUrl": "/contests",
  "actionType": "navigate"
}
```

### Support Chat (Admin)

**GET /api/admin/support/tickets** - Get all support tickets
**GET /api/admin/support/tickets/:ticketId/messages** - Get ticket messages
**POST /api/admin/support/tickets/:ticketId/messages** - Reply to ticket
**PATCH /api/admin/support/tickets/:ticketId** - Update ticket status/priority
**GET /api/admin/support/unread-count** - Get admin unread count

### User Chats (Admin)

**GET /api/admin/chats** - Get all user conversations
**GET /api/admin/chats/:conversationId/messages** - Get messages
**POST /api/admin/chats/:conversationId/messages** - Send message as admin

### Content Management

**Banners:**
- GET /api/admin/banners
- POST /api/admin/banners
- PUT /api/admin/banners/:id
- DELETE /api/admin/banners/:id

**Library/Ebooks:**
- GET /api/admin/library-categories
- POST /api/admin/library-categories
- PUT /api/admin/library-categories/:id
- DELETE /api/admin/library-categories/:id
- GET /api/admin/library-items
- POST /api/admin/library-items
- PUT /api/admin/library-items/:id
- DELETE /api/admin/library-items/:id
- POST /api/admin/ebooks
- PUT /api/admin/ebooks/:id
- DELETE /api/admin/ebooks/:id

**Forum Posts:**
- GET /api/admin/forum-posts
- PUT /api/admin/forum-posts/:id
- DELETE /api/admin/forum-posts/:id

### Firebase Settings

**GET /api/admin/firebase-settings** - Get Firebase configuration
**PUT /api/admin/firebase-settings** - Update Firebase configuration
**GET /api/admin/config/firebase/test** - Test Firebase connection

### Subscription Plans

**GET /api/admin/subscription-plans** - Get all plans
**POST /api/admin/subscription-plans** - Create plan
**PUT /api/admin/subscription-plans/:id** - Update plan
**DELETE /api/admin/subscription-plans/:id** - Delete plan

### Uploads (Admin)

**POST /api/admin/upload/image** - Upload image
**POST /api/admin/upload/content** - Upload content file
**POST /api/admin/upload/pdf** - Upload PDF/ebook

### Settings

**GET /api/admin/settings** - Get site settings
**PUT /api/admin/settings** - Update site settings

### Configs

**GET /api/admin/configs** - Get app configs
**POST /api/admin/configs** - Create config
**PUT /api/admin/configs/:id** - Update config
**DELETE /api/admin/configs/:id** - Delete config

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (not logged in or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

API requests are rate-limited to prevent abuse. Current limits:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints

---

*Last Updated: February 5, 2026*
