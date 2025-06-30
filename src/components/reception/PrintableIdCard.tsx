
import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface PublicUser {
  public_id: string;
  name: string;
  nic: string;
  address: string;
  mobile: string;
  dateOfBirth: string;
}

interface PrintableIdCardProps {
  user: PublicUser;
}

const PrintableIdCard = forwardRef<HTMLDivElement, PrintableIdCardProps>(
  ({ user }, ref) => {
    return (
      <div 
        ref={ref} 
        className="w-[85.6mm] h-[53.98mm] bg-white border border-black p-2 font-mono text-xs print:shadow-none"
        style={{
          width: '85.6mm',
          height: '53.98mm',
          fontSize: '8px',
          lineHeight: '1.2'
        }}
      >
        {/* Header with logos */}
        <div className="flex justify-between items-center mb-1">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">LOGO</span>
          </div>
          <div className="text-center flex-1 mx-2">
            <div className="font-bold text-[9px]">Divisional Secretariat - Kalmunai</div>
          </div>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">LOGO</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex">
          {/* Left side - Information */}
          <div className="flex-1 pr-2">
            <div className="space-y-1">
              <div>
                <span className="font-semibold">Name:</span> {user.name}
              </div>
              <div>
                <span className="font-semibold">NIC:</span> {user.nic}
              </div>
              <div>
                <span className="font-semibold">Date of Birth:</span> {user.dateOfBirth}
              </div>
              <div>
                <span className="font-semibold">Mobile Number:</span> {user.mobile}
              </div>
              <div>
                <span className="font-semibold">Address:</span> {user.address}
              </div>
              <div>
                <span className="font-semibold">Public_ID:</span> {user.public_id}
              </div>
            </div>
          </div>
          
          {/* Right side - QR Code */}
          <div className="w-16 flex flex-col items-center">
            <QRCodeSVG 
              value={JSON.stringify({
                id: user.public_id,
                name: user.name,
                nic: user.nic
              })}
              size={48}
              level="M"
            />
            <div className="text-[6px] mt-1 text-center font-bold">SCAN ID</div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableIdCard.displayName = "PrintableIdCard";

export default PrintableIdCard;
