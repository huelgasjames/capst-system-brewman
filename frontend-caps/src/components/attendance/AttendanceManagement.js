import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  Assignment as ReportIcon,
  Business as BranchIcon,
} from '@mui/icons-material';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { attendanceService } from '../../services/attendanceService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AttendanceManagement() {
  const { user } = useUnifiedAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for different views
  const [myAttendance, setMyAttendance] = useState(null);
  const [branchAttendance, setBranchAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [weeklyReport, setWeeklyReport] = useState([]);

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      fetchMyAttendance();
      if (user.role === 'branch_manager' || user.role === 'admin') {
        fetchBranchAttendance();
        fetchAttendanceSummary();
      }
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (user && (user.role === 'branch_manager' || user.role === 'admin')) {
      fetchWeeklyReport();
    }
  }, [user, startDate, endDate]);

  const fetchMyAttendance = async () => {
    try {
      const response = await attendanceService.getMyAttendance();
      setMyAttendance(response.data.data);
    } catch (err) {
      console.error('Failed to fetch my attendance:', err);
    }
  };

  const fetchBranchAttendance = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getBranchAttendance({ date: selectedDate });
      setBranchAttendance(response.data.data);
    } catch (err) {
      setError('Failed to fetch branch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const response = await attendanceService.getAttendanceSummary({ date: selectedDate });
      setAttendanceSummary(response.data.data);
    } catch (err) {
      console.error('Failed to fetch attendance summary:', err);
    }
  };

  const fetchWeeklyReport = async () => {
    try {
      const response = await attendanceService.getWeeklyReport({ 
        start_date: startDate, 
        end_date: endDate 
      });
      setWeeklyReport(response.data.data);
    } catch (err) {
      console.error('Failed to fetch weekly report:', err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await attendanceService.checkIn();
      setSuccess('Successfully checked in!');
      fetchMyAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await attendanceService.checkOut();
      setSuccess('Successfully checked out!');
      fetchMyAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked_in': return 'success';
      case 'checked_out': return 'info';
      case 'not_checked_in': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checked_in': return <CheckInIcon />;
      case 'checked_out': return <CheckOutIcon />;
      case 'not_checked_in': return <WarningIcon />;
      default: return <TimeIcon />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isManager = user?.role === 'branch_manager' || user?.role === 'admin';
  const isEmployee = user?.role === 'cashier' || user?.role === 'barista';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
          borderRadius: 3,
          border: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main', 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <TimeIcon sx={{ fontSize: 40 }} />
                Attendance Management
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Track employee attendance and working hours
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchMyAttendance();
                  if (isManager) {
                    fetchBranchAttendance();
                    fetchAttendanceSummary();
                    fetchWeeklyReport();
                  }
                }}
                size="large"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(139, 69, 19, 0.05)',
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Employee Check In/Out Section */}
        {isEmployee && myAttendance && (
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ color: 'primary.main', mr: 2, fontSize: '2rem' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  My Attendance - {new Date().toLocaleDateString()}
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Check In Time
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {formatTime(myAttendance.check_in)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Check Out Time
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                      {formatTime(myAttendance.check_out)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Hours Worked
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {myAttendance.total_hours}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
                {!myAttendance.is_checked_in ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CheckInIcon />}
                    onClick={handleCheckIn}
                    disabled={loading}
                    sx={{
                      bgcolor: 'success.main',
                      '&:hover': { bgcolor: 'success.dark' },
                      px: 4,
                      py: 1.5
                    }}
                  >
                    Check In
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CheckOutIcon />}
                    onClick={handleCheckOut}
                    disabled={loading}
                    sx={{
                      bgcolor: 'error.main',
                      '&:hover': { bgcolor: 'error.dark' },
                      px: 4,
                      py: 1.5
                    }}
                  >
                    Check Out
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Manager/Admin View */}
        {isManager && (
          <Paper sx={{ width: '100%', borderRadius: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="attendance tabs"
                sx={{
                  '& .MuiTab-root': {
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    py: 2,
                    px: 3,
                    minHeight: '64px',
                  }
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon />
                      Today's Attendance
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon />
                      Summary
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReportIcon />
                      Weekly Report
                    </Box>
                  } 
                />
              </Tabs>
            </Box>

            {/* Today's Attendance Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchBranchAttendance}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Check In</TableCell>
                        <TableCell>Check Out</TableCell>
                        <TableCell>Total Hours</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {branchAttendance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                              No attendance records for {new Date(selectedDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        branchAttendance.map((attendance) => (
                          <TableRow key={attendance.attendance_id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                  <PersonIcon />
                                </Avatar>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {attendance.user_name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={attendance.user_role} 
                                color="primary" 
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatTime(attendance.check_in)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatTime(attendance.check_out)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {attendance.total_hours}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(attendance.status)}
                                label={attendance.status.replace('_', ' ').toUpperCase()}
                                color={getStatusColor(attendance.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Summary Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '140px', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <PeopleIcon sx={{ color: '#8B4513', mr: 3, fontSize: '2.5rem' }} />
                        <Box>
                          <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                            Total Employees
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {attendanceSummary.total_employees || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '140px', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <CheckInIcon sx={{ color: '#4CAF50', mr: 3, fontSize: '2.5rem' }} />
                        <Box>
                          <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                            Checked In
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {attendanceSummary.checked_in || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '140px', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <CheckOutIcon sx={{ color: '#2196F3', mr: 3, fontSize: '2.5rem' }} />
                        <Box>
                          <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                            Checked Out
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {attendanceSummary.checked_out || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '140px', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <TimeIcon sx={{ color: '#FF9800', mr: 3, fontSize: '2.5rem' }} />
                        <Box>
                          <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                            Total Hours
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {attendanceSummary.total_hours_worked || 0}h
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Weekly Report Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchWeeklyReport}
                >
                  Refresh
                </Button>
              </Box>

              {weeklyReport.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No attendance data for the selected period
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {weeklyReport.map((employee) => (
                    <Grid item xs={12} md={6} key={employee.user_id}>
                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {employee.user_name}
                              </Typography>
                              <Chip 
                                label={employee.user_role} 
                                color="primary" 
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Days Worked:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {employee.total_days_worked}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Total Hours:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {employee.total_hours_worked}h
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
          </Paper>
        )}

        {/* Snackbars */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default AttendanceManagement;
