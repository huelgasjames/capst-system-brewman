import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  PointOfSale as POSIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import InventoryDashboardWidget from '../components/dashboard/InventoryDashboardWidget';

function BranchManagerDashboard() {
  const { user, getUserBranchId } = useUnifiedAuth();
  const [branchStats, setBranchStats] = useState({
    totalSales: 0,
    todaySales: 0,
    lowStockItems: 0,
    activeStaff: 0,
  });

  const getRoleColor = (role) => {
    const colors = {
      'Branch Manager': '#1976d2',
      'Staff': '#388e3c',
      'Cashier': '#f57c00',
    };
    return colors[role] || '#666';
  };

  const getRoleIcon = (role) => {
    if (role === 'Branch Manager') return <PersonIcon />;
    if (role === 'Staff') return <PeopleIcon />;
    return <PersonIcon />;
  };

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setBranchStats({
      totalSales: 15420.50,
      todaySales: 1250.75,
      lowStockItems: 3,
      activeStaff: 5,
    });
  }, []);

  const quickActions = [
    {
      title: 'Point of Sale',
      description: 'Process customer orders',
      icon: <POSIcon />,
      color: '#1976d2',
      path: '/pos',
    },
    {
      title: 'Inventory System',
      description: 'Advanced inventory management',
      icon: <InventoryIcon />,
      color: '#388e3c',
      path: '/inventory-system',
    },
    {
      title: 'Staff Management',
      description: 'View staff schedules',
      icon: <PeopleIcon />,
      color: '#f57c00',
      path: '/employees',
    },
    {
      title: 'Reports',
      description: 'View branch reports',
      icon: <TrendingUpIcon />,
      color: '#9c27b0',
      path: '/reports',
    },
  ];

  const recentActivities = [
    { action: 'New sale completed', time: '2 minutes ago', type: 'success' },
    { action: 'Low stock alert: Coffee beans', time: '15 minutes ago', type: 'warning' },
    { action: 'Staff member clocked in', time: '1 hour ago', type: 'info' },
    { action: 'Inventory updated', time: '2 hours ago', type: 'info' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Header />
      
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Branch Manager Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: getRoleColor(user?.role), width: 56, height: 56 }}>
            {getRoleIcon(user?.role)}
          </Avatar>
          <Box>
            <Typography variant="h6">{user?.name}</Typography>
            <Chip 
              label={user?.role} 
              color="primary" 
              size="small"
              sx={{ bgcolor: getRoleColor(user?.role), color: 'white' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Branch: {user?.branch?.branch_name || 'Main Branch'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Today's Sales
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    ₱{branchStats.todaySales.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Sales
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    ₱{branchStats.totalSales.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#388e3c' }}>
                  <StoreIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {branchStats.lowStockItems}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f57c00' }}>
                  <WarningIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Staff
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    {branchStats.activeStaff}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#9c27b0' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Management Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          Branch Inventory Management
        </Typography>
        <InventoryDashboardWidget userRole={user?.role} branchId={getUserBranchId()} />
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 100,
                        flexDirection: 'column',
                        gap: 1,
                        borderColor: action.color,
                        color: action.color,
                        '&:hover': {
                          borderColor: action.color,
                          backgroundColor: `${action.color}10`,
                        },
                      }}
                    >
                      <Box sx={{ color: action.color }}>{action.icon}</Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {action.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {activity.type === 'success' && <CheckCircleIcon color="success" />}
                        {activity.type === 'warning' && <WarningIcon color="warning" />}
                        {activity.type === 'info' && <PersonIcon color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={activity.time}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BranchManagerDashboard;
