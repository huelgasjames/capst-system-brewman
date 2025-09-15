<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['branch', 'supplier', 'createdBy', 'approvedBy', 'items.product']);

        // Filter by branch if user is branch manager
        if (Auth::user()->role === 'Branch Manager') {
            $query->where('branch_id', Auth::user()->branch_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by supplier
        if ($request->has('supplier_id') && $request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->where('order_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('order_date', '<=', $request->date_to);
        }

        $purchaseOrders = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($purchaseOrders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,supplier_id',
            'expected_delivery_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,product_id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            $purchaseOrder = PurchaseOrder::create([
                'order_number' => PurchaseOrder::generateOrderNumber(),
                'branch_id' => Auth::user()->branch_id,
                'supplier_id' => $request->supplier_id,
                'status' => PurchaseOrder::STATUS_DRAFT,
                'order_date' => now()->toDateString(),
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes,
                'created_by' => Auth::id()
            ]);

            $totalAmount = 0;
            foreach ($request->items as $item) {
                $itemTotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $itemTotal;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->purchase_order_id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $itemTotal,
                    'notes' => $item['notes'] ?? null
                ]);
            }

            $purchaseOrder->update(['total_amount' => $totalAmount]);

            DB::commit();

            return response()->json([
                'message' => 'Purchase order created successfully',
                'purchase_order' => $purchaseOrder->load(['branch', 'supplier', 'createdBy', 'items.product'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create purchase order: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $purchaseOrder = PurchaseOrder::with([
            'branch', 
            'supplier', 
            'createdBy', 
            'approvedBy', 
            'items.product'
        ])->findOrFail($id);

        // Check if user has access to this purchase order
        if (Auth::user()->role === 'Branch Manager' && $purchaseOrder->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        return response()->json($purchaseOrder);
    }

    public function update(Request $request, $id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Check if user has access and can modify
        if (Auth::user()->role === 'Branch Manager' && $purchaseOrder->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$purchaseOrder->canBeModified()) {
            return response()->json(['error' => 'Purchase order cannot be modified in current status'], 400);
        }

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,supplier_id',
            'expected_delivery_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,product_id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            $purchaseOrder->update([
                'supplier_id' => $request->supplier_id,
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes
            ]);

            // Delete existing items and create new ones
            $purchaseOrder->items()->delete();

            $totalAmount = 0;
            foreach ($request->items as $item) {
                $itemTotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $itemTotal;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->purchase_order_id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $itemTotal,
                    'notes' => $item['notes'] ?? null
                ]);
            }

            $purchaseOrder->update(['total_amount' => $totalAmount]);

            DB::commit();

            return response()->json([
                'message' => 'Purchase order updated successfully',
                'purchase_order' => $purchaseOrder->load(['branch', 'supplier', 'createdBy', 'items.product'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update purchase order: ' . $e->getMessage()], 500);
        }
    }

    public function submitForApproval($id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $purchaseOrder->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if ($purchaseOrder->status !== PurchaseOrder::STATUS_DRAFT) {
            return response()->json(['error' => 'Only draft purchase orders can be submitted for approval'], 400);
        }

        $purchaseOrder->update(['status' => PurchaseOrder::STATUS_PENDING_APPROVAL]);

        return response()->json([
            'message' => 'Purchase order submitted for approval',
            'purchase_order' => $purchaseOrder->load(['branch', 'supplier', 'createdBy', 'items.product'])
        ]);
    }

    public function approve($id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Only admin can approve
        if (Auth::user()->role !== 'Admin') {
            return response()->json(['error' => 'Only admin can approve purchase orders'], 403);
        }

        if (!$purchaseOrder->canBeApproved()) {
            return response()->json(['error' => 'Purchase order cannot be approved in current status'], 400);
        }

        $purchaseOrder->update([
            'status' => PurchaseOrder::STATUS_APPROVED,
            'approved_by' => Auth::id(),
            'approved_at' => now()
        ]);

        return response()->json([
            'message' => 'Purchase order approved successfully',
            'purchase_order' => $purchaseOrder->load(['branch', 'supplier', 'createdBy', 'approvedBy', 'items.product'])
        ]);
    }

    public function markAsDelivered(Request $request, $id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $purchaseOrder->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$purchaseOrder->canBeDelivered()) {
            return response()->json(['error' => 'Purchase order cannot be marked as delivered in current status'], 400);
        }

        $request->validate([
            'received_items' => 'required|array',
            'received_items.*.item_id' => 'required|exists:purchase_order_items,item_id',
            'received_items.*.received_quantity' => 'required|integer|min:0'
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->received_items as $receivedItem) {
                $item = PurchaseOrderItem::findOrFail($receivedItem['item_id']);
                
                if ($receivedItem['received_quantity'] > $item->quantity) {
                    throw new \Exception('Received quantity cannot exceed ordered quantity');
                }

                $item->update(['received_quantity' => $receivedItem['received_quantity']]);

                // Create inventory log entry for received items
                if ($receivedItem['received_quantity'] > 0) {
                    InventoryLog::create([
                        'product_id' => $item->product_id,
                        'branch_id' => $purchaseOrder->branch_id,
                        'change_type' => 'restock',
                        'quantity' => $receivedItem['received_quantity'],
                        'supplier_id' => $purchaseOrder->supplier_id,
                        'notes' => "Purchase order delivery: {$purchaseOrder->order_number}",
                        'admin_id' => Auth::id()
                    ]);
                }
            }

            $purchaseOrder->update([
                'status' => PurchaseOrder::STATUS_DELIVERED,
                'actual_delivery_date' => now()->toDateString()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Purchase order marked as delivered successfully',
                'purchase_order' => $purchaseOrder->load(['branch', 'supplier', 'createdBy', 'approvedBy', 'items.product'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to mark as delivered: ' . $e->getMessage()], 500);
        }
    }

    public function cancel($id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $purchaseOrder->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!in_array($purchaseOrder->status, [PurchaseOrder::STATUS_DRAFT, PurchaseOrder::STATUS_PENDING_APPROVAL])) {
            return response()->json(['error' => 'Purchase order cannot be cancelled in current status'], 400);
        }

        $purchaseOrder->update(['status' => PurchaseOrder::STATUS_CANCELLED]);

        return response()->json([
            'message' => 'Purchase order cancelled successfully',
            'purchase_order' => $purchaseOrder->load(['branch', 'supplier', 'createdBy', 'items.product'])
        ]);
    }

    public function getLowStockProducts()
    {
        $branchId = Auth::user()->branch_id;
        
        $lowStockProducts = Product::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get()
            ->filter(function ($product) use ($branchId) {
                return $product->isLowStock($branchId);
            })
            ->map(function ($product) use ($branchId) {
                return [
                    'product_id' => $product->product_id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'current_stock' => $product->getCurrentStock($branchId),
                    'low_stock_threshold' => $product->low_stock_threshold,
                    'base_price' => $product->base_price,
                    'product_unit' => $product->product_unit
                ];
            });

        return response()->json($lowStockProducts->values());
    }
}
