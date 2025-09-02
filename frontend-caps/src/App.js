  import React from 'react';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import { ThemeProvider, createTheme } from '@mui/material/styles';
  import CssBaseline from '@mui/material/CssBaseline';
  import DashboardLayout from './layouts/DashboardLayout';

  // Pages
  import Dashboard from './pages/Dashboard';
  import AccountManagement from './pages/AccountManagement';
  import UserManagement from './pages/UserManagement';
  import BranchManagement from './pages/BranchManagement';
  import ProductMenuManagement from './pages/ProductMenuManagement';
  import InventoryManagement from './pages/InventoryManagement';
  import PointOfSale from './pages/PointOfSale';
  import CustomerManagement from './pages/CustomerManagement';
  import EmployeeManagement from './pages/EmployeeManagement';
  import FinancialManagement from './pages/FinancialManagement';
  import Reporting from './pages/Reporting';
  import CustomerDisplay from './pages/CustomerDisplay';
  import KitchenDisplay from './pages/KitchenDisplay';

  // ✅ Coffee Shop Theme
  const theme = createTheme({
    palette: {
      primary: {
        main: '#8B4513',
        light: '#A0522D',
        dark: '#654321',
      },
      secondary: {
        main: '#D2691E',
        light: '#F4A460',
        dark: '#CD853F',
      },
      background: {
        default: '#F5F5DC',
        paper: '#FFFFFF',
      },
      success: { main: '#4CAF50' },
      warning: { main: '#FF9800' },
      error: { main: '#F44336' },
      info: { main: '#2196F3' },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, fontSize: '2.5rem' },
      h2: { fontWeight: 600, fontSize: '2rem' },
      h3: { fontWeight: 600, fontSize: '1.75rem' },
      h4: { fontWeight: 600, fontSize: '1.5rem' },
      h5: { fontWeight: 500, fontSize: '1.25rem' },
      h6: { fontWeight: 500, fontSize: '1rem' },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            padding: '10px 24px',
          },
          contained: {
            boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)',
            '&:hover': { boxShadow: '0 4px 12px rgba(139, 69, 19, 0.4)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: 12,
            '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' },
        },
      },
    },
  });

  function App() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* ✅ All dashboard pages use DashboardLayout */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/account" element={<AccountManagement />} />
              <Route path="/account/users" element={<UserManagement />} />
              <Route path="/branches" element={<BranchManagement />} />
              <Route path="/products" element={<ProductMenuManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/pos" element={<PointOfSale />} />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/financial" element={<FinancialManagement />} />
              <Route path="/reports" element={<Reporting />} />
              <Route path="/customer-display" element={<CustomerDisplay />} />
              <Route path="/kitchen-display" element={<KitchenDisplay />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    );
  }

  export default App;
