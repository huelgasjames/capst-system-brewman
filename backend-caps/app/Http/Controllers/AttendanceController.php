<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // Get attendance records for a branch
    public function getBranchAttendance(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        $admin = $request->get('admin');
        
        // Determine branch ID based on user type
        if ($admin) {
            // Admin can view all branches or specify a branch
            $branchId = $request->get('branch_id');
            if (!$branchId) {
                return response()->json([
                    'message' => 'Branch ID is required for admin users'
                ], 400);
            }
        } elseif ($user) {
            // Branch Manager can only view their branch
            $branchId = $user->branch_id;
        } else {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $date = $request->get('date', today()->toDateString());
        
        $attendances = Attendance::with(['user'])
            ->where('branch_id', $branchId)
            ->whereDate('check_in', $date)
            ->orderBy('check_in', 'desc')
            ->get()
            ->map(function ($attendance) {
                return [
                    'attendance_id' => $attendance->attendance_id,
                    'user_id' => $attendance->user_id,
                    'user_name' => $attendance->user->name,
                    'user_role' => $attendance->user->role,
                    'check_in' => $attendance->check_in,
                    'check_out' => $attendance->check_out,
                    'total_hours' => $attendance->getFormattedTotalHours(),
                    'is_checked_in' => $attendance->isCheckedIn(),
                    'status' => $attendance->isCheckedIn() ? 'checked_in' : 'checked_out'
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $attendances,
            'date' => $date,
            'branch_id' => $branchId
        ]);
    }

    // Get current user's attendance status
    public function getMyAttendance(Request $request)
    {
        $user = $request->get('user');
        
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $todayAttendance = Attendance::where('user_id', $user->user_id)
            ->whereDate('check_in', today())
            ->first();

        if (!$todayAttendance) {
            return response()->json([
                'success' => true,
                'data' => [
                    'is_checked_in' => false,
                    'check_in' => null,
                    'check_out' => null,
                    'total_hours' => '0h 0m',
                    'status' => 'not_checked_in'
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'attendance_id' => $todayAttendance->attendance_id,
                'is_checked_in' => $todayAttendance->isCheckedIn(),
                'check_in' => $todayAttendance->check_in,
                'check_out' => $todayAttendance->check_out,
                'total_hours' => $todayAttendance->getFormattedTotalHours(),
                'status' => $todayAttendance->isCheckedIn() ? 'checked_in' : 'checked_out'
            ]
        ]);
    }

    // Check in
    public function checkIn(Request $request)
    {
        $user = $request->get('user');
        
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        // Check if user already checked in today
        $existingAttendance = Attendance::where('user_id', $user->user_id)
            ->whereDate('check_in', today())
            ->first();

        if ($existingAttendance && $existingAttendance->isCheckedIn()) {
            return response()->json([
                'success' => false,
                'message' => 'You are already checked in today'
            ], 400);
        }

        DB::beginTransaction();
        try {
            if ($existingAttendance) {
                // Update existing record (in case of system issues)
                $existingAttendance->update([
                    'check_in' => now(),
                    'check_out' => null
                ]);
                $attendance = $existingAttendance;
            } else {
                // Create new attendance record
                $attendance = Attendance::create([
                    'user_id' => $user->user_id,
                    'branch_id' => $user->branch_id,
                    'check_in' => now(),
                    'check_out' => null
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Successfully checked in',
                'data' => [
                    'attendance_id' => $attendance->attendance_id,
                    'check_in' => $attendance->check_in,
                    'status' => 'checked_in'
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to check in: ' . $e->getMessage()
            ], 500);
        }
    }

    // Check out
    public function checkOut(Request $request)
    {
        $user = $request->get('user');
        
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        // Find today's attendance record
        $attendance = Attendance::where('user_id', $user->user_id)
            ->whereDate('check_in', today())
            ->whereNull('check_out')
            ->first();

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'No active check-in found for today'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $attendance->update([
                'check_out' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Successfully checked out',
                'data' => [
                    'attendance_id' => $attendance->attendance_id,
                    'check_in' => $attendance->check_in,
                    'check_out' => $attendance->check_out,
                    'total_hours' => $attendance->getFormattedTotalHours(),
                    'status' => 'checked_out'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to check out: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get attendance summary for a branch
    public function getAttendanceSummary(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        $admin = $request->get('admin');
        
        // Determine branch ID based on user type
        if ($admin) {
            $branchId = $request->get('branch_id');
            if (!$branchId) {
                return response()->json([
                    'message' => 'Branch ID is required for admin users'
                ], 400);
            }
        } elseif ($user) {
            $branchId = $user->branch_id;
        } else {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $date = $request->get('date', today()->toDateString());
        
        $summary = [
            'date' => $date,
            'total_employees' => User::where('branch_id', $branchId)
                ->whereIn('role', ['cashier', 'barista'])
                ->count(),
            'checked_in' => Attendance::where('branch_id', $branchId)
                ->whereDate('check_in', $date)
                ->whereNull('check_out')
                ->count(),
            'checked_out' => Attendance::where('branch_id', $branchId)
                ->whereDate('check_in', $date)
                ->whereNotNull('check_out')
                ->count(),
            'not_checked_in' => 0,
            'total_hours_worked' => 0
        ];

        // Calculate not checked in
        $summary['not_checked_in'] = $summary['total_employees'] - $summary['checked_in'] - $summary['checked_out'];

        // Calculate total hours worked
        $totalMinutes = Attendance::where('branch_id', $branchId)
            ->whereDate('check_in', $date)
            ->whereNotNull('check_out')
            ->get()
            ->sum(function ($attendance) {
                $checkIn = Carbon::parse($attendance->check_in);
                $checkOut = Carbon::parse($attendance->check_out);
                return $checkIn->diffInMinutes($checkOut);
            });

        $summary['total_hours_worked'] = round($totalMinutes / 60, 2);

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }

    // Get weekly attendance report
    public function getWeeklyReport(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        $admin = $request->get('admin');
        
        // Determine branch ID based on user type
        if ($admin) {
            $branchId = $request->get('branch_id');
            if (!$branchId) {
                return response()->json([
                    'message' => 'Branch ID is required for admin users'
                ], 400);
            }
        } elseif ($user) {
            $branchId = $user->branch_id;
        } else {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $startDate = $request->get('start_date', now()->startOfWeek()->toDateString());
        $endDate = $request->get('end_date', now()->endOfWeek()->toDateString());

        $attendances = Attendance::with(['user'])
            ->where('branch_id', $branchId)
            ->whereBetween('check_in', [$startDate, $endDate])
            ->orderBy('check_in', 'desc')
            ->get()
            ->groupBy('user_id')
            ->map(function ($userAttendances, $userId) {
                $user = $userAttendances->first()->user;
                $totalHours = $userAttendances->sum(function ($attendance) {
                    return $attendance->getTotalHours();
                });

                return [
                    'user_id' => $userId,
                    'user_name' => $user->name,
                    'user_role' => $user->role,
                    'total_days_worked' => $userAttendances->count(),
                    'total_hours_worked' => round($totalHours, 2),
                    'attendances' => $userAttendances->map(function ($attendance) {
                        return [
                            'attendance_id' => $attendance->attendance_id,
                            'date' => Carbon::parse($attendance->check_in)->toDateString(),
                            'check_in' => $attendance->check_in,
                            'check_out' => $attendance->check_out,
                            'total_hours' => $attendance->getFormattedTotalHours()
                        ];
                    })
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $attendances->values(),
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }
}
