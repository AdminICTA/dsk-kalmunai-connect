import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, FileText, Shield, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

type UserRole = 'public' | 'staff' | 'admin';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    {
      id: 'public' as UserRole,
      title: 'Public User',
      subtitle: 'Access citizen services',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Apply for certificates, track applications, and access public services'
    },
    {
      id: 'staff' as UserRole,
      title: 'Staff Member',
      subtitle: 'Staff portal access',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      description: 'Manage documents, process applications, and handle daily operations'
    },
    {
      id: 'admin' as UserRole,
      title: 'Administrator',
      subtitle: 'Administrative panel',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      description: 'Full system access, user management, and administrative controls'
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username && password && selectedRole) {
      console.log("Login attempt:", { username, password, role: selectedRole });
      
      // Simulate login success and redirect based on role
      if (selectedRole === "admin") {
        navigate("/admin-dashboard");
      } else if (selectedRole === "staff") {
        navigate("/reception-dashboard");
      } else {
        // Handle public role when implemented
        console.log(`${selectedRole} dashboard not yet implemented`);
      }
    }
  };

  const resetSelection = () => {
    setSelectedRole(null);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">DSK</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-800">DSK Kalmunai</h1>
              <p className="text-blue-600">Divisional Secretariat Login</p>
            </div>
          </div>
        </div>

        {!selectedRole ? (
          /* Role Selection */
          <Card className="bg-white shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl text-blue-800 mb-2">Select Your Role</CardTitle>
              <p className="text-gray-600">Choose your access level to continue</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {roles.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <Card 
                      key={role.id}
                      className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-blue-200"
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-blue-800 mb-2">{role.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{role.subtitle}</p>
                        <p className="text-xs text-gray-500">{role.description}</p>
                        <Button className={`mt-4 w-full bg-gradient-to-r ${role.color} hover:opacity-90`}>
                          Select Role
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Login Form */
          <Card className="bg-white shadow-2xl max-w-md mx-auto">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetSelection}
                  className="absolute left-4 top-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                {(() => {
                  const selectedRoleData = roles.find(r => r.id === selectedRole);
                  const IconComponent = selectedRoleData?.icon || Users;
                  return (
                    <div className={`w-16 h-16 bg-gradient-to-r ${selectedRoleData?.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  );
                })()}
              </div>
              <CardTitle className="text-2xl text-blue-800 mb-2">
                {roles.find(r => r.id === selectedRole)?.title} Login
              </CardTitle>
              <p className="text-gray-600 text-sm">
                {roles.find(r => r.id === selectedRole)?.subtitle}
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-blue-800 font-medium">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="h-12 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-800 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg font-medium shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                  Forgot your password?
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
