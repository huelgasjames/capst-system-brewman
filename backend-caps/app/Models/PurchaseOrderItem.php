<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $table = 'purchase_order_items';
    protected $primaryKey = 'item_id';

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_price',
        'received_quantity',
        'notes'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'received_quantity' => 'integer'
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id', 'purchase_order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    // Calculate total price
    public function calculateTotal()
    {
        return $this->quantity * $this->unit_price;
    }

    // Check if item is fully received
    public function isFullyReceived()
    {
        return $this->received_quantity >= $this->quantity;
    }

    // Get remaining quantity to receive
    public function getRemainingQuantity()
    {
        return max(0, $this->quantity - $this->received_quantity);
    }
}
