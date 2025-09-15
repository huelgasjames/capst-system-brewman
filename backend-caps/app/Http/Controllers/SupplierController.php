<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active);
        }

        // Search by name
        if ($request->has('search') && $request->search) {
            $query->where('supplier_name', 'like', '%' . $request->search . '%');
        }

        $suppliers = $query->orderBy('supplier_name')->paginate(15);

        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'payment_terms' => 'nullable|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000'
        ]);

        $supplier = Supplier::create($request->all());

        return response()->json([
            'message' => 'Supplier created successfully',
            'supplier' => $supplier
        ], 201);
    }

    public function show($id)
    {
        $supplier = Supplier::with(['purchaseOrders' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(10);
        }])->findOrFail($id);

        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $request->validate([
            'supplier_name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'payment_terms' => 'nullable|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000'
        ]);

        $supplier->update($request->all());

        return response()->json([
            'message' => 'Supplier updated successfully',
            'supplier' => $supplier
        ]);
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);

        // Check if supplier has any purchase orders
        $purchaseOrderCount = $supplier->purchaseOrders()->count();
        if ($purchaseOrderCount > 0) {
            return response()->json([
                'error' => 'Cannot delete supplier with existing purchase orders. Please deactivate instead.'
            ], 400);
        }

        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }

    public function getActiveSuppliers()
    {
        $suppliers = Supplier::where('is_active', true)
            ->orderBy('supplier_name')
            ->select('supplier_id', 'supplier_name', 'contact_person', 'phone', 'email')
            ->get();

        return response()->json($suppliers);
    }

    public function getSupplierStats($id)
    {
        $supplier = Supplier::findOrFail($id);

        $stats = [
            'total_orders' => $supplier->purchaseOrders()->count(),
            'total_amount' => $supplier->purchaseOrders()->sum('total_amount'),
            'pending_orders' => $supplier->purchaseOrders()
                ->whereIn('status', [
                    PurchaseOrder::STATUS_PENDING_APPROVAL,
                    PurchaseOrder::STATUS_APPROVED,
                    PurchaseOrder::STATUS_ORDERED
                ])->count(),
            'pending_amount' => $supplier->purchaseOrders()
                ->whereIn('status', [
                    PurchaseOrder::STATUS_PENDING_APPROVAL,
                    PurchaseOrder::STATUS_APPROVED,
                    PurchaseOrder::STATUS_ORDERED
                ])->sum('total_amount'),
            'delivered_orders' => $supplier->purchaseOrders()
                ->where('status', PurchaseOrder::STATUS_DELIVERED)
                ->count(),
            'credit_limit_usage' => $supplier->credit_limit ? 
                ($supplier->getPendingOrdersTotal() / $supplier->credit_limit) * 100 : 0
        ];

        return response()->json($stats);
    }
}
