import api from './api';

// Purchase Order Management
export const purchaseOrderService = {
  // Get all purchase orders
  getPurchaseOrders: (params = {}) => {
    return api.get('/purchase-orders', { params });
  },

  // Get purchase order by ID
  getPurchaseOrder: (id) => {
    return api.get(`/purchase-orders/${id}`);
  },

  // Create purchase order
  createPurchaseOrder: (data) => {
    return api.post('/purchase-orders', data);
  },

  // Update purchase order
  updatePurchaseOrder: (id, data) => {
    return api.put(`/purchase-orders/${id}`, data);
  },

  // Submit purchase order for approval
  submitForApproval: (id) => {
    return api.post(`/purchase-orders/${id}/submit`);
  },

  // Approve purchase order
  approvePurchaseOrder: (id) => {
    return api.post(`/purchase-orders/${id}/approve`);
  },

  // Mark purchase order as delivered
  markAsDelivered: (id, data) => {
    return api.post(`/purchase-orders/${id}/deliver`, data);
  },

  // Cancel purchase order
  cancelPurchaseOrder: (id) => {
    return api.post(`/purchase-orders/${id}/cancel`);
  },

  // Get low stock products for purchase orders
  getLowStockProducts: () => {
    return api.get('/purchase-orders/low-stock-products');
  }
};

// Stock Transfer Management
export const stockTransferService = {
  // Get all stock transfers
  getStockTransfers: (params = {}) => {
    return api.get('/stock-transfers', { params });
  },

  // Get stock transfer by ID
  getStockTransfer: (id) => {
    return api.get(`/stock-transfers/${id}`);
  },

  // Create stock transfer
  createStockTransfer: (data) => {
    return api.post('/stock-transfers', data);
  },

  // Update stock transfer
  updateStockTransfer: (id, data) => {
    return api.put(`/stock-transfers/${id}`, data);
  },

  // Approve stock transfer
  approveStockTransfer: (id, data) => {
    return api.post(`/stock-transfers/${id}/approve`, data);
  },

  // Complete stock transfer
  completeStockTransfer: (id, data) => {
    return api.post(`/stock-transfers/${id}/complete`, data);
  },

  // Reject stock transfer
  rejectStockTransfer: (id) => {
    return api.post(`/stock-transfers/${id}/reject`);
  },

  // Cancel stock transfer
  cancelStockTransfer: (id) => {
    return api.post(`/stock-transfers/${id}/cancel`);
  }
};

// Stock Adjustment Management
export const stockAdjustmentService = {
  // Get all stock adjustments
  getStockAdjustments: (params = {}) => {
    return api.get('/stock-adjustments', { params });
  },

  // Get stock adjustment by ID
  getStockAdjustment: (id) => {
    return api.get(`/stock-adjustments/${id}`);
  },

  // Create stock adjustment
  createStockAdjustment: (data) => {
    return api.post('/stock-adjustments', data);
  },

  // Update stock adjustment
  updateStockAdjustment: (id, data) => {
    return api.put(`/stock-adjustments/${id}`, data);
  },

  // Approve stock adjustment
  approveStockAdjustment: (id) => {
    return api.post(`/stock-adjustments/${id}/approve`);
  },

  // Reject stock adjustment
  rejectStockAdjustment: (id) => {
    return api.post(`/stock-adjustments/${id}/reject`);
  },

  // Get adjustment reasons
  getAdjustmentReasons: () => {
    return api.get('/stock-adjustments/reasons');
  }
};

// Inventory Count Management
export const inventoryCountService = {
  // Get all inventory counts
  getInventoryCounts: (params = {}) => {
    return api.get('/inventory-counts', { params });
  },

  // Get inventory count by ID
  getInventoryCount: (id) => {
    return api.get(`/inventory-counts/${id}`);
  },

  // Create inventory count
  createInventoryCount: (data) => {
    return api.post('/inventory-counts', data);
  },

  // Update inventory count
  updateInventoryCount: (id, data) => {
    return api.put(`/inventory-counts/${id}`, data);
  },

  // Add item to inventory count
  addItemToCount: (id, data) => {
    return api.post(`/inventory-counts/${id}/items`, data);
  },

  // Update count item
  updateCountItem: (id, itemId, data) => {
    return api.put(`/inventory-counts/${id}/items/${itemId}`, data);
  },

  // Remove count item
  removeCountItem: (id, itemId) => {
    return api.delete(`/inventory-counts/${id}/items/${itemId}`);
  },

  // Complete inventory count
  completeInventoryCount: (id) => {
    return api.post(`/inventory-counts/${id}/complete`);
  },

  // Approve inventory count
  approveInventoryCount: (id) => {
    return api.post(`/inventory-counts/${id}/approve`);
  },

  // Get products for count
  getProductsForCount: (id) => {
    return api.get(`/inventory-counts/${id}/products`);
  }
};

// Supplier Management
export const supplierService = {
  // Get all suppliers
  getSuppliers: (params = {}) => {
    return api.get('/suppliers', { params });
  },

  // Get supplier by ID
  getSupplier: (id) => {
    return api.get(`/suppliers/${id}`);
  },

  // Create supplier
  createSupplier: (data) => {
    return api.post('/suppliers', data);
  },

  // Update supplier
  updateSupplier: (id, data) => {
    return api.put(`/suppliers/${id}`, data);
  },

  // Delete supplier
  deleteSupplier: (id) => {
    return api.delete(`/suppliers/${id}`);
  },

  // Get active suppliers
  getActiveSuppliers: () => {
    return api.get('/suppliers/active/list');
  },

  // Get supplier statistics
  getSupplierStats: (id) => {
    return api.get(`/suppliers/${id}/stats`);
  }
};

// Low Stock Alerts and Automated Restocking
export const lowStockAlertService = {
  // Get low stock products
  getLowStockProducts: async (params = {}) => {
    try {
      return await api.get('/low-stock-alerts/products', { params });
    } catch (error) {
      console.warn('Failed to fetch low stock products:', error.message);
      throw error;
    }
  },

  // Get out of stock products
  getOutOfStockProducts: async (params = {}) => {
    try {
      return await api.get('/low-stock-alerts/out-of-stock', { params });
    } catch (error) {
      console.warn('Failed to fetch out of stock products:', error.message);
      throw error;
    }
  },

  // Create automated restocking request
  createRestockingRequest: async (data) => {
    try {
      return await api.post('/low-stock-alerts/restocking-request', data);
    } catch (error) {
      console.warn('Failed to create restocking request:', error.message);
      throw error;
    }
  },

  // Get restocking suggestions
  getRestockingSuggestions: async (params = {}) => {
    try {
      return await api.get('/low-stock-alerts/suggestions', { params });
    } catch (error) {
      console.warn('Failed to fetch restocking suggestions:', error.message);
      throw error;
    }
  },

  // Get inventory summary
  getInventorySummary: async (params = {}) => {
    try {
      return await api.get('/low-stock-alerts/inventory-summary', { params });
    } catch (error) {
      console.warn('Failed to fetch inventory summary:', error.message);
      throw error;
    }
  }
};
