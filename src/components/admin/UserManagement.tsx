
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";

interface User {
  user_id: string;
  name: string;
  post: string;
  dep_id: string;
  department: string;
  div_id: string;
  division: string;
  role: "Admin" | "Reception_Staff";
  username: string;
  password: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([
    { 
      user_id: "USR001", 
      name: "Admin User", 
      post: "System Administrator", 
      dep_id: "DEP003",
      department: "IT Services",
      div_id: "DIV003",
      division: "System Management",
      role: "Admin", 
      username: "admin",
      password: "admin123"
    },
    { 
      user_id: "USR002", 
      name: "Reception Staff", 
      post: "Front Desk Officer", 
      dep_id: "DEP001",
      department: "Administration",
      div_id: "DIV001", 
      division: "General Administration",
      role: "Reception_Staff", 
      username: "reception",
      password: "reception123"
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "", post: "", dep_id: "", div_id: "", role: "Admin" as "Admin" | "Reception_Staff",
    username: "", password: ""
  });

  const departments = [
    { id: "DEP001", name: "Administration" },
    { id: "DEP002", name: "Finance" },
    { id: "DEP003", name: "IT Services" },
    { id: "DEP004", name: "Human Resources" },
  ];

  const divisions = [
    { id: "DIV001", name: "General Administration", dep_id: "DEP001" },
    { id: "DIV002", name: "Accounting", dep_id: "DEP002" },
    { id: "DIV003", name: "System Management", dep_id: "DEP003" },
    { id: "DIV004", name: "Staff Management", dep_id: "DEP004" },
  ];

  const filteredDivisions = divisions.filter(div => div.dep_id === formData.dep_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDept = departments.find(d => d.id === formData.dep_id);
    const selectedDiv = divisions.find(d => d.id === formData.div_id);
    
    if (editingUser) {
      setUsers(users.map(user => 
        user.user_id === editingUser.user_id 
          ? { 
              ...user, 
              name: formData.name,
              post: formData.post,
              dep_id: formData.dep_id,
              department: selectedDept?.name || "",
              div_id: formData.div_id,
              division: selectedDiv?.name || "",
              role: formData.role,
              username: formData.username,
              password: formData.password
            }
          : user
      ));
    } else {
      const newUser = {
        user_id: `USR${String(users.length + 1).padStart(3, '0')}`,
        name: formData.name,
        post: formData.post,
        dep_id: formData.dep_id,
        department: selectedDept?.name || "",
        div_id: formData.div_id,
        division: selectedDiv?.name || "",
        role: formData.role,
        username: formData.username,
        password: formData.password
      };
      setUsers([...users, newUser]);
    }
    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: "", post: "", dep_id: "", div_id: "", role: "Admin", username: "", password: "" });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      post: user.post,
      dep_id: user.dep_id,
      div_id: user.div_id,
      role: user.role,
      username: user.username,
      password: user.password
    });
    setShowForm(true);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter(user => user.user_id !== userId));
  };

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
            {users.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-800">{user.name}</p>
                  <p className="text-sm text-gray-600">
                    {user.post} | {user.role} | {user.department}
                  </p>
                  <p className="text-xs text-gray-500">ID: {user.user_id} | Username: {user.username}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(user.user_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
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
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    value={formData.dep_id}
                    onChange={(e) => setFormData({ ...formData, dep_id: e.target.value, div_id: "" })}
                    className="w-full p-2 border rounded-md"
                    required
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
                    value={formData.div_id}
                    onChange={(e) => setFormData({ ...formData, div_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={!formData.dep_id}
                  >
                    <option value="">Select Division</option>
                    {filteredDivisions.map(div => (
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
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-purple-700">
                  {editingUser ? "Update" : "Create"} User
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
