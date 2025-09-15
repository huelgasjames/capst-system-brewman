# BrewManager Login System

## Overview
The BrewManager system now supports unified authentication for all user types with role-based access control and customized dashboards.

## User Types and Roles

### Admin Users (Super Admin, Owner, Admin)
- **Access Level**: Full system access
- **Dashboard**: Complete admin dashboard with all management features
- **Login Endpoint**: `/api/login` or `/api/user/login`
- **Test Credentials**:
  - Super Admin: `superadmin@brewman.com` / `admin123`
  - Owner: `owner@brewman.com` / `admin123`

### Branch Manager
- **Access Level**: Branch-specific management
- **Dashboard**: Branch Manager dashboard with branch operations
- **Login Endpoint**: `/api/user/login`
- **Test Credentials**: `branchmanager@brewman.com` / `password123`

### Staff Users (Staff, Cashier, Barista, Server)
- **Access Level**: Limited to assigned branch operations
- **Dashboard**: Staff dashboard with task management and POS access
- **Login Endpoint**: `/api/user/login`
- **Test Credentials**:
  - Staff: `staff@brewman.com` / `password123`
  - Cashier: `cashier@brewman.com` / `password123`
  - Barista: `barista@brewman.com` / `password123`

## Features

### Unified Login System
- Single login page for all user types
- Automatic role detection and routing
- Secure token-based authentication
- Session management with localStorage

### Role-Based Dashboards
- **Admin Dashboard**: Full system management, user management, branch management, reports
- **Branch Manager Dashboard**: Branch operations, staff management, inventory, POS, reports
- **Staff Dashboard**: Personal tasks, POS access, inventory checks, attendance

### Role-Based Navigation
- Dynamic sidebar based on user role and permissions
- Contextual menu items and quick actions
- Branch-specific information display

### Security Features
- Token-based authentication
- Role-based access control
- Branch-specific data isolation
- Secure logout functionality

## Technical Implementation

### Frontend Components
- `UnifiedAuthContext.js`: Centralized authentication state management
- `RoleBasedDashboard.js`: Dynamic dashboard routing based on user type
- `RoleBasedSidebar.js`: Contextual navigation based on user role
- `BranchManagerDashboard.js`: Branch manager specific dashboard
- `StaffDashboard.js`: Staff specific dashboard

### Backend Endpoints
- `POST /api/user/login`: Unified login for all user types
- `GET /api/user/check-auth`: Authentication verification
- `POST /api/login`: Admin-specific login (legacy)
- `POST /api/branch-manager/login`: Branch manager login (legacy)

### Database Structure
- `admins` table: Super Admin, Owner, Admin users
- `users` table: Branch Manager, Staff, Cashier, Barista, Server users
- `branches` table: Branch information and assignments

## Usage Instructions

### For Developers
1. All users can access the same login page at `/login`
2. The system automatically detects user type and routes to appropriate dashboard
3. Use `useUnifiedAuth()` hook for authentication state
4. Check user roles with helper functions: `isAdmin()`, `isBranchManager()`, `isStaff()`

### For Users
1. Navigate to the login page
2. Enter your email and password
3. System automatically redirects to your role-appropriate dashboard
4. Access features based on your role and permissions

## Testing
Run the database seeder to create test users:
```bash
php artisan db:seed --class=TestUserSeeder
```

## Security Notes
- All passwords are hashed using Laravel's Hash facade
- Tokens are generated using secure random bytes
- Role-based access control is enforced at both frontend and backend
- Branch-specific data isolation for non-admin users
