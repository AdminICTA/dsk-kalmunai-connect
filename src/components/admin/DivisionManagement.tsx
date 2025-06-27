
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";

interface Division {
  div_id: string;
  name: string;
  dep_id: string;
  department: string;
}

const DivisionManagement = () => {
  const [divisions, setDivisions] = useState<Division[]>([
    { div_id: "DIV001", name: "General Administration", dep_id: "DEP001", department: "Administration" },
    { div_id: "DIV002", name: "Accounting", dep_id: "DEP002", department: "Finance" },
    { div_id: "DIV003", name: "System Management", dep_id: "DEP003", department: "IT Services" },
    { div_id: "DIV004", name: "Staff Management", dep_id: "DEP004", department: "Human Resources" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingDiv, setEditingDiv] = useState<Division | null>(null);
  const [formData, setFormData] = useState({ name: "", dep_id: "", department: "" });

  const departments = [
    { id: "DEP001", name: "Administration" },
    { id: "DEP002", name: "Finance" },
    { id: "DEP003", name: "IT Services" },
    { id: "DEP004", name: "Human Resources" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDept = departments.find(d => d.id === formData.dep_id);
    
    if (editingDiv) {
      setDivisions(divisions.map(div => 
        div.div_id === editingDiv.div_id 
          ? { ...div, name: formData.name, dep_id: formData.dep_id, department: selectedDept?.name || "" }
          : div
      ));
    } else {
      const newDiv = {
        div_id: `DIV${String(divisions.length + 1).padStart(3, '0')}`,
        name: formData.name,
        dep_id: formData.dep_id,
        department: selectedDept?.name || ""
      };
      setDivisions([...divisions, newDiv]);
    }
    setShowForm(false);
    setEditingDiv(null);
    setFormData({ name: "", dep_id: "", department: "" });
  };

  const handleEdit = (div: Division) => {
    setEditingDiv(div);
    setFormData({ name: div.name, dep_id: div.dep_id, department: div.department });
    setShowForm(true);
  };

  const handleDelete = (divId: string) => {
    setDivisions(divisions.filter(div => div.div_id !== divId));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-blue-800">Division Management</CardTitle>
          <Button 
            className="bg-gradient-to-r from-green-600 to-green-700"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Division
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {divisions.map((div) => (
              <div key={div.div_id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-800">{div.name}</p>
                  <p className="text-sm text-gray-600">ID: {div.div_id} | Department: {div.department}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(div)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(div.div_id)}>
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
              {editingDiv ? "Edit Division" : "Create New Division"}
            </CardTitle>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Division Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter division name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={formData.dep_id}
                  onChange={(e) => setFormData({ ...formData, dep_id: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700">
                  {editingDiv ? "Update" : "Create"} Division
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

export default DivisionManagement;
