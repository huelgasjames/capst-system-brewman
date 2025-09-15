const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');
  const token = localStorage.getItem('token');
  const admin_token = localStorage.getItem('admin_token');
  
  const selectedToken = adminToken || userToken || token || admin_token;
  
  // Debug logging
  console.log('Token retrieval debug:', {
    adminToken: adminToken ? 'present' : 'missing',
    userToken: userToken ? 'present' : 'missing',
    token: token ? 'present' : 'missing',
    admin_token: admin_token ? 'present' : 'missing',
    selectedToken: selectedToken ? 'present' : 'missing'
  });
  
  return selectedToken;
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

  // Debug logging for request
  console.log('API Request Debug:', {
    url,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    headers: config.headers
  });

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Don't immediately logout - let the calling component handle this
      // This allows for better error handling and user experience
      console.warn('API request returned 401 Unauthorized. Token may be invalid or expired.');
      
      // Try to get more details about the error
      let errorMessage = 'Unauthorized';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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
    // If it's a network error, provide a more helpful message
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and ensure the backend server is running.');
    }
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
