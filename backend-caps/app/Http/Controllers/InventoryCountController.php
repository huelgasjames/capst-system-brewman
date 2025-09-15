<?php

namespace App\Http\Controllers;

use App\Models\InventoryCount;
use App\Models\InventoryCountItem;
use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InventoryCountController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryCount::with(['branch', 'conductedBy', 'approvedBy', 'items.product']);

        // Filter by branch if user is branch manager
        if (Auth::user()->role === 'Branch Manager') {
            $query->where('branch_id', Auth::user()->branch_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->where('count_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('count_date', '<=', $request->date_to);
        }

        $inventoryCounts = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($inventoryCounts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'count_date' => 'required|date',
            'notes' => 'nullable|string|max:1000'
        ]);

        // Check if user is branch manager and can only count their branch's inventory
        if (Auth::user()->role === 'Branch Manager') {
            $request->merge(['branch_id' => Auth::user()->branch_id]);
        } else {
            $request->validate(['branch_id' => 'required|exists:branches,branch_id']);
        }

        $inventoryCount = InventoryCount::create([
            'count_number' => InventoryCount::generateCountNumber(),
            'branch_id' => $request->branch_id,
            'count_date' => $request->count_date,
            'status' => InventoryCount::STATUS_IN_PROGRESS,
            'notes' => $request->notes,
            'conducted_by' => Auth::id()
        ]);

        return response()->json([
            'message' => 'Inventory count created successfully',
            'inventory_count' => $inventoryCount->load(['branch', 'conductedBy'])
        ], 201);
    }

    public function show($id)
    {
        $inventoryCount = InventoryCount::with([
            'branch', 
            'conductedBy', 
            'approvedBy', 
            'items.product'
        ])->findOrFail($id);

        // Check if user has access to this inventory count
        if (Auth::user()->role === 'Branch Manager' && $inventoryCount->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        return response()->json($inventoryCount);
    }

    public function update(Request $request, $id)
    {
        $inventoryCount = InventoryCount::findOrFail($id);

        // Check if user has access and can modify
        if (Auth::user()->role === 'Branch Manager' && $inventoryCount->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$inventoryCount->canBeModified()) {
            return response()->json(['error' => 'Inventory count cannot be modified in current status'], 400);
        }

        $request->validate([
            'count_date' => 'required|date',
            'notes' => 'nullable|string|max:1000'
        ]);

        $inventoryCount->update([
            'count_date' => $request->count_date,
            'notes' => $request->notes
        ]);

        return response()->json([
            'message' => 'Inventory count updated successfully',
            'inventory_count' => $inventoryCount->load(['branch', 'conductedBy'])
        ]);
    }

    public function addItem(Request $request, $id)
    {
        $inventoryCount = InventoryCount::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $inventoryCount->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$inventoryCount->canBeModified()) {
            return response()->json(['error' => 'Cannot add items to inventory count in current status'], 400);
        }

        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'counted_quantity' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500'
        ]);

        // Check if product belongs to the branch
        $product = Product::findOrFail($request->product_id);
        if ($product->branch_id !== $inventoryCount->branch_id) {
            return response()->json(['error' => 'Product does not belong to the specified branch'], 400);
        }

        // Check if item already exists
        $existingItem = InventoryCountItem::where('count_id', $id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingItem) {
            return response()->json(['error' => 'Product already added to this inventory count'], 400);
        }

        $systemQuantity = $product->getCurrentStock($inventoryCount->branch_id);
        $variance = $request->counted_quantity - $systemQuantity;

        $item = InventoryCountItem::create([
            'count_id' => $id,
            'product_id' => $request->product_id,
            'system_quantity' => $systemQuantity,
            'counted_quantity' => $request->counted_quantity,
            'variance' => $variance,
            'notes' => $request->notes
        ]);

        return response()->json([
            'message' => 'Item added to inventory count successfully',
            'item' => $item->load('product')
        ], 201);
    }

    public function updateItem(Request $request, $id, $itemId)
    {
        $inventoryCount = InventoryCount::findOrFail($id);
        $item = InventoryCountItem::findOrFail($itemId);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $inventoryCount->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$inventoryCount->canBeModified()) {
            return response()->json(['error' => 'Cannot modify items in inventory count in current status'], 400);
        }

        $request->validate([
            'counted_quantity' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500'
        ]);

        $variance = $request->counted_quantity - $item->system_quantity;

        $item->update([
            'counted_quantity' => $request->counted_quantity,
            'variance' => $variance,
            'notes' => $request->notes
        ]);

        return response()->json([
            'message' => 'Item updated successfully',
            'item' => $item->load('product')
        ]);
    }

    public function removeItem($id, $itemId)
    {
        $inventoryCount = InventoryCount::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $inventoryCount->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$inventoryCount->canBeModified()) {
            return response()->json(['error' => 'Cannot remove items from inventory count in current status'], 400);
        }

        $item = InventoryCountItem::findOrFail($itemId);
        $item->delete();

        return response()->json(['message' => 'Item removed from inventory count successfully']);
    }

    public function complete($id)
    {
        $inventoryCount = InventoryCount::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $inventoryCount->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$inventoryCount->canBeCompleted()) {
            return response()->json(['error' => 'Inventory count cannot be completed in current status'], 400);
        }

        // Check if there are items in the count
        if ($inventoryCount->items()->count() === 0) {
            return response()->json(['error' => 'Cannot complete inventory count without any items'], 400);
        }

        $inventoryCount->update(['status' => InventoryCount::STATUS_COMPLETED]);

        return response()->json([
            'message' => 'Inventory count completed successfully',
            'inventory_count' => $inventoryCount->load(['branch', 'conductedBy', 'items.product'])
        ]);
    }

    public function approve($id)
    {
        $inventoryCount = InventoryCount::findOrFail($id);

        // Only admin can approve
        if (Auth::user()->role !== 'Admin') {
            return response()->json(['error' => 'Only admin can approve inventory counts'], 403);
        }

        if (!$inventoryCount->canBeApproved()) {
            return response()->json(['error' => 'Inventory count cannot be approved in current status'], 400);
        }

        DB::beginTransaction();
        try {
            // Create inventory log entries for items with variance
            $itemsWithVariance = $inventoryCount->getItemsWithVariance();
            
            foreach ($itemsWithVariance as $item) {
                if ($item->variance !== 0) {
                    InventoryLog::create([
                        'product_id' => $item->product_id,
                        'branch_id' => $inventoryCount->branch_id,
                        'change_type' => 'adjustment',
                        'quantity' => $item->variance,
                        'notes' => "Inventory count adjustment: {$inventoryCount->count_number}",
                        'admin_id' => Auth::id()
                    ]);
                }
            }

            $inventoryCount->update([
                'status' => InventoryCount::STATUS_APPROVED,
                'approved_by' => Auth::id(),
                'approved_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Inventory count approved successfully',
                'inventory_count' => $inventoryCount->load(['branch', 'conductedBy', 'approvedBy', 'items.product'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to approve inventory count: ' . $e->getMessage()], 500);
        }
    }

    public function getProductsForCount($id)
    {
        $inventoryCount = InventoryCount::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $inventoryCount->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        // Get products for the branch that are not already in the count
        $existingProductIds = $inventoryCount->items()->pluck('product_id')->toArray();

        $products = Product::where('branch_id', $inventoryCount->branch_id)
            ->where('is_active', true)
            ->whereNotIn('product_id', $existingProductIds)
            ->select('product_id', 'name', 'category', 'product_unit')
            ->get()
            ->map(function ($product) use ($inventoryCount) {
                return [
                    'product_id' => $product->product_id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'product_unit' => $product->product_unit,
                    'current_stock' => $product->getCurrentStock($inventoryCount->branch_id)
                ];
            });

        return response()->json($products);
    }
}
