<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\InventoryController;

// Default test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Test database connection
Route::get('/test-db', function () {
    try {
        $admins = \App\Models\Admin::all();
        return response()->json([
            'message' => 'Database connection successful!',
            'admin_count' => $admins->count(),
            'admins' => $admins->map(function($admin) {
                return [
                    'id' => $admin->admin_id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => $admin->role
                ];
            })
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Database connection failed!',
            'error' => $e->getMessage()
        ], 500);
    }
});

// TEMPORARY: Reset admin passwords (remove this after use)
Route::get('/reset-passwords', function () {
    try {
        // Reset Super Admin password
        $admin = \App\Models\Admin::where('email', 'superadmin@brewman.com')->first();
        if ($admin) {
            $admin->password = \Illuminate\Support\Facades\Hash::make('admin123');
            $admin->save();
        }
        
        // Reset Owner password  
        $admin = \App\Models\Admin::where('email', 'owner@brewman.com')->first();
        if ($admin) {
            $admin->password = \Illuminate\Support\Facades\Hash::make('admin123');
            $admin->save();
        }
        
        return response()->json([
            'message' => 'Passwords reset successfully!',
            'superadmin_updated' => \App\Models\Admin::where('email', 'superadmin@brewman.com')->exists(),
            'owner_updated' => \App\Models\Admin::where('email', 'owner@brewman.com')->exists()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Password reset failed!',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Test password hashing
Route::get('/test-password', function () {
    $testPassword = 'admin123';
    $hash = \Illuminate\Support\Facades\Hash::make($testPassword);
    $check = \Illuminate\Support\Facades\Hash::check($testPassword, $hash);
    
    return response()->json([
        'test_password' => $testPassword,
        'hash' => $hash,
        'check_result' => $check,
        'message' => 'Password hashing test'
    ]);
});

// Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('admin.token');
Route::get('/me', [AuthController::class, 'me'])->middleware('admin.token');
Route::get('/check-auth', [AuthController::class, 'checkAuth'])->middleware('admin.token');

// Protected Routes - Require Admin Authentication
Route::middleware(['admin.token'])->group(function () {
    // User Management CRUD
    Route::get('/users', [UserController::class, 'index']);       // Get all users
    Route::post('/users', [UserController::class, 'store']);      // Create new user
    Route::get('/users/{id}', [UserController::class, 'show']);   // Get user by ID
    Route::put('/users/{id}', [UserController::class, 'update']); // Update user
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // Delete user

    // Branch Management CRUD
    Route::get('/branches', [BranchController::class, 'index']);           // Get all branches
    Route::post('/branches', [BranchController::class, 'store']);          // Create new branch
    Route::get('/branches/{id}', [BranchController::class, 'show']);       // Get branch by ID
    Route::put('/branches/{id}', [BranchController::class, 'update']);     // Update branch
    Route::delete('/branches/{id}', [BranchController::class, 'destroy']); // Delete branch
    Route::get('/branches/{id}/users', [BranchController::class, 'getUsersByBranch']); // Get users by branch

    // Branch Management - Staff Assignment
    Route::post('/branches/assign-manager', [BranchController::class, 'assignBranchManager']); // Assign Branch Manager
    Route::post('/branches/unassign-user', [BranchController::class, 'unassignUser']);         // Unassign user from branch
    Route::post('/branches/change-role', [BranchController::class, 'changeUserRole']);         // Change user role
    Route::get('/branches/available-users', [BranchController::class, 'getAvailableUsers']);   // Get available users

    // Product Management CRUD
    Route::get('/products', [ProductController::class, 'index']);           // Get all products
    Route::post('/products', [ProductController::class, 'store']);          // Create new product
    Route::get('/products/{id}', [ProductController::class, 'show']);       // Get product by ID
    Route::put('/products/{id}', [ProductController::class, 'update']);     // Update product
    Route::delete('/products/{id}', [ProductController::class, 'destroy']); // Delete product
    Route::get('/products/categories', [ProductController::class, 'getCategories']); // Get product categories
    Route::get('/products/{id}/stock', [ProductController::class, 'getStock']); // Get product stock

    // Product Variant Management CRUD
    Route::get('/product-variants', [ProductVariantController::class, 'index']);           // Get all product variants
    Route::post('/product-variants', [ProductVariantController::class, 'store']);          // Create new product variant
    Route::get('/product-variants/{id}', [ProductVariantController::class, 'show']);       // Get product variant by ID
    Route::put('/product-variants/{id}', [ProductVariantController::class, 'update']);     // Update product variant
    Route::delete('/product-variants/{id}', [ProductVariantController::class, 'destroy']); // Delete product variant
    Route::get('/products/{productId}/variants', [ProductVariantController::class, 'getByProduct']); // Get variants by product

    // Inventory Management
    Route::get('/inventory/logs', [InventoryController::class, 'index']);           // Get inventory logs
    Route::post('/inventory/logs', [InventoryController::class, 'store']);          // Create inventory log
    Route::get('/inventory/logs/{id}', [InventoryController::class, 'show']);       // Get inventory log by ID
    Route::get('/inventory/status', [InventoryController::class, 'getInventoryStatus']); // Get inventory status
    Route::get('/inventory/summary', [InventoryController::class, 'getInventorySummary']); // Get inventory summary
    Route::get('/inventory/change-types', [InventoryController::class, 'getChangeTypes']); // Get change types
});

