<?php

namespace App\Http\Controllers;

use App\Models\StockAdjustment;
use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        $query = StockAdjustment::with(['branch', 'product', 'adjustedBy', 'approvedBy']);

        // Filter by branch if user is branch manager
        if (Auth::user()->role === 'Branch Manager') {
            $query->where('branch_id', Auth::user()->branch_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by adjustment type
        if ($request->has('adjustment_type') && $request->adjustment_type) {
            $query->where('adjustment_type', $request->adjustment_type);
        }

        // Filter by product
        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->where('adjustment_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('adjustment_date', '<=', $request->date_to);
        }

        $stockAdjustments = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($stockAdjustments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'adjustment_type' => 'required|in:increase,decrease',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'adjustment_date' => 'required|date'
        ]);

        // Check if user is branch manager and can only adjust their branch's stock
        if (Auth::user()->role === 'Branch Manager') {
            $request->merge(['branch_id' => Auth::user()->branch_id]);
        } else {
            $request->validate(['branch_id' => 'required|exists:branches,branch_id']);
        }

        // Check if product belongs to the branch
        $product = Product::findOrFail($request->product_id);
        if ($product->branch_id !== $request->branch_id) {
            return response()->json(['error' => 'Product does not belong to the specified branch'], 400);
        }

        // For decrease adjustments, check if there's sufficient stock
        if ($request->adjustment_type === StockAdjustment::TYPE_DECREASE) {
            $currentStock = $product->getCurrentStock($request->branch_id);
            if ($currentStock < $request->quantity) {
                return response()->json([
                    'error' => 'Insufficient stock for adjustment. Current stock: ' . $currentStock . ', Adjustment: ' . $request->quantity
                ], 400);
            }
        }

        $stockAdjustment = StockAdjustment::create([
            'adjustment_number' => StockAdjustment::generateAdjustmentNumber(),
            'branch_id' => $request->branch_id,
            'product_id' => $request->product_id,
            'adjustment_type' => $request->adjustment_type,
            'quantity' => $request->quantity,
            'reason' => $request->reason,
            'notes' => $request->notes,
            'adjusted_by' => Auth::id(),
            'status' => StockAdjustment::STATUS_PENDING,
            'adjustment_date' => $request->adjustment_date
        ]);

        return response()->json([
            'message' => 'Stock adjustment created successfully',
            'stock_adjustment' => $stockAdjustment->load(['branch', 'product', 'adjustedBy'])
        ], 201);
    }

    public function show($id)
    {
        $stockAdjustment = StockAdjustment::with([
            'branch', 
            'product', 
            'adjustedBy', 
            'approvedBy'
        ])->findOrFail($id);

        // Check if user has access to this stock adjustment
        if (Auth::user()->role === 'Branch Manager' && $stockAdjustment->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        return response()->json($stockAdjustment);
    }

    public function update(Request $request, $id)
    {
        $stockAdjustment = StockAdjustment::findOrFail($id);

        // Check if user has access and can modify
        if (Auth::user()->role === 'Branch Manager' && $stockAdjustment->branch_id !== Auth::user()->branch_id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        if (!$stockAdjustment->canBeModified()) {
            return response()->json(['error' => 'Stock adjustment cannot be modified in current status'], 400);
        }

        $request->validate([
            'adjustment_type' => 'required|in:increase,decrease',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'adjustment_date' => 'required|date'
        ]);

        // For decrease adjustments, check if there's sufficient stock
        if ($request->adjustment_type === StockAdjustment::TYPE_DECREASE) {
            $product = Product::findOrFail($stockAdjustment->product_id);
            $currentStock = $product->getCurrentStock($stockAdjustment->branch_id);
            if ($currentStock < $request->quantity) {
                return response()->json([
                    'error' => 'Insufficient stock for adjustment. Current stock: ' . $currentStock . ', Adjustment: ' . $request->quantity
                ], 400);
            }
        }

        $stockAdjustment->update([
            'adjustment_type' => $request->adjustment_type,
            'quantity' => $request->quantity,
            'reason' => $request->reason,
            'notes' => $request->notes,
            'adjustment_date' => $request->adjustment_date
        ]);

        return response()->json([
            'message' => 'Stock adjustment updated successfully',
            'stock_adjustment' => $stockAdjustment->load(['branch', 'product', 'adjustedBy'])
        ]);
    }

    public function approve($id)
    {
        $stockAdjustment = StockAdjustment::findOrFail($id);

        // Only admin can approve
        if (Auth::user()->role !== 'Admin') {
            return response()->json(['error' => 'Only admin can approve stock adjustments'], 403);
        }

        if (!$stockAdjustment->canBeApproved()) {
            return response()->json(['error' => 'Stock adjustment cannot be approved in current status'], 400);
        }

        DB::beginTransaction();
        try {
            // Create inventory log entry
            InventoryLog::create([
                'product_id' => $stockAdjustment->product_id,
                'branch_id' => $stockAdjustment->branch_id,
                'change_type' => 'adjustment',
                'quantity' => $stockAdjustment->getEffectiveQuantity(),
                'notes' => "Stock adjustment: {$stockAdjustment->reason} - {$stockAdjustment->adjustment_number}",
                'admin_id' => Auth::id()
            ]);

            $stockAdjustment->update([
                'status' => StockAdjustment::STATUS_APPROVED,
                'approved_by' => Auth::id()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Stock adjustment approved successfully',
                'stock_adjustment' => $stockAdjustment->load(['branch', 'product', 'adjustedBy', 'approvedBy'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to approve stock adjustment: ' . $e->getMessage()], 500);
        }
    }

    public function reject($id)
    {
        $stockAdjustment = StockAdjustment::findOrFail($id);

        // Only admin can reject
        if (Auth::user()->role !== 'Admin') {
            return response()->json(['error' => 'Only admin can reject stock adjustments'], 403);
        }

        if (!$stockAdjustment->canBeApproved()) {
            return response()->json(['error' => 'Stock adjustment cannot be rejected in current status'], 400);
        }

        $stockAdjustment->update(['status' => StockAdjustment::STATUS_REJECTED]);

        return response()->json([
            'message' => 'Stock adjustment rejected successfully',
            'stock_adjustment' => $stockAdjustment->load(['branch', 'product', 'adjustedBy'])
        ]);
    }

    public function getAdjustmentReasons()
    {
        $reasons = [
            'Damaged goods',
            'Expired products',
            'Theft/Loss',
            'Found stock',
            'Return from customer',
            'Quality control rejection',
            'Physical count variance',
            'Other'
        ];

        return response()->json($reasons);
    }
}
