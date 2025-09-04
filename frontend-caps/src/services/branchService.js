const API_BASE_URL = 'http://localhost:8000/api';

export const branchService = {
  // Get all branches with their users
  async getAllBranches() {
    try {
      const response = await fetch(`${API_BASE_URL}/branches`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch branches');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  // Get a single branch by ID
  async getBranchById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/branches/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch branch');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching branch:', error);
      throw error;
    }
  },

  // Create a new branch
  async createBranch(branchData) {
    try {
      const response = await fetch(`${API_BASE_URL}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create branch');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  },

  // Update an existing branch
  async updateBranch(id, branchData) {
    try {
      const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update branch');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  },

  // Delete a branch
  async deleteBranch(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete branch');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  },

  // Get users by branch ID
  async getUsersByBranch(branchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/branches/${branchId}/users`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users for branch');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching users by branch:', error);
      throw error;
    }
  },
};
