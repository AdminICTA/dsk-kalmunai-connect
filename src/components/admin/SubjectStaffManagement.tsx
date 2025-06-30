import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { subjectStaffService, SubjectStaff } from "@/services/subjectStaffService";
import { departmentService, Department } from "@/services/departmentService";
import { divisionService, Division } from "@/services/divisionService";

const SubjectStaffManagement = () => {
  const [staff, setStaff] = useState<SubjectStaff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<SubjectStaff | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", post: "", dep_id: "", divisions: [] as string[], username: "", password: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.dep_id) {
      fetchDivisions(formData.dep_id);
    }
  }, [formData.dep_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffData, departmentData] = await Promise.all([
        subjectStaffService.getAll(),
        departmentService.getAll()
      ]);
      setStaff(staffData);
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
      if (editingStaff) {
        // Update functionality would go here
        toast({
          title: "Info",
          description: "Update functionality will be implemented soon",
        });
      } else {
        const newStaff = await subjectStaffService.create(formData);
        await fetchData(); // Refresh the list
        toast({
          title: "Success",
          description: "Subject staff created successfully",
        });
      }
      setShowForm(false);
      setEditingStaff(null);
      setFormData({ name: "", post: "", dep_id: "", divisions: [], username: "", password: "" });
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

  const handleEdit = (staffMember: SubjectStaff) => {
    // Edit functionality placeholder
    toast({
      title: "Info",
      description: "Edit functionality will be implemented soon",
    });
  };

  const handleDelete = (subId: string) => {
    // Delete functionality placeholder
    toast({
      title: "Info",
      description: "Delete functionality will be implemented soon",
    });
  };

  const handleDivisionChange = (divId: string) => {
    const newDivisions = formData.divisions.includes(divId)
      ? formData.divisions.filter(id => id !== divId)
      : [...formData.divisions, divId];
    setFormData({ ...formData, divisions: newDivisions });
  };

  const availableDivisions = divisions.filter(div => div.department_id === formData.dep_id);

  if (loading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">Loading subject staff...</div>
        </CardContent>
      </Card>
    );
  }

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
            {staff.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No subject staff found. Create your first subject staff member!
              </div>
            ) : (
              staff.map((staffMember) => (
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
              ))
            )}
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
                    value={formData.dep_id}
                    onChange={(e) => setFormData({ ...formData, dep_id: e.target.value, divisions: [] })}
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
                          disabled={submitting}
                        />
                        <span className="text-sm">{div.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-orange-600 to-orange-700"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : (editingStaff ? "Update" : "Create")} Subject Staff
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
