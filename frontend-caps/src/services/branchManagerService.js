import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const branchManagerAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
branchManagerAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('branchManagerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
branchManagerAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('branchManagerToken');
      localStorage.removeItem('branchManagerData');
      window.location.href = '/branch-manager/login';
    }
    return Promise.reject(error);
  }
);

export const branchManagerService = {
  // Dashboard Analytics
  getDashboardOverview: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  getSalesAnalytics: async (period = 'today') => {
    try {
      const response = await branchManagerAPI.get(`/branch-manager/dashboard/sales?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }
  },

  getInventoryStatus: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/dashboard/inventory');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory status:', error);
      throw error;
    }
  },

  getStaffPerformance: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/dashboard/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff performance:', error);
      throw error;
    }
  },

  // Sales Management
  getRecentSales: async (limit = 10) => {
    try {
      const response = await branchManagerAPI.get(`/branch-manager/sales?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      throw error;
    }
  },

  getSalesByDate: async (date) => {
    try {
      const response = await branchManagerAPI.get(`/branch-manager/sales/date/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by date:', error);
      throw error;
    }
  },

  // Inventory Management
  getLowStockProducts: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/inventory/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  },

  updateInventory: async (productId, quantity, changeType, notes = '') => {
    try {
      const response = await branchManagerAPI.post('/branch-manager/inventory/update', {
        product_id: productId,
        quantity,
        change_type: changeType,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  },

  // Staff Management
  getBranchStaff: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching branch staff:', error);
      throw error;
    }
  },

  // Product Management
  getBranchProducts: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching branch products:', error);
      throw error;
    }
  },

  // Reports
  generateDailyReport: async (date) => {
    try {
      const response = await branchManagerAPI.get(`/branch-manager/reports/daily?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  },

  generateWeeklyReport: async (weekStart) => {
    try {
      const response = await branchManagerAPI.get(`/branch-manager/reports/weekly?week_start=${weekStart}`);
      return response.data;
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw error;
    }
  },

  generateMonthlyReport: async (month, year) => {
    try {
      const response = await branchManagerAPI.get(`/branch-manager/reports/monthly?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  },

  // Branch Information
  getBranchInfo: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/branch');
      return response.data;
    } catch (error) {
      console.error('Error fetching branch info:', error);
      throw error;
    }
  },

  // Customer Management
  getBranchCustomers: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching branch customers:', error);
      throw error;
    }
  },

  // Notifications/Alerts
  getNotifications: async () => {
    try {
      const response = await branchManagerAPI.get('/branch-manager/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await branchManagerAPI.put(`/branch-manager/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};

export default branchManagerService;
