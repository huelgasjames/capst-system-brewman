import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { admin } = useAuth();

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Box sx={{ p: 3 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4, p: 4, bgcolor: 'rgba(139, 69, 19, 0.05)', borderRadius: 3, border: '1px solid rgba(139, 69, 19, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar 
              sx={{ 
                bgcolor: getRoleColor(admin?.role),
                width: 80,
                height: 80,
                border: '4px solid rgba(139, 69, 19, 0.2)',
              }}
            >
              {getRoleIcon(admin?.role)}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                Welcome back, {admin?.name}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                You are currently logged in as a <strong>{admin?.role}</strong> with full access to the BrewMan system.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={admin?.email}
                  variant="outlined"
                  size="medium"
                  sx={{ borderColor: 'primary.main', color: 'primary.main', fontSize: '1rem' }}
                />
                <Chip
                  label={`Role: ${admin?.role}`}
                  size="medium"
                  sx={{
                    bgcolor: getRoleColor(admin?.role),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      Users
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Manage system users
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
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                    <AdminIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      Branches
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Manage locations
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
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                    <DashboardIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      Products
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
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
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      Reports
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Analytics & insights
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                  <strong>Admin ID:</strong> {admin?.admin_id}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {admin?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {admin?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Role:</strong> {admin?.role}
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