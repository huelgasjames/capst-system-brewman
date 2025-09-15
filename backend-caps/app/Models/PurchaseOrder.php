<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'purchase_orders';
    protected $primaryKey = 'purchase_order_id';

    protected $fillable = [
        'order_number',
        'branch_id',
        'supplier_id',
        'status',
        'order_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'total_amount',
        'notes',
        'created_by',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'total_amount' => 'decimal:2',
        'approved_at' => 'datetime'
    ];

    // Status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING_APPROVAL = 'pending_approval';
    const STATUS_APPROVED = 'approved';
    const STATUS_ORDERED = 'ordered';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'supplier_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by', 'user_id');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id', 'purchase_order_id');
    }

    // Generate unique order number
    public static function generateOrderNumber()
    {
        $prefix = 'PO';
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', now()->toDateString())
            ->orderBy('purchase_order_id', 'desc')
            ->first();
        
        $sequence = $lastOrder ? (intval(substr($lastOrder->order_number, -4)) + 1) : 1;
        
        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    // Calculate total amount from items
    public function calculateTotal()
    {
        return $this->items()->sum(\DB::raw('quantity * unit_price'));
    }

    // Check if order can be modified
    public function canBeModified()
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_PENDING_APPROVAL]);
    }

    // Check if order can be approved
    public function canBeApproved()
    {
        return $this->status === self::STATUS_PENDING_APPROVAL;
    }

    // Check if order can be delivered
    public function canBeDelivered()
    {
        return in_array($this->status, [self::STATUS_APPROVED, self::STATUS_ORDERED]);
    }
}
