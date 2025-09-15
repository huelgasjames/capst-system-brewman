<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransferItem extends Model
{
    use HasFactory;

    protected $table = 'stock_transfer_items';
    protected $primaryKey = 'item_id';

    protected $fillable = [
        'transfer_id',
        'product_id',
        'requested_quantity',
        'approved_quantity',
        'transferred_quantity',
        'notes'
    ];

    protected $casts = [
        'requested_quantity' => 'integer',
        'approved_quantity' => 'integer',
        'transferred_quantity' => 'integer'
    ];

    public function transfer()
    {
        return $this->belongsTo(StockTransfer::class, 'transfer_id', 'transfer_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    // Check if item is fully transferred
    public function isFullyTransferred()
    {
        return $this->transferred_quantity >= $this->approved_quantity;
    }

    // Get remaining quantity to transfer
    public function getRemainingQuantity()
    {
        return max(0, $this->approved_quantity - $this->transferred_quantity);
    }
}
