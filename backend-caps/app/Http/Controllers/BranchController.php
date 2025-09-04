<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BranchController extends Controller
{
    /**
     * Display a listing of branches with their assigned users
     */
    public function index(): JsonResponse
    {
        try {
            $branches = Branch::with(['users' => function ($query) {
                $query->select('user_id', 'name', 'role', 'branch_id');
            }])->get();

            return response()->json([
                'success' => true,
                'data' => $branches,
                'message' => 'Branches retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve branches: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created branch
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'branch_name' => 'required|string|max:255',
                'location' => 'required|string|max:500',
            ]);

            $branch = Branch::create([
                'branch_name' => $request->branch_name,
                'location' => $request->location,
            ]);

            return response()->json([
                'success' => true,
                'data' => $branch,
                'message' => 'Branch created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create branch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified branch with its users
     */
    public function show(string $id): JsonResponse
    {
        try {
            $branch = Branch::with(['users' => function ($query) {
                $query->select('user_id', 'name', 'role', 'branch_id');
            }])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $branch,
                'message' => 'Branch retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified branch
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'branch_name' => 'required|string|max:255',
                'location' => 'required|string|max:500',
            ]);

            $branch = Branch::findOrFail($id);
            $branch->update([
                'branch_name' => $request->branch_name,
                'location' => $request->location,
            ]);

            return response()->json([
                'success' => true,
                'data' => $branch,
                'message' => 'Branch updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update branch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified branch
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $branch = Branch::findOrFail($id);
            
            // Check if branch has users assigned
            if ($branch->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete branch with assigned users. Please reassign users first.'
                ], 400);
            }

            $branch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Branch deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete branch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users by branch
     */
    public function getUsersByBranch(string $branchId): JsonResponse
    {
        try {
            $users = User::where('branch_id', $branchId)
                ->select('user_id', 'name', 'role', 'branch_id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $users,
                'message' => 'Users retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign a user as Branch Manager to a branch
     */
    public function assignBranchManager(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'branch_id' => 'required|exists:branches,branch_id',
                'user_id' => 'required|exists:users,user_id',
            ]);

            $branch = Branch::findOrFail($request->branch_id);
            $user = User::findOrFail($request->user_id);

            // Check if user is already assigned to another branch
            if ($user->branch_id && $user->branch_id != $request->branch_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is already assigned to another branch. Please unassign first.'
                ], 400);
            }

            // Update user's branch assignment and role
            $user->update([
                'branch_id' => $request->branch_id,
                'role' => 'Branch Manager'
            ]);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Branch Manager assigned successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign Branch Manager: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unassign a user from a branch
     */
    public function unassignUser(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,user_id',
            ]);

            $user = User::findOrFail($request->user_id);
            
            // Store the branch info before unassigning
            $branchName = $user->branch ? $user->branch->branch_name : 'Unknown';
            
            $user->update([
                'branch_id' => null,
                'role' => 'User' // Reset to default role
            ]);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => "User unassigned from {$branchName} successfully"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unassign user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user role within a branch
     */
    public function changeUserRole(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,user_id',
                'new_role' => 'required|string|in:Owner,Branch Manager,Cashier,Barista,Staff',
            ]);

            $user = User::findOrFail($request->user_id);
            
            if (!$user->branch_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not assigned to any branch'
                ], 400);
            }

            $user->update(['role' => $request->new_role]);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User role updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available users (not assigned to any branch)
     */
    public function getAvailableUsers(): JsonResponse
    {
        try {
            $users = User::whereNull('branch_id')
                ->select('user_id', 'name', 'role')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $users,
                'message' => 'Available users retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available users: ' . $e->getMessage()
            ], 500);
        }
    }
}
