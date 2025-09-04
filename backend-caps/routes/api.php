<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BranchController;

// Default test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

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
