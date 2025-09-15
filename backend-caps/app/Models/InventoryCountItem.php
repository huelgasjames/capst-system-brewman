<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryCountItem extends Model
{
    use HasFactory;

    protected $table = 'inventory_count_items';
    protected $primaryKey = 'item_id';

    protected $fillable = [
        'count_id',
        'product_id',
        'system_quantity',
        'counted_quantity',
        'variance',
        'notes'
    ];

    protected $casts = [
        'system_quantity' => 'integer',
        'counted_quantity' => 'integer',
        'variance' => 'integer'
    ];

    public function inventoryCount()
    {
        return $this->belongsTo(InventoryCount::class, 'count_id', 'count_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    // Calculate variance
    public function calculateVariance()
    {
        return $this->counted_quantity - $this->system_quantity;
    }

    // Check if there's a variance
    public function hasVariance()
    {
        return $this->variance !== 0;
    }

    // Get variance type
    public function getVarianceType()
    {
        if ($this->variance > 0) {
            return 'overage';
        } elseif ($this->variance < 0) {
            return 'shortage';
        }
        return 'none';
    }
}
