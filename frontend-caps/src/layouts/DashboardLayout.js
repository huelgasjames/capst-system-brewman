import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Coffee as CoffeeIcon,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

function DashboardLayout({ children }) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header with Logo */}
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important' }}>
          {/* Title Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  lineHeight: 1.2
                }}
              >
                BrewManager
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  fontSize: '1rem'
                }}
              >
                Comprehensive Web-based Management System
              </Typography>
            </Box>
          </Box>
          
          {/* Right side - Coffee icon and user */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CoffeeIcon sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '2rem',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
            }} />
            <Avatar sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <AccountIcon sx={{ fontSize: '1.5rem' }} />
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 10, // Account for fixed header
          background: 'linear-gradient(135deg, #F5F5DC 0%, #FAF0E6 100%)',
          minHeight: 'calc(100vh - 80px)',
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;