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
        'low_stock_threshold',
        'branch_id',
        'is_active'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'low_stock_threshold' => 'integer',
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

    // Check if product is low on stock for a specific branch
    public function isLowStock($branchId)
    {
        $currentStock = $this->getCurrentStock($branchId);
        return $currentStock <= $this->low_stock_threshold && $currentStock > 0;
    }

    // Check if product is out of stock for a specific branch
    public function isOutOfStock($branchId)
    {
        return $this->getCurrentStock($branchId) <= 0;
    }

    // Get stock status for a specific branch
    public function getStockStatus($branchId)
    {
        $currentStock = $this->getCurrentStock($branchId);
        
        if ($currentStock <= 0) {
            return 'out_of_stock';
        } elseif ($currentStock <= $this->low_stock_threshold) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }

    // Get stock status with color for UI
    public function getStockStatusWithColor($branchId)
    {
        $status = $this->getStockStatus($branchId);
        
        switch ($status) {
            case 'out_of_stock':
                return ['status' => 'Out of Stock', 'color' => 'error'];
            case 'low_stock':
                return ['status' => 'Low Stock', 'color' => 'warning'];
            default:
                return ['status' => 'In Stock', 'color' => 'success'];
        }
    }
}
