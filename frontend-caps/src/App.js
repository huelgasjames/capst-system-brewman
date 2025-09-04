import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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
      main: '#8B4513', // Saddle Brown
      light: '#A0522D', // Sienna
      dark: '#654321', // Dark Brown
      contrastText: '#fff',
    },
    secondary: {
      main: '#CD853F', // Peru
      light: '#DEB887', // Burlywood
      dark: '#A0522D', // Sienna
      contrastText: '#fff',
    },
    background: {
      default: '#F5F5DC', // Beige
      paper: '#FAF0E6', // Linen
    },
    text: {
      primary: '#2F2F2F',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="branches" element={<BranchManagement />} />
              <Route path="products" element={<ProductMenuManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="pos" element={<PointOfSale />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="financial" element={<FinancialManagement />} />
              <Route path="reports" element={<Reporting />} />
              <Route path="customer-display" element={<CustomerDisplay />} />
              <Route path="kitchen-display" element={<KitchenDisplay />} />
              
              {/* Legacy routes for backward compatibility */}
              <Route path="account" element={<AccountManagement />} />
              <Route path="account/users" element={<UserManagement />} />
            </Route>

            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
