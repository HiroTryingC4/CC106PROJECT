# SmartStay — Property Rental Platform

A full-stack property rental and booking platform built with React (frontend) and Node.js/Express + PostgreSQL (backend). The platform supports four distinct user roles, each with a tailored set of features.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [User Roles Overview](#user-roles-overview)
- [Features by User Level](#features-by-user-level)
  - [Public / Unauthenticated](#1-public--unauthenticated)
  - [Guest](#2-guest)
  - [Host](#3-host)
  - [Admin](#4-admin)
  - [Communication Admin](#5-communication-admin)
- [Shared / Cross-Role Features](#shared--cross-role-features)
- [Payment System](#payment-system)
- [Real-Time & Notifications](#real-time--notifications)
- [Chatbot & AI Assistant](#chatbot--ai-assistant)
- [Getting Started](#getting-started)

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React, React Router, WebSocket          |
| Backend      | Node.js, Express                        |
| Database     | PostgreSQL (Neon)                       |
| Payments     | PayMongo (GCash, PayMaya, Credit Card)  |
| File Storage | Cloudinary                              |
| Real-time    | WebSocket                               |
| Email        | SMTP (verification & notifications)     |
| Auth         | Token-based (session tokens)            |
| API Docs     | Swagger / OpenAPI                       |

---

## User Roles Overview

| Role                 | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| **Guest**            | Registered users who browse and book properties                             |
| **Host**             | Property owners who list and manage rental units                            |
| **Admin**            | Platform administrators with full system oversight                          |
| **Communication Admin** | Specialized admin focused on messaging, chatbot, and live support        |

---

## Features by User Level

---

### 1. Public / Unauthenticated

Features accessible without an account.

| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Browse Properties    | View all available listings on the public units page                        |
| Property Recommendations | View a curated recommendations page                                    |
| FAQ Page             | Browse frequently asked questions                                           |
| Help Center          | Access help documentation and guides                                        |
| Terms of Service     | Read the platform's terms and conditions                                    |
| Contact Form         | Submit a message to the platform team                                       |
| Register             | Create a new account as a Guest or Host                                     |
| Login                | Authenticate with email and password                                        |
| Email Verification   | Verify account via a token sent to the registered email                     |

---

### 2. Guest

Registered users who search for and book properties.

#### Account & Profile
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Guest Dashboard      | Overview of recent bookings, activity, and recommendations                  |
| Profile Management   | Update name, email, phone, bio, and profile picture                         |
| Settings & Preferences | Configure notification preferences and account settings                  |
| Change Password      | Update account password (requires current password)                         |

#### Property Discovery
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Browse Units         | View all available properties with photos, pricing, and details             |
| Property Details     | View full property info: amenities, house rules, availability, host info    |
| Advanced Search      | Filter properties by type, price range, location, and keyword               |
| Personalized Recommendations | Get AI-driven property suggestions based on browsing history       |
| Favorites / Wishlist | Save and manage a list of favorite properties                               |
| Host Profile         | View a host's public profile, listings, and reviews                         |

#### Booking
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Booking Form         | Select check-in/check-out dates, guest count, and special requests          |
| Availability Calendar | See real-time availability before booking                                  |
| Booking Types        | Support for fixed-date and hourly bookings                                  |
| Extra Guest Fees     | Automatic fee calculation for guests beyond the base count                  |
| Promo Code Redemption | Apply host-issued promo codes for discounts at checkout                    |
| Cancellation Policy  | 100% refund if cancelled 48+ hrs before check-in; 50% for 24–48 hrs; no refund under 24 hrs |
| Booking History      | View all past and upcoming bookings                                         |
| Booking Details      | See full details of any individual booking                                  |
| Checkout Photos      | Upload photos of the property at checkout                                   |

#### Payments
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Payment Page         | Dedicated payment flow after booking confirmation                           |
| GCash Payments       | Pay via GCash through PayMongo                                              |
| PayMaya Payments     | Pay via PayMaya through PayMongo                                            |
| Credit/Debit Card    | Pay via card through PayMongo                                               |
| Payment Status       | Track payment status (pending, completed, failed, refunded)                 |
| Payment Success/Fail | Dedicated result pages after payment processing                             |

#### Reviews
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Submit Property Review | Rate a property after checkout across 6 dimensions: cleanliness, accuracy, communication, location, check-in, and value |
| View Property Reviews | Browse all reviews for any property                                        |
| Review with Photos   | Attach checkout photos to a review                                          |
| Combined Checkout & Review | Complete checkout and leave a review in a single flow               |

#### Messaging & Notifications
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Guest Messages       | Send and receive direct messages with hosts                                 |
| Conversation History | View full message threads with each host                                    |
| Notification Center  | View all notifications (bookings, payments, messages, review replies)       |
| Real-time Notifications | Receive instant WebSocket-based notifications                            |
| AI Chatbot Assistant | Get instant answers about bookings, properties, and platform features       |

---

### 3. Host

Property owners who list units and manage reservations.

#### Verification
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Host Verification    | Submit identity and business documents for platform verification            |
| Verification Status  | Track the status of a submitted verification request                        |

#### Property Management
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Host Dashboard       | Overview of properties, bookings, earnings, and recent activity             |
| Add Property         | Create a new listing with title, description, type, location, and photos    |
| Edit Property        | Update any property details, pricing, or availability                       |
| Delete Property      | Remove a listing from the platform                                          |
| Property Photos      | Upload and manage property images via Cloudinary                            |
| Amenities Management | Define available amenities for each property                                |
| Pricing Options      | Set fixed nightly rates, hourly rates, or both                              |
| Extra Guest Fees     | Configure per-guest fees beyond the base occupancy                          |
| House Rules          | Define rules guests must agree to before booking                            |
| Availability Settings | Set time-based availability windows for each property                      |
| Accepted Payment Methods | Configure which payment methods are accepted per property              |
| Property Analytics   | View performance metrics for individual listings                            |

#### Booking Management
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| View All Bookings    | See all reservations across all properties                                  |
| Accept Booking       | Approve a pending booking request                                           |
| Reject Booking       | Decline a pending booking request                                           |
| Booking Reports      | Generate and view booking reports                                           |
| Guest Reviews        | View reviews left by guests for your properties                             |
| Reply to Reviews     | Post a public reply to any guest review                                     |

#### Financial
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Payments Dashboard   | Track all incoming payments across bookings                                 |
| Earnings Summary     | View total earnings, processing fees, and net payouts                       |
| Payout Tracking      | Monitor payout status for completed bookings                                |
| Expense Tracking     | Log and track property-related expenses                                     |
| Financial Dashboard  | Full financial overview with revenue trends and breakdowns                  |

#### Promo Codes
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Create Promo Code    | Generate discount codes (percentage or fixed amount)                        |
| Manage Promo Codes   | Edit, activate, deactivate, or delete promo codes                           |
| Usage Limits         | Set maximum usage count and validity date ranges                            |
| Property Assignment  | Assign promo codes to specific properties                                   |

#### Messaging & Notifications
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Host Messages        | Communicate directly with guests                                            |
| Host Notifications   | Receive alerts for new bookings, payments, and messages                     |
| Host Settings        | Configure notification preferences and account settings                     |
| AI Chatbot Assistant | Get instant answers about managing properties and bookings                  |

---

### 4. Admin

Platform administrators with full system access.

#### Dashboard & Overview
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Admin Dashboard      | High-level platform stats: users, bookings, revenue, and activity           |
| Financial Dashboard  | Platform-wide revenue tracking, payment summaries, and trends               |
| Admin Reports        | Generate system-wide reports on bookings, users, and revenue                |

#### User Management
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| View All Users       | Browse and filter all registered users by role, status, or keyword          |
| Change User Status   | Activate, deactivate, or suspend user accounts                              |
| Host Verification    | Review, approve, or reject host verification submissions                    |
| Communication Admin Management | Create and manage Communication Admin accounts               |

#### Content Management
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Property Management  | View, moderate, and manage all property listings                            |
| Review Management    | View, flag, or remove guest and host reviews                                |
| FAQ Management       | Create, edit, reorder, and delete FAQ entries                               |
| Contact Messages     | View and respond to messages submitted via the contact form                 |

#### System & Monitoring
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Activity Logs        | Full audit trail of all user and system actions                             |
| Admin Notifications  | Receive and manage platform-level alerts                                    |
| System Settings      | Configure global platform settings                                          |
| Chatbot Analytics    | View chatbot usage stats, top questions, and unanswered queries             |
| Admin Messages       | Manage platform-level messaging and communications                          |
| Admin Profile        | Manage the admin account profile                                            |

---

### 5. Communication Admin

A specialized admin role focused on user communication and support.

#### Dashboard
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Communication Dashboard | Overview of message volume, active sessions, and escalations            |
| System Status        | Monitor the health and status of communication services                     |
| Recent Activity      | View a live feed of recent communication events                             |

#### Message Management
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| View All Messages    | Browse all user messages across the platform                                |
| Reply to Messages    | Send replies directly to users from the admin panel                         |
| Mark as Read         | Update message read status                                                  |
| Delete Messages      | Remove messages from the system                                             |

#### Live Chat & Chatbot
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Active Chat Sessions | View and monitor all currently active chatbot sessions                      |
| Join Chat Session    | Take over a chatbot session to provide human support                        |
| Send Admin Message   | Send messages directly within an active chat session                        |
| Resolve Session      | Mark a chat session as resolved                                             |
| Escalated Sessions   | View sessions that have been escalated for human intervention               |
| Session Details      | View the full conversation history of any session                           |

#### Chatbot Analytics
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Usage Statistics     | Total sessions, messages, resolution rates, and response times              |
| Performance Metrics  | Chatbot effectiveness and user satisfaction scores                          |
| Top Questions        | Most frequently asked questions by users                                    |
| Unanswered Questions | Questions the chatbot could not answer (for training improvements)          |
| Recent Conversations | Browse recent chatbot conversation logs                                     |

#### Settings
| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Communication Settings | Configure chatbot behavior, auto-responses, and escalation rules          |
| Notifications        | Manage communication admin notification preferences                         |
| Profile Management   | Update communication admin account details                                  |

---

## Shared / Cross-Role Features

Features available to all authenticated users regardless of role.

| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Email Verification   | Account activation via email token before full access is granted            |
| Password Management  | Change password with strength requirements (12+ chars, mixed case, numbers, special characters) |
| Real-time Notifications | WebSocket-powered instant notifications for relevant events              |
| AI Chatbot           | Context-aware assistant that adapts responses based on user role            |
| Messaging            | Direct messaging between guests and hosts                                   |
| Profile Management   | Update personal information and profile picture                             |

---

## Payment System

Payments are processed through **PayMongo** and support the following methods:

| Method       | Type              | Notes                                      |
|--------------|-------------------|--------------------------------------------|
| GCash        | E-wallet          | Redirect-based source payment              |
| PayMaya      | E-wallet          | Redirect-based source payment              |
| Credit Card  | Card              | Direct payment intent                      |
| Debit Card   | Card              | Direct payment intent                      |

**Fee structure:**
- 3% processing fee applied to all transactions
- Net payout to host = total amount − processing fee
- Refunds follow the cancellation policy (100% / 50% / 0% based on timing)

**Payment statuses:** `pending` → `completed` / `failed` / `refunded`

---

## Real-Time & Notifications

The platform uses **WebSocket** connections to deliver real-time events:

| Event Type       | Who Receives It                          |
|------------------|------------------------------------------|
| New booking      | Host                                     |
| Booking confirmed | Guest                                   |
| Payment received | Guest and Host                           |
| New message      | Recipient user                           |
| Review reply     | Guest who left the review                |
| System alerts    | Admin                                    |

Notifications are also persisted in the database and accessible from each user's notification center.

---

## Chatbot & AI Assistant

The built-in chatbot provides context-aware support for all user roles:

| Capability                  | Description                                                        |
|-----------------------------|--------------------------------------------------------------------|
| Booking inquiries           | Check booking status, counts, and details                          |
| Property inquiries          | Check property availability and listing status                     |
| Payout inquiries            | Retrieve payout summaries for hosts                                |
| General platform help       | Answer questions about features, policies, and navigation          |
| Session escalation          | Hand off to a human Communication Admin when needed               |
| Feedback collection         | Gather user satisfaction ratings after sessions                    |
| Analytics                   | Track top questions, unanswered queries, and resolution rates      |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon cloud instance)
- PayMongo account (for payments)
- Cloudinary account (for image uploads)
- SMTP credentials (for email)

### Backend Setup

```bash
cd backend
npm install
# Configure backend/.env with DB, PayMongo, Cloudinary, and SMTP credentials
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
# Configure frontend/.env with the backend API URL
npm start
```

### Environment Variables

**Backend (`backend/.env`)**
```
DATABASE_URL=
PAYMONGO_SECRET_KEY=
PAYMONGO_PUBLIC_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

**Frontend (`frontend/.env`)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

### Database Migration

```bash
cd backend
node migrate.js
```

---

## API Documentation

Swagger UI is available at `http://localhost:5000/api-docs` when the backend is running.
