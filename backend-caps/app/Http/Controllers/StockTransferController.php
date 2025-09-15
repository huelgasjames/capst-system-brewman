<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockTransferController extends Controller
{
    public function index(Request $request)
    {
        $query = StockTransfer::with(['fromBranch', 'toBranch', 'requestedBy', 'approvedBy', 'items.product']);

        // Filter by branch if user is branch manager
        if (Auth::user()->role === 'Branch Manager') {
            $query->where(function ($q) {
                $q->where('from_branch_id', Auth::user()->branch_id)
                  ->orWhere('to_branch_id', Auth::user()->branch_id);
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by from branch
        if ($request->has('from_branch_id') && $request->from_branch_id) {
            $query->where('from_branch_id', $request->from_branch_id);
        }

        // Filter by to branch
        if ($request->has('to_branch_id') && $request->to_branch_id) {
            $query->where('to_branch_id', $request->to_branch_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->where('request_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('request_date', '<=', $request->date_to);
        }

        $stockTransfers = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($stockTransfers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'to_branch_id' => 'required|exists:branches,branch_id|different:from_branch_id',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,product_id',
            'items.*.requested_quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:500'
        ]);

        // Check if user is branch manager and can only transfer from their branch
        if (Auth::user()->role === 'Branch Manager') {
            $request->merge(['from_branch_id' => Auth::user()->branch_id]);
        } else {
            $request->validate(['from_branch_id' => 'required|exists:branches,branch_id']);
        }

        DB::beginTransaction();
        try {
            $stockTransfer = StockTransfer::create([
                'transfer_number' => StockTransfer::generateTransferNumber(),
                'from_branch_id' => $request->from_branch_id,
                'to_branch_id' => $request->to_branch_id,
                'status' => StockTransfer::STATUS_PENDING,
                'request_date' => now()->toDateString(),
                'notes' => $request->notes,
                'requested_by' => Auth::id()
            ]);

            foreach ($request->items as $item) {
                // Check if product has sufficient stock in source branch
                $product = Product::findOrFail($item['product_id']);
                $currentStock = $product->getCurrentStock($request->from_branch_id);
                
                if ($currentStock < $item['requested_quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}. Available: {$currentStock}, Requested: {$item['requested_quantity']}");
                }

                StockTransferItem::create([
                    'transfer_id' => $stockTransfer->transfer_id,
                    'product_id' => $item['product_id'],
                    'requested_quantity' => $item['requested_quantity'],
                    'notes' => $item['notes'] ?? null
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Stock transfer request created successfully',
                'stock_transfer' => $stockTransfer->load(['fromBranch', 'toBranch', 'requestedBy', 'items.product'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create stock transfer: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $stockTransfer = StockTransfer::with([
            'fromBranch', 
            'toBranch', 
            'requestedBy', 
            'approvedBy', 
            'items.product'
        ])->findOrFail($id);

        // Check if user has access to this stock transfer
        if (Auth::user()->role === 'Branch Manager') {
            if ($stockTransfer->from_branch_id !== Auth::user()->branch_id && 
                $stockTransfer->to_branch_id !== Auth::user()->branch_id) {
                return response()->json(['error' => 'Unauthorized access'], 403);
            }
        }

        return response()->json($stockTransfer);
    }

    public function update(Request $request, $id)
    {
        $stockTransfer = StockTransfer::findOrFail($id);

        // Check if user has access and can modify
        if (Auth::user()->role === 'Branch Manager' && $stockTransfer->from_branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$stockTransfer->canBeModified()) {
            return response()->json(['error' => 'Stock transfer cannot be modified in current status'], 400);
        }

        $request->validate([
            'to_branch_id' => 'required|exists:branches,branch_id|different:from_branch_id',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,product_id',
            'items.*.requested_quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            $stockTransfer->update([
                'to_branch_id' => $request->to_branch_id,
                'notes' => $request->notes
            ]);

            // Delete existing items and create new ones
            $stockTransfer->items()->delete();

            foreach ($request->items as $item) {
                // Check if product has sufficient stock in source branch
                $product = Product::findOrFail($item['product_id']);
                $currentStock = $product->getCurrentStock($stockTransfer->from_branch_id);
                
                if ($currentStock < $item['requested_quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}. Available: {$currentStock}, Requested: {$item['requested_quantity']}");
                }

                StockTransferItem::create([
                    'transfer_id' => $stockTransfer->transfer_id,
                    'product_id' => $item['product_id'],
                    'requested_quantity' => $item['requested_quantity'],
                    'notes' => $item['notes'] ?? null
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Stock transfer updated successfully',
                'stock_transfer' => $stockTransfer->load(['fromBranch', 'toBranch', 'requestedBy', 'items.product'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update stock transfer: ' . $e->getMessage()], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        $stockTransfer = StockTransfer::findOrFail($id);

        // Only admin can approve
        if (Auth::user()->role !== 'Admin') {
            return response()->json(['error' => 'Only admin can approve stock transfers'], 403);
        }

        if (!$stockTransfer->canBeApproved()) {
            return response()->json(['error' => 'Stock transfer cannot be approved in current status'], 400);
        }

        $request->validate([
            'approved_items' => 'required|array',
            'approved_items.*.item_id' => 'required|exists:stock_transfer_items,item_id',
            'approved_items.*.approved_quantity' => 'required|integer|min:0'
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->approved_items as $approvedItem) {
                $item = StockTransferItem::findOrFail($approvedItem['item_id']);
                
                if ($approvedItem['approved_quantity'] > $item->requested_quantity) {
                    throw new \Exception('Approved quantity cannot exceed requested quantity');
                }

                // Check if product still has sufficient stock
                $product = Product::findOrFail($item->product_id);
                $currentStock = $product->getCurrentStock($stockTransfer->from_branch_id);
                
                if ($currentStock < $approvedItem['approved_quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}. Available: {$currentStock}, Approved: {$approvedItem['approved_quantity']}");
                }

                $item->update(['approved_quantity' => $approvedItem['approved_quantity']]);
            }

            $stockTransfer->update([
                'status' => StockTransfer::STATUS_APPROVED,
                'approved_by' => Auth::id(),
                'approved_date' => now()->toDateString()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Stock transfer approved successfully',
                'stock_transfer' => $stockTransfer->load(['fromBranch', 'toBranch', 'requestedBy', 'approvedBy', 'items.product'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to approve stock transfer: ' . $e->getMessage()], 500);
        }
    }

    public function complete(Request $request, $id)
    {
        $stockTransfer = StockTransfer::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $stockTransfer->to_branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$stockTransfer->canBeCompleted()) {
            return response()->json(['error' => 'Stock transfer cannot be completed in current status'], 400);
        }

        $request->validate([
            'transferred_items' => 'required|array',
            'transferred_items.*.item_id' => 'required|exists:stock_transfer_items,item_id',
            'transferred_items.*.transferred_quantity' => 'required|integer|min:0'
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->transferred_items as $transferredItem) {
                $item = StockTransferItem::findOrFail($transferredItem['item_id']);
                
                if ($transferredItem['transferred_quantity'] > $item->approved_quantity) {
                    throw new \Exception('Transferred quantity cannot exceed approved quantity');
                }

                $item->update(['transferred_quantity' => $transferredItem['transferred_quantity']]);

                // Create inventory log entries
                if ($transferredItem['transferred_quantity'] > 0) {
                    // Out from source branch
                    InventoryLog::create([
                        'product_id' => $item->product_id,
                        'branch_id' => $stockTransfer->from_branch_id,
                        'change_type' => 'transfer_out',
                        'quantity' => $transferredItem['transferred_quantity'],
                        'notes' => "Stock transfer to {$stockTransfer->toBranch->branch_name}: {$stockTransfer->transfer_number}",
                        'admin_id' => Auth::id()
                    ]);

                    // In to destination branch
                    InventoryLog::create([
                        'product_id' => $item->product_id,
                        'branch_id' => $stockTransfer->to_branch_id,
                        'change_type' => 'transfer_in',
                        'quantity' => $transferredItem['transferred_quantity'],
                        'notes' => "Stock transfer from {$stockTransfer->fromBranch->branch_name}: {$stockTransfer->transfer_number}",
                        'admin_id' => Auth::id()
                    ]);
                }
            }

            $stockTransfer->update([
                'status' => StockTransfer::STATUS_COMPLETED,
                'completed_date' => now()->toDateString()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Stock transfer completed successfully',
                'stock_transfer' => $stockTransfer->load(['fromBranch', 'toBranch', 'requestedBy', 'approvedBy', 'items.product'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to complete stock transfer: ' . $e->getMessage()], 500);
        }
    }

    public function reject($id)
    {
        $stockTransfer = StockTransfer::findOrFail($id);

        // Only admin can reject
        if (Auth::user()->role !== 'Admin') {
            return response()->json(['error' => 'Only admin can reject stock transfers'], 403);
        }

        if (!$stockTransfer->canBeApproved()) {
            return response()->json(['error' => 'Stock transfer cannot be rejected in current status'], 400);
        }

        $stockTransfer->update(['status' => StockTransfer::STATUS_REJECTED]);

        return response()->json([
            'message' => 'Stock transfer rejected successfully',
            'stock_transfer' => $stockTransfer->load(['fromBranch', 'toBranch', 'requestedBy', 'items.product'])
        ]);
    }

    public function cancel($id)
    {
        $stockTransfer = StockTransfer::findOrFail($id);

        // Check if user has access
        if (Auth::user()->role === 'Branch Manager' && $stockTransfer->from_branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$stockTransfer->canBeCancelled()) {
            return response()->json(['error' => 'Stock transfer cannot be cancelled in current status'], 400);
        }

        $stockTransfer->update(['status' => StockTransfer::STATUS_CANCELLED]);

        return response()->json([
            'message' => 'Stock transfer cancelled successfully',
            'stock_transfer' => $stockTransfer->load(['fromBranch', 'toBranch', 'requestedBy', 'items.product'])
        ]);
    }
}
