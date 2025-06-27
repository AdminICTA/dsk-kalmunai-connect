
import { QRCodeSVG } from 'qrcode.react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PublicUser {
  public_id: string;
  name: string;
  nic: string;
  address: string;
  mobile: string;
  dateOfBirth: string;
}

interface IdCardGeneratorProps {
  user: PublicUser;
}

const IdCardGenerator = ({ user }: IdCardGeneratorProps) => {
  const qrData = JSON.stringify({
    public_id: user.public_id,
    name: user.name,
    nic: user.nic
  });

  const handleDownload = () => {
    const element = document.getElementById('id-card');
    if (element) {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Card id="id-card" className="w-[400px] h-[250px] bg-white border-2 border-black p-3 print:shadow-none relative">
        {/* Header with logos and title */}
        <div className="flex justify-between items-center mb-3 h-12">
          {/* Left Logo */}
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src="/placeholder.svg" 
              alt="Government Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Center Title */}
          <div className="text-center flex-1 mx-3">
            <h3 className="text-sm font-bold text-black leading-tight">
              Divisional Secretariat - Kalmunai
            </h3>
          </div>
          
          {/* Right Logo */}
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src="/placeholder.svg" 
              alt="District Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex h-[180px] border-t border-black pt-2">
          {/* Left side - Personal Information */}
          <div className="flex-1 pr-3 space-y-2">
            <div className="text-xs">
              <span className="font-bold">Name: </span>
              <span>{user.name}</span>
            </div>
            <div className="text-xs">
              <span className="font-bold">NIC: </span>
              <span>{user.nic}</span>
            </div>
            <div className="text-xs">
              <span className="font-bold">Date of Birth: </span>
              <span>{user.dateOfBirth}</span>
            </div>
            <div className="text-xs">
              <span className="font-bold">Mobile: </span>
              <span>{user.mobile}</span>
            </div>
            <div className="text-xs">
              <span className="font-bold">Address: </span>
              <span className="break-words">{user.address.length > 40 ? user.address.substring(0, 40) + '...' : user.address}</span>
            </div>
            <div className="text-xs">
              <span className="font-bold">Public ID: </span>
              <span>{user.public_id}</span>
            </div>
          </div>

          {/* Right side - QR Code */}
          <div className="w-[150px] flex items-center justify-center border-l border-black pl-3">
            <div className="text-center">
              <QRCodeSVG
                value={qrData}
                size={120}
                level="M"
                includeMargin={false}
                fgColor="#000000"
                bgColor="#ffffff"
              />
              <div className="text-xs mt-1 font-bold">SCAN ID</div>
            </div>
          </div>
        </div>
      </Card>

      <Button onClick={handleDownload} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Download ID Card
      </Button>
    </div>
  );
};

export default IdCardGenerator;
