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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory2 as InventoryIcon,
  ReceiptLong as ReceiptIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import bmLogo from '../BM-Logo.png';

const drawerWidth = 260;

function Sidebar() {
  return (
    <Box
      sx={{
        width: drawerWidth,
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #FFF8F0 0%, #F7E9D7 100%)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        minHeight: 'calc(100vh - 80px)',
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

        <List>
          <ListItemButton>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </List>

        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon fontSize="small" />
              <Typography>User Management</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="Users" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="Roles" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="Permissions" />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon fontSize="small" />
              <Typography>Inventory</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="Items" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="Suppliers" />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon fontSize="small" />
              <Typography>Reports</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="Sales" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="Inventory" />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon fontSize="small" />
              <Typography>Settings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="General" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}

export const SIDEBAR_WIDTH = drawerWidth;
export default Sidebar;


