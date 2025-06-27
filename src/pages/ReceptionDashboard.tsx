
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, QrCode, History, Monitor, Bell, Settings, LogOut } from "lucide-react";
import PublicManagement from "@/components/reception/PublicManagement";
import PublicRegistry from "@/components/reception/PublicRegistry";
import TokenView from "@/components/reception/TokenView";
import NotificationManagement from "@/components/reception/NotificationManagement";
import AccountSettings from "@/components/reception/AccountSettings";

const ReceptionDashboard = () => {
  const [activeTab, setActiveTab] = useState("public-management");

  const menuItems = [
    { id: "public-management", label: "Public Management", icon: Users },
    { id: "public-registry", label: "Public Registry", icon: UserPlus },
    { id: "scan-history", label: "View History", icon: History },
    { id: "token-view", label: "Token Management", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "public-management":
        return <PublicManagement onCreateSuccess={() => setActiveTab("public-registry")} />;
      case "public-registry":
        return <PublicRegistry />;
      case "scan-history":
        return <div className="p-6"><h2 className="text-xl font-bold text-blue-800">View History - Scan ID Card to view past records</h2></div>;
      case "token-view":
        return <TokenView />;
      case "notifications":
        return <NotificationManagement />;
      case "settings":
        return <AccountSettings />;
      default:
        return <PublicManagement onCreateSuccess={() => setActiveTab("public-registry")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">DSK Reception Dashboard</h1>
            <p className="text-blue-100">Divisional Secretariat - Kalmunai</p>
          </div>
          <Button variant="outline" className="text-blue-600 border-white hover:bg-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Menu</h3>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                      : "hover:bg-blue-50 text-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
