import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import { useNavigate } from 'react-router-dom';
import BMLogo from '../BM-Logo.png';

const Header = () => {
  const { user, logout } = useUnifiedAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    const colors = {
      'Super Admin': '#d32f2f',
      'Owner': '#1976d2',
      'Admin': '#388e3c',
      'Branch Manager': '#1976d2',
      'Staff': '#388e3c',
      'Cashier': '#f57c00',
      'Barista': '#9c27b0',
      'Server': '#1976d2',
    };
    return colors[role] || '#666';
  };

  const getRoleIcon = (role) => {
    if (role === 'Super Admin' || role === 'Owner' || role === 'Admin') return <AdminIcon />;
    if (role === 'Branch Manager') return <PersonIcon />;
    return <PersonIcon />;
  };

  if (!user) return null;

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src={BMLogo}
            alt="BrewManager Logo"
            sx={{
              height: 40,
              width: 'auto',
              filter: 'brightness(0) invert(1)', // Makes logo white
            }}
          />
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            BrewManager
          </Typography>
        </Box>

        {/* Admin Info and Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Admin Info Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 40,
                height: 40,
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {getRoleIcon(user.role)}
            </Avatar>
            
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  bgcolor: getRoleColor(user.role),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: 20,
                }}
              />
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} />

          {/* Admin Menu */}
          <IconButton
            size="large"
            aria-label="admin menu"
            aria-controls="admin-menu"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{ 
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <AccountCircle />
          </IconButton>
          
          <Menu
            id="admin-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                borderRadius: 2,
              }
            }}
          >
            <MenuItem onClick={handleClose} sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: getRoleColor(user.role),
                    width: 32,
                    height: 32,
                  }}
                >
                  {getRoleIcon(user.role)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleClose}>
              <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
              Settings
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
