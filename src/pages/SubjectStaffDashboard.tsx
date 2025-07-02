import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Edit, 
  Settings, 
  LogOut, 
  User, 
  Building2,
  FolderOpen,
  Files,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  user_id: string;
  name: string;
  username: string;
  role: string;
  dep_id: number;
  post: string;
}

interface Document {
  doc_id: string;
  title: string;
  type: 'Personal' | 'Office' | 'Common';
  file_name: string;
  file_path: string;
  div_id: number;
  division_name: string;
  uploaded_at: string;
}

const SubjectStaffDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'Subject_Staff') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
      fetchDocuments(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchDocuments = async (token: string) => {
    try {
      const response = await fetch('https://dskalmunai.lk/backend/api/documents/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const handleDownload = (document: Document) => {
    if (document.file_path) {
      window.open(`https://dskalmunai.lk/backend/${document.file_path}`, '_blank');
    }
  };

  const handleEdit = (document: Document) => {
    // For now, just show a message - can be implemented later for online editing
    toast({
      title: "Edit Document",
      description: `Opening ${document.title} for editing...`,
    });
  };

  const groupDocumentsByType = (docs: Document[]) => {
    return docs.reduce((acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Personal':
        return <User className="w-4 h-4" />;
      case 'Office':
        return <Building2 className="w-4 h-4" />;
      case 'Common':
        return <FolderOpen className="w-4 h-4" />;
      default:
        return <Files className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Personal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Office':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Common':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-32 h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const groupedDocuments = groupDocumentsByType(documents);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subject Staff Dashboard</h1>
                <p className="text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {user.post}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Personal Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {groupedDocuments['Personal']?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Office Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {groupedDocuments['Office']?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Document Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="Personal">Personal</TabsTrigger>
                <TabsTrigger value="Office">Office</TabsTrigger>
                <TabsTrigger value="Common">Common</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No documents available</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.doc_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
                            {getTypeIcon(doc.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{doc.title}</h3>
                            <p className="text-sm text-gray-500">
                              {doc.division_name} • {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getTypeColor(doc.type)}>
                            {doc.type}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {Object.entries(groupedDocuments).map(([type, docs]) => (
                <TabsContent key={type} value={type} className="mt-6">
                  <div className="space-y-4">
                    {docs.length === 0 ? (
                      <div className="text-center py-8">
                        <div className={`p-3 rounded-lg ${getTypeColor(type)} mx-auto w-fit mb-4`}>
                          {getTypeIcon(type)}
                        </div>
                        <p className="text-gray-500">No {type.toLowerCase()} documents available</p>
                      </div>
                    ) : (
                      docs.map((doc) => (
                        <div key={doc.doc_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
                              {getTypeIcon(doc.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{doc.title}</h3>
                              <p className="text-sm text-gray-500">
                                {doc.division_name} • {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectStaffDashboard;
