<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle admin login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Debug logging
        \Log::info('Login attempt', [
            'email' => $request->email,
            'password_length' => strlen($request->password)
        ]);

        $admin = Admin::where('email', $request->email)->first();

        // Debug logging
        if ($admin) {
            \Log::info('Admin found', [
                'admin_id' => $admin->admin_id,
                'name' => $admin->name,
                'role' => $admin->role,
                'password_hash' => substr($admin->password, 0, 20) . '...'
            ]);
        } else {
            \Log::info('Admin not found for email: ' . $request->email);
        }

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            \Log::warning('Login failed', [
                'email' => $request->email,
                'admin_found' => $admin ? 'yes' : 'no',
                'password_check' => $admin ? Hash::check($request->password, $admin->password) : 'N/A'
            ]);
            
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if admin has valid role
        if (!in_array($admin->role, ['Super Admin', 'Owner'])) {
            return response()->json([
                'message' => 'Access denied. Only Super Admin and Owner users can access this system.',
            ], 403);
        }

        // Create a simple token (in production, use Laravel Sanctum or Passport)
        $token = bin2hex(random_bytes(32));
        
        // Store token in admin record
        $admin->remember_token = $token;
        $admin->save();

        return response()->json([
            'admin' => [
                'admin_id' => $admin->admin_id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
            'token' => $token,
            'message' => 'Login successful',
        ]);
    }

    /**
     * Handle admin logout
     */
    public function logout(Request $request)
    {
        // Get admin from request (set by middleware)
        $admin = $request->get('admin');
        
        if ($admin) {
            // Clear the remember token
            $admin->remember_token = null;
            $admin->save();
        }

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Get current authenticated admin
     */
    public function me(Request $request)
    {
        // Get admin from request (set by middleware)
        $admin = $request->get('admin');
        
        if (!$admin) {
            return response()->json([
                'message' => 'Admin not authenticated',
            ], 401);
        }

        return response()->json([
            'admin' => [
                'admin_id' => $admin->admin_id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
        ]);
    }

    /**
     * Check if admin is authenticated and has proper role
     */
    public function checkAuth(Request $request)
    {
        // Get admin from request (set by middleware)
        $admin = $request->get('admin');
        
        if (!$admin) {
            return response()->json([
                'authenticated' => false,
                'message' => 'Admin not authenticated',
            ], 401);
        }

        $isSuperAdminOrOwner = in_array($admin->role, ['Super Admin', 'Owner']);

        return response()->json([
            'authenticated' => true,
            'admin' => [
                'admin_id' => $admin->admin_id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
            'isSuperAdminOrOwner' => $isSuperAdminOrOwner,
            'canManageUsers' => $isSuperAdminOrOwner,
            'canManageBranches' => $isSuperAdminOrOwner,
            'canManageSystem' => $isSuperAdminOrOwner,
        ]);
    }

    /**
     * Handle Branch Manager login
     */
    public function branchManagerLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Debug logging
        \Log::info('Branch Manager login attempt', [
            'email' => $request->email,
            'password_length' => strlen($request->password)
        ]);

        $user = User::where('email', $request->email)
                   ->where('role', 'Branch Manager')
                   ->with('branch')
                   ->first();

        // Debug logging
        if ($user) {
            \Log::info('Branch Manager found', [
                'user_id' => $user->user_id,
                'name' => $user->name,
                'role' => $user->role,
                'branch_id' => $user->branch_id,
                'branch_name' => $user->branch ? $user->branch->branch_name : 'No branch',
                'password_hash' => substr($user->password, 0, 20) . '...'
            ]);
        } else {
            \Log::info('Branch Manager not found for email: ' . $request->email);
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            \Log::warning('Branch Manager login failed', [
                'email' => $request->email,
                'user_found' => $user ? 'yes' : 'no',
                'password_check' => $user ? Hash::check($request->password, $user->password) : 'N/A'
            ]);
            
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user has a branch assigned
        if (!$user->branch_id || !$user->branch) {
            return response()->json([
                'message' => 'Access denied. Branch Manager must be assigned to a branch.',
            ], 403);
        }

        // Create a simple token (in production, use Laravel Sanctum or Passport)
        $token = bin2hex(random_bytes(32));
        
        // Store token in user record
        $user->remember_token = $token;
        $user->save();

        return response()->json([
            'user' => [
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch_id' => $user->branch_id,
                'branch' => [
                    'branch_id' => $user->branch->branch_id,
                    'branch_name' => $user->branch->branch_name,
                    'location' => $user->branch->location,
                    'status' => $user->branch->status,
                ]
            ],
            'token' => $token,
            'message' => 'Branch Manager login successful',
        ]);
    }

    /**
     * Handle Branch Manager logout
     */
    public function branchManagerLogout(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        
        if ($user) {
            // Clear the remember token
            $user->remember_token = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Branch Manager logout successful',
        ]);
    }

    /**
     * Get current authenticated Branch Manager
     */
    public function branchManagerMe(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        
        if (!$user) {
            return response()->json([
                'message' => 'Branch Manager not authenticated',
            ], 401);
        }

        return response()->json([
            'user' => [
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch_id' => $user->branch_id,
                'branch' => [
                    'branch_id' => $user->branch->branch_id,
                    'branch_name' => $user->branch->branch_name,
                    'location' => $user->branch->location,
                    'status' => $user->branch->status,
                ]
            ],
        ]);
    }

    /**
     * Check if Branch Manager is authenticated
     */
    public function checkBranchManagerAuth(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        
        if (!$user) {
            return response()->json([
                'authenticated' => false,
                'message' => 'Branch Manager not authenticated',
            ], 401);
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch_id' => $user->branch_id,
                'branch' => [
                    'branch_id' => $user->branch->branch_id,
                    'branch_name' => $user->branch->branch_name,
                    'location' => $user->branch->location,
                    'status' => $user->branch->status,
                ]
            ],
            'isBranchManager' => true,
            'canManageBranch' => true,
        ]);
    }
}
