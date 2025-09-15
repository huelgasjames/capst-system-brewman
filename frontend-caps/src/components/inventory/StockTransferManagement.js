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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  SwapHoriz as TransferIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  DateRange as DateRangeIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { stockTransferService } from '../../services/inventoryService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stock-transfer-tabpanel-${index}`}
      aria-labelledby={`stock-transfer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function StockTransferManagement() {
  const { user } = useUnifiedAuth();
  const [tabValue, setTabValue] = useState(0);
  const [stockTransfers, setStockTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog states
  const [transferDialog, setTransferDialog] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [viewingTransfer, setViewingTransfer] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);

  // Form states
  const [transferForm, setTransferForm] = useState({
    to_branch_id: '',
    notes: '',
    items: []
  });

  const [newItem, setNewItem] = useState({
    product_id: '',
    requested_quantity: '',
    notes: ''
  });

  const [approvalForm, setApprovalForm] = useState({
    approved_items: []
  });

  const [completionForm, setCompletionForm] = useState({
    transferred_items: []
  });

  // Statistics
  const [stats, setStats] = useState({
    totalTransfers: 0,
    pendingTransfers: 0,
    approvedTransfers: 0,
    completedTransfers: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStockTransfers(),
        fetchBranches(),
        fetchProducts(),
        calculateStats()
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockTransfers = async () => {
    try {
      const response = await stockTransferService.getStockTransfers();
      setStockTransfers(response.data.data?.data || response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch stock transfers:', err);
      setError('Failed to fetch stock transfers');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      const data = await response.json();
      setBranches(data.data?.data || data.data || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.data?.data || data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const calculateStats = () => {
    const totalTransfers = stockTransfers.length;
    const pendingTransfers = stockTransfers.filter(st => st.status === 'pending').length;
    const approvedTransfers = stockTransfers.filter(st => st.status === 'approved').length;
    const completedTransfers = stockTransfers.filter(st => st.status === 'completed').length;

    setStats({
      totalTransfers,
      pendingTransfers,
      approvedTransfers,
      completedTransfers
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    
    if (transferForm.items.length === 0) {
      setError('Please add at least one item to the transfer request');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (editingTransfer) {
        await stockTransferService.updateStockTransfer(editingTransfer.transfer_id, transferForm);
        setSuccess('Stock transfer updated successfully');
      } else {
        await stockTransferService.createStockTransfer(transferForm);
        setSuccess('Stock transfer request created successfully');
      }
      
      setTransferDialog(false);
      setEditingTransfer(null);
      resetTransferForm();
      fetchData();
    } catch (err) {
      console.error('Stock transfer submission error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save stock transfer';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.requested_quantity) {
      setError('Please fill in all item fields');
      return;
    }

    const product = products.find(p => p.product_id === parseInt(newItem.product_id));
    if (!product) {
      setError('Product not found');
      return;
    }

    // Check if product has sufficient stock
    const currentStock = product.current_stock || 0;
    if (currentStock < parseInt(newItem.requested_quantity)) {
      setError(`Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${newItem.requested_quantity}`);
      return;
    }

    const item = {
      product_id: parseInt(newItem.product_id),
      requested_quantity: parseInt(newItem.requested_quantity),
      notes: newItem.notes
    };

    setTransferForm(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      product_id: '',
      requested_quantity: '',
      notes: ''
    });
  };

  const handleRemoveItem = (index) => {
    setTransferForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleApprove = async (transfer) => {
    setApprovalForm({
      approved_items: transfer.items.map(item => ({
        item_id: item.item_id,
        approved_quantity: item.requested_quantity
      }))
    });
    setApprovalDialog(transfer);
  };

  const handleApprovalSubmit = async () => {
    try {
      await stockTransferService.approveStockTransfer(approvalDialog.transfer_id, approvalForm);
      setSuccess('Stock transfer approved successfully');
      setApprovalDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve stock transfer');
    }
  };

  const handleComplete = async (transfer) => {
    setCompletionForm({
      transferred_items: transfer.items.map(item => ({
        item_id: item.item_id,
        transferred_quantity: item.approved_quantity || item.requested_quantity
      }))
    });
    setCompletionDialog(transfer);
  };

  const handleCompletionSubmit = async () => {
    try {
      await stockTransferService.completeStockTransfer(completionDialog.transfer_id, completionForm);
      setSuccess('Stock transfer completed successfully');
      setCompletionDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete stock transfer');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this stock transfer request?')) {
      try {
        await stockTransferService.rejectStockTransfer(id);
        setSuccess('Stock transfer rejected successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to reject stock transfer');
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this stock transfer?')) {
      try {
        await stockTransferService.cancelStockTransfer(id);
        setSuccess('Stock transfer cancelled successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel stock transfer');
      }
    }
  };

  const resetTransferForm = () => {
    setTransferForm({
      to_branch_id: '',
      notes: '',
      items: []
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'in_transit': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'in_transit': return <ShippingIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'cancelled': return <CancelIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const canModify = (transfer) => {
    return transfer.status === 'pending';
  };

  const canApprove = (transfer) => {
    return user?.role === 'Admin' && transfer.status === 'pending';
  };

  const canComplete = (transfer) => {
    return ['approved', 'in_transit'].includes(transfer.status);
  };

  const canReject = (transfer) => {
    return user?.role === 'Admin' && transfer.status === 'pending';
  };

  const canCancel = (transfer) => {
    return ['pending', 'approved'].includes(transfer.status);
  };

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
                <TransferIcon sx={{ fontSize: 40 }} />
                Stock Transfer Management
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Manage inter-branch stock transfers and inventory movements
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetTransferForm();
                setEditingTransfer(null);
                setError(null);
                setTransferDialog(true);
              }}
              size="large"
              sx={{
                bgcolor: 'primary.main',
                fontSize: '1.1rem',
                px: 3,
                py: 1.5,
                height: '48px',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)',
                '&:hover': { 
                  bgcolor: 'primary.dark',
                  boxShadow: '0 6px 16px rgba(139, 69, 19, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Request Transfer
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '140px', borderRadius: 3 }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AssignmentIcon sx={{ color: '#8B4513', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Total Transfers
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalTransfers}
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
                  <PendingIcon sx={{ color: '#FF9800', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Pending Approval
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.pendingTransfers}
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
                  <CheckCircleIcon sx={{ color: '#4CAF50', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Approved
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.approvedTransfers}
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
                  <ShippingIcon sx={{ color: '#2196F3', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Completed
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.completedTransfers}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ width: '100%', borderRadius: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="stock transfer tabs"
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
              <Tab label="All Transfers" />
              <Tab 
                label={
                  <Badge badgeContent={stats.pendingTransfers} color="warning">
                    Pending Approval
                  </Badge>
                } 
              />
              <Tab label="My Transfers" />
            </Tabs>
          </Box>

          {/* All Transfers Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Transfer Number</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>From Branch</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>To Branch</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Request Date</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Requested By</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockTransfers.map((transfer) => (
                    <TableRow key={transfer.transfer_id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.transfer_number}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.fromBranch?.branch_name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.toBranch?.branch_name}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          icon={getStatusIcon(transfer.status)}
                          label={transfer.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(transfer.status)}
                          size="medium"
                          sx={{ fontSize: '1rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>
                        {new Date(transfer.request_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.requestedBy?.name}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewingTransfer(transfer)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {canModify(transfer) && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingTransfer(transfer);
                                  setTransferForm({
                                    to_branch_id: transfer.to_branch_id,
                                    notes: transfer.notes || '',
                                    items: transfer.items || []
                                  });
                                  setTransferDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canApprove(transfer) && (
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprove(transfer)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canComplete(transfer) && (
                            <Tooltip title="Complete">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleComplete(transfer)}
                              >
                                <ShippingIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canReject(transfer) && (
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReject(transfer.transfer_id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canCancel(transfer) && (
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancel(transfer.transfer_id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Pending Approval Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Transfer Number</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>From Branch</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>To Branch</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Requested By</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Items Count</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockTransfers
                    .filter(transfer => transfer.status === 'pending')
                    .map((transfer) => (
                    <TableRow key={transfer.transfer_id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.transfer_number}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.fromBranch?.branch_name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.toBranch?.branch_name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.requestedBy?.name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.items?.length || 0}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewingTransfer(transfer)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {canApprove(transfer) && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleApprove(transfer)}
                            >
                              Approve
                            </Button>
                          )}

                          {canReject(transfer) && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleReject(transfer.transfer_id)}
                            >
                              Reject
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* My Transfers Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Transfer Number</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>From Branch</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>To Branch</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Request Date</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockTransfers
                    .filter(transfer => transfer.requested_by === user?.user_id)
                    .map((transfer) => (
                    <TableRow key={transfer.transfer_id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.transfer_number}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.fromBranch?.branch_name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{transfer.toBranch?.branch_name}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          icon={getStatusIcon(transfer.status)}
                          label={transfer.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(transfer.status)}
                          size="medium"
                          sx={{ fontSize: '1rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>
                        {new Date(transfer.request_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewingTransfer(transfer)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {canModify(transfer) && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingTransfer(transfer);
                                  setTransferForm({
                                    to_branch_id: transfer.to_branch_id,
                                    notes: transfer.notes || '',
                                    items: transfer.items || []
                                  });
                                  setTransferDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canComplete(transfer) && (
                            <Tooltip title="Complete">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleComplete(transfer)}
                              >
                                <ShippingIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canCancel(transfer) && (
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancel(transfer.transfer_id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>

        {/* Create/Edit Transfer Dialog */}
        <Dialog 
          open={transferDialog} 
          onClose={() => {
            setTransferDialog(false);
            setError(null);
          }} 
          maxWidth="lg" 
          fullWidth
        >
          <DialogTitle sx={{ pb: 3, fontSize: '1.8rem', fontWeight: 'bold' }}>
            {editingTransfer ? 'Edit Stock Transfer' : 'Create New Stock Transfer Request'}
          </DialogTitle>
          <form onSubmit={handleTransferSubmit}>
            <DialogContent sx={{ px: 4, py: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, fontSize: '1.1rem' }}>
                  {error}
                </Alert>
              )}
              
              <Grid container spacing={4} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="large">
                    <InputLabel sx={{ fontSize: '1.1rem' }}>To Branch *</InputLabel>
                    <Select
                      value={transferForm.to_branch_id}
                      onChange={(e) => setTransferForm({ ...transferForm, to_branch_id: e.target.value })}
                      required
                      sx={{
                        fontSize: '1.2rem',
                        height: '64px',
                        '& .MuiSelect-select': {
                          padding: '16px 14px',
                        },
                      }}
                    >
                      {branches
                        .filter(branch => branch.branch_id !== user?.branch_id)
                        .map((branch) => (
                        <MenuItem key={branch.branch_id} value={branch.branch_id} sx={{ fontSize: '1.1rem' }}>
                          {branch.branch_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={transferForm.notes}
                    onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                    size="large"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '1.2rem',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem',
                      },
                    }}
                  />
                </Grid>

                {/* Add Items Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Add Items
                    </Typography>
                  </Divider>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="large">
                        <InputLabel>Product *</InputLabel>
                        <Select
                          value={newItem.product_id}
                          onChange={(e) => setNewItem({ ...newItem, product_id: e.target.value })}
                          required
                        >
                          {products
                            .filter(product => product.branch_id === user?.branch_id)
                            .map((product) => (
                            <MenuItem key={product.product_id} value={product.product_id}>
                              {product.name} (Stock: {product.current_stock || 0})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Quantity *"
                        type="number"
                        value={newItem.requested_quantity}
                        onChange={(e) => setNewItem({ ...newItem, requested_quantity: e.target.value })}
                        required
                        size="large"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Notes"
                        value={newItem.notes}
                        onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                        size="large"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={1}>
                      <Button
                        variant="contained"
                        onClick={handleAddItem}
                        size="large"
                        sx={{ height: '56px', minWidth: '56px' }}
                      >
                        <AddIcon />
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Items List */}
                  {transferForm.items.length > 0 && (
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Requested Quantity</TableCell>
                            <TableCell>Current Stock</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transferForm.items.map((item, index) => {
                            const product = products.find(p => p.product_id === item.product_id);
                            return (
                              <TableRow key={index}>
                                <TableCell>{product?.name}</TableCell>
                                <TableCell>{item.requested_quantity}</TableCell>
                                <TableCell>{product?.current_stock || 0}</TableCell>
                                <TableCell>{item.notes}</TableCell>
                                <TableCell>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleRemoveItem(index)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 4, pt: 2 }}>
              <Button 
                onClick={() => setTransferDialog(false)} 
                size="large"
                sx={{ 
                  fontSize: '1.2rem',
                  px: 4,
                  py: 1.5,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(139, 69, 19, 0.05)',
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading} 
                size="large"
                sx={{ 
                  fontSize: '1.2rem',
                  px: 4,
                  py: 1.5,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(139, 69, 19, 0.3)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Transfer Request'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog 
          open={!!approvalDialog} 
          onClose={() => setApprovalDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Approve Stock Transfer - {approvalDialog?.transfer_number}
          </DialogTitle>
          <DialogContent>
            {approvalDialog && (
              <Box>
                <Typography variant="h6" gutterBottom>Review and Approve Items</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Requested</TableCell>
                        <TableCell>Available Stock</TableCell>
                        <TableCell>Approved Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {approvalDialog.items?.map((item, index) => {
                        const product = products.find(p => p.product_id === item.product_id);
                        return (
                          <TableRow key={index}>
                            <TableCell>{product?.name}</TableCell>
                            <TableCell>{item.requested_quantity}</TableCell>
                            <TableCell>{product?.current_stock || 0}</TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={approvalForm.approved_items[index]?.approved_quantity || item.requested_quantity}
                                onChange={(e) => {
                                  const newApprovedItems = [...approvalForm.approved_items];
                                  newApprovedItems[index] = {
                                    ...newApprovedItems[index],
                                    item_id: item.item_id,
                                    approved_quantity: parseInt(e.target.value) || 0
                                  };
                                  setApprovalForm({ approved_items: newApprovedItems });
                                }}
                                inputProps={{ min: 0, max: item.requested_quantity }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleApprovalSubmit}
            >
              Approve Transfer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Completion Dialog */}
        <Dialog 
          open={!!completionDialog} 
          onClose={() => setCompletionDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Complete Stock Transfer - {completionDialog?.transfer_number}
          </DialogTitle>
          <DialogContent>
            {completionDialog && (
              <Box>
                <Typography variant="h6" gutterBottom>Confirm Transferred Quantities</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Approved</TableCell>
                        <TableCell>Transferred Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completionDialog.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product?.name}</TableCell>
                          <TableCell>{item.approved_quantity || item.requested_quantity}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={completionForm.transferred_items[index]?.transferred_quantity || item.approved_quantity || item.requested_quantity}
                              onChange={(e) => {
                                const newTransferredItems = [...completionForm.transferred_items];
                                newTransferredItems[index] = {
                                  ...newTransferredItems[index],
                                  item_id: item.item_id,
                                  transferred_quantity: parseInt(e.target.value) || 0
                                };
                                setCompletionForm({ transferred_items: newTransferredItems });
                              }}
                              inputProps={{ min: 0, max: item.approved_quantity || item.requested_quantity }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompletionDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleCompletionSubmit}
            >
              Complete Transfer
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Transfer Dialog */}
        <Dialog 
          open={!!viewingTransfer} 
          onClose={() => setViewingTransfer(null)} 
          maxWidth="lg" 
          fullWidth
        >
          <DialogTitle>
            Stock Transfer Details - {viewingTransfer?.transfer_number}
          </DialogTitle>
          <DialogContent>
            {viewingTransfer && (
              <Box>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Transfer Information</Typography>
                    <Typography><strong>From Branch:</strong> {viewingTransfer.fromBranch?.branch_name}</Typography>
                    <Typography><strong>To Branch:</strong> {viewingTransfer.toBranch?.branch_name}</Typography>
                    <Typography><strong>Status:</strong> 
                      <Chip 
                        label={viewingTransfer.status.replace('_', ' ').toUpperCase()} 
                        color={getStatusColor(viewingTransfer.status)}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography><strong>Request Date:</strong> {new Date(viewingTransfer.request_date).toLocaleDateString()}</Typography>
                    <Typography><strong>Requested By:</strong> {viewingTransfer.requestedBy?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Additional Information</Typography>
                    <Typography><strong>Approved Date:</strong> {viewingTransfer.approved_date ? new Date(viewingTransfer.approved_date).toLocaleDateString() : 'N/A'}</Typography>
                    <Typography><strong>Approved By:</strong> {viewingTransfer.approvedBy?.name || 'N/A'}</Typography>
                    <Typography><strong>Completed Date:</strong> {viewingTransfer.completed_date ? new Date(viewingTransfer.completed_date).toLocaleDateString() : 'N/A'}</Typography>
                    <Typography><strong>Notes:</strong> {viewingTransfer.notes || 'None'}</Typography>
                  </Grid>
                </Grid>

                {viewingTransfer.items && viewingTransfer.items.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Transfer Items</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Requested</TableCell>
                            <TableCell>Approved</TableCell>
                            <TableCell>Transferred</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewingTransfer.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.product?.name}</TableCell>
                              <TableCell>{item.requested_quantity}</TableCell>
                              <TableCell>{item.approved_quantity || 'N/A'}</TableCell>
                              <TableCell>{item.transferred_quantity || 'N/A'}</TableCell>
                              <TableCell>{item.notes}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewingTransfer(null)}>Close</Button>
          </DialogActions>
        </Dialog>

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

export default StockTransferManagement;
