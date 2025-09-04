# BrewMan Authentication System

This document explains how to use the authentication system implemented in the BrewMan application.

## Overview

The authentication system allows Super Admin and Owner users to log into the BrewMan dashboard using their credentials from the `admins` table in the database.

## Database Setup

The system uses the existing `admins` table with the following structure:
- `admin_id` - Primary key
- `name` - Admin's full name
- `email` - Admin's email address
- `password` - Hashed password
- `role` - Role (Super Admin, Owner, etc.)
- `remember_token` - Authentication token
- `created_at` - Account creation timestamp

## Available Login Credentials

Based on your database, you can use either of these accounts:

### Super Admin
- **Email:** superadmin@brewman.com
- **Password:** (check your database for the actual password)
- **Role:** Super Admin

### Owner
- **Email:** owner@brewman.com
- **Password:** (check your database for the actual password)
- **Role:** Owner

## How to Use

### 1. Start the Backend
```bash
cd backend-caps
php artisan serve
```

### 2. Start the Frontend
```bash
cd frontend-caps
npm start
```

### 3. Access the Application
- Navigate to `http://localhost:3000`
- You'll be redirected to the login page
- Enter your admin credentials
- Upon successful login, you'll be taken to the dashboard

## Features

### Authentication
- **Login:** Secure admin authentication
- **Token-based:** Uses Bearer tokens for API requests
- **Protected Routes:** All dashboard routes require authentication
- **Auto-redirect:** Unauthenticated users are redirected to login

### Dashboard Features
- **Welcome Message:** Personalized greeting with admin name and role
- **Header:** Shows logged-in admin information with logout option
- **User Management:** Full CRUD operations for system users
- **Branch Management:** Manage coffee shop locations
- **Role-based Access:** Different permissions based on admin role

### Security
- **Password Hashing:** Passwords are securely hashed using bcrypt
- **Token Expiration:** Tokens are cleared on logout
- **Role Validation:** Only Super Admin and Owner can access the system
- **Protected API Endpoints:** All sensitive routes require valid tokens

## File Structure

```
frontend-caps/
├── src/
│   ├── components/
│   │   ├── Header.js          # Navigation header with admin info
│   │   └── ProtectedRoute.js  # Route protection component
│   ├── contexts/
│   │   └── AuthContext.js     # Authentication state management
│   ├── pages/
│   │   ├── Login.js           # Login page
│   │   ├── Dashboard.js       # Main dashboard
│   │   └── UserManagement.js  # User management page
│   └── App.js                 # Main app with routing

backend-caps/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── AuthController.php    # Authentication logic
│   │   └── Middleware/
│   │       └── AdminTokenMiddleware.php  # Token validation
│   └── Models/
│       └── Admin.php          # Admin model
├── routes/
│   └── api.php               # API routes with middleware
└── bootstrap/
    └── app.php               # Middleware registration
```

## API Endpoints

### Public Routes
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `GET /api/me` - Get current admin info
- `GET /api/check-auth` - Verify authentication status

### Protected Routes (require admin.token middleware)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create new branch
- And more...

## Troubleshooting

### Common Issues

1. **"Access token required" error**
   - Make sure you're logged in
   - Check if the token is stored in localStorage
   - Try logging out and logging back in

2. **"Invalid or expired token" error**
   - Your session may have expired
   - Log out and log back in
   - Check if the backend is running

3. **"Access denied" error**
   - Only Super Admin and Owner roles can access the system
   - Check your role in the database

4. **Login not working**
   - Verify your email and password
   - Check if the backend server is running
   - Ensure the database connection is working

### Development Tips

- Check the browser console for any JavaScript errors
- Check the Laravel logs in `backend-caps/storage/logs/laravel.log`
- Use browser dev tools to inspect network requests
- Verify that CORS is properly configured if testing from different ports

## Security Notes

- This is a development implementation using simple tokens
- For production, consider using Laravel Sanctum or Passport
- Implement proper session management and token refresh
- Add rate limiting for login attempts
- Consider implementing 2FA for additional security

## Next Steps

1. **Test the authentication** with your admin credentials
2. **Explore the dashboard** to see the logged-in admin information
3. **Try the user management** features
4. **Customize the UI** to match your brand requirements
5. **Add more features** like audit logs, user activity tracking, etc.
