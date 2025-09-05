<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    /**
     * Display a listing of inventory logs
     */
    public function index(Request $request)
    {
        try {
            $query = InventoryLog::with(['product', 'branch', 'admin', 'supplier']);

            // Filter by product if specified
            if ($request->has('product_id')) {
                $query->where('product_id', $request->product_id);
            }

            // Filter by branch if specified
            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }

            // Filter by change type if specified
            if ($request->has('change_type')) {
                $query->where('change_type', $request->change_type);
            }

            // Date range filter
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Sort by created_at desc by default
            $query->orderBy('created_at', 'desc');

            $logs = $query->paginate($request->get('per_page', 15));

            // Transform the data to include unit information
            $transformedLogs = $logs->getCollection()->map(function ($log) {
                $logData = $log->toArray();
                // Add unit information from the product
                if ($log->product) {
                    $logData['unit'] = $log->product->sale_unit;
                    $logData['product_unit'] = $log->product->product_unit;
                }
                return $logData;
            });

            // Replace the collection with transformed data
            $logs->setCollection($transformedLogs);

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inventory logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created inventory log entry
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,product_id',
                'branch_id' => 'required|exists:branches,branch_id',
                'change_type' => 'required|in:restock,waste,sale,adjustment,return',
                'quantity' => 'required|integer',
                'supplier_id' => 'nullable|exists:suppliers,supplier_id',
                'notes' => 'nullable|string',
                'admin_id' => 'nullable|exists:admins,admin_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the current admin from the request (set by middleware)
            $admin = $request->get('admin');
            $adminId = $admin ? $admin->admin_id : null;

            $logData = $request->all();
            $logData['admin_id'] = $adminId;

            $log = InventoryLog::create($logData);

            return response()->json([
                'success' => true,
                'message' => 'Inventory log created successfully',
                'data' => $log->load(['product', 'branch', 'admin', 'supplier'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inventory log',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified inventory log
     */
    public function show($id)
    {
        try {
            $log = InventoryLog::with(['product', 'branch', 'admin', 'supplier'])->find($id);

            if (!$log) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory log not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $log
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inventory log',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current inventory status for all products in a branch
     */
    public function getInventoryStatus(Request $request)
    {
        try {
            $branchId = $request->get('branch_id');
            
            if (!$branchId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch ID is required'
                ], 400);
            }

            $products = Product::where('branch_id', $branchId)
                ->where('is_active', true)
                ->get();

            $inventoryStatus = $products->map(function ($product) use ($branchId) {
                $currentStock = $product->getCurrentStock($branchId);
                
                return [
                    'product_id' => $product->product_id,
                    'product_name' => $product->name,
                    'category' => $product->category,
                    'current_stock' => $currentStock,
                    'product_unit' => $product->product_unit,
                    'base_price' => $product->base_price
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $inventoryStatus
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inventory status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory summary for dashboard
     */
    public function getInventorySummary(Request $request)
    {
        try {
            $branchId = $request->get('branch_id');
            
            // If no branch_id is provided, get all products (for SuperAdmin)
            if ($branchId) {
                $products = Product::where('branch_id', $branchId)
                    ->where('is_active', true)
                    ->get();
            } else {
                $products = Product::where('is_active', true)->get();
            }

            $totalProducts = $products->count();
            $lowStockProducts = 0;
            $outOfStockProducts = 0;
            $totalValue = 0;

            foreach ($products as $product) {
                // If no branch_id, get stock for the product's branch
                $stockBranchId = $branchId ? $branchId : $product->branch_id;
                $currentStock = $product->getCurrentStock($stockBranchId);
                $productValue = $currentStock * $product->base_price;
                $totalValue += $productValue;

                if ($currentStock <= 0) {
                    $outOfStockProducts++;
                } elseif ($currentStock <= 10) { // Assuming 10 is low stock threshold
                    $lowStockProducts++;
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_products' => $totalProducts,
                    'low_stock_products' => $lowStockProducts,
                    'out_of_stock_products' => $outOfStockProducts,
                    'total_inventory_value' => $totalValue
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inventory summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get change types for dropdown
     */
    public function getChangeTypes()
    {
        try {
            $changeTypes = [
                ['value' => 'restock', 'label' => 'Restock'],
                ['value' => 'waste', 'label' => 'Waste'],
                ['value' => 'sale', 'label' => 'Sale'],
                ['value' => 'adjustment', 'label' => 'Adjustment'],
                ['value' => 'return', 'label' => 'Return']
            ];

            return response()->json([
                'success' => true,
                'data' => $changeTypes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch change types',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
