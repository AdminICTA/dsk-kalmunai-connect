import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Users, Ticket } from "lucide-react";

const API_BASE = "/backend/api";

const PublicRegistry = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [publicUser, setPublicUser] = useState<any>(null);
  const [registryData, setRegistryData] = useState({
    public_id: "",
    name: "",
    nic: "",
    mobile: "",
    address: "",
    purpose: "",
    dep_id: "",
    division_id: "",
    tokenNumber: ""
  });
  const [isScanning, setIsScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registryEntries, setRegistryEntries] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch departments/divisions from backend
  useEffect(() => {
    fetch(`${API_BASE}/departments/list.php`)
      .then(res => res.json())
      .then(data => setDepartments(data.departments || []));
    fetch(`${API_BASE}/divisions/list.php`)
      .then(res => res.json())
      .then(data => setDivisions(data.divisions || []));
    fetchRegistryEntries();
  }, []);

  // Fetch today's registry entries
  const fetchRegistryEntries = () => {
    const today = new Date().toISOString().slice(0, 10);
    fetch(`${API_BASE}/registry/list.php?date=${today}`)
      .then(res => res.json())
      .then(data => setRegistryEntries(data.entries || []));
  };

  // Simulate scan or allow manual NIC entry
  const handleScanIdCard = async () => {
    setIsScanning(true);
    // For demo: prompt for NIC
    const nic = prompt("Enter NIC number to fetch public user:");
    if (!nic) {
      setIsScanning(false);
      return;
    }
    // Fetch public user by NIC
    const res = await fetch(`${API_BASE}/public/list.php?nic_number=${nic}`);
    const data = await res.json();
    if (data.success && data.users && data.users.length > 0) {
      const user = data.users[0];
      setPublicUser(user);
      setRegistryData(rd => ({
        ...rd,
        public_id: user.public_id,
        name: user.name,
        nic: user.nic_number,
        mobile: user.phone,
        address: user.address
      }));
    } else {
      alert("User not found");
    }
    setIsScanning(false);
  };

  // Handle registry form submit (generate token)
  const handleGenerateToken = async () => {
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${API_BASE}/registry/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: registryData.public_id,
          purpose: registryData.purpose,
          dep_id: registryData.dep_id,
          division_id: registryData.division_id
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegistryData(rd => ({ ...rd, tokenNumber: data.registry.token_number }));
        setSuccessMsg(`Token Generated: ${data.registry.token_number}`);
        fetchRegistryEntries();
      } else {
        alert(data.message || "Failed to generate token");
      }
    } catch (e) {
      alert("Error generating token");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDivisions = divisions.filter(div => div.dep_id === registryData.dep_id);

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Public Registry Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Scan ID Card Section */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleScanIdCard}
                disabled={isScanning}
                className="bg-gradient-to-r from-green-600 to-green-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {isScanning ? "Scanning..." : "Scan ID Card / Enter NIC"}
              </Button>
              <span className="text-sm text-gray-600">
                Scan or enter NIC to auto-fill information
              </span>
            </div>
            {/* Registry Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg-name">Name</Label>
                <Input
                  id="reg-name"
                  value={registryData.name}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="reg-nic">NIC</Label>
                <Input
                  id="reg-nic"
                  value={registryData.nic}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="reg-mobile">Mobile</Label>
                <Input
                  id="reg-mobile"
                  value={registryData.mobile}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="reg-address">Address</Label>
                <Input
                  id="reg-address"
                  value={registryData.address}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Input
                  id="purpose"
                  value={registryData.purpose}
                  onChange={(e) => setRegistryData({ ...registryData, purpose: e.target.value })}
                  placeholder="Enter purpose of visit"
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={registryData.dep_id} onValueChange={(value) => setRegistryData({ ...registryData, dep_id: value, division_id: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.dep_id} value={dept.dep_id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="division">Division</Label>
                <Select value={registryData.division_id} onValueChange={(value) => setRegistryData({ ...registryData, division_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDivisions.map((div) => (
                      <SelectItem key={div.division_id} value={div.division_id}>
                        {div.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="token">Token Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="token"
                    value={registryData.tokenNumber}
                    placeholder="Generated token will appear here"
                    readOnly
                  />
                  <Button 
                    onClick={handleGenerateToken}
                    disabled={!registryData.public_id || !registryData.purpose || !registryData.dep_id || !registryData.division_id || submitting}
                    className="bg-gradient-to-r from-orange-600 to-orange-700"
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    {submitting ? "Generating..." : "Generate Token"}
                  </Button>
                </div>
              </div>
            </div>
            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800">{successMsg}</h3>
                <p className="text-sm text-green-600">Please proceed to the designated department.</p>
              </div>
            )}
            {/* Live Registry Table */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-2 text-blue-700">Today's Registry Entries</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border">Token</th>
                      <th className="px-2 py-1 border">Name</th>
                      <th className="px-2 py-1 border">NIC</th>
                      <th className="px-2 py-1 border">Purpose</th>
                      <th className="px-2 py-1 border">Department</th>
                      <th className="px-2 py-1 border">Division</th>
                      <th className="px-2 py-1 border">Status</th>
                      <th className="px-2 py-1 border">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registryEntries.map((entry, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-2 py-1 border font-bold text-blue-700">{entry.token_number}</td>
                        <td className="px-2 py-1 border">{entry.public_name}</td>
                        <td className="px-2 py-1 border">{entry.nic_number}</td>
                        <td className="px-2 py-1 border">{entry.purpose}</td>
                        <td className="px-2 py-1 border">{entry.department_name}</td>
                        <td className="px-2 py-1 border">{entry.division_name}</td>
                        <td className="px-2 py-1 border capitalize">{entry.status}</td>
                        <td className="px-2 py-1 border">{entry.visit_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicRegistry;
