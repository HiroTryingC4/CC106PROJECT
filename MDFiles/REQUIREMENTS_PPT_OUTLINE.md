# SmartStay — Requirements Documentation
# PowerPoint Presentation Outline

**Suggested Tool:** Google Slides / Microsoft PowerPoint / Canva
**Color Theme:** Primary `#4E7B22` (green), Dark `#0C1805`, White, Light Gray `#F8FFD3`
**Total Slides:** 18

---

## SLIDE 1 — Title Slide

**Title:** SmartStay
**Subtitle:** Functional & Non-Functional Requirements Documentation
**Sub-subtitle:** An AI-Enhanced Web-Based Platform for Short-Term Property Rental Booking, Host Financial Analytics, and Multi-Role Administrative Management
**Footer:** CC106 — Advanced Database Systems | [Team Name] | [Date]

**Design:** Full green background (`#4E7B22`), white text, SmartStay logo/wordmark centered

---

## SLIDE 2 — Agenda

**Title:** What We'll Cover

**Content (icon + label list):**
- 📋 Functional Requirements Overview
- 👤 Requirements by User Role
- ⚙️ Non-Functional Requirements
- 📱 Responsive Design Requirements
- 🌐 Browser Compatibility
- 🖥️ System & Environment Requirements
- ⚠️ Constraints & Delimitations

**Design:** Clean white slide, green accent icons, two-column layout

---

## SLIDE 3 — System Overview

**Title:** What is SmartStay?

**Left column — 3 key points:**
- Full-stack web application for short-term property rental
- 4 user roles: Guest, Host, Admin, Communication Admin
- Built on React + Node.js + PostgreSQL + PayMongo + Socket.io

**Right column — Key Stats box (green card):**
```
16+   Normalized DB Tables
18    API Route Modules
4     User Roles
3     Payment Methods
```

**Design:** Split layout, green stat cards on right

---

## SLIDE 4 — Functional Requirements: Overview

**Title:** Functional Requirements
**Subtitle:** What the system must DO

**Content — 5 role cards in a row:**

| 🌐 Public | 👤 Guest | 🏠 Host | 🛡️ Admin | 💬 Comm Admin |
|-----------|----------|---------|----------|----------------|
| 9 requirements | 34 requirements | 25 requirements | 12 requirements | 8 requirements |
| Browse, Register, Login | Book, Pay, Review, Message | List, Manage, Earn | Oversee, Verify, Moderate | Support, Chatbot, Escalate |

**Design:** 5 equal-width colored cards, green header per card

---

## SLIDE 5 — FR: Public & Guest Users

**Title:** Functional Requirements — Public & Guest

**Left panel — Public (9):**
- Browse properties without account
- View recommendations, FAQs, Help Center
- Submit contact form
- Register as Guest or Host
- Login with email & password
- Email verification before full access

**Right panel — Guest Highlights (34 total):**
- Search & filter properties (type, price, location, guests, bedrooms)
- Fixed-date & hourly booking types
- GCash / PayMaya / Card payments via PayMongo
- 6-dimension property reviews (cleanliness, accuracy, communication, location, check-in, value)
- Favorites/wishlist
- Real-time notifications via WebSocket
- AI chatbot assistant

**Design:** Two-column, left = light green bg, right = white with green bullets

---

## SLIDE 6 — FR: Host Users

**Title:** Functional Requirements — Host

**4 category boxes:**

**🔐 Verification**
- Submit business & identity documents
- Track verification status

**🏠 Property Management**
- Create / Edit / Delete listings
- Upload photos via Cloudinary
- Set nightly & hourly rates
- Configure availability windows

**📅 Booking Management**
- View all reservations
- Approve / Reject bookings
- Reply to guest reviews

**💰 Financial & Promos**
- Track payments & payouts
- Revenue trend dashboard
- Create & manage promo codes
- Set usage limits & validity dates

**Design:** 2×2 grid of green-bordered cards

---

## SLIDE 7 — FR: Admin & Communication Admin

**Title:** Functional Requirements — Admin & Comm Admin

**Left — Admin (12 requirements):**
- Platform-wide dashboard (users, bookings, revenue)
- User management: activate / deactivate / suspend
- Host verification: approve / reject
- Create Communication Admin accounts
- Moderate properties and reviews
- Manage FAQs and contact messages
- Full activity audit log
- Financial dashboard & chatbot analytics

**Right — Communication Admin (8 requirements):**
- Communication dashboard
- View & reply to all messages
- Monitor active chatbot sessions
- Join & take over sessions (human escalation)
- Mark sessions as resolved
- Chatbot analytics (resolution rate, top questions)
- Configure chatbot behavior & escalation rules

**Design:** Two-column, left = dark green header, right = medium green header

---

## SLIDE 8 — Non-Functional Requirements: Overview

**Title:** Non-Functional Requirements
**Subtitle:** How the system must PERFORM

**6 category tiles in 2×3 grid:**

| ⚡ Performance | 🔒 Security | 📈 Scalability |
|----------------|-------------|----------------|
| 6 requirements | 10 requirements | 4 requirements |

| 🛡️ Reliability | 🎨 Usability | 🔧 Maintainability |
|----------------|-------------|-------------------|
| 5 requirements | 7 requirements | 5 requirements |

**Design:** 6 equal tiles, alternating green shades

---

## SLIDE 9 — NFR: Performance & Security

**Title:** Performance & Security Requirements

**Left — ⚡ Performance:**
- API responses < 2 seconds under normal load
- HTTP gzip compression on all responses
- Multi-column DB indexing on FK & filter columns
- Rate limiting: 100 req / 15 min per IP
- WebSocket events delivered < 1 second
- Images served via Cloudinary CDN

**Right — 🔒 Security:**
- bcrypt password hashing (10+ salt rounds)
- 12+ char passwords with complexity rules
- Token/session validation on every request
- Server-side RBAC — no client-side role escalation
- Helmet.js HTTP security headers
- CORS whitelist — authorized origins only
- HttpOnly + SameSite session cookies
- Time-limited email verification tokens
- HTTPS in production
- No raw files stored on server

**Design:** Two-column, performance = blue-green, security = dark green

---

## SLIDE 10 — NFR: Scalability, Reliability & Usability

**Title:** Scalability, Reliability & Usability

**Three columns:**

**📈 Scalability (4)**
- Neon cloud PostgreSQL (elastic)
- Stateless backend (horizontal scaling ready)
- 18 modular independent API routes
- Normalized schema (no data duplication)

**🛡️ Reliability (5)**
- DB connection validated on startup
- Atomic booking & payment operations
- Morgan request logging
- Structured JSON error responses
- WebSocket auto-reconnect (25s ping / 60s timeout)

**🎨 Usability (7)**
- Fully responsive: 320px → 1920px
- Mobile bottom tab bar navigation
- Green loading spinner on all data fetches
- Confirmation modals for destructive actions
- Inline form validation errors
- Page transition animations
- Persistent chatbot button on all pages

**Design:** Three equal columns with colored headers

---

## SLIDE 11 — Responsive Design Requirements

**Title:** Responsive Design Requirements
**Subtitle:** Mobile-First with Tailwind CSS

**Breakpoint table:**

| Breakpoint | Width | Key Behavior |
|------------|-------|--------------|
| Mobile xs | 320–639px | Single column, bottom tab bar, slide-down menu |
| Mobile sm | 640–767px | 2-col grids, compact buttons |
| Tablet md | 768–1023px | 2–3 col grids, desktop nav visible |
| Desktop lg | 1024–1279px | Full sidebar, 3-col grids, tab bar hidden |
| Wide xl+ | 1280px+ | Max-width container, full layouts |

**Mobile-specific highlights (icon list):**
- 📱 Bottom tab bar: 4 primary pages + "More"
- 👤 Top header: avatar initials + page name + bell icon
- 🃏 Tables → card layouts below 640px
- 📐 Min touch target: 44px height
- 💬 Chatbot: full-screen on mobile

**Design:** Table on left, icon list on right, phone mockup graphic if available

---

## SLIDE 12 — Browser Compatibility

**Title:** Browser Compatibility Requirements

**Browser support table:**

| Browser | Min Version | Support |
|---------|-------------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Safari macOS | 14+ | ✅ Full |
| Safari iOS | 14+ | ✅ Full |
| Samsung Internet | 14+ | ✅ Full |
| Opera | 76+ | ✅ Full |
| Internet Explorer | Any | ❌ Not Supported |

**Key compatibility measures (below table):**
- Socket.io with polling fallback for WebSocket support
- PostCSS + Autoprefixer for CSS cross-browser compatibility
- browserslist: >0.2% global usage
- LocalStorage / SessionStorage with graceful fallback

**Design:** Table centered, green ✅ / red ❌ status indicators, browser logos if available

---

## SLIDE 13 — System Requirements: Frontend

**Title:** System Requirements — Frontend

**Two columns:**

**Left — Core Stack:**
```
React 18.2.0
React Router DOM 6.15.0
Tailwind CSS 3.3.3
Axios 1.5.0
Socket.io Client 4.7.2
```

**Right — Supporting Libraries:**
```
Chart.js 4.4.0 + React-Chartjs-2
Heroicons React 2.0.18
Lucide React
date-fns 2.30.0
React Datepicker 4.16.0
Leaflet 1.9.4 + React-Leaflet
```

**Bottom bar — Environment:**
```
Node.js 18+  |  REACT_APP_API_URL  |  REACT_APP_WS_URL
```

**Design:** Dark code-style boxes, green accent borders

---

## SLIDE 14 — System Requirements: Backend

**Title:** System Requirements — Backend

**3-column grid:**

**Core:**
```
Node.js 18+
Express 4.18.2
pg (node-postgres) 8.20.0
Socket.io 4.7.2
```

**Security:**
```
bcryptjs 2.4.3
Helmet 7.0.0
express-rate-limit 6.10.0
CORS 2.8.5
express-session 1.19.0
```

**Services & Docs:**
```
Cloudinary SDK 2.9.0
Nodemailer 6.10.1
swagger-jsdoc 6.2.8
swagger-ui-express 5.0.0
Morgan 1.10.0
compression 1.7.4
```

**Bottom — Testing:**
```
Jest 29.6.4  |  Supertest 6.3.4  |  Nodemon 3.0.1
```

**Design:** 3-column dark cards, green section headers

---

## SLIDE 15 — System Requirements: Database & External Services

**Title:** Database & External Services

**Left — Database:**
```
Engine:     PostgreSQL 14+
Hosting:    Neon Cloud (prod) / Local (dev)
Driver:     node-postgres (pg) 8.20.0
Tables:     16+ normalized tables
Indexes:    FK + filter columns
SSL:        Required in production
Migrations: node migrate.js
```

**Right — External Services (4 cards):**

**💳 PayMongo**
GCash, PayMaya, Card payments
Requires: API keys in `.env`

**☁️ Cloudinary**
Property image upload & CDN delivery
Requires: Cloud name, API key, secret

**📧 SMTP (Gmail)**
Email verification & notifications
Requires: Gmail App Password

**🗄️ Neon**
Cloud PostgreSQL hosting
Requires: DATABASE_URL connection string

**Design:** Left = dark code block, right = 2×2 service cards with logos

---

## SLIDE 16 — Constraints & Delimitations

**Title:** Constraints & Delimitations

**8 constraint cards in 2×4 grid:**

| 🎓 Academic Prototype | 🤖 Rule-Based AI |
|----------------------|-----------------|
| Not for commercial deployment at scale | No ML model or external AI API used |

| 🗄️ No DB Procedures | 🇵🇭 PHP Currency Only |
|---------------------|----------------------|
| Business logic at application layer | PayMongo PH: GCash, PayMaya, Card |

| 📱 Web Only | 🌐 Internet Required |
|------------|---------------------|
| No mobile app in scope | DB, images, email, payments are cloud-hosted |

| 🧪 Limited Test Coverage | 📊 Partial Admin Analytics |
|--------------------------|---------------------------|
| Auth & validation only tested | Some metrics still static data |

**Design:** 2×4 grid, alternating light/dark green cards

---

## SLIDE 17 — Summary

**Title:** Requirements Summary

**Large stat row:**
```
88    Total Functional Requirements
37    Total Non-Functional Requirements
10    Responsive Design Requirements
7     Browser Compatibility Requirements
8     Constraints Documented
```

**Key takeaways (3 bullets):**
- SmartStay is a complete, production-ready academic platform covering all four user roles with clearly defined, verifiable requirements
- Non-functional requirements are directly traceable to implemented technologies (Helmet, bcrypt, Socket.io, Cloudinary, rate limiting)
- Responsive design is mobile-first with a bottom tab bar, slide-down menu, and adaptive layouts across all breakpoints

**Design:** Large green number stats at top, bullet points below, clean white background

---

## SLIDE 18 — Thank You / Q&A

**Title:** Thank You

**Center content:**
SmartStay — Requirements Documentation
CC106 Advanced Database Systems

**Bottom row — links:**
- 📄 Full documentation: `MDFiles/REQUIREMENTS_DOCUMENTATION.md`
- 📖 API Docs: `http://localhost:5000/api-docs`
- 📁 Repository: GitHub / CC106PROJECT

**Design:** Full green background, white text, centered layout matching Slide 1

---

## Design Notes for Presentation

**Fonts:**
- Headings: Inter Bold or Poppins Bold
- Body: Inter Regular or Poppins Regular
- Code blocks: JetBrains Mono or Fira Code

**Colors:**
- Primary green: `#4E7B22`
- Dark green: `#0C1805`
- Light green accent: `#F8FFD3`
- White: `#FFFFFF`
- Light gray: `#F9FAFB`
- Text dark: `#111827`

**Slide structure:**
- Every slide: title in green, content in white/gray cards
- Use icons (emoji or Heroicons style) for visual anchors
- Keep bullet points to max 6 per column
- Use tables for compatibility and breakpoint data
- Use code-style dark boxes for technical stack details
