<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        $users = User::select('user_id as id', 'name', 'email', 'role', 'branch_id', 'created_at', 'updated_at')
            ->with(['branch' => function($query) {
                $query->select('branch_id', 'branch_name', 'location', 'status');
            }])
            ->orderBy('user_id')
            ->get();

        return response()->json($users, 200);
    }

    // Create a new user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'nullable|string|in:Branch Manager,Cashier,Barista,Staff',
            'branch_id' => 'nullable|integer|exists:branches,branch_id',
        ]);

        $validated['password'] = bcrypt($validated['password']); // Hash password

        $user = User::create($validated);
        
        // Load user with branch relationship
        $user = $user->fresh(['branch' => function($query) {
            $query->select('branch_id', 'branch_name', 'location', 'status');
        }]);

        return response()->json([
            'id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'branch_id' => $user->branch_id,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'branch' => $user->branch,
        ], 201);
    }

    // Show a single user
    public function show($id)
    {
        $user = User::where('user_id', $id)
            ->with(['branch' => function($query) {
                $query->select('branch_id', 'branch_name', 'location', 'status');
            }])
            ->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user, 200);
    }

    // Update user
    public function update(Request $request, $id)
    {
        $user = User::where('user_id', $id)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id . ',user_id',
            'password' => 'sometimes|nullable|min:6',
            'role' => 'sometimes|nullable|string|in:Branch Manager,Cashier,Barista,Staff',
            'branch_id' => 'sometimes|nullable|integer|exists:branches,branch_id',
        ]);

        // Only update password if it's provided and not empty
        if (isset($validated['password']) && !empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            // Remove password from validation if it's empty or not provided
            unset($validated['password']);
        }

        $user->update($validated);
        
        // Reload user with branch relationship
        $user = $user->fresh(['branch' => function($query) {
            $query->select('branch_id', 'branch_name', 'location', 'status');
        }]);

        return response()->json([
            'id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'branch_id' => $user->branch_id,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'branch' => $user->branch,
        ], 200);
    }

    // Delete user
    public function destroy($id)
    {
        $user = User::where('user_id', $id)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
