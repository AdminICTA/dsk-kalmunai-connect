
const API_BASE_URL = 'https://dskalmunai.lk/backend/api';

export interface User {
  user_id: string;
  id?: string; // For backward compatibility
  name: string;
  post: string;
  dep_id: string;
  department: string;
  div_id: string;
  division: string;
  role: 'Admin' | 'Reception_Staff';
  username: string;
  is_active: boolean;
}

export const userService = {
  async getAll(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      return data.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async create(userData: {
    name: string;
    post: string;
    dep_id: string;
    div_id: string;
    role: 'Admin' | 'Reception_Staff';
    username: string;
    password: string;
  }): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create user');
      }
      
      return data.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async update(userData: {
    user_id: string;
    name: string;
    post: string;
    dep_id: string;
    div_id: string;
    role: 'Admin' | 'Reception_Staff';
    username: string;
    password?: string;
  }): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update user');
      }
      
      return data.user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async delete(user_id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/delete?user_id=${user_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
