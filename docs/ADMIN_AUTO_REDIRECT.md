# Admin Auto-Redirect Feature

## Overview
You can now login as an admin (super admin or portal user) from the **citizen login page** at `http://localhost:3000/login`, and the app will **automatically redirect you to the appropriate admin portal** and log you in.

## How It Works

### For Super Admins
1. Go to the citizen login page: `http://localhost:3000/login`
2. Enter your super admin credentials:
   - **Username:** `miloadmin`
   - **Password:** `admin123`
3. Click "Login"
4. You'll be **automatically redirected to** `http://localhost:3000/superadmin/login`
5. The app will **automatically log you in** and take you to the Super Admin Dashboard

### For Portal Users
The same flow works for portal users - they'll be redirected to `http://localhost:3000/portal/login` instead.

## Technical Implementation

### 1. Modified `AppContext.tsx` Login Function
The `login` function in `AppContext.tsx` now checks the user's role after successful authentication:

- If `role === 'super_admin'`: Throws an error with `redirectTo: '/superadmin/login'`
- If `role === 'portal'`: Throws an error with `redirectTo: '/portal/login'`
- Otherwise: Continues with normal citizen login

### 2. Updated `LoginPage.tsx`
The citizen login page catches the redirect error and:

1. Stores the username and password in `sessionStorage`
2. Redirects to the appropriate portal login page

### 3. Updated Portal Login Pages
Both `SuperAdminLoginPage.tsx` and `PortalLoginPage.tsx`:

1. Check `sessionStorage` for `autoLoginUsername` and `autoLoginPassword`
2. If found, automatically pre-fill the form and trigger login
3. Clear the credentials from `sessionStorage` after use (for security)

## Security Considerations

- Credentials are stored in `sessionStorage` (not `localStorage`), so they're cleared when the browser tab closes
- Credentials are immediately removed after the auto-login attempt
- The actual authentication still happens through the secure backend API
- JWT tokens are still properly managed

## User Experience

From the user's perspective:
- Admin users can use ANY login page (citizen, portal, or super admin)
- The system automatically detects their role and redirects them
- No error messages or confusion - just a smooth redirect
- Credentials are preserved during the redirect for seamless login

## Testing

To test this feature:

1. Start the app: `npm run dev`
2. Open `http://localhost:3000/login`
3. Enter admin credentials: `miloadmin` / `admin123`
4. Watch as you're automatically redirected to the super admin portal
5. You should land on the Super Admin Dashboard without any additional steps
