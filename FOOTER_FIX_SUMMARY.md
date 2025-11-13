# Footer Database Fetch Fix for Apache Deployment

**Issue**: Footer contact and social media sections were showing fallback data only when deployed to Apache server.

**Root Cause**: The Footer component was attempting to fetch from Node.js endpoint first (`/api/footer-settings`), which doesn't exist on Apache-only deployments, causing timeouts before falling back to the PHP endpoint.

---

## Changes Made

### 1. **client/components/Footer.tsx**
- **Changed**: Removed fallback logic that tried Node endpoint first
- **Now**: Uses only `/api.php?table=footer_settings` endpoint directly
- **Result**: Immediately fetches from PHP backend on page load

### 2. **client/pages/AdminFooter.tsx**
- **Changed**: Updated `fetchFooterSettings()` to use only `/api/admin/footer-settings` endpoint
- **Changed**: Updated `seedDefaultFooterSettings()` to use only `/api/admin/footer-settings` endpoint
- **Changed**: Updated `handleSave()` to use only `/api/admin/footer-settings` endpoint for both create and update operations
- **Result**: Admin panel now works directly with PHP admin routing without trying Node endpoints

### 3. **api.php** (GET /api/footer-settings endpoint)
- **Added**: Auto-seeding of default footer data if table is empty
- **Behavior**: 
  - If table doesn't exist → Creates it
  - If table is empty → Inserts default settings with proper values
  - If data exists → Returns it from database
- **Result**: Database is automatically populated with initial data on first request

---

## How It Works on Apache Deployment

### On First Footer Load:
1. User visits website
2. Footer component calls `/api.php?table=footer_settings`
3. PHP checks if `footer_settings` table exists
   - If not → Creates table
4. PHP checks if table has data
   - If empty → Inserts default data (phone, email, location, empty social URLs)
   - If has data → Returns it
5. Frontend receives data and displays actual values instead of fallback

### Admin Portal Updates:
1. Admin logs in
2. Loads Admin Footer page
3. Calls `/api/admin/footer-settings` (PHP admin routing)
4. Updates are sent via PATCH/POST to same endpoint
5. Changes persist in database

---

## Environment Support

### Development (npm run dev)
- ✅ Works with Node server
- ✅ Uses `/api.php?table=footer_settings`
- ✅ Data persists in in-memory database

### Apache Deployment
- ✅ Works without Node server
- ✅ Uses only `/api.php` endpoints
- ✅ Data persists in MySQL database
- ✅ Auto-seeds initial data on first request

### Production (API_BASE_URL configured)
- ✅ Works with remote MySQL database
- ✅ Uses the configured PHP API backend
- ✅ Full data persistence

---

## Default Footer Data

If no footer settings exist in the database, the first request will auto-insert:

```
Phone: +254 (0) XXX XXX XXX
Email: info@cornbelt.co.ke
Location: Kenya
Facebook URL: (empty - admin sets this)
Instagram URL: (empty - admin sets this)
Twitter URL: (empty - admin sets this)
```

Admin can log in to update these values at any time.

---

## Testing the Fix

### On Apache Server:
1. Clear browser cache
2. Visit website homepage
3. Check browser console (should not show fetch errors)
4. Scroll to footer
5. Should see actual phone/email/location from database
6. Log in to admin panel
7. Navigate to Footer settings
8. Verify data loads and can be updated

### Browser Console:
- Should see: `API response status: 200`
- Should NOT see any 404 or 500 errors for footer endpoints

---

## Files Modified
- `client/components/Footer.tsx` - Public footer component
- `client/pages/AdminFooter.tsx` - Admin footer management
- `api.php` - PHP GET endpoint auto-seeding

## No Changes Needed
- `server/index.ts` - Works as-is, development only
- Database schema - Already correct
- Admin routing in api.php - Already configured correctly
