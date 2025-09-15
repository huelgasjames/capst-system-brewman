<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAdjustment extends Model
{
    use HasFactory;

    protected $table = 'stock_adjustments';
    protected $primaryKey = 'adjustment_id';

    protected $fillable = [
        'adjustment_number',
        'branch_id',
        'product_id',
        'adjustment_type',
        'quantity',
        'reason',
        'notes',
        'adjusted_by',
        'approved_by',
        'status',
        'adjustment_date'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'adjustment_date' => 'date'
    ];

    // Adjustment type constants
    const TYPE_INCREASE = 'increase';
    const TYPE_DECREASE = 'decrease';

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function adjustedBy()
    {
        return $this->belongsTo(User::class, 'adjusted_by', 'user_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by', 'user_id');
    }

    // Generate unique adjustment number
    public static function generateAdjustmentNumber()
    {
        $prefix = 'SA';
        $date = now()->format('Ymd');
        $lastAdjustment = self::whereDate('created_at', now()->toDateString())
            ->orderBy('adjustment_id', 'desc')
            ->first();
        
        $sequence = $lastAdjustment ? (intval(substr($lastAdjustment->adjustment_number, -4)) + 1) : 1;
        
        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    // Check if adjustment can be modified
    public function canBeModified()
    {
        return $this->status === self::STATUS_PENDING;
    }

    // Check if adjustment can be approved
    public function canBeApproved()
    {
        return $this->status === self::STATUS_PENDING;
    }

    // Get effective quantity (positive for increase, negative for decrease)
    public function getEffectiveQuantity()
    {
        return $this->adjustment_type === self::TYPE_INCREASE ? 
            $this->quantity : -$this->quantity;
    }
}
