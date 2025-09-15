import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import RoleBasedSidebar from '../components/RoleBasedSidebar';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';

function DashboardLayout() {
  const { user } = useUnifiedAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <RoleBasedSidebar />

            {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            backgroundColor: 'background.default',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;