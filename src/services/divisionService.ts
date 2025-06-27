
const API_BASE_URL = 'http://localhost/backend/api'; // Update this to your actual backend URL

export interface Division {
  id: number;
  name: string;
  department_id: number;
  department_name: string;
  status: string;
}

export const divisionService = {
  async getAll(departmentId?: number): Promise<Division[]> {
    try {
      const url = departmentId 
        ? `${API_BASE_URL}/divisions/list?department_id=${departmentId}`
        : `${API_BASE_URL}/divisions/list`;
      
      const response = await fetch(url);
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

  async create(name: string, department_id: number): Promise<Division> {
    try {
      const response = await fetch(`${API_BASE_URL}/divisions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, department_id }),
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

  async update(id: number, name: string, department_id: number): Promise<Division> {
    try {
      const response = await fetch(`${API_BASE_URL}/divisions/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, department_id }),
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
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/divisions/delete?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete division');
      }
    } catch (error) {
      console.error('Error deleting division:', error);
      throw error;
    }
  },
};
