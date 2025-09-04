import React from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory2 as InventoryIcon,
  ReceiptLong as ReceiptIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  PointOfSale as POSIcon,
  Kitchen as KitchenIcon,
  AccountBalance as FinanceIcon,
  Person as CustomerIcon,
} from '@mui/icons-material';
import bmLogo from '../BM-Logo.png';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 260;

function Sidebar() {
  const location = useLocation();
  
  // Mock user data for development
  const currentUser = {
    name: 'Developer',
    role: 'Developer'
  };

  const isActive = (path) => location.pathname === path;

  // Mock permissions for development - allow all access
  const canManageUsers = true;
  const canManageBranches = true;
  const canManageSystem = true;

  // Helper function to get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'Owner': return 'Business Owner';
      case 'Super Admin': return 'Super Administrator';
      case 'Admin': return 'Administrator';
      case 'Manager': return 'Branch Manager';
      case 'Staff': return 'Staff Member';
      default: return role;
    }
  };

  return (
    <Box
      sx={{
        width: drawerWidth,
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #FFF8F0 0%, #F7E9D7 100%)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        minHeight: '100vh',
        pt: '80px',
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Sidebar Logo */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1,
          pb: 2,
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
          <img
            src={bmLogo}
            alt="BrewManager"
            style={{ height: 88, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
          />
        </Box>

        {/* User Role Display */}
        {currentUser && (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'rgba(139, 69, 19, 0.1)', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
              {currentUser.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#A0522D' }}>
              {getRoleDisplayName(currentUser.role)}
            </Typography>
          </Box>
        )}

        <List>
          <ListItemButton 
            component={Link} 
            to="/dashboard"
            selected={isActive('/dashboard')}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                bgcolor: 'rgba(139, 69, 19, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(139, 69, 19, 0.15)',
                },
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: '#8B4513' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </List>

        {/* User Management Section */}
        {canManageUsers && (
          <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon fontSize="small" sx={{ color: '#8B4513' }} />
                <Typography sx={{ color: '#8B4513', fontWeight: 'bold' }}>User Management</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List disablePadding>
                <ListItemButton 
                  component={Link} 
                  to="/users"
                  selected={isActive('/users')}
                  sx={{
                    pl: 4,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(139, 69, 19, 0.1)',
                    },
                  }}
                >
                  <ListItemText primary="Users" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemText primary="Role Management" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemText primary="Permissions" />
                </ListItemButton>
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Branch Management Section */}
        {canManageBranches && (
          <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon fontSize="small" sx={{ color: '#8B4513' }} />
                <Typography sx={{ color: '#8B4513', fontWeight: 'bold' }}>Branch Management</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List disablePadding>
                <ListItemButton 
                  component={Link} 
                  to="/branches"
                  selected={isActive('/branches')}
                  sx={{
                    pl: 4,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(139, 69, 19, 0.1)',
                    },
                  }}
                >
                  <ListItemText primary="Branches" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemText primary="Branch Overview" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemText primary="Staff Assignment" />
                </ListItemButton>
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Operations Section */}
        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <POSIcon fontSize="small" sx={{ color: '#8B4513' }} />
              <Typography sx={{ color: '#8B4513', fontWeight: 'bold' }}>Operations</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/pos">
                <ListItemText primary="Point of Sale" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/kitchen-display">
                <ListItemText primary="Kitchen Display" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/inventory">
                <ListItemText primary="Inventory Management" />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Customer Management */}
        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CustomerIcon fontSize="small" sx={{ color: '#8B4513' }} />
              <Typography sx={{ color: '#8B4513', fontWeight: 'bold' }}>Customers</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/customers">
                <ListItemText primary="Customer Database" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/loyalty">
                <ListItemText primary="Loyalty Program" />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Financial Management */}
        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FinanceIcon fontSize="small" sx={{ color: '#8B4513' }} />
              <Typography sx={{ color: '#8B4513', fontWeight: 'bold' }}>Financial</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/financial">
                <ListItemText primary="Financial Reports" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/expenses">
                <ListItemText primary="Expense Tracking" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/payroll">
                <ListItemText primary="Payroll" />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Reports & Analytics */}
        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon fontSize="small" sx={{ color: '#8B4513' }} />
              <Typography sx={{ color: '#8B4513', fontWeight: 'bold' }}>Reports</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/reports">
                <ListItemText primary="Sales Reports" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/analytics">
                <ListItemText primary="Analytics Dashboard" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/export">
                <ListItemText primary="Export Data" />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* System Settings - Available in Development */}
        {canManageSystem && (
          <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon fontSize="small" sx={{ color: '#8B4513' }} />
                <Typography sx={{ color: '#8B4513', fontWeight: 'bold' }}>System Settings</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List disablePadding>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/settings">
                  <ListItemText primary="General Settings" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/security">
                  <ListItemText primary="Security & Access" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/backup">
                  <ListItemText primary="Backup & Restore" />
                </ListItemButton>
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Quick Actions */}
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: '#8B4513', fontWeight: 'bold', mb: 1, display: 'block' }}>
            Quick Actions
          </Typography>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ 
              borderColor: '#8B4513', 
              color: '#8B4513',
              mb: 1,
              '&:hover': {
                borderColor: '#A0522D',
                bgcolor: 'rgba(139, 69, 19, 0.05)',
              }
            }}
          >
            New Sale
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ 
              borderColor: '#8B4513', 
              color: '#8B4513',
              '&:hover': {
                borderColor: '#A0522D',
                bgcolor: 'rgba(139, 69, 19, 0.05)',
              }
            }}
          >
            Add Customer
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Sidebar;


