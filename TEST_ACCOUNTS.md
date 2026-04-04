# Test Accounts for SmartStay Platform

This document contains all test accounts with their credentials for testing different user roles and verification states.

## Account Credentials

### 1. Admin Account
- **Email:** admin@smartstay.com
- **Password:** admin123
- **Role:** Admin
- **Status:** Verified
- **Description:** Full admin access to all platform features

### 2. Communication Admin Account
- **Email:** comadmin@smartstay.com
- **Password:** comadmin123
- **Role:** Communication Admin
- **Status:** Verified
- **Description:** Access to communication and messaging features

### 3. Verified Host Account
- **Email:** host@smartstay.com
- **Password:** host123
- **Role:** Host
- **Status:** Verified ✅
- **Description:** Fully verified host with access to all host features
- **Verification Details:**
  - Business: Host Properties LLC
  - Experience: 5 years
  - Properties: 3 units
  - All documents submitted and approved

### 4. Unverified Host Account
- **Email:** newhost@smartstay.com
- **Password:** newhost123
- **Role:** Host
- **Status:** Not Submitted ⏳
- **Description:** New host account that hasn't completed verification yet
- **Features:** Can access all pages but sees empty states and verification prompts

### 5. Guest Account
- **Email:** guest@smartstay.com
- **Password:** guest123
- **Role:** Guest
- **Status:** Not Required
- **Description:** Regular guest user for booking properties

## Testing Scenarios

### Host Verification Flow
1. **Login as Unverified Host** (newhost@smartstay.com / newhost123)
   - See empty dashboards with verification prompts
   - Complete verification form
   - Submit documents and wait for approval

2. **Login as Verified Host** (host@smartstay.com / host123)
   - Access all host features
   - View populated dashboards with sample data
   - Manage properties, bookings, payments, etc.

### Admin Functions
1. **Login as Admin** (admin@smartstay.com / admin123)
   - Manage all users and properties
   - Review and approve host verifications
   - Access system analytics and reports

2. **Login as Communication Admin** (comadmin@smartstay.com / comadmin123)
   - Manage messaging and communication features
   - Handle customer support functions

### Guest Experience
1. **Login as Guest** (guest@smartstay.com / guest123)
   - Browse and book properties
   - Manage bookings and payments
   - Leave reviews and ratings

## Quick Login Guide

For quick testing, use these one-click credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartstay.com | admin123 |
| Communication Admin | comadmin@smartstay.com | comadmin123 |
| Verified Host | host@smartstay.com | host123 |
| Unverified Host | newhost@smartstay.com | newhost123 |
| Guest | guest@smartstay.com | guest123 |

## Notes

- All passwords are simple for testing purposes (not for production)
- The verified host account has pre-populated verification data
- The unverified host account shows empty states until verification is completed
- All accounts are stored in memory and will reset when the server restarts