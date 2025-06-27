
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";

interface SubjectStaff {
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

const SubjectStaffManagement = () => {
  const [staff, setStaff] = useState<SubjectStaff[]>([
    { 
      sub_id: "SUB001", 
      name: "Document Specialist", 
      post: "Senior Officer", 
      dep_id: "DEP001",
      department: "Administration",
      divisions: ["DIV001", "DIV002"],
      divisionNames: ["General Administration", "Accounting"],
      username: "docspec",
      password: "doc123"
    },
    { 
      sub_id: "SUB002", 
      name: "Finance Officer", 
      post: "Assistant Officer", 
      dep_id: "DEP002",
      department: "Finance",
      divisions: ["DIV002"],
      divisionNames: ["Accounting"],
      username: "finoff",
      password: "fin123"
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<SubjectStaff | null>(null);
  const [formData, setFormData] = useState({
    name: "", post: "", dep_id: "", divisions: [] as string[], username: "", password: ""
  });

  const departments = [
    { id: "DEP001", name: "Administration" },
    { id: "DEP002", name: "Finance" },
    { id: "DEP003", name: "IT Services" },
    { id: "DEP004", name: "Human Resources" },
  ];

  const allDivisions = [
    { id: "DIV001", name: "General Administration", dep_id: "DEP001" },
    { id: "DIV002", name: "Accounting", dep_id: "DEP002" },
    { id: "DIV003", name: "System Management", dep_id: "DEP003" },
    { id: "DIV004", name: "Staff Management", dep_id: "DEP004" },
  ];

  const availableDivisions = allDivisions.filter(div => div.dep_id === formData.dep_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDept = departments.find(d => d.id === formData.dep_id);
    const selectedDivisions = allDivisions.filter(d => formData.divisions.includes(d.id));
    
    if (editingStaff) {
      setStaff(staff.map(s => 
        s.sub_id === editingStaff.sub_id 
          ? { 
              ...s, 
              name: formData.name,
              post: formData.post,
              dep_id: formData.dep_id,
              department: selectedDept?.name || "",
              divisions: formData.divisions,
              divisionNames: selectedDivisions.map(d => d.name),
              username: formData.username,
              password: formData.password
            }
          : s
      ));
    } else {
      const newStaff = {
        sub_id: `SUB${String(staff.length + 1).padStart(3, '0')}`,
        name: formData.name,
        post: formData.post,
        dep_id: formData.dep_id,
        department: selectedDept?.name || "",
        divisions: formData.divisions,
        divisionNames: selectedDivisions.map(d => d.name),
        username: formData.username,
        password: formData.password
      };
      setStaff([...staff, newStaff]);
    }
    setShowForm(false);
    setEditingStaff(null);
    setFormData({ name: "", post: "", dep_id: "", divisions: [], username: "", password: "" });
  };

  const handleEdit = (staffMember: SubjectStaff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      post: staffMember.post,
      dep_id: staffMember.dep_id,
      divisions: staffMember.divisions,
      username: staffMember.username,
      password: staffMember.password
    });
    setShowForm(true);
  };

  const handleDelete = (subId: string) => {
    setStaff(staff.filter(s => s.sub_id !== subId));
  };

  const handleDivisionChange = (divId: string) => {
    const newDivisions = formData.divisions.includes(divId)
      ? formData.divisions.filter(id => id !== divId)
      : [...formData.divisions, divId];
    setFormData({ ...formData, divisions: newDivisions });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-blue-800">Subject Staff Management</CardTitle>
          <Button 
            className="bg-gradient-to-r from-orange-600 to-orange-700"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Subject Staff
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.map((staffMember) => (
              <div key={staffMember.sub_id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-800">{staffMember.name}</p>
                  <p className="text-sm text-gray-600">{staffMember.post} | {staffMember.department}</p>
                  <p className="text-xs text-gray-500">
                    ID: {staffMember.sub_id} | Username: {staffMember.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    Assigned Divisions: {staffMember.divisionNames.join(", ")}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(staffMember)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(staffMember.sub_id)}>
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
              {editingStaff ? "Edit Subject Staff" : "Create New Subject Staff"}
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
                    onChange={(e) => setFormData({ ...formData, dep_id: e.target.value, divisions: [] })}
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
              
              {formData.dep_id && (
                <div>
                  <Label>Assign Divisions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {availableDivisions.map(div => (
                      <label key={div.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.divisions.includes(div.id)}
                          onChange={() => handleDivisionChange(div.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{div.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-orange-600 to-orange-700">
                  {editingStaff ? "Update" : "Create"} Subject Staff
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

export default SubjectStaffManagement;
