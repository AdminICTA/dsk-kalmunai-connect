
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Users, Ticket } from "lucide-react";

const PublicRegistry = () => {
  const [registryData, setRegistryData] = useState({
    name: "",
    nic: "",
    mobile: "",
    address: "",
    purpose: "",
    department: "",
    division: "",
    tokenNumber: ""
  });
  const [isScanning, setIsScanning] = useState(false);

  const departments = [
    { id: "DEP001", name: "Administration" },
    { id: "DEP002", name: "Finance" },
    { id: "DEP003", name: "IT Services" },
    { id: "DEP004", name: "Human Resources" },
    { id: "DEP005", name: "Public Services" }
  ];

  const divisions = [
    { id: "DIV001", name: "General Administration", dep_id: "DEP001" },
    { id: "DIV002", name: "Accounting", dep_id: "DEP002" },
    { id: "DIV005", name: "Birth Certificates", dep_id: "DEP005" },
    { id: "DIV006", name: "Death Certificates", dep_id: "DEP005" },
    { id: "DIV007", name: "Marriage Certificates", dep_id: "DEP005" },
    { id: "DIV008", name: "Land Records", dep_id: "DEP005" }
  ];

  const handleScanIdCard = () => {
    setIsScanning(true);
    // Simulate QR code scanning
    setTimeout(() => {
      setRegistryData({
        ...registryData,
        name: "John Doe",
        nic: "123456789V",
        mobile: "0771234567",
        address: "123 Main Street, Kalmunai"
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleGenerateToken = () => {
    const tokenNumber = `${registryData.department}-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`;
    setRegistryData({ ...registryData, tokenNumber });
  };

  const filteredDivisions = divisions.filter(div => div.dep_id === registryData.department);

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
                {isScanning ? "Scanning..." : "Scan ID Card"}
              </Button>
              <span className="text-sm text-gray-600">
                Scan existing public ID card to auto-fill information
              </span>
            </div>

            {/* Registry Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg-name">Name</Label>
                <Input
                  id="reg-name"
                  value={registryData.name}
                  onChange={(e) => setRegistryData({ ...registryData, name: e.target.value })}
                  placeholder="Name will auto-fill from scan"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="reg-nic">NIC</Label>
                <Input
                  id="reg-nic"
                  value={registryData.nic}
                  onChange={(e) => setRegistryData({ ...registryData, nic: e.target.value })}
                  placeholder="NIC will auto-fill from scan"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="reg-mobile">Mobile</Label>
                <Input
                  id="reg-mobile"
                  value={registryData.mobile}
                  onChange={(e) => setRegistryData({ ...registryData, mobile: e.target.value })}
                  placeholder="Mobile will auto-fill from scan"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="reg-address">Address</Label>
                <Input
                  id="reg-address"
                  value={registryData.address}
                  onChange={(e) => setRegistryData({ ...registryData, address: e.target.value })}
                  placeholder="Address will auto-fill from scan"
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
                <Select value={registryData.department} onValueChange={(value) => setRegistryData({ ...registryData, department: value, division: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="division">Division</Label>
                <Select value={registryData.division} onValueChange={(value) => setRegistryData({ ...registryData, division: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDivisions.map((div) => (
                      <SelectItem key={div.id} value={div.id}>
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
                    disabled={!registryData.department || !registryData.division}
                    className="bg-gradient-to-r from-orange-600 to-orange-700"
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    Generate Token
                  </Button>
                </div>
              </div>
            </div>

            {registryData.tokenNumber && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800">Token Generated Successfully!</h3>
                <p className="text-green-700">Token Number: <strong>{registryData.tokenNumber}</strong></p>
                <p className="text-sm text-green-600">Please proceed to the designated department.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicRegistry;
