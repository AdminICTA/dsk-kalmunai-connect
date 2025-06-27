
const API_BASE_URL = 'http://localhost/backend/api'; // Update this to your actual backend URL

export interface Department {
  id: number;
  name: string;
  status: string;
}

export const departmentService = {
  async getAll(): Promise<Department[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/list`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch departments');
      }
      
      return data.departments || [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  async create(name: string): Promise<Department> {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create department');
      }
      
      return data.department;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  async update(id: number, name: string): Promise<Department> {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update department');
      }
      
      return data.department;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/delete?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },
};
