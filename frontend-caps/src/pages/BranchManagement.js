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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  RemoveCircle as RemoveIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

function BranchManagement() {
  const { admin, getAuthHeaders } = useAuth();
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState({
    branch_name: '',
    location: '',
    status: 'active',
  });
  const [userAssignment, setUserAssignment] = useState({
    user_id: '',
    role: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchBranches();
    fetchUsers();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
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
    }
  };

  const handleOpenDialog = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        branch_name: branch.branch_name || branch.name || '',
        location: branch.location || '',
        status: branch.status || 'active',
      });
    } else {
      setEditingBranch(null);
      setFormData({
        branch_name: '',
        location: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBranch(null);
    setFormData({
      branch_name: '',
      location: '',
      status: 'active',
    });
  };

  const handleOpenUserDialog = (branch) => {
    setSelectedBranch(branch);
    setUserAssignment({
      user_id: '',
      role: '',
    });
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setSelectedBranch(null);
    setUserAssignment({
      user_id: '',
      role: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserAssignmentChange = (e) => {
    const { name, value } = e.target;
    setUserAssignment(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingBranch) {
        // Update existing branch
        const response = await fetch(`${API_BASE_URL}/branches/${editingBranch.branch_id || editingBranch.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showSnackbar('Branch updated successfully!', 'success');
          fetchBranches();
          handleCloseDialog();
        } else {
          const errorData = await response.json();
          showSnackbar('Failed to update branch: ' + (errorData.message || 'Unknown error'), 'error');
        }
      } else {
        // Create new branch
        const response = await fetch(`${API_BASE_URL}/branches`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showSnackbar('Branch created successfully!', 'success');
          fetchBranches();
          handleCloseDialog();
        } else {
          const errorData = await response.json();
          showSnackbar('Failed to create branch: ' + (errorData.message || 'Unknown error'), 'error');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Failed to save branch: ' + error.message, 'error');
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/branches/${branchId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          showSnackbar('Branch deleted successfully!', 'success');
          fetchBranches();
        } else {
          const errorData = await response.json();
          showSnackbar('Failed to delete branch: ' + (errorData.message || 'Unknown error'), 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showSnackbar('Failed to delete branch: ' + error.message, 'error');
      }
    }
  };

  const handleAssignUser = async () => {
    if (!userAssignment.user_id || !userAssignment.role) {
      showSnackbar('Please select both user and role', 'error');
      return;
    }

    try {
      // For Branch Manager role, use the assign-manager endpoint
      if (userAssignment.role === 'Branch Manager') {
        const response = await fetch(`${API_BASE_URL}/branches/assign-manager`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            branch_id: selectedBranch.branch_id || selectedBranch.id,
            user_id: userAssignment.user_id,
          }),
        });

        if (response.ok) {
          showSnackbar('Branch Manager assigned successfully!', 'success');
          fetchBranches();
          handleCloseUserDialog();
        } else {
          const data = await response.json();
          showSnackbar('Failed to assign Branch Manager: ' + (data.message || 'Unknown error'), 'error');
        }
      } else {
        // For other roles, update the user directly
        const response = await fetch(`${API_BASE_URL}/users/${userAssignment.user_id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            branch_id: selectedBranch.branch_id || selectedBranch.id,
            role: userAssignment.role,
            _method: 'PUT'
          }),
        });

        if (response.ok) {
          showSnackbar('User assigned successfully!', 'success');
          fetchBranches();
          handleCloseUserDialog();
        } else {
          const data = await response.json();
          showSnackbar('Failed to assign user: ' + (data.message || 'Unknown error'), 'error');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Failed to assign user: ' + error.message, 'error');
    }
  };

  const handleUnassignUser = async (userId, branchId) => {
    if (window.confirm('Are you sure you want to unassign this user from this branch?')) {
      try {
        console.log('Attempting to unassign user:', { userId, branchId });
        
        // Try to update the user directly to remove branch assignment
        const updateResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            branch_id: null, // Remove branch assignment
            _method: 'PUT'
          }),
        });

        console.log('Update response status:', updateResponse.status);

        if (updateResponse.ok) {
          showSnackbar('User unassigned successfully!', 'success');
          fetchBranches(); // Refresh the branches data
        } else {
          const errorData = await updateResponse.json();
          console.error('Unassign error response:', errorData);
          
          // If direct update fails, try the dedicated unassign endpoint as fallback
          showSnackbar('Trying alternative unassign method...', 'info');
          
          const unassignResponse = await fetch(`${API_BASE_URL}/branches/unassign-user`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              user_id: userId,
              branch_id: branchId,
            }),
          });

          console.log('Unassign response status:', unassignResponse.status);

          if (unassignResponse.ok) {
            showSnackbar('User unassigned successfully using alternative method!', 'success');
            fetchBranches();
          } else {
            const unassignErrorData = await unassignResponse.json();
            console.error('Unassign endpoint error:', unassignErrorData);
            showSnackbar('Failed to unassign user: ' + (unassignErrorData.message || 'Unknown error'), 'error');
          }
        }
      } catch (error) {
        console.error('Error unassigning user:', error);
        showSnackbar('Failed to unassign user: ' + error.message, 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const getAvailableUsers = () => {
    // Filter users who are not assigned to any branch
    return users.filter(user => !user.branch_id);
  };

  const getRoleColor = (role) => {
    const colors = {
      'Branch Manager': '#1976d2',
      'branch_manager': '#1976d2',
      'Cashier': '#2e7d32',
      'cashier': '#2e7d32',
      'Barista': '#ed6c02',
      'barista': '#ed6c02',
      'Staff': '#9c27b0',
      'staff': '#9c27b0',
    };
    return colors[role] || '#666';
  };

  const getBranchManager = (branch) => {
    if (!branch.users || !Array.isArray(branch.users)) return null;
    return branch.users.find(user => 
      user.role === 'Branch Manager' || user.role === 'branch_manager'
    );
  };

  const getOtherStaff = (branch) => {
    if (!branch.users || !Array.isArray(branch.users)) return [];
    return branch.users.filter(user => 
      user.role !== 'Branch Manager' && user.role !== 'branch_manager'
    );
  };

  // Check if user has permission to manage branches
  if (!admin || !['Super Admin', 'Owner'].includes(admin.role)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access Branch Management. Only Super Admin and Owner users can manage branches.
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

  // Calculate branch statistics
  const totalBranches = branches.length;
  const activeBranches = branches.filter(branch => branch.status === 'active').length;
  const totalStaff = branches.reduce((total, branch) => total + (branch.users?.length || 0), 0);
  const branchesWithManagers = branches.filter(branch => 
    branch.users?.some(user => user.role === 'Branch Manager' || user.role === 'branch_manager')
  ).length;

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
              <StoreIcon sx={{ fontSize: 40 }} />
              Branch Management
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Manage your coffee shop branches and staff assignments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
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
            Add New Branch
          </Button>
        </Box>
      </Box>

      {/* Total Branch Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold', 
          color: 'text.primary', 
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TrendingUpIcon sx={{ color: 'primary.main' }} />
          Total Branch Overview
        </Typography>
        
        <Grid container spacing={3}>
          {/* Total Branches Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {totalBranches}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Branches
                  </Typography>
                </Box>
                <StoreIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </Card>
          </Grid>

          {/* Active Branches Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(17, 153, 142, 0.4)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {activeBranches}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Active Branches
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </Card>
          </Grid>

          {/* Total Staff Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(240, 147, 251, 0.4)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {totalStaff}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Users
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </Card>
          </Grid>

          {/* Branches with Managers Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(79, 172, 254, 0.4)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {branchesWithManagers}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    With Managers
                  </Typography>
                </Box>
                <BusinessIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>



      {/* Branches Grid */}
      <Grid container spacing={3}>
        {Array.isArray(branches) && branches.length > 0 ? (
          branches.map((branch) => (
            <Grid item xs={12} md={6} lg={4} key={branch.branch_id || branch.id}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Branch Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          {branch.branch_name || branch.name}
                        </Typography>
                        <Chip
                          label={branch.status || 'active'}
                          size="small"
                          color={branch.status === 'active' ? 'success' : 'default'}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(branch)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBranch(branch.branch_id || branch.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {branch.location}
                    </Typography>
                  </Box>

                  {/* Branch Manager Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                      Branch Manager
                    </Typography>
                    {getBranchManager(branch) ? (
                      <Card sx={{ 
                        p: 2, 
                        bgcolor: 'primary.light', 
                        color: 'primary.contrastText',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40, 
                            fontSize: '1.2rem',
                            bgcolor: 'primary.main',
                            color: 'white'
                          }}>
                            {getBranchManager(branch).name?.charAt(0)?.toUpperCase() || 'M'}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                              {getBranchManager(branch).name}
                            </Typography>
                            <Chip
                              label="Branch Manager"
                              size="small"
                              sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                height: 20,
                              }}
                            />
                          </Box>
                          <Tooltip title="Unassign Manager">
                            <IconButton
                              size="small"
                              onClick={() => handleUnassignUser(getBranchManager(branch).user_id || getBranchManager(branch).id, branch.branch_id || branch.id)}
                              sx={{ color: 'white' }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Card>
                    ) : (
                      <Card sx={{ 
                        p: 2, 
                        bgcolor: 'grey.100', 
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        borderRadius: 2,
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          No Branch Manager Assigned
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleOpenUserDialog(branch)}
                          sx={{
                            color: 'primary.main',
                            fontSize: '0.7rem',
                            textTransform: 'none',
                            mt: 1,
                          }}
                        >
                          Assign Manager
                        </Button>
                      </Card>
                    )}
                  </Box>

                  {/* Other Staff Section */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Other Staff ({getOtherStaff(branch).length})
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={() => handleOpenUserDialog(branch)}
                        sx={{
                          color: 'primary.main',
                          fontSize: '0.75rem',
                          textTransform: 'none',
                        }}
                      >
                        Assign
                      </Button>
                    </Box>
                    
                    {getOtherStaff(branch).length > 0 ? (
                      <List dense sx={{ p: 0 }}>
                        {getOtherStaff(branch).map((user) => (
                          <ListItem key={user.user_id || user.id} sx={{ p: 0, mb: 0.5 }}>
                            <ListItemAvatar sx={{ minWidth: 32 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={user.name}
                              secondary={
                                <Chip
                                  label={user.role}
                                  size="small"
                                  sx={{
                                    bgcolor: getRoleColor(user.role),
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    height: 18,
                                  }}
                                />
                              }
                            />
                            <ListItemSecondaryAction>
                              <Tooltip title="Unassign User">
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleUnassignUser(user.user_id || user.id, branch.branch_id || branch.id)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        No other staff assigned
                      </Typography>
                    )}
                  </Box>

                  {/* Branch Stats */}
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #eee' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Total Staff
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {branch.users?.length || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Manager
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: getBranchManager(branch) ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}>
                          {getBranchManager(branch) ? '✓ Assigned' : '✗ None'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Branch ID
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                          #{branch.branch_id || branch.id}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No branches found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by adding your first branch using the "Add Branch" button above.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Branch Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            minHeight: '70vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              {editingBranch ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingBranch ? 'Update branch information' : 'Create a new branch location'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
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
                  <BusinessIcon fontSize="large" />
                  Branch Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Branch Name *"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      padding: '16px 14px',
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
                <FormControl fullWidth variant="outlined" size="large">
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                    sx={{
                      fontSize: '1.1rem',
                      padding: '16px 14px',
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
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location *"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                  size="large"
                  placeholder="Enter full address or location description"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      padding: '16px 14px',
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
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={!formData.branch_name || !formData.location}
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
            {editingBranch ? 'Update Branch' : 'Create Branch'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog 
        open={openUserDialog} 
        onClose={handleCloseUserDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            minHeight: '60vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Assign User to Branch
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedBranch?.branch_name || selectedBranch?.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Box>
            <Grid container spacing={4}>
              <Grid item xs={12}>
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
                  User Assignment
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="large">
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Select User</InputLabel>
                  <Select
                    name="user_id"
                    value={userAssignment.user_id}
                    onChange={handleUserAssignmentChange}
                    label="Select User"
                    sx={{
                      fontSize: '1.1rem',
                      padding: '16px 14px',
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
                    {Array.isArray(users) && getAvailableUsers().map((user) => (
                      <MenuItem key={user.user_id || user.id} value={user.user_id || user.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '1rem' }}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                              {user.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="large">
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Role</InputLabel>
                  <Select
                    name="role"
                    value={userAssignment.role}
                    onChange={handleUserAssignmentChange}
                    label="Role"
                    sx={{
                      fontSize: '1.1rem',
                      padding: '16px 14px',
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
                    <MenuItem value="Branch Manager">Branch Manager</MenuItem>
                    <MenuItem value="Cashier">Cashier</MenuItem>
                    <MenuItem value="Barista">Barista</MenuItem>
                    <MenuItem value="Staff">Staff</MenuItem>
                  </Select>
                </FormControl>
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
            onClick={handleCloseUserDialog}
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
            onClick={handleAssignUser}
            variant="contained"
            size="large"
            disabled={!userAssignment.user_id || !userAssignment.role}
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
            Assign User
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
}

export default BranchManagement;