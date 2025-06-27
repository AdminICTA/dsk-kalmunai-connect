
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";

interface Department {
  dep_id: string;
  name: string;
}

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([
    { dep_id: "DEP001", name: "Administration" },
    { dep_id: "DEP002", name: "Finance" },
    { dep_id: "DEP003", name: "IT Services" },
    { dep_id: "DEP004", name: "Human Resources" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      setDepartments(departments.map(dept => 
        dept.dep_id === editingDept.dep_id 
          ? { ...dept, name: formData.name }
          : dept
      ));
    } else {
      const newDept = {
        dep_id: `DEP${String(departments.length + 1).padStart(3, '0')}`,
        name: formData.name
      };
      setDepartments([...departments, newDept]);
    }
    setShowForm(false);
    setEditingDept(null);
    setFormData({ name: "" });
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name });
    setShowForm(true);
  };

  const handleDelete = (depId: string) => {
    setDepartments(departments.filter(dept => dept.dep_id !== depId));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-blue-800">Department Management</CardTitle>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-700"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Department
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.dep_id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-800">{dept.name}</p>
                  <p className="text-sm text-gray-600">ID: {dept.dep_id}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(dept)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(dept.dep_id)}>
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
              {editingDept ? "Edit Department" : "Create New Department"}
            </CardTitle>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter department name"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
                  {editingDept ? "Update" : "Create"} Department
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

export default DepartmentManagement;
