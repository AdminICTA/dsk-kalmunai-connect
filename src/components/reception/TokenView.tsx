
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, CheckCircle, Clock } from "lucide-react";

const TokenView = () => {
  const [tokens, setTokens] = useState([
    { department: "Administration", division: "General Administration", currentToken: "DEP001-045", queue: 3, status: "active" },
    { department: "Finance", division: "Accounting", currentToken: "DEP002-023", queue: 7, status: "active" },
    { department: "Public Services", division: "Birth Certificates", currentToken: "DEP005-012", queue: 15, status: "active" },
    { department: "Public Services", division: "Death Certificates", currentToken: "DEP005-008", queue: 5, status: "active" },
    { department: "Public Services", division: "Marriage Certificates", currentToken: "DEP005-003", queue: 2, status: "waiting" },
    { department: "Public Services", division: "Land Records", currentToken: "DEP005-019", queue: 12, status: "active" }
  ]);

  const handleCompleteToken = (index: number) => {
    const updatedTokens = [...tokens];
    const currentNumber = parseInt(updatedTokens[index].currentToken.split('-')[1]);
    const newTokenNumber = String(currentNumber + 1).padStart(3, '0');
    updatedTokens[index].currentToken = `${updatedTokens[index].currentToken.split('-')[0]}-${newTokenNumber}`;
    updatedTokens[index].queue = Math.max(0, updatedTokens[index].queue - 1);
    setTokens(updatedTokens);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Monitor className="w-6 h-6 mr-2" />
            Token Display Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token, index) => (
              <Card key={index} className={`border-l-4 ${token.status === 'active' ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-blue-800">{token.department}</h3>
                  <p className="text-sm text-gray-600">{token.division}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">{token.currentToken}</div>
                      <p className="text-sm text-gray-500">Current Token</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">Queue: {token.queue}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${token.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${token.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm capitalize">{token.status}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleCompleteToken(index)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete & Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TV Display Preview */}
      <Card className="bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-white">TV Display Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tokens.map((token, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg text-center">
                <h4 className="font-bold text-blue-300 mb-2">{token.department}</h4>
                <p className="text-sm text-gray-300 mb-2">{token.division}</p>
                <div className="text-xl font-bold text-white">{token.currentToken}</div>
                <p className="text-xs text-gray-400">Queue: {token.queue}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenView;
