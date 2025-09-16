<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';
    protected $primaryKey = 'attendance_id';

    protected $fillable = ['user_id', 'branch_id', 'check_in', 'check_out'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    // Check if user is currently checked in
    public function isCheckedIn()
    {
        return !is_null($this->check_in) && is_null($this->check_out);
    }

    // Get total hours worked
    public function getTotalHours()
    {
        if (is_null($this->check_in) || is_null($this->check_out)) {
            return 0;
        }

        $checkIn = \Carbon\Carbon::parse($this->check_in);
        $checkOut = \Carbon\Carbon::parse($this->check_out);
        
        return $checkIn->diffInHours($checkOut);
    }

    // Get formatted total hours
    public function getFormattedTotalHours()
    {
        if (is_null($this->check_in) || is_null($this->check_out)) {
            return '0h 0m';
        }

        $checkIn = \Carbon\Carbon::parse($this->check_in);
        $checkOut = \Carbon\Carbon::parse($this->check_out);
        
        $hours = $checkIn->diffInHours($checkOut);
        $minutes = $checkIn->diffInMinutes($checkOut) % 60;
        
        return "{$hours}h {$minutes}m";
    }

    // Scope for today's attendance
    public function scopeToday($query)
    {
        return $query->whereDate('check_in', today());
    }

    // Scope for current week
    public function scopeThisWeek($query)
    {
        return $query->whereBetween('check_in', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }
}
