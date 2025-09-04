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
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { admin, logout } = useAuth();
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
    };
    return colors[role] || '#666';
  };

  const getRoleIcon = (role) => {
    if (role === 'Super Admin') return <AdminIcon />;
    if (role === 'Owner') return <AdminIcon />;
    return <PersonIcon />;
  };

  if (!admin) return null;

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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            BrewMan Dashboard
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
              {getRoleIcon(admin.role)}
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
                {admin.name}
              </Typography>
              <Chip
                label={admin.role}
                size="small"
                sx={{
                  bgcolor: getRoleColor(admin.role),
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
                    bgcolor: getRoleColor(admin.role),
                    width: 32,
                    height: 32,
                  }}
                >
                  {getRoleIcon(admin.role)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {admin.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {admin.email}
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
