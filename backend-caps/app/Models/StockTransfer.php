<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransfer extends Model
{
    use HasFactory;

    protected $table = 'stock_transfers';
    protected $primaryKey = 'transfer_id';

    protected $fillable = [
        'transfer_number',
        'from_branch_id',
        'to_branch_id',
        'status',
        'request_date',
        'approved_date',
        'completed_date',
        'notes',
        'requested_by',
        'approved_by'
    ];

    protected $casts = [
        'request_date' => 'date',
        'approved_date' => 'date',
        'completed_date' => 'date'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_IN_TRANSIT = 'in_transit';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REJECTED = 'rejected';

    public function fromBranch()
    {
        return $this->belongsTo(Branch::class, 'from_branch_id', 'branch_id');
    }

    public function toBranch()
    {
        return $this->belongsTo(Branch::class, 'to_branch_id', 'branch_id');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by', 'user_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by', 'user_id');
    }

    public function items()
    {
        return $this->hasMany(StockTransferItem::class, 'transfer_id', 'transfer_id');
    }

    // Generate unique transfer number
    public static function generateTransferNumber()
    {
        $prefix = 'ST';
        $date = now()->format('Ymd');
        $lastTransfer = self::whereDate('created_at', now()->toDateString())
            ->orderBy('transfer_id', 'desc')
            ->first();
        
        $sequence = $lastTransfer ? (intval(substr($lastTransfer->transfer_number, -4)) + 1) : 1;
        
        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    // Check if transfer can be modified
    public function canBeModified()
    {
        return $this->status === self::STATUS_PENDING;
    }

    // Check if transfer can be approved
    public function canBeApproved()
    {
        return $this->status === self::STATUS_PENDING;
    }

    // Check if transfer can be completed
    public function canBeCompleted()
    {
        return in_array($this->status, [self::STATUS_APPROVED, self::STATUS_IN_TRANSIT]);
    }

    // Check if transfer can be cancelled
    public function canBeCancelled()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_APPROVED]);
    }
}
