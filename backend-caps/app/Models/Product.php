<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'product_id';

    protected $fillable = [
        'name',
        'category', 
        'description',
        'product_unit',
        'sale_unit',
        'base_price',
        'branch_id',
        'is_active'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id', 'product_id');
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class, 'product_id', 'product_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class, 'product_id', 'product_id');
    }

    // Get current stock for a specific branch
    public function getCurrentStock($branchId)
    {
        $in = $this->inventoryLogs()
            ->where('branch_id', $branchId)
            ->whereIn('change_type', ['restock', 'return'])
            ->sum('quantity');
            
        $out = $this->inventoryLogs()
            ->where('branch_id', $branchId)
            ->whereIn('change_type', ['waste', 'sale'])
            ->sum('quantity');
            
        return $in - $out;
    }
}
