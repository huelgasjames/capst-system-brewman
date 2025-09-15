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
  ShoppingCart as PurchaseOrderIcon,
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
} from '@mui/icons-material';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { purchaseOrderService, supplierService } from '../../services/inventoryService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`purchase-order-tabpanel-${index}`}
      aria-labelledby={`purchase-order-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function PurchaseOrderManagement() {
  const { user } = useUnifiedAuth();
  const [tabValue, setTabValue] = useState(0);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog states
  const [purchaseOrderDialog, setPurchaseOrderDialog] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState(null);
  const [viewingPurchaseOrder, setViewingPurchaseOrder] = useState(null);

  // Form states
  const [purchaseOrderForm, setPurchaseOrderForm] = useState({
    supplier_id: '',
    expected_delivery_date: '',
    notes: '',
    items: []
  });

  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: '',
    unit_price: '',
    notes: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    deliveredOrders: 0,
    totalValue: 0
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
        fetchPurchaseOrders(),
        fetchSuppliers(),
        fetchLowStockProducts(),
        calculateStats()
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await purchaseOrderService.getPurchaseOrders();
      setPurchaseOrders(response.data.data?.data || response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch purchase orders:', err);
      setError('Failed to fetch purchase orders');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getActiveSuppliers();
      setSuppliers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await purchaseOrderService.getLowStockProducts();
      setLowStockProducts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch low stock products:', err);
    }
  };

  const calculateStats = () => {
    const totalOrders = purchaseOrders.length;
    const pendingOrders = purchaseOrders.filter(po => po.status === 'pending_approval').length;
    const approvedOrders = purchaseOrders.filter(po => po.status === 'approved').length;
    const deliveredOrders = purchaseOrders.filter(po => po.status === 'delivered').length;
    const totalValue = purchaseOrders.reduce((sum, po) => sum + (parseFloat(po.total_amount) || 0), 0);

    setStats({
      totalOrders,
      pendingOrders,
      approvedOrders,
      deliveredOrders,
      totalValue
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePurchaseOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (purchaseOrderForm.items.length === 0) {
      setError('Please add at least one item to the purchase order');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (editingPurchaseOrder) {
        await purchaseOrderService.updatePurchaseOrder(editingPurchaseOrder.purchase_order_id, purchaseOrderForm);
        setSuccess('Purchase order updated successfully');
      } else {
        await purchaseOrderService.createPurchaseOrder(purchaseOrderForm);
        setSuccess('Purchase order created successfully');
      }
      
      setPurchaseOrderDialog(false);
      setEditingPurchaseOrder(null);
      resetPurchaseOrderForm();
      fetchData();
    } catch (err) {
      console.error('Purchase order submission error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save purchase order';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.quantity || !newItem.unit_price) {
      setError('Please fill in all item fields');
      return;
    }

    const product = lowStockProducts.find(p => p.product_id === parseInt(newItem.product_id));
    if (!product) {
      setError('Product not found');
      return;
    }

    const item = {
      product_id: parseInt(newItem.product_id),
      quantity: parseInt(newItem.quantity),
      unit_price: parseFloat(newItem.unit_price),
      notes: newItem.notes
    };

    setPurchaseOrderForm(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      product_id: '',
      quantity: '',
      unit_price: '',
      notes: ''
    });
  };

  const handleRemoveItem = (index) => {
    setPurchaseOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await purchaseOrderService.submitForApproval(id);
      setSuccess('Purchase order submitted for approval');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit for approval');
    }
  };

  const handleApprove = async (id) => {
    try {
      await purchaseOrderService.approvePurchaseOrder(id);
      setSuccess('Purchase order approved successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve purchase order');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this purchase order?')) {
      try {
        await purchaseOrderService.cancelPurchaseOrder(id);
        setSuccess('Purchase order cancelled successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel purchase order');
      }
    }
  };

  const resetPurchaseOrderForm = () => {
    setPurchaseOrderForm({
      supplier_id: '',
      expected_delivery_date: '',
      notes: '',
      items: []
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending_approval': return 'warning';
      case 'approved': return 'info';
      case 'ordered': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <EditIcon />;
      case 'pending_approval': return <PendingIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'ordered': return <ShippingIcon />;
      case 'delivered': return <CheckCircleIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const canModify = (purchaseOrder) => {
    return ['draft', 'pending_approval'].includes(purchaseOrder.status);
  };

  const canApprove = (purchaseOrder) => {
    return user?.role === 'Admin' && purchaseOrder.status === 'pending_approval';
  };

  const canSubmit = (purchaseOrder) => {
    return purchaseOrder.status === 'draft';
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
                <PurchaseOrderIcon sx={{ fontSize: 40 }} />
                Purchase Order Management
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Create and manage purchase orders for inventory restocking
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetPurchaseOrderForm();
                setEditingPurchaseOrder(null);
                setError(null);
                setPurchaseOrderDialog(true);
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
              Create Purchase Order
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
                      Total Orders
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalOrders}
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
                      {stats.pendingOrders}
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
                      Delivered
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.deliveredOrders}
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
                  <MoneyIcon sx={{ color: '#2196F3', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Total Value
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ₱{stats.totalValue.toFixed(2)}
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
              aria-label="purchase order tabs"
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
              <Tab label="All Purchase Orders" />
              <Tab 
                label={
                  <Badge badgeContent={stats.pendingOrders} color="warning">
                    Pending Approval
                  </Badge>
                } 
              />
              <Tab label="Low Stock Products" />
            </Tabs>
          </Box>

          {/* All Purchase Orders Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Order Number</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Supplier</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Order Date</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Expected Delivery</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Total Amount</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrders.map((order) => (
                    <TableRow key={order.purchase_order_id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{order.order_number}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{order.supplier?.supplier_name}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(order.status)}
                          size="medium"
                          sx={{ fontSize: '1rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>
                        {new Date(order.order_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>
                        {order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2, fontWeight: 'bold' }}>
                        ₱{parseFloat(order.total_amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewingPurchaseOrder(order)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {canModify(order) && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingPurchaseOrder(order);
                                  setPurchaseOrderForm({
                                    supplier_id: order.supplier_id,
                                    expected_delivery_date: order.expected_delivery_date || '',
                                    notes: order.notes || '',
                                    items: order.items || []
                                  });
                                  setPurchaseOrderDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canSubmit(order) && (
                            <Tooltip title="Submit for Approval">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleSubmitForApproval(order.purchase_order_id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canApprove(order) && (
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprove(order.purchase_order_id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canModify(order) && (
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancel(order.purchase_order_id)}
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
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Order Number</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Supplier</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Created By</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Total Amount</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrders
                    .filter(order => order.status === 'pending_approval')
                    .map((order) => (
                    <TableRow key={order.purchase_order_id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{order.order_number}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{order.supplier?.supplier_name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{order.createdBy?.name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2, fontWeight: 'bold' }}>
                        ₱{parseFloat(order.total_amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewingPurchaseOrder(order)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {canApprove(order) && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleApprove(order.purchase_order_id)}
                            >
                              Approve
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

          {/* Low Stock Products Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Product Name</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Category</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Current Stock</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Low Stock Threshold</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Base Price</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.product_id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{product.name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{product.category}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2, fontWeight: 'bold' }}>
                        {product.current_stock}
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{product.low_stock_threshold}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>₱{product.base_price}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={product.status_with_color?.status}
                          color={product.status_with_color?.color}
                          size="medium"
                          sx={{ fontSize: '1rem', fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>

        {/* Create/Edit Purchase Order Dialog */}
        <Dialog 
          open={purchaseOrderDialog} 
          onClose={() => {
            setPurchaseOrderDialog(false);
            setError(null);
          }} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              minHeight: '80vh',
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 3, fontSize: '1.8rem', fontWeight: 'bold' }}>
            {editingPurchaseOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
          </DialogTitle>
          <form onSubmit={handlePurchaseOrderSubmit}>
            <DialogContent sx={{ px: 4, py: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, fontSize: '1.1rem' }}>
                  {error}
                </Alert>
              )}
              
              <Grid container spacing={4} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="large">
                    <InputLabel sx={{ fontSize: '1.1rem' }}>Supplier *</InputLabel>
                    <Select
                      value={purchaseOrderForm.supplier_id}
                      onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, supplier_id: e.target.value })}
                      required
                      sx={{
                        fontSize: '1.2rem',
                        height: '64px',
                        '& .MuiSelect-select': {
                          padding: '16px 14px',
                        },
                      }}
                    >
                      {suppliers.map((supplier) => (
                        <MenuItem key={supplier.supplier_id} value={supplier.supplier_id} sx={{ fontSize: '1.1rem' }}>
                          {supplier.supplier_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expected Delivery Date"
                    type="date"
                    value={purchaseOrderForm.expected_delivery_date}
                    onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, expected_delivery_date: e.target.value })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    size="large"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '1.2rem',
                        padding: '16px 14px',
                        height: '64px',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={purchaseOrderForm.notes}
                    onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, notes: e.target.value })}
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
                          {lowStockProducts.map((product) => (
                            <MenuItem key={product.product_id} value={product.product_id}>
                              {product.name} (Stock: {product.current_stock})
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
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                        required
                        size="large"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Unit Price *"
                        type="number"
                        step="0.01"
                        value={newItem.unit_price}
                        onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                        required
                        size="large"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
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
                  {purchaseOrderForm.items.length > 0 && (
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit Price</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {purchaseOrderForm.items.map((item, index) => {
                            const product = lowStockProducts.find(p => p.product_id === item.product_id);
                            return (
                              <TableRow key={index}>
                                <TableCell>{product?.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>₱{item.unit_price}</TableCell>
                                <TableCell>₱{(item.quantity * item.unit_price).toFixed(2)}</TableCell>
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
                onClick={() => setPurchaseOrderDialog(false)} 
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Purchase Order'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* View Purchase Order Dialog */}
        <Dialog 
          open={!!viewingPurchaseOrder} 
          onClose={() => setViewingPurchaseOrder(null)} 
          maxWidth="lg" 
          fullWidth
        >
          <DialogTitle>
            Purchase Order Details - {viewingPurchaseOrder?.order_number}
          </DialogTitle>
          <DialogContent>
            {viewingPurchaseOrder && (
              <Box>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Supplier Information</Typography>
                    <Typography><strong>Name:</strong> {viewingPurchaseOrder.supplier?.supplier_name}</Typography>
                    <Typography><strong>Contact:</strong> {viewingPurchaseOrder.supplier?.contact_person}</Typography>
                    <Typography><strong>Phone:</strong> {viewingPurchaseOrder.supplier?.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Order Information</Typography>
                    <Typography><strong>Status:</strong> 
                      <Chip 
                        label={viewingPurchaseOrder.status.replace('_', ' ').toUpperCase()} 
                        color={getStatusColor(viewingPurchaseOrder.status)}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography><strong>Order Date:</strong> {new Date(viewingPurchaseOrder.order_date).toLocaleDateString()}</Typography>
                    <Typography><strong>Expected Delivery:</strong> {viewingPurchaseOrder.expected_delivery_date ? new Date(viewingPurchaseOrder.expected_delivery_date).toLocaleDateString() : 'N/A'}</Typography>
                    <Typography><strong>Total Amount:</strong> ₱{parseFloat(viewingPurchaseOrder.total_amount || 0).toFixed(2)}</Typography>
                  </Grid>
                </Grid>

                {viewingPurchaseOrder.items && viewingPurchaseOrder.items.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Order Items</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit Price</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Received</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewingPurchaseOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.product?.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>₱{item.unit_price}</TableCell>
                              <TableCell>₱{item.total_price}</TableCell>
                              <TableCell>{item.received_quantity || 0}</TableCell>
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
            <Button onClick={() => setViewingPurchaseOrder(null)}>Close</Button>
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

export default PurchaseOrderManagement;
