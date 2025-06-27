
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
  }
};
