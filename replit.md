# Overview

**Lawncare Workshop** - Professional Lawn Care Guidance Platform

A beautiful full-stack web application for lawn care enthusiasts, featuring custom lawn care plans, video lessons, AI-powered diagnosis, product deals, expert Q&A, and monthly competitions. Based on the iOS app by TurfguyRoss, a golf course superintendent with 30+ years of experience.

**Status:** Complete - Ready for Deployment  
**Last Updated:** February 13, 2026  
**Deployment Platform:** Replit Autoscale (configured)

# Core Features

## User Features
- **Custom Lawn Care Plans** - Region and grass type based personalized plans
- **Video Lessons Library** - Comprehensive tutorials with progress tracking
- **AI-Powered Diagnosis** - Upload photos for lawn/plant health analysis
- **Product Deals** - Curated marketplace for lawn care products
- **Expert Q&A** - Direct access to professional lawn care advice
- **Monthly Competitions** - Showcase lawns and win prizes
- **Subscription Management** - $9.99/month or $89.99/year
- **Pricing Page** - /pricing with Free, Monthly, Yearly plans comparison

## Admin Features
- **Dashboard** - Overview analytics and metrics
- **User Management** - View and manage subscribers
- **Support Chat** - Real-time chat with users for support (/admin/support)
- **Content Management** - Grass types, lessons, plans, deals
- **Competition Management** - Create and manage monthly contests
- **Diagnosis Review** - Review AI diagnosis submissions
- **Blog & FAQs** - Content management system
- **Static Pages** - CMS for Privacy Policy, Terms & Conditions, About Us, Contact Us with HTML content editor (/admin/pages)
- **Settings** - Platform configuration

# Admin Credentials

- **Email:** admin@lawncareworkshop.com
- **Password:** admin123
- Change password after first login!

# System Architecture

## Technology Stack
- **Frontend:** React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js/Express with TypeScript
- **Database:** PostgreSQL via Drizzle ORM (universal postgres-js driver, works with local and hosted PostgreSQL)
- **State Management:** TanStack Query v5
- **Forms:** React Hook Form with Zod validation
- **Routing:** Wouter
- **Animations:** Framer Motion

## Database Schema
- `users` - User accounts with subscription status
- `grassTypes` - Cool-season grass information (Kentucky bluegrass, fescue, rye)
- `lessons` - Video tutorial content
- `plans` - Lawn care plans by region/grass type
- `deals` - Product marketplace items
- `competitions` - Monthly lawn competition entries
- `competitionEntries` - User contest submissions with voting
- `entryVotes` - User votes for contest entries
- `diagnoses` - AI diagnosis submissions
- `expertQuestions` - User questions for expert Q&A
- `chatMessages` - Message history for Q&A chat threads
- `forumPosts` - Forum posts (text/image/video)
- `postLikes` - Forum post likes
- `postComments` - Forum post comments
- `homeContentItems` - Home screen content sections
- `banners` - Promotional banners
- `testimonials` - Customer reviews
- `faqs` - Frequently asked questions
- `blogPosts` - Blog content
- `landingPageSettings` - CMS for homepage
- `supportTickets` - User-admin support tickets
- `supportMessages` - Support ticket messages

## Key Files
- `shared/schema.ts` - Database schema and types
- `server/routes.ts` - API endpoints
- `server/seed.ts` - Database seeding
- `client/src/App.tsx` - Main application router
- `client/src/pages/HomePage.tsx` - Landing page
- `client/src/components/AdminLayout.tsx` - Admin sidebar layout
- `API_DOCS.md` - Complete API documentation
- `postman_collection.json` - Postman collection for API testing
- `server/upload.ts` - File upload configuration (multer)
- `client/src/components/FileUpload.tsx` - Reusable file upload component

## Mobile App API Endpoints (v1.3.0)
- `GET /api/home` - Aggregated home screen data (includes videos with `is_pinned`, deals with `affiliate_link`, `start_date`, `expires_at`)
- `GET/POST /api/posts` - Forum posts (text/image/video)
- `POST /api/posts/:id/like` - Like/unlike posts
- `POST /api/posts/:id/comments` - Add comments
- `POST /api/questions` - Submit expert questions
- `GET /api/questions/:id/messages` - Get chat history
- `POST /api/questions/:id/messages` - Send chat message
- `GET /api/contest/info` - Current contest info
- `GET /api/contest/entries` - Contest entries with voting
- `POST /api/contest/entries` - Submit contest entry
- `POST /api/contest/entries/:id/vote` - Vote for entry
- `GET /api/contest/winners` - Past contest winners

## Calendars API
- `GET /api/calendars` - Get all lawn care calendars with events
- `GET /api/calendars/:id` - Get specific calendar with events

## Self-Diagnosis API
- `GET /api/self-diagnosis` - Get all diagnosis decision tree flows
- `GET /api/self-diagnosis/:id` - Get specific diagnosis flow

## Ebooks/Library API
- `GET /api/ebooks` - Get all ebooks/PDFs in the library
- `GET /api/ebooks/:id` - Get specific ebook details

## Static Pages API (CMS)
- `GET /api/pages/:slug` - Get static page by slug (privacy-policy, terms, about-us, contact-us)
- `GET /api/admin/pages` - Admin: List all static pages
- `POST /api/admin/pages` - Admin: Create new static page
- `PUT /api/admin/pages/:id` - Admin: Update static page
- `DELETE /api/admin/pages/:id` - Admin: Delete static page

## Privacy Content API
- `GET /api/privacy-content` - Get all active privacy content sections
  - Response format: `{ data: [{ heading: "...", text: "..." }] }`
- `GET /api/admin/privacy-content` - Admin: List all privacy content sections
- `POST /api/admin/privacy-content` - Admin: Create new section
- `PUT /api/admin/privacy-content/:id` - Admin: Update section
- `DELETE /api/admin/privacy-content/:id` - Admin: Delete section

## Media Upload API
- `POST /api/upload/media` - Upload any file (image, video, document) and get URL back
  - Response: { url, fileType, fileName, fileSize, mimeType }
  - All uploads are stored in Replit Object Storage (persistent across deployments)
  - Returned URLs use `/objects/...` paths served by the object storage integration
  - Legacy `/uploads/...` paths may still exist in older database records

## Real-Time Chat System API
- `GET /api/chats` - Get chat list with user info, last message, time, unread count
- `POST /api/chats` - Start new conversation (body: { recipientId })
- `GET /api/chats/:conversationId/messages` - Get messages in a chat room (pagination support)
- `POST /api/chats/:conversationId/messages` - Send message (supports text, image, video, document)
  - Body: { messageType: "text"|"image"|"video"|"document", content, mediaUrl, thumbnailUrl, fileName, fileSize }
- `POST /api/chats/upload` - Upload media for chat (images, videos, documents)
- `DELETE /api/chats/messages/:messageId` - Delete a message
- `GET /api/chats/unread-count` - Get total unread message count

## FCM Device Token API (Push Notifications)
- `POST /api/user/device` - Register/update FCM token
  - Body: { fcm_token: string, device_type: "ios"|"android" }
  - If token exists for user, updates last active time; otherwise creates new entry
- `DELETE /api/user/device` - Unregister FCM token
  - Body: { fcm_token: string }
- `GET /api/user/devices` - Get user's registered devices

## Firebase Configuration API (Dynamic from Admin Panel)
- `GET /api/firebase-config` - Public endpoint for client-side Firebase config
  - Returns: { configured, apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, vapidKey }
- `GET /api/admin/firebase-settings` - Admin: Get all Firebase settings
- `PUT /api/admin/firebase-settings` - Admin: Update Firebase settings
  - Supports both server-side (firebase_service_account) and web client config (firebase_web_*)

## Password Reset (OTP) & Email/SMTP API
- `POST /api/auth/forgot-password` - Stores a 6-digit OTP (15min expiry, invalidates prior codes) and emails it (body: { email }). IP rate-limited.
- `POST /api/auth/reset-password` - Validates a 6-digit code and updates the password (body: { token, password }). Mobile sends only the OTP + new password (no email). IP rate-limited to mitigate brute-force.
- SMTP is configured via the admin panel (`/admin/email-settings`), stored in `admin_configs` (keys: smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from), with env-var fallback (SMTP_HOST/PORT/USER/PASS/FROM).
- `GET /api/admin/email-settings` - Admin: get SMTP settings (password masked as "(configured)")
- `PUT /api/admin/email-settings` - Admin: update SMTP settings (blank password keeps existing)
- `POST /api/admin/email-settings/test` - Admin: verify connection and send a test email
- `password_reset_otps` table is auto-created on startup via `server/dbMigrations.ts`.

## Support Chat System API (User-Admin)
### User Endpoints
- `GET /api/support/tickets` - Get user's support tickets
- `POST /api/support/tickets` - Create new support ticket (body: { subject, message })
- `GET /api/support/tickets/:ticketId/messages` - Get messages in a ticket
- `POST /api/support/tickets/:ticketId/messages` - Send message to ticket
- `GET /api/support/unread-count` - Get unread support message count

### Admin Endpoints
- `GET /api/admin/support/tickets` - Get all support tickets (filters: status, priority)
- `GET /api/admin/support/tickets/:ticketId/messages` - Get ticket messages
- `POST /api/admin/support/tickets/:ticketId/messages` - Reply to ticket
- `PATCH /api/admin/support/tickets/:ticketId` - Update ticket status/priority
- `GET /api/admin/support/unread-count` - Get admin unread count

### Ticket Status Values
- `open` - New ticket awaiting response
- `in_progress` - Being handled by admin
- `resolved` - Issue resolved
- `closed` - Ticket closed

# User Preferences

Preferred communication style: Simple, everyday language.

# External Dependencies

## Database
- **Neon PostgreSQL**: Serverless PostgreSQL with connection pooling
- **Drizzle ORM**: Type-safe database toolkit

## Authentication & Security
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation
- **cookie-parser**: Session cookie handling

## UI & Frontend
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

## Development
- **Vite**: Frontend build tool
- **tsx**: TypeScript execution
- **concurrently**: Run multiple processes
