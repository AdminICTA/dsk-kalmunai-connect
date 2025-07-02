import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Eye, CheckCircle, X, Clock } from "lucide-react";

const API_BASE = "/backend/api";

const NotificationManagement = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [notificationData, setNotificationData] = useState({
    recipient: "",
    title: "",
    message: "",
    type: "single"
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/notifications/list.php?recipient_type=Public`);
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "view") fetchNotifications();
  }, [activeTab]);

  // Send notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    let recipient_id = null;
    if (notificationData.type === "single") {
      // Fetch public user by NIC or public_id
      const res = await fetch(`${API_BASE}/public/list.php?nic_number=${notificationData.recipient}`);
      const data = await res.json();
      if (data.success && data.users && data.users.length > 0) {
        recipient_id = data.users[0].public_id;
      } else {
        alert("User not found");
        setSending(false);
        return;
      }
    }
    const payload = {
      sender_id: "RECEPTION", // Replace with real reception user id
      sender_type: "Reception_Staff",
      recipient_id: recipient_id,
      recipient_type: notificationData.type === "single" ? "Public" : (notificationData.type === "group" ? "Group" : "All"),
      title: notificationData.title,
      message: notificationData.message,
      type: "Info",
      status: "Pending"
    };
    const res = await fetch(`${API_BASE}/notifications/create.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert("Notification sent!");
      setNotificationData({ recipient: "", title: "", message: "", type: "single" });
    } else {
      alert(data.message || "Failed to send notification");
    }
    setSending(false);
  };

  // Update notification status
  const handleStatusChange = async (id: number, newStatus: string) => {
    await fetch(`${API_BASE}/notifications/update.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notification_id: id, status: newStatus })
    });
    fetchNotifications();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Rejected":
      case "rejected":
        return <X className="w-4 h-4 text-red-500" />;
      case "Completed":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
      case "accepted":
        return "text-green-600 bg-green-50";
      case "Rejected":
      case "rejected":
        return "text-red-600 bg-red-50";
      case "Completed":
      case "completed":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            Notification Management
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === "send" ? "default" : "outline"}
              onClick={() => setActiveTab("send")}
              className={activeTab === "send" ? "bg-gradient-to-r from-blue-600 to-blue-700" : ""}
            >
              Send Notifications
            </Button>
            <Button
              variant={activeTab === "view" ? "default" : "outline"}
              onClick={() => setActiveTab("view")}
              className={activeTab === "view" ? "bg-gradient-to-r from-blue-600 to-blue-700" : ""}
            >
              View Notifications
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "send" ? (
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <Label htmlFor="type">Notification Type</Label>
                <Select value={notificationData.type} onValueChange={(value) => setNotificationData({ ...notificationData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single User</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="all">All Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {notificationData.type === "single" && (
                <div>
                  <Label htmlFor="recipient">Recipient (Public ID or NIC)</Label>
                  <Input
                    id="recipient"
                    value={notificationData.recipient}
                    onChange={(e) => setNotificationData({ ...notificationData, recipient: e.target.value })}
                    placeholder="Enter Public ID or NIC"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  placeholder="Enter notification title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                  placeholder="Enter notification message"
                  required
                />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700" disabled={sending}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send Notification"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {loading ? <p>Loading notifications...</p> : notifications.length === 0 ? <p>No notifications found.</p> : notifications.map((notification) => (
                <Card key={notification.notification_id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(notification.status)}
                          <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                            {notification.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">From: {notification.sender_id} | Date: {notification.created_at}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(notification.notification_id, "Accepted")}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(notification.notification_id, "Pending")}>Pending</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(notification.notification_id, "Rejected")}>Reject</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(notification.notification_id, "Completed")}>Complete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManagement;
