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
        className="w-[85.6mm] h-[53.98mm] bg-white border border-black p-2 print:shadow-none flex flex-col justify-between"
        style={{
          width: '85.6mm',
          height: '53.98mm',
          fontSize: '13px',
          lineHeight: '1.3',
          fontWeight: 700,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Header with logos and title */}
        <div className="flex items-center justify-between mb-2">
          <img src="/Gov_logo.png" alt="Gov Logo" className="w-12 h-12 object-contain" style={{filter: 'grayscale(1) contrast(1.5)'}} />
          <div className="flex-1 text-center mx-2">
            <div className="font-bold text-[15px] tracking-wide">Divisional Secretariat - Kalmunai</div>
          </div>
          <img src="/placeholder.svg" alt="Dept Logo" className="w-12 h-12 object-contain" style={{filter: 'grayscale(1) contrast(1.5)'}} />
        </div>
        {/* Main content: left info, right QR */}
        <div className="flex h-full">
          {/* Left side - Information */}
          <div className="flex-1 pr-2 flex flex-col justify-center">
            <div className="space-y-2">
              <div><span className="font-bold">Name:</span> <span className="font-bold">{user.name}</span></div>
              <div><span className="font-bold">NIC:</span> <span className="font-bold">{user.nic}</span></div>
              <div><span className="font-bold">Date of Birth:</span> <span className="font-bold">{user.dateOfBirth}</span></div>
              <div><span className="font-bold">Mobile Number:</span> <span className="font-bold">{user.mobile}</span></div>
              <div><span className="font-bold">Address:</span> <span className="font-bold">{user.address}</span></div>
              <div><span className="font-bold">Public_ID:</span> <span className="font-bold">{user.public_id}</span></div>
            </div>
          </div>
          {/* Right side - Large QR code */}
          <div className="flex items-center justify-center w-1/2">
            <QRCodeSVG 
              value={JSON.stringify({
                id: user.public_id,
                name: user.name,
                nic: user.nic
              })}
              size={110}
              level="M"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </div>
        </div>
        {/* Print-specific centering */}
        <style>{`
          @media print {
            body { margin: 0; }
            html, body { height: 100%; }
            .print-container, #root, #app {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              width: 100vw;
              background: white;
            }
          }
        `}</style>
      </div>
    );
  }
);

PrintableIdCard.displayName = "PrintableIdCard";

export default PrintableIdCard;
