
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import PrintableIdCard from "./PrintableIdCard";

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
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>ID Card - ${user.name}</title>
              <style>
                @media print {
                  body { margin: 0; }
                  .print-container { 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh; 
                  }
                }
                @page {
                  size: A4;
                  margin: 20mm;
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                ${printRef.current.outerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <PrintableIdCard ref={printRef} user={user} />
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Print ID Card
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default IdCardGenerator;
