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
                  size: 85.6mm 53.98mm;
                  margin: 0;
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

  // Download as image (PNG)
  const handleDownload = async () => {
    if (printRef.current) {
      const node = printRef.current;
      // Dynamically import html-to-image for client-side rendering
      const htmlToImage = await import('html-to-image');
      htmlToImage.toPng(node, { backgroundColor: '#fff', width: 325, height: 204 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `ID_Card_${user.public_id}.png`;
          link.href = dataUrl;
          link.click();
        });
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
        <Button onClick={handleDownload} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default IdCardGenerator;
