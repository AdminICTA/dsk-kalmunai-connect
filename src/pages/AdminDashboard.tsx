
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  FileText, 
  Settings, 
  BarChart3, 
  Plus,
  Menu,
  X,
  LogOut,
  Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DepartmentManagement from "@/components/admin/DepartmentManagement";
import DivisionManagement from "@/components/admin/DivisionManagement";
import UserManagement from "@/components/admin/UserManagement";
import SubjectStaffManagement from "@/components/admin/SubjectStaffManagement";
import DocumentManagement from "@/components/admin/DocumentManagement";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "departments", label: "Departments", icon: Building2 },
    { id: "divisions", label: "Divisions", icon: FileText },
    { id: "users", label: "User Management", icon: Users },
    { id: "staff", label: "Subject Staff", icon: Users },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  const stats = [
    { title: "Total Users", value: "1,234", change: "+12%", color: "from-blue-500 to-blue-600" },
    { title: "Departments", value: "15", change: "+2", color: "from-green-500 to-green-600" },
    { title: "Divisions", value: "45", change: "+5", color: "from-purple-500 to-purple-600" },
    { title: "Documents", value: "2,890", change: "+156", color: "from-orange-500 to-orange-600" },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-blue-800">{stat.value}</p>
                        <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center`}>
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-800">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "New department created: IT Services",
                      "User account activated: John Doe",
                      "Document uploaded: Policy Guidelines",
                      "Division updated: Administration"
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <p className="text-sm text-gray-700">{activity}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-700"
                    onClick={() => setActiveTab("departments")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Department
                  </Button>
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-green-600 to-green-700"
                    onClick={() => setActiveTab("divisions")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Division
                  </Button>
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-purple-600 to-purple-700"
                    onClick={() => setActiveTab("users")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create User Account
                  </Button>
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-orange-600 to-orange-700"
                    onClick={() => setActiveTab("documents")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "departments":
        return <DepartmentManagement />;

      case "divisions":
        return <DivisionManagement />;

      case "users":
        return <UserManagement />;

      case "staff":
        return <SubjectStaffManagement />;

      case "documents":
        return <DocumentManagement />;

      default:
        return (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Feature Coming Soon</h3>
              <p className="text-gray-600">This section is under development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-800 to-blue-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-800 font-bold">DSK</span>
            </div>
            <span className="text-white font-semibold">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-white text-blue-800 shadow-lg'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-blue-800">Administrator Dashboard</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-800">Admin User</p>
              <p className="text-xs text-gray-600">System Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">AU</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
