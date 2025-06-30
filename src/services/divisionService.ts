
const API_BASE_URL = 'https://dskalmunai.lk/backend/api';

export interface Division {
  id: string;
  name: string;
  department_id: string;
  department_name: string;
  status?: string;
}

export const divisionService = {
  async getAll(departmentId?: string): Promise<Division[]> {
    try {
      const url = departmentId 
        ? `${API_BASE_URL}/divisions/list?department_id=${departmentId}`
        : `${API_BASE_URL}/divisions/list`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch divisions');
      }
      
      return data.divisions || [];
    } catch (error) {
      console.error('Error fetching divisions:', error);
      throw error;
    }
  },

  async create(name: string, department_id: string): Promise<Division> {
    try {
      const response = await fetch(`${API_BASE_URL}/divisions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          department_id
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create division');
      }
      
      return data.division;
    } catch (error) {
      console.error('Error creating division:', error);
      throw error;
    }
  },

  async update(id: string, name: string, department_id: string): Promise<Division> {
    try {
      const response = await fetch(`${API_BASE_URL}/divisions/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id,
          name,
          department_id
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update division');
      }
      
      return data.division;
    } catch (error) {
      console.error('Error updating division:', error);
      throw error;
    }
  }
};
