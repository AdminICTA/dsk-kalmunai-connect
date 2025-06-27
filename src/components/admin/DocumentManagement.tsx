
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, X, Upload, FileText } from "lucide-react";

interface Document {
  doc_id: string;
  title: string;
  type: "Personal" | "Office" | "Common";
  div_id: string;
  division: string;
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
}

const DocumentManagement = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { 
      doc_id: "DOC001", 
      title: "Birth Certificate Application Form", 
      type: "Personal", 
      div_id: "DIV001",
      division: "General Administration",
      uploadedBy: "Admin User",
      uploadDate: "2024-01-15",
      fileSize: "2.3 MB"
    },
    { 
      doc_id: "DOC002", 
      title: "Budget Report 2024", 
      type: "Office", 
      div_id: "DIV002",
      division: "Accounting",
      uploadedBy: "Finance Officer",
      uploadDate: "2024-01-20",
      fileSize: "5.1 MB"
    },
    { 
      doc_id: "DOC003", 
      title: "Public Holiday Notice", 
      type: "Common", 
      div_id: "DIV001",
      division: "General Administration",
      uploadedBy: "Admin User",
      uploadDate: "2024-01-25",
      fileSize: "1.2 MB"
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    title: "", type: "Personal" as "Personal" | "Office" | "Common", div_id: ""
  });

  const divisions = [
    { id: "DIV001", name: "General Administration" },
    { id: "DIV002", name: "Accounting" },
    { id: "DIV003", name: "System Management" },
    { id: "DIV004", name: "Staff Management" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDiv = divisions.find(d => d.id === formData.div_id);
    
    if (editingDoc) {
      setDocuments(documents.map(doc => 
        doc.doc_id === editingDoc.doc_id 
          ? { 
              ...doc, 
              title: formData.title,
              type: formData.type,
              div_id: formData.div_id,
              division: selectedDiv?.name || ""
            }
          : doc
      ));
    } else {
      const newDoc = {
        doc_id: `DOC${String(documents.length + 1).padStart(3, '0')}`,
        title: formData.title,
        type: formData.type,
        div_id: formData.div_id,
        division: selectedDiv?.name || "",
        uploadedBy: "Current User",
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: "0 MB"
      };
      setDocuments([...documents, newDoc]);
    }
    setShowForm(false);
    setEditingDoc(null);
    setFormData({ title: "", type: "Personal", div_id: "" });
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      type: doc.type,
      div_id: doc.div_id
    });
    setShowForm(true);
  };

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter(doc => doc.doc_id !== docId));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Personal": return "bg-blue-100 text-blue-800";
      case "Office": return "bg-green-100 text-green-800";
      case "Common": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-blue-800">Document Management</CardTitle>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-700"
            onClick={() => setShowForm(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.doc_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doc.title}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                        {doc.type}
                      </span>
                      <span className="text-sm text-gray-600">{doc.division}</span>
                      <span className="text-sm text-gray-500">{doc.fileSize}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(doc)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(doc.doc_id)}>
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
              {editingDoc ? "Edit Document" : "Upload New Document"}
            </CardTitle>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter document title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Document Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "Personal" | "Office" | "Common" })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="Personal">Personal</option>
                  <option value="Office">Office</option>
                  <option value="Common">Common</option>
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
                >
                  <option value="">Select Division</option>
                  {divisions.map(div => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>
              {!editingDoc && (
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    className="cursor-pointer"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    required
                  />
                </div>
              )}
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
                  {editingDoc ? "Update" : "Upload"} Document
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

export default DocumentManagement;
