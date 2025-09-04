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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { branchService } from '../services/branchService';

function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    branch_name: '',
    location: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await branchService.getAllBranches();
      setBranches(response.data || []);
    } catch (error) {
      showSnackbar('Failed to fetch branches: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        branch_name: branch.branch_name,
        location: branch.location,
      });
    } else {
      setEditingBranch(null);
      setFormData({
        branch_name: '',
        location: '',
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
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch.branch_id, formData);
        showSnackbar('Branch updated successfully!', 'success');
      } else {
        await branchService.createBranch(formData);
        showSnackbar('Branch created successfully!', 'success');
      }
      handleCloseDialog();
      fetchBranches();
    } catch (error) {
      showSnackbar('Operation failed: ' + error.message, 'error');
    }
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await branchService.deleteBranch(branchId);
        showSnackbar('Branch deleted successfully!', 'success');
        fetchBranches();
      } catch (error) {
        showSnackbar('Failed to delete branch: ' + error.message, 'error');
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

  const getRoleColor = (role) => {
    const colors = {
      'Branch Manager': '#1976d2',
      'Cashier': '#388e3c',
      'Barista': '#f57c00',
      'Admin': '#d32f2f',
    };
    return colors[role] || '#757575';
  };

  const getRoleIcon = (role) => {
    if (role === 'Branch Manager') return '👨‍💼';
    if (role === 'Cashier') return '💳';
    if (role === 'Barista') return '☕';
    if (role === 'Admin') return '⚙️';
    return '👤';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#8B4513', fontWeight: 700 }}>
            Branch Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your coffee shop branches and view assigned staff
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#8B4513',
            '&:hover': { bgcolor: '#654321' },
            px: 3,
            py: 1.5,
          }}
        >
          Add Branch
        </Button>
      </Box>

      {/* Branches Grid */}
      <Grid container spacing={3}>
        {branches.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No branches found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Get started by adding your first branch
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ borderColor: '#8B4513', color: '#8B4513' }}
              >
                Add First Branch
              </Button>
            </Paper>
          </Grid>
        ) : (
          branches.map((branch) => (
            <Grid item xs={12} md={6} lg={4} key={branch.branch_id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Branch Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon sx={{ color: '#8B4513', fontSize: 28 }} />
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        {branch.branch_name}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(branch)}
                        sx={{ color: '#8B4513' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(branch.branch_id)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {branch.location}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Staff Section */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <GroupIcon sx={{ color: '#8B4513', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Assigned Staff ({branch.users?.length || 0})
                      </Typography>
                    </Box>
                    
                    {branch.users && branch.users.length > 0 ? (
                      <List dense sx={{ p: 0 }}>
                        {branch.users.map((user) => (
                          <ListItem key={user.user_id} sx={{ px: 0, py: 0.5 }}>
                            <ListItemAvatar sx={{ minWidth: 32 }}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: getRoleColor(user.role) }}>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                  {getRoleIcon(user.role)}
                                </Typography>
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
                                    fontSize: '0.7rem',
                                    height: 20,
                                  }}
                                />
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No staff assigned to this branch
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Branch Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#8B4513', color: 'white' }}>
          {editingBranch ? 'Edit Branch' : 'Add New Branch'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Branch Name"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#8B4513',
              '&:hover': { bgcolor: '#654321' },
            }}
          >
            {editingBranch ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
  );
}

export default BranchManagement;