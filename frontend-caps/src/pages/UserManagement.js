import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Visibility as ViewIcon,
  VisibilityOff as ViewOffIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as BranchManagerIcon,
  PointOfSale as CashierIcon,
  LocalCafe as BaristaIcon,
  Groups as StaffIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';

function UserManagement() {
  const { user, getAuthHeaders } = useUnifiedAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBranchDialog, setOpenBranchDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    branch_id: '',
  });
  const [branchAssignment, setBranchAssignment] = useState({
    branch_id: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    role: '',
    branch_id: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch(`${API_BASE_URL}/test`);
      const data = await response.json();
      console.log('Backend test response:', data);
    } catch (error) {
      console.error('Backend connection test failed:', error);
    }
  };

  const fetchBranches = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/branches`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Raw branches data:', data); // Debug log
        
        // The API returns branches in a nested structure with success/data
        const branchesArray = data.success && Array.isArray(data.data) ? data.data : 
                             Array.isArray(data) ? data : 
                             Array.isArray(data.branches) ? data.branches : [];
        
        // Transform the data to ensure consistent structure
        const transformedBranches = branchesArray.map(branch => ({
          id: branch.branch_id || branch.id,
          branch_id: branch.branch_id || branch.id,
          name: branch.branch_name || branch.name,
          branch_name: branch.branch_name || branch.name,
          location: branch.location,
          status: branch.status,
          users: branch.users || []
        }));
        
        console.log('Transformed branches:', transformedBranches); // Debug log
        setBranches(transformedBranches);
      } else {
        console.error('Failed to fetch branches');
        setBranches([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]); // Set empty array on error
    }
  }, [getAuthHeaders]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching users from:', `${API_BASE_URL}/users`);
      console.log('Auth headers:', getAuthHeaders());
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Raw users data:', data); // Debug log
        
        // The API returns users directly as an array
        const usersArray = Array.isArray(data) ? data : [];
        console.log('Users array length:', usersArray.length);
        
        // Transform the data to ensure consistent structure
        const transformedUsers = usersArray.map(user => ({
          id: user.id || user.user_id, // Handle both id and user_id
          user_id: user.user_id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          branch_id: user.branch_id,
          created_at: user.created_at,
          updated_at: user.updated_at,
          // Add branch information if available
          branch: user.branch ? {
            id: user.branch.branch_id,
            name: user.branch.branch_name,
            location: user.branch.location,
            status: user.branch.status
          } : null
        }));
        
        console.log('Transformed users:', transformedUsers); // Debug log
        setUsers(transformedUsers);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users - Status:', response.status);
        console.error('Error response:', errorText);
        setUsers([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    // Test backend connection first
    testBackendConnection();
    fetchUsers();
    fetchBranches();
  }, [fetchUsers, fetchBranches]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}:`, value); // Debug log
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
    
    // Clear form errors when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Clear role error specifically when role is changed
    if (name === 'role' && formErrors.role) {
      setFormErrors(prev => ({
        ...prev,
        role: '',
      }));
    }
  };

  const validatePassword = () => {
    if (editingUser) {
      // For editing: if password is provided, confirm password must match
      if (formData.password && formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return false;
      }
      // If password is blank, that's fine (user doesn't want to change it)
      if (formData.password && formData.password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return false;
      }
    } else {
      // For new users: password is required and must match
      if (!formData.password) {
        setPasswordError('Password is required');
        return false;
      }
      if (formData.password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Can add users:', canAddUsers);
    console.log('Available branches:', branches);
    console.log('Available roles:', getAvailableRoles());
    
    if (!validatePassword()) {
      console.log('Password validation failed');
      return;
    }

    try {
      const url = editingUser 
        ? `${API_BASE_URL}/users/${editingUser.id}`
        : `${API_BASE_URL}/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Prepare the data to send
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        role: formData.role && formData.role !== '' ? formData.role : null,
        branch_id: formData.branch_id && formData.branch_id !== '' ? formData.branch_id : null,
      };
      
      console.log('Submitting user data:', dataToSend);
      console.log('Request URL:', url);
      console.log('Request method:', method);
      console.log('Auth headers:', getAuthHeaders());
      
      // Only include password if it's provided (for new users or when updating)
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success response:', responseData);
        setSnackbar({
          open: true,
          message: editingUser ? 'User updated successfully!' : 'User created successfully!',
          severity: 'success',
        });
        // Clear form errors on success
        setFormErrors({
          name: '',
          email: '',
          role: '',
          branch_id: '',
        });
        handleCloseDialog();
        fetchUsers();
      } else {
        const errorData = await response.json();
        console.error('User creation/update failed:', errorData);
        console.error('Response status:', response.status);
        console.error('Response status text:', response.statusText);
        
        // Handle validation errors from backend
        if (errorData.errors) {
          const newFormErrors = {};
          Object.keys(errorData.errors).forEach(field => {
            newFormErrors[field] = errorData.errors[field][0]; // Take first error message
          });
          setFormErrors(newFormErrors);
        }
        
        setSnackbar({
          open: true,
          message: errorData.message || `Operation failed (${response.status})`,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
              const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

        if (response.ok) {
          setSnackbar({
            open: true,
            message: 'User deleted successfully!',
            severity: 'success',
          });
          fetchUsers();
        } else {
          setSnackbar({
            open: true,
            message: 'Failed to delete user',
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setSnackbar({
          open: true,
          message: 'An error occurred',
          severity: 'error',
        });
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      branch_id: user.branch_id || '',
    });
    setPasswordError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      branch_id: '',
    });
    setPasswordError('');
    setFormErrors({
      name: '',
      email: '',
      role: '',
      branch_id: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleBranchAssignment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/branches/assign-manager`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(branchAssignment),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Branch assignment updated successfully!',
          severity: 'success',
        });
        setOpenBranchDialog(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || 'Assignment failed',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred',
        severity: 'error',
      });
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Branch Manager': '#f57c00',
      'Cashier': '#7b1fa2',
      'Barista': '#0097a7',
      'Staff': '#9c27b0',
    };
    return colors[role] || '#666';
  };

  const getAvailableRoles = () => {
    return [
      { value: 'Branch Manager', label: 'Branch Manager' },
      { value: 'Cashier', label: 'Cashier' },
      { value: 'Barista', label: 'Barista' },
      { value: 'Staff', label: 'Staff' },
    ];
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      // Backward compatibility for old format
      'super_admin': 'Super Admin',
      'owner': 'Owner',
      'admin': 'Admin',
      'branch_manager': 'Branch Manager',
      'cashier': 'Cashier',
      'barista': 'Barista',
      'staff': 'Staff',
      // Current format (proper case)
      'Branch Manager': 'Branch Manager',
      'Cashier': 'Cashier',
      'Barista': 'Barista',
      'Staff': 'Staff',
      // Handle lowercase variations from database
      'branch manager': 'Branch Manager',
    };
    return roleMap[role] || role;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  
  // Check if user has permission to manage users
  if (!user || !['Super Admin', 'Owner'].includes(user.role)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access User Management. Only Super Admin and Owner users can manage users.
        </Typography>
      </Box>
    );
  }

  // Check if roles and branches are available
  const availableRoles = getAvailableRoles();
  const hasAvailableRoles = availableRoles && availableRoles.length > 0;
  const hasAvailableBranches = branches && branches.length > 0;
  const canAddUsers = hasAvailableRoles && hasAvailableBranches;

  // Calculate user statistics by role (case-insensitive)
  const branchManagerCount = users.filter(user => 
    getRoleDisplayName(user.role) === 'Branch Manager'
  ).length;
  const cashierCount = users.filter(user => 
    getRoleDisplayName(user.role) === 'Cashier'
  ).length;
  const baristaCount = users.filter(user => 
    getRoleDisplayName(user.role) === 'Barista'
  ).length;
  const staffCount = users.filter(user => 
    getRoleDisplayName(user.role) === 'Staff'
  ).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Box sx={{ p: 3 }}>

        {/* Enhanced Header */}
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
                <PersonIcon sx={{ fontSize: 40 }} />
            User Management
          </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Manage your coffee shop staff and user accounts
              </Typography>
            </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
              size="large"
            sx={{
              background: 'linear-gradient(45deg, #8B4513 30%, #A0522D 90%)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(45deg, #A0522D 30%, #CD853F 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(139, 69, 19, 0.3)',
              },
                transition: 'all 0.3s ease',
            }}
          >
              Add New User
          </Button>
          </Box>
        </Box>

        {/* Role Count Cards - Fixed and Stable */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            User Role Overview
          </Typography>
          <Grid container spacing={3} sx={{ minHeight: '150px' }}>
            {/* Branch Manager Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '150px',
                  minHeight: '150px',
                  maxHeight: '150px',
                  width: '150px',
                  minWidth: '150px',
                  maxWidth: '150px',
                  background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(245, 124, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  mx: 'auto',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(245, 124, 0, 0.25)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  }
                }}
              >
                <CardContent sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 1.5,
                  color: 'white',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <BranchManagerIcon sx={{ 
                    fontSize: 36, 
                    mb: 1.2, 
                    opacity: 0.95,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    mb: 0.4,
                    fontSize: '1.8rem',
                    lineHeight: 1,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {branchManagerCount}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.95, 
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    Branch Manager{branchManagerCount !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Cashier Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '150px',
                  minHeight: '150px',
                  maxHeight: '150px',
                  width: '150px',
                  minWidth: '150px',
                  maxWidth: '150px',
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(123, 31, 162, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  mx: 'auto',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(123, 31, 162, 0.25)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  }
                }}
              >
                <CardContent sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 1.5,
                  color: 'white',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <CashierIcon sx={{ 
                    fontSize: 36, 
                    mb: 1.2, 
                    opacity: 0.95,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    mb: 0.4,
                    fontSize: '1.8rem',
                    lineHeight: 1,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {cashierCount}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.95, 
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    Cashier{cashierCount !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Barista Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '150px',
                  minHeight: '150px',
                  maxHeight: '150px',
                  width: '150px',
                  minWidth: '150px',
                  maxWidth: '150px',
                  background: 'linear-gradient(135deg, #0097a7 0%, #00acc1 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(0, 151, 167, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  mx: 'auto',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0, 151, 167, 0.25)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  }
                }}
              >
                <CardContent sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 1.5,
                  color: 'white',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <BaristaIcon sx={{ 
                    fontSize: 36, 
                    mb: 1.2, 
                    opacity: 0.95,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    mb: 0.4,
                    fontSize: '1.8rem',
                    lineHeight: 1,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {baristaCount}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.95, 
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    Barista{baristaCount !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Staff Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '150px',
                  minHeight: '150px',
                  maxHeight: '150px',
                  width: '150px',
                  minWidth: '150px',
                  maxWidth: '150px',
                  background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(156, 39, 176, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  mx: 'auto',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(156, 39, 176, 0.25)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  }
                }}
              >
                <CardContent sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 1.5,
                  color: 'white',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <StaffIcon sx={{ 
                    fontSize: 36, 
                    mb: 1.2, 
                    opacity: 0.95,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    mb: 0.4,
                    fontSize: '1.8rem',
                    lineHeight: 1,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {staffCount}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.95, 
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    Staff Member{staffCount !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

      {/* Users Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          Users List
        </Typography>
        
        {Array.isArray(users) && users.length > 0 ? (
          <Card elevation={0} sx={{ 
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="users table">
                <TableHead sx={{ bgcolor: 'rgba(139, 69, 19, 0.05)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'primary.main' }}>
                      User
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'primary.main' }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'primary.main' }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'primary.main' }}>
                      Branch
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'primary.main' }}>
                      Created
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'primary.main', textAlign: 'center' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                    <TableRow
                      key={user.id || user.user_id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { bgcolor: 'rgba(139, 69, 19, 0.02)' },
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEdit(user)}
                    >
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${getRoleColor(user.role)}CC 100%)`,
                              width: 40,
                              height: 40,
                              fontSize: '1rem',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {user.id || user.user_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.role && user.role !== '' ? (
                          <Chip
                            label={getRoleDisplayName(user.role)}
                            size="small"
                            sx={{
                              background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${getRoleColor(user.role)}DD 100%)`,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                        ) : (
                          <Chip
                            label="Unassigned"
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                              fontStyle: 'italic',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.branch_id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                              {user.branch ? user.branch.name : (() => {
                                const branch = branches.find(b => (b.id || b.branch_id) === user.branch_id);
                                return branch ? (branch.name || branch.branch_name) : `Branch ${user.branch_id}`;
                              })()}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Unassigned
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(user.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(user);
                            }}
                            sx={{ 
                              color: '#1976d2',
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              border: '1px solid rgba(25, 118, 210, 0.2)',
                              '&:hover': {
                                bgcolor: '#1976d2',
                                color: 'white',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user.id || user.user_id);
                            }}
                            sx={{ 
                              color: '#d32f2f',
                              bgcolor: 'rgba(211, 47, 47, 0.08)',
                              border: '1px solid rgba(211, 47, 47, 0.2)',
                              '&:hover': {
                                bgcolor: '#d32f2f',
                                color: 'white',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                bgcolor: 'rgba(139, 69, 19, 0.02)'
              }}
            />
          </Card>
        ) : (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {loading ? 'Loading users...' : 'No users found'}
            </Typography>
            {!loading && (
              <Typography variant="body2" color="text.secondary">
                Start by adding your first user using the "Add User" button above.
              </Typography>
            )}
          </Card>
        )}
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            minHeight: '80vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {editingUser ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {editingUser ? 'Update user information and permissions' : 'Create a new user account'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Box component="form" onSubmit={handleSubmit} id="user-form">
            <Grid container spacing={4}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  bgcolor: 'rgba(139, 69, 19, 0.05)', 
                  borderRadius: 2,
                  border: '1px solid rgba(139, 69, 19, 0.1)'
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '3px solid',
                    borderColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <PersonIcon fontSize="large" />
                    Personal Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 500, 
                          color: 'text.primary',
                          mb: 1.5,
                          ml: 1
                        }}>
                          Full Name *
                        </Typography>
                        <TextField
                          fullWidth
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          error={!!formErrors.name}
                          helperText={formErrors.name}
                          variant="filled"
                          size="large"
                          placeholder="Enter full name"
                          sx={{
                            fontSize: '1.1rem',
                            height: '56px',
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 2,
                            '& .MuiFilledInput-root': {
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 2,
                              fontSize: '1.1rem',
                              height: '56px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                              '&:before': {
                                borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                              },
                              '&:hover:not(.Mui-disabled):before': {
                                borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                              },
                              '&:after': {
                                borderBottom: '2px solid #8B4513',
                              },
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.9rem', 
                          color: 'text.secondary',
                          mt: 1,
                          ml: 1,
                          display: 'block'
                        }}>
                          Enter fullname of the user
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 500, 
                          color: 'text.primary',
                          mb: 1.5,
                          ml: 1
                        }}>
                          Email Address *
                        </Typography>
                        <TextField
                          fullWidth
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          error={!!formErrors.email}
                          helperText={formErrors.email}
                          variant="filled"
                          size="large"
                          placeholder="Enter email address"
                          sx={{
                            fontSize: '1.1rem',
                            height: '56px',
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 2,
                            '& .MuiFilledInput-root': {
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 2,
                              fontSize: '1.1rem',
                              height: '56px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                              '&:before': {
                                borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                              },
                              '&:hover:not(.Mui-disabled):before': {
                                borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                              },
                              '&:after': {
                                borderBottom: '2px solid #8B4513',
                              },
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.9rem', 
                          color: 'text.secondary',
                          mt: 1,
                          ml: 1,
                          display: 'block'
                        }}>
                          Enter an email address for login
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Security & Access Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  bgcolor: 'rgba(139, 69, 19, 0.05)', 
                  borderRadius: 2,
                  border: '1px solid rgba(139, 69, 19, 0.1)'
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '3px solid',
                    borderColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <SecurityIcon fontSize="large" />
                    Security & Access
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 500, 
                          color: 'text.primary',
                          mb: 1.5,
                          ml: 1
                        }}>
                          {editingUser ? "New Password (leave blank to keep current)" : "Password *"}
                        </Typography>
                        <TextField
                          fullWidth
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!editingUser}
                          variant="filled"
                          size="large"
                          placeholder={editingUser ? "Enter new password (optional)" : "Enter password (minimum 6 characters)"}
                          error={!!passwordError}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  sx={{ color: 'primary.main' }}
                                >
                                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            fontSize: '1.1rem',
                            height: '56px',
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 2,
                            '& .MuiFilledInput-root': {
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 2,
                              fontSize: '1.1rem',
                              height: '56px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                              '&:before': {
                                borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                              },
                              '&:hover:not(.Mui-disabled):before': {
                                borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                              },
                              '&:after': {
                                borderBottom: '2px solid #8B4513',
                              },
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.9rem', 
                          color: passwordError ? 'error.main' : 'text.secondary',
                          mt: 1,
                          ml: 1,
                          display: 'block'
                        }}>
                          {passwordError || (editingUser ? 'Leave blank to keep current password' : 'Password must be at least 6 characters long')}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 500, 
                          color: 'text.primary',
                          mb: 1.5,
                          ml: 1
                        }}>
                          {editingUser ? "Confirm New Password" : "Confirm Password *"}
                        </Typography>
                        <TextField
                          fullWidth
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required={!editingUser}
                          error={!!passwordError}
                          variant="filled"
                          size="large"
                          placeholder={editingUser ? "Re-enter new password to confirm" : "Re-enter password to confirm"}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  sx={{ color: 'primary.main' }}
                                >
                                  {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            fontSize: '1.1rem',
                            height: '56px',
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 2,
                            '& .MuiFilledInput-root': {
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 2,
                              fontSize: '1.1rem',
                              height: '56px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                              '&:before': {
                                borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                              },
                              '&:hover:not(.Mui-disabled):before': {
                                borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                              },
                              '&:after': {
                                borderBottom: '2px solid #8B4513',
                              },
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.9rem', 
                          color: passwordError ? 'error.main' : 'text.secondary',
                          mt: 1,
                          ml: 1,
                          display: 'block'
                        }}>
                          {passwordError || (editingUser ? 'Re-enter the new password to confirm' : 'Re-enter the same password to confirm')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Roles & Assignment Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  bgcolor: 'rgba(139, 69, 19, 0.05)', 
                  borderRadius: 2,
                  border: '1px solid rgba(139, 69, 19, 0.1)'
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '3px solid',
                    borderColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <AssignmentIcon fontSize="large" />
                    Roles & Assignment
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 500, 
                          color: 'text.primary',
                          mb: 1.5,
                          ml: 1
                        }}>
                          User Role
                        </Typography>
                        <FormControl fullWidth variant="filled" size="large" error={!!formErrors.role}>
                          <Select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            displayEmpty
                            sx={{
                              fontSize: '1.1rem',
                              height: '56px',
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 2,
                              '& .MuiFilledInput-root': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                borderRadius: 2,
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                '&:before': {
                                  borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover:not(.Mui-disabled):before': {
                                  borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                                },
                                '&:after': {
                                  borderBottom: '2px solid #8B4513',
                                },
                              },
                            }}
                            renderValue={(selected) => {
                              if (!selected) {
                                return <em style={{ color: '#999' }}>Select role or leave unassigned</em>;
                              }
                              if (selected === 'unassigned') {
                                return 'Unassigned (No Role)';
                              }
                              const role = getAvailableRoles().find(r => r.value === selected);
                              return role ? role.label : selected;
                            }}
                          >
                            <MenuItem value="">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: 'text.secondary',
                                  }}
                                />
                                <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                                  Unassigned (No Role)
                                </Typography>
                              </Box>
                            </MenuItem>
                            {getAvailableRoles().map((role) => (
                              <MenuItem key={role.value} value={role.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: '50%',
                                      bgcolor: getRoleColor(role.value),
                                    }}
                                  />
                                  <Typography sx={{ fontSize: '1.1rem' }}>
                                    {role.label}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.9rem', 
                          color: formErrors.role ? 'error.main' : 'text.secondary',
                          mt: 1,
                          ml: 1,
                          display: 'block'
                        }}>
                          {formErrors.role || 'Choose the user\'s role and permissions or leave unassigned'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 500, 
                          color: 'text.primary',
                          mb: 1.5,
                          ml: 1
                        }}>
                          Branch Assignment
                        </Typography>
                        <FormControl fullWidth variant="filled" size="large" error={!!formErrors.branch_id}>
                          <Select
                            name="branch_id"
                            value={formData.branch_id}
                            onChange={handleInputChange}
                            displayEmpty
                            sx={{
                              fontSize: '1.1rem',
                              height: '56px',
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 2,
                              '& .MuiFilledInput-root': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                borderRadius: 2,
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                '&:before': {
                                  borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover:not(.Mui-disabled):before': {
                                  borderBottom: '2px solid rgba(0, 0, 0, 0.23)',
                                },
                                '&:after': {
                                  borderBottom: '2px solid #8B4513',
                                },
                              },
                            }}
                            renderValue={(selected) => {
                              if (!selected) {
                                return <em style={{ color: '#999' }}>Select branch or leave unassigned</em>;
                              }
                              if (selected === 'unassigned') {
                                return 'Unassigned (No Branch)';
                              }
                              const branch = branches.find(b => (b.id || b.branch_id) === selected);
                              return branch ? (branch.name || branch.branch_name) : 'Unknown Branch';
                            }}
                          >
                            <MenuItem value="">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BusinessIcon fontSize="medium" sx={{ color: 'text.secondary' }} />
                                <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                                  Unassigned (No Branch)
                                </Typography>
                              </Box>
                            </MenuItem>
                            {branches.map((branch) => (
                              <MenuItem key={branch.id || branch.branch_id} value={branch.id || branch.branch_id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <BusinessIcon fontSize="medium" sx={{ color: 'primary.main' }} />
                                  <Typography sx={{ fontSize: '1.1rem' }}>
                                    {branch.name || branch.branch_name}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.9rem', 
                          color: formErrors.branch_id ? 'error.main' : 'text.secondary',
                          mt: 1,
                          ml: 1,
                          display: 'block'
                        }}>
                          {formErrors.branch_id || 'Assign user to a specific branch or leave unassigned'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          pt: 3, 
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          bgcolor: 'background.paper'
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            size="large"
            sx={{ 
              borderColor: 'text.secondary',
              color: 'text.secondary',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                borderColor: 'text.primary',
                color: 'text.primary',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="user-form"
            variant="contained"
            disabled={!formData.name || !formData.email || !canAddUsers}
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #8B4513 30%, #A0522D 90%)',
              px: 5,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #A0522D 30%, #CD853F 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(139, 69, 19, 0.4)',
              },
              '&:disabled': {
                background: '#ccc',
                transform: 'none',
                boxShadow: 'none',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Branch Assignment Dialog */}
      <Dialog open={openBranchDialog} onClose={() => setOpenBranchDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <AssignmentIcon />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Assign User to Branch
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" size="large">
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Branch</InputLabel>
                  <Select
                    value={branchAssignment.branch_id}
                    onChange={(e) => setBranchAssignment(prev => ({ ...prev, branch_id: e.target.value }))}
                    label="Branch"
                    sx={{
                      fontSize: '1.1rem',
                      padding: '16px 14px',
                    }}
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BusinessIcon fontSize="medium" sx={{ color: 'text.secondary' }} />
                        <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                          Unassigned (No Branch)
                        </Typography>
                      </Box>
                    </MenuItem>
                    {Array.isArray(branches) && branches.map((branch) => (
                      <MenuItem key={branch.id || branch.branch_id} value={branch.id || branch.branch_id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <BusinessIcon fontSize="medium" sx={{ color: 'primary.main' }} />
                          <Typography sx={{ fontSize: '1.1rem' }}>
                            {branch.name || branch.branch_name}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" size="large">
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Role</InputLabel>
                  <Select
                    value={branchAssignment.role}
                    onChange={(e) => setBranchAssignment(prev => ({ ...prev, role: e.target.value }))}
                    label="Role"
                    sx={{
                      fontSize: '1.1rem',
                      padding: '16px 14px',
                    }}
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: 'text.secondary',
                          }}
                        />
                        <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                          Unassigned (No Role)
                        </Typography>
                      </Box>
                    </MenuItem>
                    {getAvailableRoles().map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: getRoleColor(role.value),
                            }}
                          />
                          <Typography sx={{ fontSize: '1.1rem' }}>
                            {role.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setOpenBranchDialog(false)}
            variant="outlined"
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBranchAssignment}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #8B4513 30%, #A0522D 90%)',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #A0522D 30%, #CD853F 90%)',
              },
            }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
        </Box>
      </Box>
    );
}


export default UserManagement;