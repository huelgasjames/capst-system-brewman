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
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import InventoryDashboardWidget from '../components/dashboard/InventoryDashboardWidget';
import dashboardService from '../services/dashboardService';

function Dashboard() {
  const { user } = useUnifiedAuth();
  const [dashboardStats, setDashboardStats] = useState({
    total_users: 0,
    total_branches: 0,
    loading: true,
    error: null
  });

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setDashboardStats(prev => ({ ...prev, loading: true, error: null }));
        const stats = await dashboardService.getDashboardStats();
        setDashboardStats({
          total_users: stats.total_users,
          total_branches: stats.total_branches,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setDashboardStats(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load dashboard statistics'
        }));
      }
    };

    fetchDashboardStats();
  }, []);

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

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Header />
      
      <Box sx={{ p: 3 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 3, p: 2.5, bgcolor: 'rgba(139, 69, 19, 0.05)', borderRadius: 2, border: '1px solid rgba(139, 69, 19, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: getRoleColor(user?.role),
                width: 60,
                height: 60,
                border: '3px solid rgba(139, 69, 19, 0.2)',
              }}
            >
              {getRoleIcon(user?.role)}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                Welcome back, {user?.name}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
                You are currently logged in as a <strong>{user?.role}</strong> with full access to the Brew Manager system.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label={user?.email}
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: 'primary.main', color: 'primary.main', fontSize: '0.875rem' }}
                />
                <Chip
                  label={`Role: ${user?.role}`}
                  size="small"
                  sx={{
                    bgcolor: getRoleColor(user?.role),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 36, height: 36 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Users
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {dashboardStats.loading ? (
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                      ) : dashboardStats.error ? (
                        'Error loading'
                      ) : (
                        `Total: ${dashboardStats.total_users}`
                      )}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #A0522D 0%, #CD853F 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 36, height: 36 }}>
                    <AdminIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Branches
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {dashboardStats.loading ? (
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                      ) : dashboardStats.error ? (
                        'Error loading'
                      ) : (
                        `Total: ${dashboardStats.total_branches}`
                      )}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #CD853F 0%, #DEB887 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 36, height: 36 }}>
                    <DashboardIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Products
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Menu management
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #DEB887 0%, #F5DEB3 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 36, height: 36 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Reports
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Analytics & insights
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Inventory Management Section */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            Inventory Management System
          </Typography>
          <InventoryDashboardWidget userRole={user?.role} />
        </Paper>

        {/* System Information */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            System Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'rgba(139, 69, 19, 0.05)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Current Session
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Admin ID:</strong> {user?.user_id}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Role:</strong> {user?.role}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'rgba(139, 69, 19, 0.05)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  System Access
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>User Management:</strong> Full Access
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Branch Management:</strong> Full Access
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Inventory Management:</strong> Full Access
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>System Settings:</strong> Full Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Reports:</strong> Full Access
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard;