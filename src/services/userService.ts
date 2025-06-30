
const API_BASE_URL = 'https://dskalmunai.lk/backend/api';

export interface User {
  id: string;
  name: string;
  post: string;
  role: 'Admin' | 'Reception_Staff';
  username: string;
  is_active: boolean;
  department: string;
  division: string;
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
    department_id: string;
    division_id: string;
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
  }
};
