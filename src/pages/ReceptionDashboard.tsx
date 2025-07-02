import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, QrCode, History, Monitor, Bell, Settings, LogOut } from "lucide-react";
import PublicManagement from "@/components/reception/PublicManagement";
import PublicRegistry from "@/components/reception/PublicRegistry";
import TokenView from "@/components/reception/TokenView";
import NotificationManagement from "@/components/reception/NotificationManagement";
import AccountSettings from "@/components/reception/AccountSettings";

const API_BASE = "/backend/api";

const ReceptionDashboard = () => {
  const [activeTab, setActiveTab] = useState("public-management");
  const [historyNIC, setHistoryNIC] = useState("");
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/stats/dashboard.php`)
      .then(res => res.json())
      .then(data => setStats(data.stats || null));
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };

  const menuItems = [
    { id: "public-management", label: "Public Management", icon: Users },
    { id: "public-registry", label: "Public Registry", icon: UserPlus },
    { id: "scan-history", label: "View History", icon: History },
    { id: "token-view", label: "Token Management", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  const handleHistorySearch = async () => {
    setHistoryLoading(true);
    setHistoryEntries([]);
    // Fetch public user by NIC
    const userRes = await fetch(`${API_BASE}/public/list.php?nic_number=${historyNIC}`);
    const userData = await userRes.json();
    if (userData.success && userData.users && userData.users.length > 0) {
      const public_id = userData.users[0].public_id;
      // Fetch registry history
      const regRes = await fetch(`${API_BASE}/registry/list.php?public_id=${public_id}`);
      const regData = await regRes.json();
      setHistoryEntries(regData.entries || []);
    } else {
      setHistoryEntries([]);
      alert("No user found with this NIC");
    }
    setHistoryLoading(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "public-management":
        return <PublicManagement onCreateSuccess={() => setActiveTab("public-registry")} />;
      case "public-registry":
        return <PublicRegistry />;
      case "scan-history":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">View History - Scan ID Card or enter NIC to view past records</h2>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                className="border rounded px-2 py-1"
                placeholder="Enter NIC number or scan QR"
                value={historyNIC}
                onChange={e => setHistoryNIC(e.target.value)}
              />
              <Button onClick={handleHistorySearch} disabled={!historyNIC || historyLoading}>
                {historyLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            {historyEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border">Token</th>
                      <th className="px-2 py-1 border">Purpose</th>
                      <th className="px-2 py-1 border">Department</th>
                      <th className="px-2 py-1 border">Division</th>
                      <th className="px-2 py-1 border">Status</th>
                      <th className="px-2 py-1 border">Date</th>
                      <th className="px-2 py-1 border">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyEntries.map((entry, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-2 py-1 border font-bold text-blue-700">{entry.token_number}</td>
                        <td className="px-2 py-1 border">{entry.purpose}</td>
                        <td className="px-2 py-1 border">{entry.department_name}</td>
                        <td className="px-2 py-1 border">{entry.division_name}</td>
                        <td className="px-2 py-1 border capitalize">{entry.status}</td>
                        <td className="px-2 py-1 border">{entry.visit_date}</td>
                        <td className="px-2 py-1 border">{entry.visit_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No history found for this NIC.</p>
            )}
          </div>
        );
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
          <Button variant="outline" className="text-blue-600 border-white hover:bg-white" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      {/* Real-time Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <Card className="bg-white shadow">
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.departments}</div>
              <div className="text-sm text-gray-600">Departments</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow">
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.divisions}</div>
              <div className="text-sm text-gray-600">Divisions</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow">
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.public_users}</div>
              <div className="text-sm text-gray-600">Public Users</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow">
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.today_registrations}</div>
              <div className="text-sm text-gray-600">Today's Registrations</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow">
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.active_tokens}</div>
              <div className="text-sm text-gray-600">Active Tokens</div>
            </CardContent>
          </Card>
        </div>
      )}
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
