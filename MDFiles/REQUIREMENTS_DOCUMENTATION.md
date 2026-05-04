# SmartStay — Requirements Documentation

**Project Title:** SmartStay: An AI-Enhanced Web-Based Platform for Short-Term Property Rental Booking, Host Financial Analytics, and Multi-Role Administrative Management

**Document Type:** Functional & Non-Functional Requirements Documentation

---

## Table of Contents

1. [Functional Requirements](#1-functional-requirements)
   - [1.1 Public / Unauthenticated Users](#11-public--unauthenticated-users)
   - [1.2 Guest Users](#12-guest-users)
   - [1.3 Host Users](#13-host-users)
   - [1.4 Administrator](#14-administrator)
   - [1.5 Communication Administrator](#15-communication-administrator)
2. [Non-Functional Requirements](#2-non-functional-requirements)
   - [2.1 Performance](#21-performance)
   - [2.2 Security](#22-security)
   - [2.3 Scalability](#23-scalability)
   - [2.4 Reliability & Availability](#24-reliability--availability)
   - [2.5 Usability](#25-usability)
   - [2.6 Maintainability](#26-maintainability)
3. [Responsive Design Requirements](#3-responsive-design-requirements)
4. [Browser Compatibility Requirements](#4-browser-compatibility-requirements)
5. [System & Environment Requirements](#5-system--environment-requirements)
   - [5.1 Frontend](#51-frontend)
   - [5.2 Backend](#52-backend)
   - [5.3 Database](#53-database)
   - [5.4 External Services](#54-external-services)
6. [Constraints & Delimitations](#6-constraints--delimitations)

---

## 1. Functional Requirements

Functional requirements define what the system must do — the specific behaviors, features, and operations it must support for each user role.

---

### 1.1 Public / Unauthenticated Users

| ID | Requirement |
|----|-------------|
| FR-PUB-01 | The system shall allow unauthenticated users to browse all available property listings. |
| FR-PUB-02 | The system shall allow unauthenticated users to view a curated recommendations page. |
| FR-PUB-03 | The system shall provide a publicly accessible FAQ page. |
| FR-PUB-04 | The system shall provide a publicly accessible Help Center page. |
| FR-PUB-05 | The system shall provide a publicly accessible Terms of Service page. |
| FR-PUB-06 | The system shall allow unauthenticated users to submit a contact form message. |
| FR-PUB-07 | The system shall allow new users to register as either a Guest or a Host. |
| FR-PUB-08 | The system shall allow registered users to log in using email and password. |
| FR-PUB-09 | The system shall send an email verification token upon registration and require verification before granting full account access. |

---

### 1.2 Guest Users

#### Account & Profile
| ID | Requirement |
|----|-------------|
| FR-GST-01 | The system shall provide a guest dashboard showing recent bookings, stats, and recommendations. |
| FR-GST-02 | The system shall allow guests to update their name, email, phone, bio, and profile picture. |
| FR-GST-03 | The system shall allow guests to configure notification preferences. |
| FR-GST-04 | The system shall allow guests to change their password by providing their current password. |

#### Property Discovery
| ID | Requirement |
|----|-------------|
| FR-GST-05 | The system shall allow guests to browse all available properties with photos, pricing, and details. |
| FR-GST-06 | The system shall allow guests to view full property details including amenities, house rules, availability, and host information. |
| FR-GST-07 | The system shall allow guests to filter properties by type, price range, location, guest count, and bedroom count. |
| FR-GST-08 | The system shall provide AI-driven personalized property recommendations based on browsing history. |
| FR-GST-09 | The system shall allow guests to save and manage a favorites/wishlist of properties. |
| FR-GST-10 | The system shall allow guests to view a host's public profile and listings. |

#### Booking
| ID | Requirement |
|----|-------------|
| FR-GST-11 | The system shall allow guests to select check-in/check-out dates, guest count, and special requests when booking. |
| FR-GST-12 | The system shall display real-time property availability before booking. |
| FR-GST-13 | The system shall support both fixed-date and hourly booking types. |
| FR-GST-14 | The system shall automatically calculate extra guest fees beyond the base occupancy count. |
| FR-GST-15 | The system shall allow guests to apply host-issued promo codes for discounts at checkout. |
| FR-GST-16 | The system shall enforce a cancellation policy: 100% refund if cancelled 48+ hours before check-in, 50% for 24–48 hours, and no refund under 24 hours. |
| FR-GST-17 | The system shall allow guests to view all past and upcoming bookings. |
| FR-GST-18 | The system shall allow guests to view full details of any individual booking. |
| FR-GST-19 | The system shall allow guests to upload checkout photos of the property. |

#### Payments
| ID | Requirement |
|----|-------------|
| FR-GST-20 | The system shall provide a dedicated payment flow after booking confirmation. |
| FR-GST-21 | The system shall support GCash payments via PayMongo. |
| FR-GST-22 | The system shall support PayMaya payments via PayMongo. |
| FR-GST-23 | The system shall support credit/debit card payments via PayMongo. |
| FR-GST-24 | The system shall display payment status (pending, completed, failed, refunded). |
| FR-GST-25 | The system shall show dedicated success and failure pages after payment processing. |

#### Reviews
| ID | Requirement |
|----|-------------|
| FR-GST-26 | The system shall allow guests to submit a property review after checkout across 6 dimensions: cleanliness, accuracy, communication, location, check-in, and value. |
| FR-GST-27 | The system shall allow guests to browse all reviews for any property. |
| FR-GST-28 | The system shall allow guests to attach checkout photos to a review. |
| FR-GST-29 | The system shall provide a combined checkout and review flow in a single screen. |

#### Messaging & Notifications
| ID | Requirement |
|----|-------------|
| FR-GST-30 | The system shall allow guests to send and receive direct messages with hosts. |
| FR-GST-31 | The system shall display full conversation history with each host. |
| FR-GST-32 | The system shall provide a notification center showing all booking, payment, message, and review reply notifications. |
| FR-GST-33 | The system shall deliver real-time WebSocket-based notifications. |
| FR-GST-34 | The system shall provide an AI chatbot assistant for instant answers about bookings, properties, and platform features. |

---

### 1.3 Host Users

#### Verification
| ID | Requirement |
|----|-------------|
| FR-HST-01 | The system shall require hosts to submit identity and business documents for platform verification before accessing listing features. |
| FR-HST-02 | The system shall allow hosts to track the status of their verification submission. |

#### Property Management
| ID | Requirement |
|----|-------------|
| FR-HST-03 | The system shall provide a host dashboard with an overview of properties, bookings, earnings, and recent activity. |
| FR-HST-04 | The system shall allow hosts to create new property listings with title, description, type, location, photos, amenities, pricing, and house rules. |
| FR-HST-05 | The system shall allow hosts to edit any property details. |
| FR-HST-06 | The system shall allow hosts to delete a property listing. |
| FR-HST-07 | The system shall allow hosts to upload and manage property images via Cloudinary. |
| FR-HST-08 | The system shall allow hosts to set fixed nightly rates, hourly rates, or both. |
| FR-HST-09 | The system shall allow hosts to configure per-guest fees beyond the base occupancy. |
| FR-HST-10 | The system shall allow hosts to set time-based availability windows per property. |
| FR-HST-11 | The system shall allow hosts to configure accepted payment methods per property. |
| FR-HST-12 | The system shall provide per-property performance analytics. |

#### Booking Management
| ID | Requirement |
|----|-------------|
| FR-HST-13 | The system shall allow hosts to view all reservations across all their properties. |
| FR-HST-14 | The system shall allow hosts to approve a pending booking request. |
| FR-HST-15 | The system shall allow hosts to reject a pending booking request. |
| FR-HST-16 | The system shall allow hosts to view reviews left by guests for their properties. |
| FR-HST-17 | The system shall allow hosts to post a public reply to any guest review. |

#### Financial
| ID | Requirement |
|----|-------------|
| FR-HST-18 | The system shall provide a payments dashboard tracking all incoming payments. |
| FR-HST-19 | The system shall display total earnings, processing fees, and net payouts. |
| FR-HST-20 | The system shall allow hosts to monitor payout status for completed bookings. |
| FR-HST-21 | The system shall provide a financial dashboard with revenue trends and breakdowns. |

#### Promo Codes
| ID | Requirement |
|----|-------------|
| FR-HST-22 | The system shall allow hosts to create discount codes (percentage or fixed amount). |
| FR-HST-23 | The system shall allow hosts to set maximum usage count and validity date ranges for promo codes. |
| FR-HST-24 | The system shall allow hosts to assign promo codes to specific properties. |
| FR-HST-25 | The system shall allow hosts to activate, deactivate, edit, or delete promo codes. |

---

### 1.4 Administrator

| ID | Requirement |
|----|-------------|
| FR-ADM-01 | The system shall provide an admin dashboard with platform-wide stats: users, bookings, revenue, and activity. |
| FR-ADM-02 | The system shall allow admins to browse and filter all registered users by role, status, or keyword. |
| FR-ADM-03 | The system shall allow admins to activate, deactivate, or suspend user accounts. |
| FR-ADM-04 | The system shall allow admins to review, approve, or reject host verification submissions. |
| FR-ADM-05 | The system shall allow admins to create and manage Communication Admin accounts. |
| FR-ADM-06 | The system shall allow admins to view and moderate all property listings. |
| FR-ADM-07 | The system shall allow admins to view, flag, or remove guest and host reviews. |
| FR-ADM-08 | The system shall allow admins to create, edit, reorder, and delete FAQ entries. |
| FR-ADM-09 | The system shall allow admins to view and respond to contact form messages. |
| FR-ADM-10 | The system shall maintain a full audit trail of all user and system actions. |
| FR-ADM-11 | The system shall provide a financial dashboard with platform-wide revenue tracking. |
| FR-ADM-12 | The system shall provide chatbot usage analytics including top questions and unanswered queries. |

---

### 1.5 Communication Administrator

| ID | Requirement |
|----|-------------|
| FR-COM-01 | The system shall provide a communication dashboard with message volume, active sessions, and escalation counts. |
| FR-COM-02 | The system shall allow communication admins to view all user messages across the platform. |
| FR-COM-03 | The system shall allow communication admins to reply to messages directly from the admin panel. |
| FR-COM-04 | The system shall allow communication admins to view and monitor all active chatbot sessions. |
| FR-COM-05 | The system shall allow communication admins to join and take over a chatbot session to provide human support. |
| FR-COM-06 | The system shall allow communication admins to mark a chat session as resolved. |
| FR-COM-07 | The system shall provide chatbot analytics: session counts, resolution rates, top questions, and unanswered queries. |
| FR-COM-08 | The system shall allow communication admins to configure chatbot behavior and escalation rules. |

---

## 2. Non-Functional Requirements

Non-functional requirements define how the system performs — quality attributes, constraints, and standards the system must meet.

---

### 2.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PRF-01 | API responses for standard read operations (property listings, booking history) shall complete within 2 seconds under normal load. |
| NFR-PRF-02 | The system shall apply HTTP response compression (gzip) to reduce payload sizes. |
| NFR-PRF-03 | The system shall use database indexing on all foreign keys and frequently filtered columns to minimize query execution time. |
| NFR-PRF-04 | The system shall rate-limit API requests to 100 requests per 15-minute window per IP to prevent abuse. |
| NFR-PRF-05 | WebSocket events (notifications, messages) shall be delivered to connected clients within 1 second of the triggering action. |
| NFR-PRF-06 | Property images shall be served via Cloudinary CDN to minimize load times regardless of user location. |

---

### 2.2 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | All user passwords shall be hashed using bcrypt with a minimum of 10 salt rounds before storage. |
| NFR-SEC-02 | Passwords shall meet minimum complexity requirements: 12+ characters, uppercase, lowercase, number, and special character. |
| NFR-SEC-03 | All API endpoints requiring authentication shall validate the user token or session on every request. |
| NFR-SEC-04 | Role-based access control shall be enforced server-side on all protected routes — no role escalation shall be possible from the client. |
| NFR-SEC-05 | HTTP security headers (X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, etc.) shall be applied via Helmet.js. |
| NFR-SEC-06 | CORS shall be restricted to a whitelist of authorized frontend origins only. |
| NFR-SEC-07 | Session cookies shall be set as HttpOnly and SameSite to prevent XSS and CSRF attacks. |
| NFR-SEC-08 | Email verification tokens shall expire after a defined time window and be invalidated after use. |
| NFR-SEC-09 | All communication between client and server shall occur over HTTPS in production. |
| NFR-SEC-10 | File uploads shall be routed through Cloudinary — no raw files shall be stored on the application server. |

---

### 2.3 Scalability

| ID | Requirement |
|----|-------------|
| NFR-SCL-01 | The database shall be hosted on Neon cloud PostgreSQL to support elastic scaling without infrastructure changes. |
| NFR-SCL-02 | The backend shall be stateless (session data stored server-side, not in memory) to support horizontal scaling. |
| NFR-SCL-03 | The API shall be modular with 18 independent route modules to allow independent scaling or replacement of services. |
| NFR-SCL-04 | The database schema shall use normalized relational design to avoid data duplication and support efficient scaling. |

---

### 2.4 Reliability & Availability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | The system shall validate the database connection on startup and terminate gracefully if the connection fails. |
| NFR-REL-02 | All booking and payment operations shall be atomic — partial writes shall not be committed to the database. |
| NFR-REL-03 | The system shall log all errors server-side using Morgan request logging. |
| NFR-REL-04 | The system shall return structured JSON error responses with appropriate HTTP status codes for all failure cases. |
| NFR-REL-05 | WebSocket connections shall support automatic reconnection with configurable ping/pong intervals (25s ping, 60s timeout). |

---

### 2.5 Usability

| ID | Requirement |
|----|-------------|
| NFR-USB-01 | The interface shall be fully responsive and usable on screen widths from 320px (mobile) to 1920px (desktop). |
| NFR-USB-02 | Mobile users shall have access to a bottom tab bar for primary navigation without needing to open a drawer menu. |
| NFR-USB-03 | All loading states during data fetching shall display a green spinner with descriptive text. |
| NFR-USB-04 | All destructive actions (logout, delete, cancel booking) shall require a confirmation modal before execution. |
| NFR-USB-05 | Form validation errors shall be displayed inline next to the relevant field. |
| NFR-USB-06 | The system shall provide page transition animations to improve perceived performance. |
| NFR-USB-07 | The AI chatbot shall be accessible from all authenticated pages via a persistent floating button. |

---

### 2.6 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-MNT-01 | The API shall be fully documented using OpenAPI 3.0 and accessible via Swagger UI at `/api-docs`. |
| NFR-MNT-02 | The database schema shall be managed through versioned migration scripts executable via `node migrate.js`. |
| NFR-MNT-03 | Authentication and authorization logic shall be centralized in a shared middleware module. |
| NFR-MNT-04 | Frontend components shall be organized by role (guest, host, admin, comm-admin) and type (common, pages, contexts). |
| NFR-MNT-05 | Environment-specific configuration (DB credentials, API keys, SMTP) shall be managed through `.env` files and never hardcoded. |

---

## 3. Responsive Design Requirements

SmartStay is built with a mobile-first approach using Tailwind CSS. The following breakpoints and behaviors are required:

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile (xs) | 320px – 639px | Single-column layout; bottom tab bar navigation; slide-down menu for full nav; compact cards |
| Mobile (sm) | 640px – 767px | Slightly wider cards; 2-column grids where applicable; compact auth buttons |
| Tablet (md) | 768px – 1023px | 2–3 column property grids; desktop nav links visible; sidebar still hidden |
| Desktop (lg) | 1024px – 1279px | Full sidebar visible; 3-column grids; bottom tab bar hidden |
| Wide (xl+) | 1280px+ | Max-width container (7xl); full multi-column layouts |

### Mobile-Specific Requirements

| ID | Requirement |
|----|-------------|
| RES-01 | On mobile, the sidebar shall be replaced by a fixed bottom tab bar with 5 tabs (4 primary pages + More). |
| RES-02 | On mobile, tapping "More" shall open a slide-down panel showing all navigation links in a 2-column grid. |
| RES-03 | The mobile top header shall display the user's avatar initials, current page name, greeting, and a notification bell. |
| RES-04 | All touch targets (buttons, links, tabs) shall have a minimum height of 44px for accessibility. |
| RES-05 | Property cards shall stack to a single column on screens below 768px. |
| RES-06 | Tables shall be replaced by card-based layouts on screens below 640px. |
| RES-07 | Modals shall be full-width with padding on screens below 640px. |
| RES-08 | The chatbot window shall be full-screen on mobile (below 640px). |
| RES-09 | Main content shall include bottom padding (`pb-24`) on mobile to prevent content from being hidden behind the tab bar. |
| RES-10 | The public Navbar shall show a fixed bottom tab bar on mobile instead of a hamburger dropdown. |

---

## 4. Browser Compatibility Requirements

| Browser | Minimum Version | Support Level |
|---------|----------------|---------------|
| Google Chrome | 90+ | Full support (primary target) |
| Mozilla Firefox | 88+ | Full support |
| Microsoft Edge | 90+ | Full support |
| Safari (macOS) | 14+ | Full support |
| Safari (iOS) | 14+ | Full support |
| Samsung Internet | 14+ | Full support |
| Opera | 76+ | Full support |
| Internet Explorer | Any | Not supported |

### Browser Feature Requirements

| ID | Requirement |
|----|-------------|
| BRW-01 | The system shall use WebSocket (Socket.io with polling fallback) to ensure real-time features work across all supported browsers. |
| BRW-02 | CSS shall be processed through PostCSS with Autoprefixer to ensure cross-browser compatibility of Tailwind utility classes. |
| BRW-03 | The frontend build target shall include all browsers with >0.2% global usage (as defined in `browserslist`). |
| BRW-04 | The system shall not rely on browser-specific APIs without a fallback. |
| BRW-05 | LocalStorage and SessionStorage shall be used for token persistence — the system shall handle environments where these are unavailable (e.g., private browsing). |
| BRW-06 | All images shall include `alt` attributes for accessibility and fallback display. |

---

## 5. System & Environment Requirements

### 5.1 Frontend

| Requirement | Detail |
|-------------|--------|
| Runtime | Node.js 18+ (for build tooling) |
| Framework | React 18.2.0 |
| Routing | React Router DOM 6.15.0 |
| Styling | Tailwind CSS 3.3.3 |
| HTTP Client | Axios 1.5.0 |
| Real-time | Socket.io Client 4.7.2 |
| Icons | Heroicons React 2.0.18, Lucide React |
| Charts | Chart.js 4.4.0, React-Chartjs-2 5.2.0 |
| Date Handling | date-fns 2.30.0, React Datepicker 4.16.0 |
| Maps | Leaflet 1.9.4, React-Leaflet 4.2.1 |
| Build Tool | React Scripts 5.0.1 (Create React App) |
| Environment | `.env` file with `REACT_APP_API_URL` and `REACT_APP_WS_URL` |

### 5.2 Backend

| Requirement | Detail |
|-------------|--------|
| Runtime | Node.js 18+ |
| Framework | Express 4.18.2 |
| Authentication | Token-based (custom) + express-session 1.19.0 |
| Password Hashing | bcryptjs 2.4.3 |
| Real-time | Socket.io 4.7.2 |
| File Upload | Cloudinary SDK 2.9.0, Busboy 1.6.0 |
| Email | Nodemailer 6.10.1 (SMTP/Gmail) |
| Payments | PayMongo via Axios HTTP calls |
| Security | Helmet 7.0.0, express-rate-limit 6.10.0, CORS 2.8.5 |
| Logging | Morgan 1.10.0 |
| Compression | compression 1.7.4 |
| API Docs | swagger-jsdoc 6.2.8, swagger-ui-express 5.0.0 |
| Validation | express-validator 7.0.1 |
| Testing | Jest 29.6.4, Supertest 6.3.4 |
| Dev Tools | Nodemon 3.0.1 |

### 5.3 Database

| Requirement | Detail |
|-------------|--------|
| Engine | PostgreSQL 14+ |
| Hosting | Neon Cloud (production), local PostgreSQL (development) |
| ORM/Driver | node-postgres (pg) 8.20.0 |
| Connection | Connection pool via `pg.Pool` |
| SSL | Required in production (`rejectUnauthorized: false`) |
| Migrations | Custom migration runner via `node migrate.js` |
| Tables | 16+ normalized tables |
| Indexes | Multi-column indexes on all FK and filter columns |

### 5.4 External Services

| Service | Purpose | Requirement |
|---------|---------|-------------|
| PayMongo | Payment processing | Active PayMongo account; test/live API keys in `.env` |
| Cloudinary | Image storage & delivery | Active Cloudinary account; cloud name, API key, API secret in `.env` |
| SMTP (Gmail) | Email verification & notifications | Gmail account with App Password; SMTP credentials in `.env` |
| Neon | Cloud PostgreSQL hosting | Active Neon project; `DATABASE_URL` connection string in `.env` |

---

## 6. Constraints & Delimitations

| ID | Constraint |
|----|------------|
| CON-01 | The system is an academic prototype and is not intended for commercial deployment at scale. |
| CON-02 | AI recommendations and chatbot responses are rule-based; no trained ML model or external AI API is used. |
| CON-03 | Database-level stored procedures, triggers, and views are not implemented; all business logic runs at the application layer. |
| CON-04 | The platform is configured for Philippine Peso (PHP) and PayMongo's supported payment methods (GCash, PayMaya, card). |
| CON-05 | A dedicated mobile application is not in scope; the platform is web-based only. |
| CON-06 | Internet connectivity is required for all features — database, image storage, email, and payments are all cloud-hosted. |
| CON-07 | Automated test coverage is limited to authentication and input validation; booking and payment flows lack full test suites. |
| CON-08 | Admin analytics are partially implemented; some metrics return static data pending full dynamic implementation. |

---

*Document prepared for CC106 — Advanced Database Systems*
*SmartStay Development Team*
