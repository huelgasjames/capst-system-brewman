<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class BranchManagerTokenMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Contracts\Container\BindingResolutionException $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Access token required',
            ], 401);
        }

        $user = User::where('remember_token', $token)
                   ->where('role', 'Branch Manager')
                   ->with('branch')
                   ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired token',
            ], 401);
        }

        // Check if user has a branch assigned
        if (!$user->branch_id || !$user->branch) {
            return response()->json([
                'message' => 'Access denied. Branch Manager must be assigned to a branch.',
            ], 403);
        }

        // Add user to request for use in controllers
        $request->merge(['user' => $user]);

        return $next($request);
    }
}
