<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
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
        $admin = Auth::guard('admin')->user();
        
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
        $admin = Auth::guard('admin')->user();
        
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
        $admin = Auth::guard('admin')->user();
        
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
}
