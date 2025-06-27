
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Phone, Info, LogIn, Menu, X, Users, FileText, Shield, Settings } from "lucide-react";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">DSK</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">DSK Kalmunai</h1>
                <p className="text-sm text-blue-100">Divisional Secretariat</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {[
                { id: "home", label: "Home", icon: Home },
                { id: "about", label: "About", icon: Info },
                { id: "contact", label: "Contact", icon: Phone },
                { id: "login", label: "Login", icon: LogIn },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeSection === id
                      ? "bg-white text-blue-600 shadow-md"
                      : "hover:bg-blue-700"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-blue-500">
              <div className="flex flex-col space-y-2 mt-4">
                {[
                  { id: "home", label: "Home", icon: Home },
                  { id: "about", label: "About", icon: Info },
                  { id: "contact", label: "Contact", icon: Phone },
                  { id: "login", label: "Login", icon: LogIn },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      activeSection === id
                        ? "bg-white text-blue-600 shadow-md"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Home Section */}
        <section id="home" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-blue-800 mb-6">
                Welcome to DSK Kalmunai
              </h2>
              <p className="text-xl md:text-2xl text-blue-600 mb-8">
                Divisional Secretariat - Streamlining Public Services
              </p>
              <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
                Access government services efficiently through our modern digital platform. 
                We're committed to providing transparent, accessible, and user-friendly public services.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-500">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">Public Services</h3>
                    <p className="text-gray-600">Easy access to all public services and applications</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-green-500">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">Document Management</h3>
                    <p className="text-gray-600">Efficient document processing and tracking system</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-purple-500">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">Secure Access</h3>
                    <p className="text-gray-600">Role-based secure access for staff and administrators</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-blue-800 mb-8">About DSK Kalmunai</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-left">
                  <p className="text-lg text-gray-700 mb-6">
                    The Divisional Secretariat of Kalmunai serves as the primary administrative unit 
                    providing essential government services to the local community. Our mission is to 
                    deliver efficient, transparent, and citizen-centric services.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <p className="text-gray-700">Comprehensive public service delivery</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <p className="text-gray-700">Digital transformation initiatives</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <p className="text-gray-700">Community engagement and development</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-8 rounded-2xl">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-800 mb-2">Our Vision</h3>
                    <p className="text-gray-700">
                      To be the leading divisional secretariat in providing excellent public services 
                      through innovative digital solutions and community partnerships.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-blue-800 mb-8">Contact Us</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold text-blue-800 mb-6">Get in Touch</h3>
                    <div className="space-y-4 text-left">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">+94 XX XXX XXXX</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Info className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">info@dsk-kalmunai.lk</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Home className="w-5 h-5 text-blue-600 mt-1" />
                        <span className="text-gray-700">
                          Divisional Secretariat Office,<br />
                          Kalmunai, Sri Lanka
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold text-blue-800 mb-6">Office Hours</h3>
                    <div className="space-y-4 text-left">
                      <div className="border-b border-gray-200 pb-2">
                        <p className="font-semibold text-gray-800">Monday - Friday</p>
                        <p className="text-gray-600">8:30 AM - 4:30 PM</p>
                      </div>
                      <div className="border-b border-gray-200 pb-2">
                        <p className="font-semibold text-gray-800">Saturday</p>
                        <p className="text-gray-600">8:30 AM - 12:00 PM</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Sunday</p>
                        <p className="text-gray-600">Closed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Login Section */}
        <section id="login" className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-blue-800 mb-8">Access Your Account</h2>
              <p className="text-lg text-gray-700 mb-12">
                Login to access personalized services based on your role
              </p>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl">
                <CardContent className="p-8">
                  <div className="grid gap-6">
                    <Button 
                      className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      onClick={() => window.location.href = '/login'}
                    >
                      <LogIn className="w-6 h-6 mr-3" />
                      Login to DSK Portal
                    </Button>
                    
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-4 bg-white rounded-lg shadow">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-blue-800">Public</p>
                        <p className="text-xs text-gray-600">Citizen Services</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow">
                        <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-blue-800">Staff</p>
                        <p className="text-xs text-gray-600">Staff Portal</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow">
                        <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-blue-800">Admin</p>
                        <p className="text-xs text-gray-600">Administrative Panel</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">DSK</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">DSK Kalmunai</h3>
              <p className="text-sm text-blue-200">Divisional Secretariat</p>
            </div>
          </div>
          <p className="text-blue-200 mb-4">
            © 2024 Divisional Secretariat Kalmunai. All rights reserved.
          </p>
          <p className="text-sm text-blue-300">
            Committed to serving our community with excellence and transparency.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
