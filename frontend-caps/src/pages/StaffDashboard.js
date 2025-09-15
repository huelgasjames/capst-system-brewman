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
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  PointOfSale as POSIcon,
  Inventory as InventoryIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import StaffInventoryWidget from '../components/dashboard/StaffInventoryWidget';

function StaffDashboard() {
  const { user, getUserBranchId } = useUnifiedAuth();
  const [staffStats, setStaffStats] = useState({
    todayShifts: 0,
    completedTasks: 0,
    pendingTasks: 0,
    clockedIn: false,
  });

  const getRoleColor = (role) => {
    const colors = {
      'Staff': '#388e3c',
      'Cashier': '#f57c00',
      'Barista': '#9c27b0',
      'Server': '#1976d2',
    };
    return colors[role] || '#666';
  };

  const getRoleIcon = (role) => {
    if (role === 'Staff') return <PersonIcon />;
    if (role === 'Cashier') return <POSIcon />;
    if (role === 'Barista') return <InventoryIcon />;
    return <PersonIcon />;
  };

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setStaffStats({
      todayShifts: 1,
      completedTasks: 8,
      pendingTasks: 2,
      clockedIn: true,
    });
  }, []);

  const quickActions = [
    {
      title: 'Clock In/Out',
      description: 'Manage your attendance',
      icon: <ScheduleIcon />,
      color: staffStats.clockedIn ? '#f57c00' : '#388e3c',
      action: staffStats.clockedIn ? 'Clock Out' : 'Clock In',
    },
    {
      title: 'Point of Sale',
      description: 'Process customer orders',
      icon: <POSIcon />,
      color: '#1976d2',
      path: '/pos',
    },
    {
      title: 'Inventory Check',
      description: 'Check stock levels',
      icon: <InventoryIcon />,
      color: '#9c27b0',
      path: '/inventory',
    },
  ];

  const todayTasks = [
    { task: 'Clean coffee machines', completed: true, priority: 'high' },
    { task: 'Restock napkins', completed: true, priority: 'medium' },
    { task: 'Update menu board', completed: false, priority: 'low' },
    { task: 'Check expiry dates', completed: false, priority: 'high' },
  ];

  const recentActivities = [
    { action: 'Clocked in for shift', time: '2 hours ago', type: 'success' },
    { task: 'Completed coffee machine cleaning', time: '1 hour ago', type: 'success' },
    { action: 'Processed 15 orders', time: '30 minutes ago', type: 'info' },
    { action: 'Low stock alert: Milk', time: '10 minutes ago', type: 'warning' },
  ];

  const handleClockInOut = () => {
    // In real app, this would call API
    setStaffStats(prev => ({
      ...prev,
      clockedIn: !prev.clockedIn,
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Header />
      
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Hello, {user?.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Staff Dashboard
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

        {/* Clock Status */}
        <Alert 
          severity={staffStats.clockedIn ? 'success' : 'warning'} 
          sx={{ mt: 2, maxWidth: 400 }}
        >
          {staffStats.clockedIn ? 'You are currently clocked in' : 'You are currently clocked out'}
        </Alert>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Today's Shifts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {staffStats.todayShifts}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <ScheduleIcon />
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
                    Completed Tasks
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    {staffStats.completedTasks}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#388e3c' }}>
                  <CheckCircleIcon />
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
                    Pending Tasks
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {staffStats.pendingTasks}
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
                    Status
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: staffStats.clockedIn ? '#388e3c' : '#f57c00' }}>
                    {staffStats.clockedIn ? 'Active' : 'Offline'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: staffStats.clockedIn ? '#388e3c' : '#f57c00' }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Overview Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          Branch Inventory Overview
        </Typography>
        <StaffInventoryWidget branchId={getUserBranchId()} />
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
                  <Grid item xs={12} sm={6} key={index}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={action.action ? handleClockInOut : undefined}
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

        {/* Today's Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Today's Tasks
              </Typography>
              <List>
                {todayTasks.map((task, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {task.completed ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <InfoIcon color={task.priority === 'high' ? 'error' : 'info'} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={task.task}
                        secondary={`Priority: ${task.priority}`}
                        sx={{
                          '& .MuiListItemText-primary': {
                            textDecoration: task.completed ? 'line-through' : 'none',
                            opacity: task.completed ? 0.6 : 1,
                          },
                        }}
                      />
                    </ListItem>
                    {index < todayTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
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
                        {activity.type === 'info' && <InfoIcon color="info" />}
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

export default StaffDashboard;
