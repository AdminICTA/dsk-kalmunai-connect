
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { departmentService, Department } from "@/services/departmentService";
import { divisionService, Division } from "@/services/divisionService";

const DivisionManagement = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDiv, setEditingDiv] = useState<Division | null>(null);
  const [formData, setFormData] = useState({ name: "", department_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [divisionData, departmentData] = await Promise.all([
        divisionService.getAll(),
        departmentService.getAll()
      ]);
      setDivisions(divisionData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingDiv) {
        const updatedDiv = await divisionService.update(
          editingDiv.id, 
          formData.name, 
          formData.department_id
        );
        setDivisions(divisions.map(div => 
          div.id === editingDiv.id ? updatedDiv : div
        ));
        toast({
          title: "Success",
          description: "Division updated successfully",
        });
      } else {
        const newDiv = await divisionService.create(formData.name, formData.department_id);
        setDivisions([...divisions, newDiv]);
        toast({
          title: "Success",
          description: "Division created successfully",
        });
      }
      setShowForm(false);
      setEditingDiv(null);
      setFormData({ name: "", department_id: "" });
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

  const handleEdit = (div: Division) => {
    setEditingDiv(div);
    setFormData({ name: div.name, department_id: div.department_id });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this division?")) {
      return;
    }
    
    try {
      await divisionService.delete(id);
      setDivisions(divisions.filter(div => div.id !== id));
      toast({
        title: "Success",
        description: "Division deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete division",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">Loading divisions...</div>
        </CardContent>
      </Card>
    );
  }

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
            {divisions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No divisions found. Create your first division!
              </div>
            ) : (
              divisions.map((div) => (
                <div key={div.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-blue-800">{div.name}</p>
                    <p className="text-sm text-gray-600">ID: {div.id} | Department: {div.department_name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(div)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(div.id)}>
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
                  disabled={submitting}
                />
              </div>
              {!editingDiv && (
                <div>
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
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
              )}
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-green-700"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : (editingDiv ? "Update" : "Create")} Division
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
