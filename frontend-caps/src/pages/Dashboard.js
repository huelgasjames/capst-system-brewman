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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Store as StoreIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
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

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      total: 125000,
      monthly: 45000,
      weekly: 12000,
      daily: 1800,
      growth: 12.5
    },
    sales: {
      total: 2500,
      monthly: 890,
      weekly: 240,
      daily: 35,
      growth: 8.3
    },
    customers: {
      total: 1500,
      new: 45,
      returning: 1200,
      growth: 15.2
    },
    branches: [
      { name: 'KapeNi Main Branch ', revenue: 45000, sales: 320, growth: 15.2, status: 'excellent' },
      { name: 'KapeNi Mamatid Branch', revenue: 38000, sales: 280, growth: 8.7, status: 'good' },
      { name: 'KapeNi Quezon Branch', revenue: 25000, sales: 180, growth: -2.1, status: 'needs_attention' },
      { name: 'KapeNi Cavite Branch', revenue: 17000, sales: 120, growth: 22.4, status: 'excellent' }
    ],
    topProducts: [
      { name: 'Espresso', sales: 450, revenue: 13500 },
      { name: 'Cappuccino', sales: 380, revenue: 11400 },
      { name: 'Latte', sales: 320, revenue: 9600 },
      { name: 'Americano', sales: 280, revenue: 5600 },
      { name: 'Mocha', sales: 250, revenue: 7500 }
    ],
    attendance: [
      { 
        branch: 'KapeNi Main Branch', 
        totalStaff: 12, 
        present: 11, 
        absent: 1, 
        late: 2, 
        attendanceRate: 91.7,
        status: 'excellent'
      },
      { 
        branch: 'KapeNi Mamatid Branch', 
        totalStaff: 8, 
        present: 7, 
        absent: 1, 
        late: 1, 
        attendanceRate: 87.5,
        status: 'good'
      },
      { 
        branch: 'KapeNi Quezon Branch', 
        totalStaff: 10, 
        present: 8, 
        absent: 2, 
        late: 3, 
        attendanceRate: 80.0,
        status: 'needs_attention'
      },
      { 
        branch: 'KapeNi Cavite Branch', 
        totalStaff: 6, 
        present: 6, 
        absent: 0, 
        late: 0, 
        attendanceRate: 100.0,
        status: 'excellent'
      }
    ],
    timeRange: 'monthly'
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'excellent': '#4caf50',
      'good': '#8bc34a',
      'needs_attention': '#ff9800',
      'poor': '#f44336'
    };
    return colors[status] || '#666';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? '#4caf50' : '#f44336';
  };

  return (
    <Box sx={{ 
      bgcolor: 'transparent', 
      margin: 0, 
      padding: 0,
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      width: '100%',
      height: '100%'
    }}>
      <Header />
      
      <Box sx={{ 
        p: 0, 
        margin: 0,
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        width: '100%'
      }}>
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

        {/* Data Analytics Overview */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Data Analytics Overview
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={analyticsData.timeRange}
                label="Time Range"
                onChange={(e) => setAnalyticsData(prev => ({ ...prev, timeRange: e.target.value }))}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            {/* Revenue Analytics */}
            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                color: 'white',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                      <MoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(analyticsData.revenue.monthly)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Monthly Revenue
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getGrowthIcon(analyticsData.revenue.growth)}
                    <Typography variant="body2" sx={{ color: getGrowthColor(analyticsData.revenue.growth) }}>
                      +{analyticsData.revenue.growth}% vs last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sales Analytics */}
            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
                color: 'white',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                      <BarChartIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {analyticsData.sales.monthly}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Monthly Sales
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getGrowthIcon(analyticsData.sales.growth)}
                    <Typography variant="body2" sx={{ color: getGrowthColor(analyticsData.sales.growth) }}>
                      +{analyticsData.sales.growth}% vs last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Customer Analytics */}
            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #7B1FA2 0%, #BA68C8 100%)',
                color: 'white',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {analyticsData.customers.total}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Customers
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getGrowthIcon(analyticsData.customers.growth)}
                    <Typography variant="body2" sx={{ color: getGrowthColor(analyticsData.customers.growth) }}>
                      +{analyticsData.customers.growth}% new customers
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Branch Analytics */}
            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #F57C00 0%, #FFB74D 100%)',
                color: 'white',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                      <StoreIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {analyticsData.branches.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Branches
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    All branches operational
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Branch Performance Analytics */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            Branch Performance Analytics
          </Typography>
          
          <Grid container spacing={3}>
            {/* Branch Performance Table */}
            <Grid item xs={12} lg={8}>
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Branch Performance Overview
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(139, 69, 19, 0.05)' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Branch Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Revenue</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Sales</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Growth</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analyticsData.branches.map((branch, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StoreIcon color="primary" />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {branch.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {formatCurrency(branch.revenue)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {branch.sales} orders
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                {getGrowthIcon(branch.growth)}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: getGrowthColor(branch.growth),
                                    fontWeight: 600
                                  }}
                                >
                                  {branch.growth > 0 ? '+' : ''}{branch.growth}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={branch.status.replace('_', ' ').toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: getStatusColor(branch.status),
                                  color: 'white',
                                  fontWeight: 600,
                                  textTransform: 'capitalize'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Branch Performance Summary */}
            <Grid item xs={12} lg={4}>
              <Grid container spacing={2}>
                {/* Top Performing Branch */}
                <Grid item xs={12}>
                  <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Top Performing Branch
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#4caf50', width: 40, height: 40 }}>
                          <TrendingUpIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            KapeNi Main Branch
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(45000)} revenue
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="success" fontSize="small" />
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          +15.2% growth
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Branch Performance Metrics */}
                <Grid item xs={12}>
                  <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Performance Metrics
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Average Revenue per Branch</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(31250)}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={75} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(139, 69, 19, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#4caf50'
                            }
                          }} 
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Sales Conversion Rate</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            78%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={78} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(139, 69, 19, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#1976d2'
                            }
                          }} 
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Customer Satisfaction</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            92%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={92} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(139, 69, 19, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#7b1fa2'
                            }
                          }} 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Staff Attendance Analytics */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            Staff Attendance Analytics
          </Typography>
          
          <Grid container spacing={3}>
            {/* Attendance Overview Cards */}
            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                color: 'white',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {analyticsData.attendance.reduce((sum, branch) => sum + branch.present, 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Staff Present Today
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Out of {analyticsData.attendance.reduce((sum, branch) => sum + branch.totalStaff, 0)} total staff
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                color: 'white',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {(analyticsData.attendance.reduce((sum, branch) => sum + branch.attendanceRate, 0) / analyticsData.attendance.length).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Average Attendance Rate
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Across all branches
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #F44336 0%, #FF5722 100%)',
                color: 'white',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                      <TrendingDownIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {analyticsData.attendance.reduce((sum, branch) => sum + branch.absent, 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Staff Absent Today
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {analyticsData.attendance.reduce((sum, branch) => sum + branch.late, 0)} late arrivals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
                color: 'white',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                      <StoreIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {analyticsData.attendance.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Branches
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    All branches operational
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Branch Attendance Table */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              Branch-wise Attendance Details
            </Typography>
            <Card elevation={1} sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(139, 69, 19, 0.05)' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Branch Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Total Staff</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Present</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Absent</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Late</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Attendance Rate</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.attendance.map((branch, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StoreIcon color="primary" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {branch.branch}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {branch.totalStaff}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                            {branch.present}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336' }}>
                            {branch.absent}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                            {branch.late}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {branch.attendanceRate}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={branch.attendanceRate} 
                              sx={{ 
                                width: 60, 
                                height: 6, 
                                borderRadius: 3,
                                bgcolor: 'rgba(139, 69, 19, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: branch.attendanceRate >= 90 ? '#4caf50' : branch.attendanceRate >= 80 ? '#ff9800' : '#f44336'
                                }
                              }} 
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={branch.status.replace('_', ' ').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(branch.status),
                              color: 'white',
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        </Paper>

        {/* Top Products Analytics */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            Top Products Performance
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Best Selling Products
                  </Typography>
                  {analyticsData.topProducts.map((product, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: index < analyticsData.topProducts.length - 1 ? '1px solid #e0e0e0' : 'none'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          color: index < 3 ? 'primary.main' : 'text.secondary',
                          minWidth: 20
                        }}>
                          #{index + 1}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.name}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {formatCurrency(product.revenue)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.sales} sales
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Product Performance Insights
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total Product Revenue
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatCurrency(analyticsData.topProducts.reduce((sum, product) => sum + product.revenue, 0))}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Average Order Value
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatCurrency(analyticsData.topProducts.reduce((sum, product) => sum + product.revenue, 0) / analyticsData.topProducts.reduce((sum, product) => sum + product.sales, 0))}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Top Product Market Share
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Espresso
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (18% of total sales)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Inventory Management Section */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            Inventory Management System
          </Typography>
          <InventoryDashboardWidget userRole={user?.role} />
        </Paper>

      </Box>
    </Box>
  );
}

export default Dashboard;