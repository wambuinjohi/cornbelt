# Footer Deployment Guide - Apache Server

## Quick Summary

✅ **Fixed**: Footer now fetches contact and social media data from database on Apache deployment

## What Changed

The footer system **no longer** tries to use the Node.js API endpoints. It now uses **only** the `api.php` backend, which works on Apache servers without Node.js.

### Components Updated:
1. **Footer.tsx** - Public footer component
2. **AdminFooter.tsx** - Admin footer settings manager  
3. **api.php** - Auto-seeds initial footer data if database is empty

---

## How to Deploy

### Step 1: Build the App
```bash
npm run build
```

### Step 2: Upload to Apache Server
```bash
# Copy the built dist folder to your Apache web root
cp -r dist/* /var/www/html/
cp api.php /var/www/html/
```

### Step 3: Ensure Database is Accessible
Make sure your `.env` or server environment has:
```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASS=your-database-password
DB_NAME=your-database-name
```

### Step 4: Test the Footer
1. Visit your website
2. Scroll to footer
3. You should see contact info from the database:
   - Phone number
   - Email address
   - Location

If it shows default placeholder values, it means the database was auto-seeded on first load.

---

## What Happens on First Load

When you first deploy and visit your website:

1. **Footer loads** → Calls `/api.php?table=footer_settings`
2. **Database check** → PHP checks if table exists
3. **Auto-create** → If table doesn't exist, creates it
4. **Auto-seed** → If table is empty, inserts default values:
   - Phone: `+254 (0) XXX XXX XXX`
   - Email: `info@cornbelt.co.ke`
   - Location: `Kenya`
   - Social URLs: (empty, admin can set these)
5. **Display** → Footer shows the data

---

## Admin Portal

To update footer settings:

1. Log in to `/admin/login`
2. Navigate to **Footer Settings**
3. Update phone, email, location, and social media URLs
4. Click **Save Changes**
5. Changes are immediately visible on the website

---

## Troubleshooting

### Footer Still Shows Default Data
- **Check**: Is the database connection working?
  - Test: `php -r "echo shell_exec('mysql -h {host} -u {user} -p{pass} -D {dbname} -e \"SELECT * FROM footer_settings;\"');"`
- **Check**: Browser console for fetch errors
  - Open DevTools → Console tab
  - Should see: `API response status: 200`

### 404 Errors in Console
- **Cause**: Old cached version with Node endpoints still being referenced
- **Fix**: Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

### Database Connection Error
- **Check**: DB credentials in environment variables
- **Check**: MySQL server is running and accessible
- **Check**: Database user has proper permissions

---

## Data Persistence

All footer changes are **permanently stored** in the database:
- Changes made in admin panel → Saved to `footer_settings` table
- Website visitors → See the database values
- No fallback values shown (unless database is unreachable)

---

## Environment Variables Needed

For production Apache deployment, ensure these are set:

```bash
DB_HOST=mysql.example.com
DB_USER=cornbelt_user
DB_PASS=secure-password-here
DB_NAME=cornbelt_db
JWT_SECRET=your-jwt-secret-key
```

---

## Technical Details

### API Endpoints Used
- **Public**: `/api.php?table=footer_settings` (GET)
- **Admin**: `/api/admin/footer-settings` (GET, POST, PATCH)

Both are handled by `api.php` - no Node.js required.

### Database Table
```sql
CREATE TABLE footer_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(255),
  email VARCHAR(255),
  location VARCHAR(255),
  facebookUrl VARCHAR(255),
  instagramUrl VARCHAR(255),
  twitterUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

---

## Rollback Plan

If you need to revert to the old version:
- The old code tried Node endpoints first, then fell back to PHP
- New code uses PHP only
- **No breaking changes** - if you need to revert, just redeploy the old version

---

## Questions?

Check the logs:
- **Browser Console**: `F12` → Console tab
- **PHP Logs**: Check Apache error logs (`/var/log/apache2/error.log`)
- **MySQL**: Verify table structure with `DESCRIBE footer_settings;`
