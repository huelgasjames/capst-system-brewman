
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import { UnifiedAuthProvider } from './contexts/UnifiedAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';

// Pages
import Dashboard from './pages/Dashboard';
import AccountManagement from './pages/AccountManagement';
import UserManagement from './pages/UserManagement';
import BranchManagement from './pages/BranchManagement';
import ProductMenuManagement from './pages/ProductMenuManagement';
import InventoryManagement from './pages/InventoryManagement';
import InventoryManagementSystem from './pages/InventoryManagementSystem';
import PointOfSale from './pages/PointOfSale';
import CustomerManagement from './pages/CustomerManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import FinancialManagement from './pages/FinancialManagement';
import Reporting from './pages/Reporting';
import CustomerDisplay from './pages/CustomerDisplay';
import KitchenDisplay from './pages/KitchenDisplay';

function App() {
  return (
    <UnifiedAuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<RoleBasedDashboard />} />
              <Route path="dashboard" element={<RoleBasedDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="branches" element={<BranchManagement />} />
              <Route path="products" element={<ProductMenuManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="inventory-system" element={<InventoryManagementSystem />} />
              <Route path="pos" element={<PointOfSale />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="financial" element={<FinancialManagement />} />
              <Route path="reports" element={<Reporting />} />
              <Route path="customer-display" element={<CustomerDisplay />} />
              <Route path="kitchen-display" element={<KitchenDisplay />} />
              
              {/* Legacy routes for backward compatibility */}
              <Route path="account" element={<AccountManagement />} />
              <Route path="account/users" element={<UserManagement />} />
            </Route>

            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </UnifiedAuthProvider>
  );
}

export default App;
