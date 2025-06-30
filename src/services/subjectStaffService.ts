
const API_BASE_URL = 'https://dskalmunai.lk/backend/api';

export interface SubjectStaff {
  sub_id: string;
  name: string;
  post: string;
  dep_id: string;
  department: string;
  divisions: string[];
  divisionNames: string[];
  username: string;
  password: string;
}

export const subjectStaffService = {
  async getAll(): Promise<SubjectStaff[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/subject-staff/list`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch subject staff');
      }
      
      return data.staff || [];
    } catch (error) {
      console.error('Error fetching subject staff:', error);
      throw error;
    }
  },

  async create(staffData: {
    name: string;
    post: string;
    dep_id: string;
    divisions: string[];
    username: string;
    password: string;
  }): Promise<SubjectStaff> {
    try {
      const response = await fetch(`${API_BASE_URL}/subject-staff/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create subject staff');
      }
      
      return data.staff;
    } catch (error) {
      console.error('Error creating subject staff:', error);
      throw error;
    }
  }
};
