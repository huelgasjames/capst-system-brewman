const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('admin_token');
};

// Helper function to make API requests
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('admin');
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    // Parse JSON response
    const data = await response.json();
    
    // Return response in axios-like format
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config,
    };
  } catch (error) {
    throw error;
  }
};

// Create API object with common HTTP methods
const api = {
  get: (endpoint, config = {}) => {
    return makeRequest(endpoint, {
      method: 'GET',
      ...config,
    });
  },

  post: (endpoint, data, config = {}) => {
    return makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...config,
    });
  },

  put: (endpoint, data, config = {}) => {
    return makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...config,
    });
  },

  delete: (endpoint, config = {}) => {
    return makeRequest(endpoint, {
      method: 'DELETE',
      ...config,
    });
  },

  patch: (endpoint, data, config = {}) => {
    return makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...config,
    });
  },
};

export default api;
