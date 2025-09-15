import React from 'react';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import AdminDashboard from '../pages/Dashboard';
import BranchManagerDashboard from '../pages/BranchManagerDashboard';
import StaffDashboard from '../pages/StaffDashboard';

const RoleBasedDashboard = () => {
  const { userType, isAdmin, isBranchManager, isStaff } = useUnifiedAuth();

  // Show loading or error state if user type is not determined
  if (!userType) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Route to appropriate dashboard based on user type and role
  if (isAdmin()) {
    return <AdminDashboard />;
  }
  
  if (isBranchManager()) {
    return <BranchManagerDashboard />;
  }
  
  if (isStaff()) {
    return <StaffDashboard />;
  }

  // Fallback for unknown user types
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Access denied. Please contact your administrator.</p>
    </div>
  );
};

export default RoleBasedDashboard;
