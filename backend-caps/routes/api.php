<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

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
