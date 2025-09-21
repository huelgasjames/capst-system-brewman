import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import RoleBasedSidebar from '../components/RoleBasedSidebar';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';

function DashboardLayout() {
  const { user } = useUnifiedAuth();

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none'
    }}>
      {/* Sidebar */}
      <RoleBasedSidebar />

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        backgroundColor: 'transparent',
        border: 'none'
      }}>
        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            backgroundColor: 'transparent',
            overflow: 'auto',
            margin: 0,
            padding: 0,
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            '& *': {
              border: 'none !important',
              outline: 'none !important'
            }
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;