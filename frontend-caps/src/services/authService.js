const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const authService = {
  // Login admin
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Login failed:', data);
        throw new Error(data.message || 'Login failed');
      }

      // Store admin data and token in localStorage
      localStorage.setItem('admin', JSON.stringify(data.admin));
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAuthenticated', 'true');

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout admin
  logout() {
    localStorage.removeItem('admin');
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
  },

  // Check if admin is authenticated
  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  // Get current admin
  getCurrentAdmin() {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  },

  // Check if admin has super admin/owner role
  isSuperAdminOrOwner() {
    const admin = this.getCurrentAdmin();
    return admin && (admin.role === 'Super Admin' || admin.role === 'Owner');
  },

  // Check if admin has admin role (includes super admin and owner)
  isAdminOrOwner() {
    const admin = this.getCurrentAdmin();
    return admin && (admin.role === 'Admin' || admin.role === 'Super Admin' || admin.role === 'Owner');
  },

  // Check if admin has specific role
  hasRole(role) {
    const admin = this.getCurrentAdmin();
    return admin && admin.role === role;
  },

  // Check if admin can manage branches (super admin/owner only)
  canManageBranches() {
    const admin = this.getCurrentAdmin();
    return admin && (admin.role === 'Super Admin' || admin.role === 'Owner');
  },

  // Check if admin can manage users (super admin/owner only)
  canManageUsers() {
    const admin = this.getCurrentAdmin();
    return admin && (admin.role === 'Super Admin' || admin.role === 'Owner');
  },

  // Check if admin can manage system settings (super admin/owner only)
  canManageSystem() {
    const admin = this.getCurrentAdmin();
    return admin && (admin.role === 'Super Admin' || admin.role === 'Owner');
  },

  // Get admin role display name
  getRoleDisplayName(role) {
    const roleNames = {
      'Super Admin': 'Super Admin',
      'Owner': 'Owner',
      'Admin': 'Admin',
    };
    return roleNames[role] || role;
  },

  // Get role hierarchy level (higher number = more permissions)
  getRoleLevel(role) {
    const roleLevels = {
      'Super Admin': 100,
      'Owner': 90,
      'Admin': 80,
    };
    return roleLevels[role] || 0;
  }
};
