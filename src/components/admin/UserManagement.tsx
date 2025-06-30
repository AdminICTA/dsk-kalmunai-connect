
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { userService, User } from "@/services/userService";
import { departmentService, Department } from "@/services/departmentService";
import { divisionService, Division } from "@/services/divisionService";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", 
    post: "", 
    department_id: "", 
    division_id: "", 
    role: "Admin" as "Admin" | "Reception_Staff",
    username: "", 
    password: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.department_id) {
      fetchDivisions(formData.department_id);
    }
  }, [formData.department_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, departmentData] = await Promise.all([
        userService.getAll(),
        departmentService.getAll()
      ]);
      setUsers(userData);
      setDepartments(departmentData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async (departmentId: string) => {
    try {
      const divisionData = await divisionService.getAll(departmentId);
      setDivisions(divisionData);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingUser) {
        // Update functionality would go here
        toast({
          title: "Info",
          description: "Update functionality will be implemented soon",
        });
      } else {
        const newUser = await userService.create(formData);
        setUsers([...users, newUser]);
        toast({
          title: "Success",
          description: "User created successfully",
        });
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ name: "", post: "", department_id: "", division_id: "", role: "Admin", username: "", password: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    // Edit functionality placeholder
    toast({
      title: "Info",
      description: "Edit functionality will be implemented soon",
    });
  };

  const handleDelete = (userId: string) => {
    // Delete functionality placeholder
    toast({
      title: "Info",
      description: "Delete functionality will be implemented soon",
    });
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-blue-800">User Management (Admin & Reception Staff)</CardTitle>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-purple-700"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found. Create your first user!
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-blue-800">{user.name}</p>
                    <p className="text-sm text-gray-600">
                      {user.post} | {user.role} | {user.department}
                    </p>
                    <p className="text-xs text-gray-500">ID: {user.id} | Username: {user.username}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-800">
              {editingUser ? "Edit User" : "Create New User"}
            </CardTitle>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="post">Post</Label>
                  <Input
                    id="post"
                    value={formData.post}
                    onChange={(e) => setFormData({ ...formData, post: e.target.value })}
                    placeholder="Enter post"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value, division_id: "" })}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={submitting}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="division">Division</Label>
                  <select
                    id="division"
                    value={formData.division_id}
                    onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={!formData.department_id || submitting}
                  >
                    <option value="">Select Division</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "Admin" | "Reception_Staff" })}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={submitting}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Reception_Staff">Reception Staff</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-600 to-purple-700"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : (editingUser ? "Update" : "Create")} User
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
