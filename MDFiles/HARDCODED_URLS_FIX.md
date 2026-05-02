# Fix Hardcoded localhost URLs

## Summary
Centralized frontend API URL construction using `frontend/src/config/api.js` and removed scattered localhost fallbacks/direct hardcoded URLs from app code.

## Current Status
- ✅ Completed: direct hardcoded localhost URLs replaced with `API_CONFIG` and `getFileUrl`.
- ✅ Completed: per-file `process.env.REACT_APP_API_URL` fallback builders refactored to centralized config.
- ✅ Completed: websocket context now uses `API_CONFIG.WS_URL`.
- ✅ Verified: only `frontend/src/config/api.js` retains localhost defaults as centralized local-dev fallback.

## Solution Created
1. Created centralized API config: `frontend/src/config/api.js`
2. Exports `API_CONFIG` object with BASE_URL, ROOT, and helper functions
3. Added centralized usage in pages/components/contexts/hooks/utils

## Files Fixed
✅ frontend/src/pages/host/HostPromoCodes.js
✅ frontend/src/pages/FAQs.js
- frontend/src/components/common/ChatBot.js
- frontend/src/contexts/AuthContext.js
- frontend/src/contexts/WebSocketContext.js
- frontend/src/hooks/useNotifications.js
- frontend/src/pages/admin/AdminProfile.js
- frontend/src/pages/admin/HostVerification.js
- frontend/src/pages/auth/Login.js
- frontend/src/pages/auth/Register.js
- frontend/src/pages/guest/BookingDetails.js
- frontend/src/pages/guest/BookingForm.js
- frontend/src/pages/guest/BookingHistory.js
- frontend/src/pages/guest/GuestDashboard.js
- frontend/src/pages/guest/GuestMessages.js
- frontend/src/pages/guest/GuestProfile.js
- frontend/src/pages/guest/GuestRecommendations.js
- frontend/src/pages/guest/GuestUnits.js
- frontend/src/pages/guest/HostProfile.js
- frontend/src/pages/guest/PaymentPage.js
- frontend/src/pages/guest/PropertySearch.js
- frontend/src/pages/guest/UnitDetails.js
- frontend/src/pages/host/AddUnit.js
- frontend/src/pages/host/EditUnit.js
- frontend/src/pages/host/HostBookings.js
- frontend/src/pages/host/HostDashboard.js
- frontend/src/pages/host/HostFinancial.js
- frontend/src/pages/host/HostMessages.js
- frontend/src/pages/host/HostPayments.js
- frontend/src/pages/host/HostProfile.js
- frontend/src/pages/host/HostReports.js
- frontend/src/pages/host/HostUnits.js
- frontend/src/pages/host/HostVerificationForm.js
- frontend/src/utils/fileUpload.js

## Verification Results

### 1. Localhost literal search
Command:
```powershell
Get-ChildItem -Recurse -Include *.js,*.jsx | Select-String "http://localhost:5000" | Select-Object Path, LineNumber
```
Result:
- Only matches are in `frontend/src/config/api.js` (centralized fallback defaults).

### 2. Distributed fallback pattern search
Command:
```powershell
Get-ChildItem -Recurse -Include *.js,*.jsx | Select-String "process\.env\.REACT_APP_API_URL\s*\|\|" | Select-Object Path, LineNumber
```
Result:
- Only match is in `frontend/src/config/api.js`.

### 3. Frontend diagnostics
Result:
- No frontend source errors after refactor.

## How to Use API_CONFIG

### Import
```javascript
import API_CONFIG from '../../config/api';
```

### Replace Patterns
```javascript
// OLD
'http://localhost:5000/api/users'

// NEW
`${API_CONFIG.BASE_URL}/users`

// OR for full paths
`${API_CONFIG.ROOT}/api/users`

// For file URLs
import { getFileUrl } from '../../config/api';
getFileUrl(fileId)
```

## Quick Fix Command (PowerShell)
Run this in frontend/src directory to see all files that need fixing:
```powershell
Get-ChildItem -Recurse -Include *.js,*.jsx | Select-String "http://localhost:5000" | Select-Object Path -Unique
```

## Benefits
- ✅ Works in any environment (dev, staging, production)
- ✅ Single source of truth for API URLs
- ✅ Easy to change ports or domains
- ✅ No more hardcoded localhost
