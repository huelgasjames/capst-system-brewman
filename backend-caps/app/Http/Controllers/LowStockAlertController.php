<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LowStockAlertController extends Controller
{
    public function getLowStockProducts(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        $admin = $request->get('admin');
        
        // Determine branch ID based on user type
        if ($admin) {
            // Admin can view all branches or specify a branch
            $branchId = $request->get('branch_id');
            if (!$branchId) {
                return response()->json([
                    'message' => 'Branch ID is required for admin users'
                ], 400);
            }
        } elseif ($user) {
            // Branch Manager can only view their branch
            $branchId = $user->branch_id;
        } else {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $lowStockProducts = Product::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get()
            ->filter(function ($product) use ($branchId) {
                $currentStock = $product->getCurrentStock($branchId);
                return $currentStock <= $product->low_stock_threshold;
            })
            ->map(function ($product) use ($branchId) {
                $currentStock = $product->getCurrentStock($branchId);
                $status = $product->getStockStatus($branchId);
                
                return [
                    'product_id' => $product->product_id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'current_stock' => $currentStock,
                    'low_stock_threshold' => $product->low_stock_threshold,
                    'base_price' => $product->base_price,
                    'product_unit' => $product->product_unit,
                    'status' => $status,
                    'status_with_color' => $product->getStockStatusWithColor($branchId),
                    'suggested_restock_quantity' => $this->calculateSuggestedRestockQuantity($product, $currentStock)
                ];
            })
            ->sortBy('current_stock');

        return response()->json($lowStockProducts->values());
    }

    public function getOutOfStockProducts(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        $admin = $request->get('admin');
        
        // Determine branch ID based on user type
        if ($admin) {
            // Admin can view all branches or specify a branch
            $branchId = $request->get('branch_id');
            if (!$branchId) {
                return response()->json([
                    'message' => 'Branch ID is required for admin users'
                ], 400);
            }
        } elseif ($user) {
            // Branch Manager can only view their branch
            $branchId = $user->branch_id;
        } else {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $outOfStockProducts = Product::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get()
            ->filter(function ($product) use ($branchId) {
                return $product->isOutOfStock($branchId);
            })
            ->map(function ($product) use ($branchId) {
                return [
                    'product_id' => $product->product_id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'current_stock' => 0,
                    'low_stock_threshold' => $product->low_stock_threshold,
                    'base_price' => $product->base_price,
                    'product_unit' => $product->product_unit,
                    'suggested_restock_quantity' => $this->calculateSuggestedRestockQuantity($product, 0)
                ];
            });

        return response()->json($outOfStockProducts->values());
    }

    public function createAutomatedRestockingRequest(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,supplier_id',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,product_id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.unit_price' => 'required|numeric|min:0',
            'expected_delivery_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000'
        ]);

        // Get user from request (set by middleware)
        $user = $request->get('user');
        $admin = $request->get('admin');
        
        // Determine branch ID and user ID based on user type
        if ($admin) {
            // Admin can create orders for any branch
            $branchId = $request->get('branch_id');
            $createdBy = $admin->admin_id;
            if (!$branchId) {
                return response()->json([
                    'message' => 'Branch ID is required for admin users'
                ], 400);
            }
        } elseif ($user) {
            // Branch Manager can only create orders for their branch
            $branchId = $user->branch_id;
            $createdBy = $user->user_id;
        } else {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        DB::beginTransaction();
        try {
            $purchaseOrder = PurchaseOrder::create([
                'order_number' => PurchaseOrder::generateOrderNumber(),
                'branch_id' => $branchId,
                'supplier_id' => $request->supplier_id,
                'status' => PurchaseOrder::STATUS_PENDING_APPROVAL,
                'order_date' => now()->toDateString(),
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes . ' (Automated Restocking Request)',
                'created_by' => $createdBy
            ]);

            $totalAmount = 0;
            foreach ($request->products as $product) {
                $itemTotal = $product['quantity'] * $product['unit_price'];
                $totalAmount += $itemTotal;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->purchase_order_id,
                    'product_id' => $product['product_id'],
                    'quantity' => $product['quantity'],
                    'unit_price' => $product['unit_price'],
                    'total_price' => $itemTotal,
                    'notes' => 'Automated restocking request'
                ]);
            }

            $purchaseOrder->update(['total_amount' => $totalAmount]);

            DB::commit();

            return response()->json([
                'message' => 'Automated restocking request created successfully',
                'purchase_order' => $purchaseOrder->load(['branch', 'supplier', 'createdBy', 'items.product'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create automated restocking request: ' . $e->getMessage()], 500);
        }
    }

    public function getRestockingSuggestions(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        $admin = $request->get('admin');
        
        // Determine branch ID based on user type
        if ($admin) {
            // Admin can view all branches or specify a branch
            $branchId = $request->get('branch_id');
            if (!$branchId) {
                return response()->json([
                    'message' => 'Branch ID is required for admin users'
                ], 400);
            }
        } elseif ($user) {
            // Branch Manager can only view their branch
            $branchId = $user->branch_id;
        } else {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $lowStockProducts = Product::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get()
            ->filter(function ($product) use ($branchId) {
                $currentStock = $product->getCurrentStock($branchId);
                return $currentStock <= $product->low_stock_threshold;
            });

        // Group products by category for better organization
        $suggestions = $lowStockProducts->groupBy('category')->map(function ($products, $category) use ($branchId) {
            return [
                'category' => $category,
                'products' => $products->map(function ($product) use ($branchId) {
                    $currentStock = $product->getCurrentStock($branchId);
                    return [
                        'product_id' => $product->product_id,
                        'name' => $product->name,
                        'current_stock' => $currentStock,
                        'low_stock_threshold' => $product->low_stock_threshold,
                        'base_price' => $product->base_price,
                        'product_unit' => $product->product_unit,
                        'suggested_restock_quantity' => $this->calculateSuggestedRestockQuantity($product, $currentStock),
                        'urgency' => $this->getUrgencyLevel($product, $currentStock)
                    ];
                })->sortBy('urgency')
            ];
        });

        return response()->json($suggestions);
    }

    public function getInventorySummary(Request $request)
    {
        // Get user from request (set by middleware)
        $user = $request->get('user');
        $admin = $request->get('admin');
        
        // Determine branch ID based on user type
        if ($admin) {
            // Admin can view all branches or specify a branch
            $branchId = $request->get('branch_id');
            if (!$branchId) {
                return response()->json([
                    'message' => 'Branch ID is required for admin users'
                ], 400);
            }
        } elseif ($user) {
            // Branch Manager can only view their branch
            $branchId = $user->branch_id;
        } else {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $products = Product::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get();

        $summary = [
            'total_products' => $products->count(),
            'in_stock' => 0,
            'low_stock' => 0,
            'out_of_stock' => 0,
            'total_inventory_value' => 0,
            'categories' => []
        ];

        foreach ($products as $product) {
            $currentStock = $product->getCurrentStock($branchId);
            $status = $product->getStockStatus($branchId);
            
            $summary['total_inventory_value'] += $currentStock * $product->base_price;
            
            switch ($status) {
                case 'in_stock':
                    $summary['in_stock']++;
                    break;
                case 'low_stock':
                    $summary['low_stock']++;
                    break;
                case 'out_of_stock':
                    $summary['out_of_stock']++;
                    break;
            }

            // Category breakdown
            if (!isset($summary['categories'][$product->category])) {
                $summary['categories'][$product->category] = [
                    'total' => 0,
                    'in_stock' => 0,
                    'low_stock' => 0,
                    'out_of_stock' => 0
                ];
            }

            $summary['categories'][$product->category]['total']++;
            $summary['categories'][$product->category][$status]++;
        }

        return response()->json($summary);
    }

    private function calculateSuggestedRestockQuantity($product, $currentStock)
    {
        // Calculate suggested restock quantity based on low stock threshold
        // This is a simple calculation - you can make it more sophisticated
        $suggestedQuantity = $product->low_stock_threshold * 3; // Restock to 3x the threshold
        
        // If out of stock, suggest a minimum quantity
        if ($currentStock <= 0) {
            $suggestedQuantity = max($suggestedQuantity, $product->low_stock_threshold * 2);
        }
        
        return $suggestedQuantity;
    }

    private function getUrgencyLevel($product, $currentStock)
    {
        if ($currentStock <= 0) {
            return 'critical';
        } elseif ($currentStock <= $product->low_stock_threshold * 0.5) {
            return 'high';
        } elseif ($currentStock <= $product->low_stock_threshold) {
            return 'medium';
        }
        
        return 'low';
    }
}
