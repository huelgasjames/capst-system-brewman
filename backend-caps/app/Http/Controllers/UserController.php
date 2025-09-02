<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        $users = User::select('user_id as id', 'name', 'email', 'role', 'branch_id', 'created_at')
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
            'role' => 'required|string',
            'branch_id' => 'required|integer|exists:branches,branch_id',
        ]);

        $validated['password'] = bcrypt($validated['password']); // Hash password

        $user = User::create($validated);

        return response()->json([
            'id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'branch_id' => $user->branch_id,
            'created_at' => $user->created_at,
        ], 201);
    }

    // Show a single user
    public function show($id)
    {
        $user = User::where('user_id', $id)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user, 200);
    }

    // Update user
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id . ',user_id',
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|string',
            'branch_id' => 'sometimes|integer|exists:branches,branch_id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'branch_id' => $user->branch_id,
            'created_at' => $user->created_at,
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
