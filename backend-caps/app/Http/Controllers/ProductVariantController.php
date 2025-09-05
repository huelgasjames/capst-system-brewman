<?php

namespace App\Http\Controllers;

use App\Models\ProductVariant;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductVariantController extends Controller
{
    /**
     * Display a listing of product variants
     */
    public function index(Request $request)
    {
        try {
            $query = ProductVariant::with(['product']);

            // Filter by product if specified
            if ($request->has('product_id')) {
                $query->where('product_id', $request->product_id);
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Sort
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $variants = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $variants
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product variants',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created product variant
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,product_id',
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $variant = ProductVariant::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Product variant created successfully',
                'data' => $variant->load(['product'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product variant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified product variant
     */
    public function show($id)
    {
        try {
            $variant = ProductVariant::with(['product'])->find($id);

            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product variant not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $variant
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product variant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified product variant
     */
    public function update(Request $request, $id)
    {
        try {
            $variant = ProductVariant::find($id);

            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product variant not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'product_id' => 'sometimes|required|exists:products,product_id',
                'name' => 'sometimes|required|string|max:255',
                'price' => 'sometimes|required|numeric|min:0',
                'description' => 'nullable|string',
                'is_active' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $variant->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Product variant updated successfully',
                'data' => $variant->load(['product'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product variant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified product variant
     */
    public function destroy($id)
    {
        try {
            $variant = ProductVariant::find($id);

            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product variant not found'
                ], 404);
            }

            $variant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product variant deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product variant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get variants for a specific product
     */
    public function getByProduct($productId)
    {
        try {
            $product = Product::find($productId);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $variants = $product->variants()->where('is_active', true)->get();

            return response()->json([
                'success' => true,
                'data' => $variants
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product variants',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
