<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'suppliers';
    protected $primaryKey = 'supplier_id';

    protected $fillable = [
        'supplier_name',
        'contact_person',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'payment_terms',
        'credit_limit',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class, 'supplier_id', 'supplier_id');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class, 'supplier_id', 'supplier_id');
    }

    // Get total amount of pending purchase orders
    public function getPendingOrdersTotal()
    {
        return $this->purchaseOrders()
            ->whereIn('status', [
                PurchaseOrder::STATUS_PENDING_APPROVAL,
                PurchaseOrder::STATUS_APPROVED,
                PurchaseOrder::STATUS_ORDERED
            ])
            ->sum('total_amount');
    }

    // Check if supplier is within credit limit
    public function isWithinCreditLimit()
    {
        if (!$this->credit_limit) {
            return true;
        }
        
        $pendingTotal = $this->getPendingOrdersTotal();
        return $pendingTotal <= $this->credit_limit;
    }
}
