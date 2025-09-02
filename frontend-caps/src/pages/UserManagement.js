import React, { useState, useEffect } from 'react';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    branch_id: ''
  });

  // Backend API URL - adjust this to match your Laravel backend
  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText} - ${text.substring(0, 120)}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON, received: ${text.substring(0, 120)}`);
      }

      const data = await response.json();

      // Support multiple shapes: array, {data: [...]}, or {users: [...]}
      const usersArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.users)
        ? data.users
        : [];

      setUsers(usersArray);
      if (!Array.isArray(usersArray)) {
        setError('Unexpected users response shape');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Error connecting to backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create or update user
  const saveUser = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser 
        ? `${API_BASE_URL}/users/${editingUser.id}`
        : `${API_BASE_URL}/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        branch_id: formData.branch_id ? Number(formData.branch_id) : undefined,
      };
      if (!editingUser || (formData.password && formData.password.trim() !== '')) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText} - ${text.substring(0, 120)}`);
      }

      // Attempt to parse JSON, but tolerate empty body (204)
      let data = null;
      const respText = await response.text();
      if (respText) {
        try { data = JSON.parse(respText); } catch (_) { /* ignore parse error */ }
      }

      await fetchUsers(); // Refresh the list
      resetForm();
      alert(editingUser ? 'User updated successfully!' : 'User created successfully!');
    } catch (err) {
      setError('Error saving user: ' + err.message);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status} ${response.statusText} - ${text.substring(0, 120)}`);
        }

        await fetchUsers(); // Refresh the list
        alert('User deleted successfully!');
      } catch (err) {
        setError('Error deleting user: ' + err.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: '', branch_id: '' });
    setEditingUser(null);
    setShowForm(false);
  };

  // Edit user
  const editUser = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      role: user.role || '',
      branch_id: user.branch_id != null ? String(user.branch_id) : ''
    });
    setEditingUser(user);
    setShowForm(true);
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>User Management</h1>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Management</h1>
      
      {error && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          margin: '10px 0',
          border: '1px solid #ef5350',
          borderRadius: '4px'
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {showForm && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '4px',
          background: '#f9f9f9'
        }}>
          <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={saveUser}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Password {editingUser && '(leave blank to keep current)'}:
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!editingUser}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
                placeholder="Owner / Branch Manager / Cashier / Barista / Staff"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Branch ID:</label>
              <input
                type="number"
                value={formData.branch_id}
                onChange={(e) => setFormData({...formData, branch_id: e.target.value})}
                required
                min="1"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <button 
                type="submit"
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button 
                type="button"
                onClick={resetForm}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3>Users List ({users.length} users)</h3>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Role</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Branch</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role || '-'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.branch_id != null ? user.branch_id : '-'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button 
                      onClick={() => editUser(user)}
                      style={{
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '5px'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;