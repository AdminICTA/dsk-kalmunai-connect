
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Download, QrCode } from "lucide-react";
import IdCardGenerator from "./IdCardGenerator";

interface PublicUser {
  public_id: string;
  name: string;
  nic: string;
  address: string;
  mobile: string;
  dateOfBirth: string;
}

interface PublicManagementProps {
  onCreateSuccess: () => void;
}

const PublicManagement = ({ onCreateSuccess }: PublicManagementProps) => {
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    address: "",
    mobile: "",
    dateOfBirth: ""
  });
  const [createdUser, setCreatedUser] = useState<PublicUser | null>(null);
  const [showIdCard, setShowIdCard] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPublicId = `PUB${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const newUser: PublicUser = {
      public_id: newPublicId,
      ...formData
    };
    
    setCreatedUser(newUser);
    setShowIdCard(true);
    
    // Reset form
    setFormData({
      name: "",
      nic: "",
      address: "",
      mobile: "",
      dateOfBirth: ""
    });
  };

  const handleProceedToRegistry = () => {
    setShowIdCard(false);
    setCreatedUser(null);
    onCreateSuccess();
  };

  if (showIdCard && createdUser) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <QrCode className="w-6 h-6 mr-2" />
              Generated ID Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IdCardGenerator user={createdUser} />
            <div className="flex space-x-4 mt-6">
              <Button onClick={handleProceedToRegistry} className="bg-gradient-to-r from-blue-600 to-blue-700">
                Proceed to Registry
              </Button>
              <Button variant="outline" onClick={() => setShowIdCard(false)}>
                Create Another Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <UserPlus className="w-6 h-6 mr-2" />
            Create New Public Account
          </CardTitle>
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
                />
              </div>
              <div>
                <Label htmlFor="nic">NIC Number</Label>
                <Input
                  id="nic"
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                  placeholder="Enter NIC number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
                required
              />
            </div>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account & Generate ID Card
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicManagement;
