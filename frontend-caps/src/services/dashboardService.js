import api from './api';

const dashboardService = {
  // Get total count of users
  getUserCount: async () => {
    try {
      const response = await api.get('/users/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching user count:', error);
      throw error;
    }
  },

  // Get total count of branches
  getBranchCount: async () => {
    try {
      const response = await api.get('/branches/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching branch count:', error);
      throw error;
    }
  },

  // Get dashboard statistics (both counts in one call)
  getDashboardStats: async () => {
    try {
      const [userCountResponse, branchCountResponse] = await Promise.all([
        api.get('/users/count'),
        api.get('/branches/count')
      ]);

      return {
        success: true,
        total_users: userCountResponse.data.total_users,
        total_branches: branchCountResponse.data.total_branches,
        message: 'Dashboard statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }
};

export default dashboardService;
