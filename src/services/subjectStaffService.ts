
<<<<<<< HEAD
const API_BASE_URL = 'https://dskalmunai.lk/backend/api';
=======
const API_BASE_URL = 'http://localhost/backend/api'; // Update this to your actual backend URL
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3

export interface SubjectStaff {
  sub_id: string;
  name: string;
  post: string;
  dep_id: string;
  department: string;
  divisions: string[];
  divisionNames: string[];
  username: string;
<<<<<<< HEAD
  password: string;
=======
  is_active: boolean;
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
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
<<<<<<< HEAD
        body: JSON.stringify(staffData)
      });

=======
        body: JSON.stringify(staffData),
      });
      
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create subject staff');
      }
      
      return data.staff;
    } catch (error) {
      console.error('Error creating subject staff:', error);
      throw error;
    }
<<<<<<< HEAD
  }
=======
  },

  async update(staffData: {
    sub_id: string;
    name: string;
    post: string;
    dep_id: string;
    divisions: string[];
    username: string;
    password?: string;
  }): Promise<SubjectStaff> {
    try {
      const response = await fetch(`${API_BASE_URL}/subject-staff/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update subject staff');
      }
      
      return data.staff;
    } catch (error) {
      console.error('Error updating subject staff:', error);
      throw error;
    }
  },

  async delete(sub_id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/subject-staff/delete?sub_id=${sub_id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete subject staff');
      }
    } catch (error) {
      console.error('Error deleting subject staff:', error);
      throw error;
    }
  },
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
};
