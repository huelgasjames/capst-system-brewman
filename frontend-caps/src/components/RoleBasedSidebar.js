import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  PointOfSale as POSIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useLocation, Link } from 'react-router-dom';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import BMLogo from '../BM-Logo.png';

const drawerWidth = 260;

function RoleBasedSidebar() {
  const location = useLocation();
  const { user, userType, isAdmin, isBranchManager, isStaff, isSuperAdmin, isOwner } = useUnifiedAuth();

  const isActive = (path) => {
    return location.pathname === path;
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

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (isAdmin()) {
      return {
        main: [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        ],
        management: [
          { text: 'User Management', icon: <PeopleIcon />, path: '/users' },
          { text: 'Branch Management', icon: <StoreIcon />, path: '/branches' },
          { text: 'Product Management', icon: <InventoryIcon />, path: '/products' },
          { text: 'Employee Management', icon: <PeopleIcon />, path: '/employees' },
        ],
        operations: [
          { text: 'Inventory Management', icon: <InventoryIcon />, path: '/inventory' },
          { text: 'Inventory System', icon: <InventoryIcon />, path: '/inventory-system' },
          { text: 'Point of Sale', icon: <POSIcon />, path: '/pos' },
          { text: 'Customer Management', icon: <PeopleIcon />, path: '/customers' },
        ],
        reports: [
          { text: 'Financial Reports', icon: <TrendingUpIcon />, path: '/financial' },
          { text: 'Analytics', icon: <AssessmentIcon />, path: '/reports' },
        ],
        displays: [
          { text: 'Customer Display', icon: <POSIcon />, path: '/customer-display' },
          { text: 'Kitchen Display', icon: <POSIcon />, path: '/kitchen-display' },
        ],
      };
    } else if (isBranchManager()) {
      return {
        main: [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        ],
        operations: [
          { text: 'Point of Sale', icon: <POSIcon />, path: '/pos' },
          { text: 'Inventory Management', icon: <InventoryIcon />, path: '/inventory' },
          { text: 'Inventory System', icon: <InventoryIcon />, path: '/inventory-system' },
          { text: 'Customer Management', icon: <PeopleIcon />, path: '/customers' },
        ],
        management: [
          { text: 'Staff Management', icon: <PeopleIcon />, path: '/employees' },
          { text: 'Schedule Management', icon: <ScheduleIcon />, path: '/schedule' },
        ],
        reports: [
          { text: 'Branch Reports', icon: <AssessmentIcon />, path: '/reports' },
        ],
      };
    } else if (isStaff()) {
      return {
        main: [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        ],
        operations: [
          { text: 'Point of Sale', icon: <POSIcon />, path: '/pos' },
          { text: 'Inventory Check', icon: <InventoryIcon />, path: '/inventory' },
        ],
        personal: [
          { text: 'My Schedule', icon: <ScheduleIcon />, path: '/my-schedule' },
          { text: 'My Profile', icon: <PersonIcon />, path: '/profile' },
        ],
      };
    }
    return { main: [] };
  };

  const navigationItems = getNavigationItems();

  const renderNavigationSection = (items, title = null) => {
    if (!items || items.length === 0) return null;

    return (
      <Box key={title}>
        {title && (
          <Typography
            variant="subtitle2"
            sx={{
              px: 2,
              py: 1,
              color: 'text.secondary',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>
        )}
        <List>
          {items.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(139, 69, 19, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(139, 69, 19, 0.15)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? '#8B4513' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive(item.path) ? 'bold' : 'normal',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#FAF0E6',
          borderRight: '1px solid #E0E0E0',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        <Box
          component="img"
          src={BMLogo}
          alt="Brew Manager Logo"
          sx={{
            height: 40,
            width: 'auto',
          }}
        />
      </Box>

      {/* User Info Section */}
      <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: getRoleColor(user?.role), width: 40, height: 40 }}>
            {getRoleIcon(user?.role)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {user?.name}
            </Typography>
            <Chip 
              label={user?.role} 
              size="small"
              sx={{ 
                bgcolor: getRoleColor(user?.role), 
                color: 'white',
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Box>
        </Box>
        {user?.branch && (
          <Typography variant="caption" color="text.secondary">
            {user.branch.branch_name}
          </Typography>
        )}
      </Box>

      {/* Navigation Sections */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {renderNavigationSection(navigationItems.main)}
        
        {navigationItems.operations && renderNavigationSection(navigationItems.operations, 'Operations')}
        {navigationItems.management && renderNavigationSection(navigationItems.management, 'Management')}
        {navigationItems.personal && renderNavigationSection(navigationItems.personal, 'Personal')}
        {navigationItems.reports && renderNavigationSection(navigationItems.reports, 'Reports')}
        {navigationItems.displays && renderNavigationSection(navigationItems.displays, 'Displays')}
      </Box>
    </Drawer>
  );
}

export default RoleBasedSidebar;
