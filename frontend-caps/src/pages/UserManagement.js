import React, { useState, useEffect } from 'react';
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
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Fab,
  Switch,
  FormControlLabel,
  InputAdornment,
  OutlinedInput,
  ListItemText,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Visibility as ViewIcon,
  VisibilityOff as ViewOffIcon,
  Assignment as AssignmentIcon,
  RemoveCircle as RemoveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

function UserManagement() {
  const { admin, getAuthHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBranchDialog, setOpenBranchDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/branches`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure branches is always an array, handle different response structures
        const branchesArray = Array.isArray(data) ? data : 
                             Array.isArray(data.data) ? data.data : 
                             Array.isArray(data.branches) ? data.branches : [];
        setBranches(branchesArray);
      } else {
        console.error('Failed to fetch branches');
        setBranches([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]); // Set empty array on error
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure users is always an array, handle different response structures
        const usersArray = Array.isArray(data) ? data : 
                          Array.isArray(data.data) ? data.data : 
                          Array.isArray(data.users) ? data.users : [];
        setUsers(usersArray);
      } else {
        console.error('Failed to fetch users');
        setUsers([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear password error when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
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
    
    if (!validatePassword()) {
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
        role: formData.role,
        branch_id: formData.branch_id || null,
      };
      
      console.log('Submitting user data:', dataToSend);
      
      // Only include password if it's provided (for new users or when updating)
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: editingUser ? 'User updated successfully!' : 'User created successfully!',
          severity: 'success',
        });
        handleCloseDialog();
        fetchUsers();
      } else {
        const errorData = await response.json();
        console.error('User creation/update failed:', errorData);
        setSnackbar({
          open: true,
          message: errorData.message || 'Operation failed',
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
      // Current format
      'Branch Manager': 'Branch Manager',
      'Cashier': 'Cashier',
      'Barista': 'Barista',
      'Staff': 'Staff',
    };
    return roleMap[role] || role;
  };
  
  // Check if user has permission to manage users
  if (!admin || !['Super Admin', 'Owner'].includes(admin.role)) {
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
        {/* Welcome Section */}
        <Box sx={{ mb: 4, p: 3, bgcolor: 'rgba(139, 69, 19, 0.05)', borderRadius: 3, border: '1px solid rgba(139, 69, 19, 0.1)' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            Welcome back, {admin?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You are currently logged in as a <strong>{admin?.role}</strong> with full access to manage users and system settings.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={admin?.email}
              variant="outlined"
              size="small"
              sx={{ borderColor: 'primary.main', color: 'primary.main' }}
            />
            <Chip
              label={`Role: ${admin?.role}`}
              size="small"
              sx={{
                bgcolor: admin?.role === 'Super Admin' ? '#d32f2f' : '#1976d2',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Box>

        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(45deg, #8B4513 30%, #A0522D 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #A0522D 30%, #CD853F 90%)',
              },
            }}
          >
            Add User
          </Button>
        </Box>



      {/* Users Grid */}
      <Grid container spacing={3}>
        {Array.isArray(users) && users.length > 0 ? (
          users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id || user.user_id}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: getRoleColor(user.role),
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getRoleDisplayName(user.role)}
                      size="small"
                      sx={{
                        bgcolor: getRoleColor(user.role),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    {user.branch && (
                      <Chip
                        label={user.branch.name}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(user)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user.id || user.user_id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
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
          </Grid>
        )}
      </Grid>

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
          <Box component="form" onSubmit={handleSubmit}>
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
                      <TextField
                        fullWidth
                        label="Full Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        size="large"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            padding: '16px 14px',
                            height: '56px',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email Address *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        size="large"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            padding: '16px 14px',
                            height: '56px',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                          },
                        }}
                      />
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
                      <TextField
                        fullWidth
                        label={editingUser ? "New Password (leave blank to keep current)" : "Password *"}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingUser}
                        variant="outlined"
                        size="large"
                        helperText={editingUser ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
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
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            padding: '16px 14px',
                            height: '56px',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: '1rem',
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={editingUser ? "Confirm New Password" : "Confirm Password *"}
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={!editingUser}
                        error={!!passwordError}
                        helperText={passwordError || (editingUser ? 'Re-enter the new password' : 'Re-enter the password')}
                        variant="outlined"
                        size="large"
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
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            padding: '16px 14px',
                            height: '56px',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: '1rem',
                          },
                        }}
                      />
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
                      <FormControl fullWidth variant="outlined" size="large">
                        <InputLabel sx={{ fontSize: '1.1rem' }}>User Role *</InputLabel>
                        <Select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          required
                          label="User Role *"
                          sx={{
                            fontSize: '1.1rem',
                            padding: '16px 14px',
                            height: '56px',
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 3,
                              },
                            },
                          }}
                        >
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
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" size="large">
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Branch Assignment</InputLabel>
                        <Select
                          name="branch_id"
                          value={formData.branch_id}
                          onChange={handleInputChange}
                          label="Branch Assignment"
                          sx={{
                            fontSize: '1.1rem',
                            padding: '16px 14px',
                            height: '56px',
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 3,
                              },
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>No Branch Assigned</em>
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
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.email || !formData.role}
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