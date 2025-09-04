import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Coffee as CoffeeIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Mock user data for development
  const currentUser = {
    name: 'Developer',
    email: 'dev@brewmanager.com',
    role: 'Developer',
    branch_id: null
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // For development, just navigate to dashboard
    navigate('/dashboard');
    handleMenuClose();
  };

  const handleProfile = () => {
    handleMenuClose();
    // Navigate to profile page or open profile modal
  };

  const handleSettings = () => {
    handleMenuClose();
    // Navigate to settings page
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={1}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Left side - Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CoffeeIcon
                sx={{
                  color: 'primary.main',
                  fontSize: 32,
                  mr: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                BrewManager
              </Typography>
            </Box>

            {/* Right side - User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User Avatar and Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    color: 'text.secondary',
                  }}
                >
                  {currentUser.name}
                </Typography>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: 'primary.main',
                      fontSize: '1rem',
                    }}
                  >
                    {currentUser.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Box>

              {/* User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    minWidth: 200,
                    mt: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* User Info */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {currentUser.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser.email}
                  </Typography>
                  <Chip
                    label={currentUser.role}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Divider />

                {/* Menu Items */}
                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  Profile
                </MenuItem>

                <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
                  <SettingsIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  Settings
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  <LogoutIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

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