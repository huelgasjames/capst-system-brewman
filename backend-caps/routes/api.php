<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\StockTransferController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\InventoryCountController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\LowStockAlertController;
use App\Http\Controllers\AttendanceController;

// Default test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'message' => 'BrewManager API is running',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
});

// Test endpoint to verify token
Route::get('/test-token', function (Request $request) {
    $token = $request->bearerToken();
    $authHeader = $request->header('Authorization');
    
    return response()->json([
        'message' => 'Token test endpoint',
        'hasToken' => !empty($token),
        'tokenPreview' => $token ? substr($token, 0, 20) . '...' : 'none',
        'authHeader' => $authHeader,
        'allHeaders' => $request->headers->all()
    ]);
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

// Branch Manager Authentication Routes
Route::post('/branch-manager/login', [AuthController::class, 'branchManagerLogin']);
Route::post('/branch-manager/logout', [AuthController::class, 'branchManagerLogout'])->middleware('branchmanager.token');
Route::get('/branch-manager/me', [AuthController::class, 'branchManagerMe'])->middleware('branchmanager.token');
Route::get('/branch-manager/check-auth', [AuthController::class, 'checkBranchManagerAuth'])->middleware('branchmanager.token');

// Unified User Authentication Routes (for all user types)
Route::post('/user/login', [AuthController::class, 'userLogin']);
Route::get('/user/check-auth', [AuthController::class, 'checkUserAuth'])->middleware('branchmanager.token');

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
    Route::get('/inventory/low-stock-alerts', [InventoryController::class, 'getLowStockAlerts']); // Get low stock alerts
    Route::get('/inventory/branch-report', [InventoryController::class, 'getBranchInventoryReport']); // Get branch inventory report

    // Purchase Order Management
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);           // Get all purchase orders
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);          // Create purchase order
    Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);       // Get purchase order by ID
    Route::put('/purchase-orders/{id}', [PurchaseOrderController::class, 'update']);     // Update purchase order
    Route::post('/purchase-orders/{id}/submit', [PurchaseOrderController::class, 'submitForApproval']); // Submit for approval
    Route::post('/purchase-orders/{id}/approve', [PurchaseOrderController::class, 'approve']); // Approve purchase order
    Route::post('/purchase-orders/{id}/deliver', [PurchaseOrderController::class, 'markAsDelivered']); // Mark as delivered
    Route::post('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel']); // Cancel purchase order
    Route::get('/purchase-orders/low-stock-products', [PurchaseOrderController::class, 'getLowStockProducts']); // Get low stock products

    // Stock Transfer Management
    Route::get('/stock-transfers', [StockTransferController::class, 'index']);           // Get all stock transfers
    Route::post('/stock-transfers', [StockTransferController::class, 'store']);          // Create stock transfer
    Route::get('/stock-transfers/{id}', [StockTransferController::class, 'show']);       // Get stock transfer by ID
    Route::put('/stock-transfers/{id}', [StockTransferController::class, 'update']);     // Update stock transfer
    Route::post('/stock-transfers/{id}/approve', [StockTransferController::class, 'approve']); // Approve stock transfer
    Route::post('/stock-transfers/{id}/complete', [StockTransferController::class, 'complete']); // Complete stock transfer
    Route::post('/stock-transfers/{id}/reject', [StockTransferController::class, 'reject']); // Reject stock transfer
    Route::post('/stock-transfers/{id}/cancel', [StockTransferController::class, 'cancel']); // Cancel stock transfer

    // Stock Adjustment Management
    Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index']);           // Get all stock adjustments
    Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store']);          // Create stock adjustment
    Route::get('/stock-adjustments/{id}', [StockAdjustmentController::class, 'show']);       // Get stock adjustment by ID
    Route::put('/stock-adjustments/{id}', [StockAdjustmentController::class, 'update']);     // Update stock adjustment
    Route::post('/stock-adjustments/{id}/approve', [StockAdjustmentController::class, 'approve']); // Approve stock adjustment
    Route::post('/stock-adjustments/{id}/reject', [StockAdjustmentController::class, 'reject']); // Reject stock adjustment
    Route::get('/stock-adjustments/reasons', [StockAdjustmentController::class, 'getAdjustmentReasons']); // Get adjustment reasons

    // Inventory Count Management
    Route::get('/inventory-counts', [InventoryCountController::class, 'index']);           // Get all inventory counts
    Route::post('/inventory-counts', [InventoryCountController::class, 'store']);          // Create inventory count
    Route::get('/inventory-counts/{id}', [InventoryCountController::class, 'show']);       // Get inventory count by ID
    Route::put('/inventory-counts/{id}', [InventoryCountController::class, 'update']);     // Update inventory count
    Route::post('/inventory-counts/{id}/items', [InventoryCountController::class, 'addItem']); // Add item to count
    Route::put('/inventory-counts/{id}/items/{itemId}', [InventoryCountController::class, 'updateItem']); // Update count item
    Route::delete('/inventory-counts/{id}/items/{itemId}', [InventoryCountController::class, 'removeItem']); // Remove count item
    Route::post('/inventory-counts/{id}/complete', [InventoryCountController::class, 'complete']); // Complete inventory count
    Route::post('/inventory-counts/{id}/approve', [InventoryCountController::class, 'approve']); // Approve inventory count
    Route::get('/inventory-counts/{id}/products', [InventoryCountController::class, 'getProductsForCount']); // Get products for count

    // Supplier Management
    Route::get('/suppliers', [SupplierController::class, 'index']);           // Get all suppliers
    Route::post('/suppliers', [SupplierController::class, 'store']);          // Create supplier
    Route::get('/suppliers/{id}', [SupplierController::class, 'show']);       // Get supplier by ID
    Route::put('/suppliers/{id}', [SupplierController::class, 'update']);     // Update supplier
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']); // Delete supplier
    Route::get('/suppliers/active/list', [SupplierController::class, 'getActiveSuppliers']); // Get active suppliers
    Route::get('/suppliers/{id}/stats', [SupplierController::class, 'getSupplierStats']); // Get supplier statistics

    // Low Stock Alerts and Automated Restocking
    Route::get('/low-stock-alerts/products', [LowStockAlertController::class, 'getLowStockProducts']); // Get low stock products
    Route::get('/low-stock-alerts/out-of-stock', [LowStockAlertController::class, 'getOutOfStockProducts']); // Get out of stock products
    Route::post('/low-stock-alerts/restocking-request', [LowStockAlertController::class, 'createAutomatedRestockingRequest']); // Create automated restocking request
    Route::get('/low-stock-alerts/suggestions', [LowStockAlertController::class, 'getRestockingSuggestions']); // Get restocking suggestions
    Route::get('/low-stock-alerts/inventory-summary', [LowStockAlertController::class, 'getInventorySummary']); // Get inventory summary

    // Attendance Management (Admin can view all branches)
    Route::get('/attendance/branch', [AttendanceController::class, 'getBranchAttendance']); // Get branch attendance
    Route::get('/attendance/summary', [AttendanceController::class, 'getAttendanceSummary']); // Get attendance summary
    Route::get('/attendance/weekly-report', [AttendanceController::class, 'getWeeklyReport']); // Get weekly report
});

// Protected Routes - Require Branch Manager Authentication
Route::middleware(['branchmanager.token'])->group(function () {
    // Purchase Order Management (Branch Manager can create and manage their branch's orders)
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);           // Get branch purchase orders
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);          // Create purchase order
    Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);       // Get purchase order by ID
    Route::put('/purchase-orders/{id}', [PurchaseOrderController::class, 'update']);     // Update purchase order
    Route::post('/purchase-orders/{id}/submit', [PurchaseOrderController::class, 'submitForApproval']); // Submit for approval
    Route::post('/purchase-orders/{id}/deliver', [PurchaseOrderController::class, 'markAsDelivered']); // Mark as delivered
    Route::post('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel']); // Cancel purchase order
    Route::get('/purchase-orders/low-stock-products', [PurchaseOrderController::class, 'getLowStockProducts']); // Get low stock products

    // Stock Transfer Management (Branch Manager can request transfers)
    Route::get('/stock-transfers', [StockTransferController::class, 'index']);           // Get branch stock transfers
    Route::post('/stock-transfers', [StockTransferController::class, 'store']);          // Create stock transfer request
    Route::get('/stock-transfers/{id}', [StockTransferController::class, 'show']);       // Get stock transfer by ID
    Route::put('/stock-transfers/{id}', [StockTransferController::class, 'update']);     // Update stock transfer
    Route::post('/stock-transfers/{id}/complete', [StockTransferController::class, 'complete']); // Complete stock transfer
    Route::post('/stock-transfers/{id}/cancel', [StockTransferController::class, 'cancel']); // Cancel stock transfer

    // Stock Adjustment Management (Branch Manager can create adjustments)
    Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index']);           // Get branch stock adjustments
    Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store']);          // Create stock adjustment
    Route::get('/stock-adjustments/{id}', [StockAdjustmentController::class, 'show']);       // Get stock adjustment by ID
    Route::put('/stock-adjustments/{id}', [StockAdjustmentController::class, 'update']);     // Update stock adjustment
    Route::get('/stock-adjustments/reasons', [StockAdjustmentController::class, 'getAdjustmentReasons']); // Get adjustment reasons

    // Inventory Count Management (Branch Manager can conduct counts)
    Route::get('/inventory-counts', [InventoryCountController::class, 'index']);           // Get branch inventory counts
    Route::post('/inventory-counts', [InventoryCountController::class, 'store']);          // Create inventory count
    Route::get('/inventory-counts/{id}', [InventoryCountController::class, 'show']);       // Get inventory count by ID
    Route::put('/inventory-counts/{id}', [InventoryCountController::class, 'update']);     // Update inventory count
    Route::post('/inventory-counts/{id}/items', [InventoryCountController::class, 'addItem']); // Add item to count
    Route::put('/inventory-counts/{id}/items/{itemId}', [InventoryCountController::class, 'updateItem']); // Update count item
    Route::delete('/inventory-counts/{id}/items/{itemId}', [InventoryCountController::class, 'removeItem']); // Remove count item
    Route::post('/inventory-counts/{id}/complete', [InventoryCountController::class, 'complete']); // Complete inventory count
    Route::get('/inventory-counts/{id}/products', [InventoryCountController::class, 'getProductsForCount']); // Get products for count

    // Supplier Management (Branch Manager can view suppliers)
    Route::get('/suppliers', [SupplierController::class, 'index']);           // Get all suppliers
    Route::get('/suppliers/{id}', [SupplierController::class, 'show']);       // Get supplier by ID
    Route::get('/suppliers/active/list', [SupplierController::class, 'getActiveSuppliers']); // Get active suppliers

    // Low Stock Alerts and Automated Restocking (Branch Manager can view alerts and create requests)
    Route::get('/low-stock-alerts/products', [LowStockAlertController::class, 'getLowStockProducts']); // Get low stock products
    Route::get('/low-stock-alerts/out-of-stock', [LowStockAlertController::class, 'getOutOfStockProducts']); // Get out of stock products
    Route::post('/low-stock-alerts/restocking-request', [LowStockAlertController::class, 'createAutomatedRestockingRequest']); // Create automated restocking request
    Route::get('/low-stock-alerts/suggestions', [LowStockAlertController::class, 'getRestockingSuggestions']); // Get restocking suggestions
    Route::get('/low-stock-alerts/inventory-summary', [LowStockAlertController::class, 'getInventorySummary']); // Get inventory summary

    // Attendance Management (Branch Manager can view their branch attendance)
    Route::get('/attendance/branch', [AttendanceController::class, 'getBranchAttendance']); // Get branch attendance
    Route::get('/attendance/summary', [AttendanceController::class, 'getAttendanceSummary']); // Get attendance summary
    Route::get('/attendance/weekly-report', [AttendanceController::class, 'getWeeklyReport']); // Get weekly report
});

// Protected Routes - Require User Authentication (Cashiers and Baristas)
Route::middleware(['user.token'])->group(function () {
    // Attendance Management (Cashiers and Baristas can check in/out and view their attendance)
    Route::get('/attendance/my-attendance', [AttendanceController::class, 'getMyAttendance']); // Get my attendance status
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']); // Check in
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']); // Check out
});

