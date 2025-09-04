<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Admin;

class AdminTokenMiddleware
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

        $admin = Admin::where('remember_token', $token)->first();

        if (!$admin) {
            return response()->json([
                'message' => 'Invalid or expired token',
            ], 401);
        }

        // Check if admin has valid role
        if (!in_array($admin->role, ['Super Admin', 'Owner'])) {
            return response()->json([
                'message' => 'Access denied. Only Super Admin and Owner users can access this system.',
            ], 403);
        }

        // Add admin to request for use in controllers
        $request->merge(['admin' => $admin]);

        return $next($request);
    }
}
