import { Plane, Settings, LogOut, BarChart3, Package, ChevronDown, User, Building2, Shield, MessageCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useState } from "react";

export function Sidebar({ currentSection, onSectionChange }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("gategroup"); // "gategroup" o "airline"
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const accounts = [
    {
      id: "gategroup",
      name: "Gate Group",
      type: "Cuenta Master",
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: "american",
      name: "American Airlines",
      type: "Aerolínea",
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: "delta",
      name: "Delta Air Lines",
      type: "Aerolínea",
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: "united",
      name: "United Airlines",
      type: "Aerolínea",
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: "lufthansa",
      name: "Lufthansa",
      type: "Aerolínea",
      icon: <Building2 className="w-4 h-4" />
    }
  ];

  const currentAccount = accounts.find(acc => acc.id === selectedAccount);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    // Aquí iría la lógica de logout real
    setShowLogoutConfirm(false);
  };

  return (
    <aside className="w-64 bg-[#050B16] backdrop-blur-3xl flex flex-col h-screen">
      {/* Logo con Dropdown */}
      <div className="p-6 flex flex-col items-center">
        <div className="relative w-full">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-2 hover:bg-[#11233F] rounded-lg transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
              <div className="text-left">
                <p className="text-white text-sm font-semibold">
                  {currentAccount.name}
                </p>
                <p className="text-xs text-gray-400">
                  {currentAccount.type}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A1427] border border-[#1E293B] rounded-lg shadow-lg z-50">
              <div className="p-2">
                <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Cuentas Master
                </div>
                {accounts.filter(acc => acc.type === "Cuenta Master").map((account) => (
                  <Button
                    key={account.id}
                    variant="ghost"
                    className={`w-full justify-start text-white hover:bg-[#11233F] mb-1 ${selectedAccount === account.id ? "bg-[#11233F] text-[#DFBD69]" : ""
                      }`}
                    onClick={() => {
                      setSelectedAccount(account.id);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {account.icon}
                    <span className="ml-2">{account.name}</span>
                  </Button>
                ))}

                <div className="my-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Aerolíneas
                </div>
                {accounts.filter(acc => acc.type === "Aerolínea").map((account) => (
                  <Button
                    key={account.id}
                    variant="ghost"
                    className={`w-full justify-start text-white hover:bg-[#11233F] mb-1 ${selectedAccount === account.id ? "bg-[#11233F] text-[#DFBD69]" : ""
                      }`}
                    onClick={() => {
                      setSelectedAccount(account.id);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {account.icon}
                    <span className="ml-2">{account.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Sections */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1 flex flex-col mt-[10px] gap-3 h-full w-full">
          {/* Flight Consumption Predictor */}
          <Button
            variant={currentSection === "flights" ? "default" : "ghost"}
            className={`w-full justify-start text-white hover:text-[#DFBD69] hover:rounded-sm ${currentSection === "flights" ? "bg-[#11233F] text-[#DFBD69]" : ""
              }`}
            onClick={() => onSectionChange("flights")}
          >
            <Plane className="w-4 h-4 mr-3" />
            Vuelos
          </Button>

          {/* Productivity Analytics */}
          <Button
            variant={currentSection === "productivity" ? "default" : "ghost"}
            className={`w-full justify-start text-nowrap hover:text-[#DFBD69] hover:rounded-sm ${currentSection === "productivity" ? "bg-[#11233F] text-[#DFBD69]" : ""
              }`}
            onClick={() => onSectionChange("productivity")}
          >
            <BarChart3 className="w-4 h-4 mr-3" />
            Empleados
          </Button>

          {/* Products Management */}
          <Button
            variant={currentSection === "products" ? "default" : "ghost"}
            className={`w-full justify-start text-white hover:text-[#DFBD69] hover:rounded-sm ${currentSection === "products" ? "bg-[#11233F] text-[#DFBD69]" : ""
              }`}
            onClick={() => onSectionChange("products")}
          >
            <Package className="w-4 h-4 mr-3" />
            Productos
          </Button>

          {/* Chatbot Assistant */}
          <Button
            variant={currentSection === "chatbot" ? "default" : "ghost"}
            className={`w-full justify-start text-white hover:text-[#DFBD69] hover:rounded-sm ${currentSection === "chatbot" ? "bg-[#11233F] text-[#DFBD69]" : ""
              }`}
            onClick={() => onSectionChange("chatbot")}
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Asistente IA
          </Button>
        </div>
      </nav>

      <div className="h-px bg-[#1E293B]" />

      {/* User Session Section */}
      <div className="p-4 space-y-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A1427] hover:bg-[#11233F] transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-[#DFBD69] to-[#B8860B] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              Alejandro Rodríguez
            </p>
            <p className="text-gray-400 text-xs truncate">
              {currentAccount.type === "Cuenta Master" ? "Administrador Master" : "Gerente de Operaciones"}
            </p>
          </div>
        </div>

        {/* Configuration and Logout */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 justify-center text-gray-400 hover:text-[#DFBD69] hover:bg-[#11233F] transition-colors"
            onClick={() => console.log("Abrir configuración")}
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            className="flex-1 justify-center text-gray-400 hover:text-red-400 hover:bg-[#11233F] transition-colors"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Account Badge */}
        <div className="px-3 py-2 bg-[#11233F] rounded-lg text-center">
          <p className="text-xs text-gray-400">
            Conectado como:{" "}
            <span className="text-[#DFBD69] font-medium">
              {currentAccount.name}
            </span>
          </p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0A1427] border border-[#1E293B] rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-white font-semibold text-lg mb-2">
              Cerrar Sesión
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              ¿Estás seguro de que quieres cerrar sesión?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}