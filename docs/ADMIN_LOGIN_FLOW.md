# Admin Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                  User enters credentials at ANY login page          │
│              (Citizen, Portal, or Super Admin login page)           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend API validates credentials                │
│                    POST /api/login (username, password)             │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Backend returns JWT token + user data              │
│                   { token, user: { role, ... } }                    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
                  ┌──────────────┴──────────────┐
                  │                             │
           role = 'citizen'            role = 'super_admin'
                  │                      or 'portal'
                  │                             │
                  ▼                             ▼
    ┌──────────────────────┐    ┌──────────────────────────────────┐
    │  Login successful    │    │  Throw redirect error:           │
    │  Stay on current app │    │  - Store credentials in storage  │
    │  Navigate to HOME    │    │  - Redirect to correct portal    │
    └──────────────────────┘    └────────────────┬─────────────────┘
                                                  │
                                                  ▼
                                ┌─────────────────────────────────┐
                                │  Portal Login Page loads        │
                                │  - Detect stored credentials    │
                                │  - Auto-fill form               │
                                │  - Auto-submit login            │
                                │  - Clear stored credentials     │
                                └────────────────┬────────────────┘
                                                  │
                                                  ▼
                                ┌─────────────────────────────────┐
                                │  User logged into correct       │
                                │  portal and sees dashboard      │
                                └─────────────────────────────────┘
```

## Example: Admin Login from Citizen Page

```
User Action:  Navigate to http://localhost:3000/login
              Enter: username="miloadmin", password="admin123"
              Click "Login"
                 │
                 ▼
AppContext:   Call api.loginUser({ username, password })
                 │
                 ▼
Backend:      Validate credentials ✓
              Return: { token: "eyJ...", user: { role: "super_admin", ... } }
                 │
                 ▼
AppContext:   Detect role = "super_admin"
              Throw error with redirectTo = "/superadmin/login"
                 │
                 ▼
LoginPage:    Catch error
              sessionStorage.setItem("autoLoginUsername", "miloadmin")
              sessionStorage.setItem("autoLoginPassword", "admin123")
              navigate("/superadmin/login")
                 │
                 ▼
SuperAdmin:   Load SuperAdminLoginPage
LoginPage     Detect autoLoginUsername and autoLoginPassword
              Pre-fill form
              Call performLogin("miloadmin", "admin123")
              sessionStorage.clear()
                 │
                 ▼
SuperAdmin:   Call SuperAdminContext.login()
Context       Validate via backend
              Set admin user in context
              Navigate to "/superadmin/dashboard"
                 │
                 ▼
Result:       User sees Super Admin Dashboard ✓
```

## Security Flow

```
Credentials Storage Timeline:

1. User enters credentials on Citizen login page
   └─> Stored in component state (memory) ✓

2. Login attempt detects wrong portal
   └─> Briefly stored in sessionStorage (~100ms) ⚠️

3. Target portal page loads
   └─> Read from sessionStorage
   └─> Immediately deleted from sessionStorage ✓

4. Auto-login completes
   └─> JWT token stored in localStorage ✓
   └─> User authenticated ✓

Note: Credentials never persist beyond the redirect flow.
      sessionStorage is cleared when browser tab closes.
```

## Code Changes Summary

### AppContext.tsx (contexts/)
```typescript
const login = async (data) => { 
  const user = await api.loginUser(data); 
  
  // NEW: Check role and redirect if needed
  if (user.role === 'super_admin') {
    const error = new Error('...');
    error.redirectTo = '/superadmin/login';
    error.user = user;
    throw error;
  }
  // ... similar for portal users
  
  await handleUserUpdate(user); 
  return user; 
};
```

### LoginPage.tsx (pages/auth/)
```typescript
try {
  await login({ username, password });
  navigate(from, { replace: true });
} catch (err) {
  // NEW: Handle redirect errors
  if (err.redirectTo) {
    sessionStorage.setItem('autoLoginUsername', username);
    sessionStorage.setItem('autoLoginPassword', password);
    navigate(err.redirectTo, { replace: true });
    return;
  }
  // ... handle other errors
}
```

### SuperAdminLoginPage.tsx & PortalLoginPage.tsx
```typescript
// NEW: Check for auto-login credentials
const autoUsername = sessionStorage.getItem('autoLoginUsername');
const autoPassword = sessionStorage.getItem('autoLoginPassword');

const [username, setUsername] = useState(autoUsername || '');
const [password, setPassword] = useState(autoPassword || '');

useEffect(() => {
  // NEW: Auto-login if credentials are available
  if (autoUsername && autoPassword) {
    performLogin(autoUsername, autoPassword);
  }
}, [autoUsername, autoPassword]);

const performLogin = async (user, pass) => {
  // NEW: Clear credentials immediately
  sessionStorage.removeItem('autoLoginUsername');
  sessionStorage.removeItem('autoLoginPassword');
  
  await login({ username: user, password: pass });
  navigate(from, { replace: true });
};
```
