import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  VisibilityOff as ViewOffIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import BMLogo from '../BM-Logo.png';

function Login() {
  const { login } = useUnifiedAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    if (adminToken || userToken) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Navigate to the intended page or dashboard based on user type
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)',
        p: 0,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
            background: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Card
        elevation={24}
        sx={{
          maxWidth: 900,
          width: '100%',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          minHeight: 600,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Left Section - Coffee Illustration */}
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #F5F5DC 0%, #FAF0E6 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, md: 4 },
            position: 'relative',
            minHeight: { xs: 300, md: 'auto' },
          }}
        >
          {/* BM-Logo */}
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={BMLogo}
              alt="Brew Manager Logo"
              sx={{
                height: { xs: 120, md: 150 },
                width: 'auto',
                maxWidth: '100%',
                filter: 'none',
              }}
            />
          </Box>

          {/* Text */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: '#2C2C2C',
              mb: 1,
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            BrewManager
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#2C2C2C',
              textAlign: 'center',
              fontWeight: 400,
              maxWidth: 300,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            A Comprehensive Web Based Management System
          </Typography>
        </Box>

        {/* Right Section - Login Form */}
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 3, md: 4 },
            position: 'relative',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 2,
            }}
          >
            <Box
              component="img"
              src={BMLogo}
              alt="Brew Manager Logo"
              sx={{
                height: 40,
                width: 'auto',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </Box>

          {/* Welcome Text */}
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center',
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Welcome Back, Please login to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
            {/* Email Field */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Email Address
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#F5F5DC',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    padding: '14px',
                  },
                }}
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'white' }}
                      >
                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#F5F5DC',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    padding: '14px',
                  },
                }}
              />
            </Box>

            {/* Remember Me and Forgot Password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: '#F5F5DC',
                      '&.Mui-checked': {
                        color: '#F5F5DC',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Remember me
                  </Typography>
                }
              />
              <Link
                href="#"
                sx={{
                  color: '#F5F5DC',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Sign In Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !formData.email || !formData.password}
              sx={{
                backgroundColor: '#F5F5DC',
                color: '#8B4513',
                height: '48px',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: '#FAF0E6',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(245, 245, 220, 0.3)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#8B4513' }} />
              ) : (
                'Sign in'
              )}
            </Button>

          </Box>
        </Box>
      </Card>

    </Box>
  );
}

export default Login;
