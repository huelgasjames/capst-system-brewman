<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryCount extends Model
{
    use HasFactory;

    protected $table = 'inventory_counts';
    protected $primaryKey = 'count_id';

    protected $fillable = [
        'count_number',
        'branch_id',
        'count_date',
        'status',
        'notes',
        'conducted_by',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'count_date' => 'date',
        'approved_at' => 'datetime'
    ];

    // Status constants
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_APPROVED = 'approved';

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function conductedBy()
    {
        return $this->belongsTo(User::class, 'conducted_by', 'user_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by', 'user_id');
    }

    public function items()
    {
        return $this->hasMany(InventoryCountItem::class, 'count_id', 'count_id');
    }

    // Generate unique count number
    public static function generateCountNumber()
    {
        $prefix = 'IC';
        $date = now()->format('Ymd');
        $lastCount = self::whereDate('created_at', now()->toDateString())
            ->orderBy('count_id', 'desc')
            ->first();
        
        $sequence = $lastCount ? (intval(substr($lastCount->count_number, -4)) + 1) : 1;
        
        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    // Check if count can be modified
    public function canBeModified()
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    // Check if count can be completed
    public function canBeCompleted()
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    // Check if count can be approved
    public function canBeApproved()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    // Calculate total variance
    public function getTotalVariance()
    {
        return $this->items()->sum(\DB::raw('counted_quantity - system_quantity'));
    }

    // Get items with variance
    public function getItemsWithVariance()
    {
        return $this->items()->whereRaw('counted_quantity != system_quantity')->get();
    }
}
