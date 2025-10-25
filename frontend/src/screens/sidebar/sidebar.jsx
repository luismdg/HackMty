import { Plane, Settings, LogOut, BarChart3 } from "lucide-react";
import { Button } from "../../components/ui/button";

export function Sidebar({ currentSection, onSectionChange }) {
  return (
    <aside className="w-64 bg-[#050B16] backdrop-blur-3xl flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center justify-center">
        <img src="/logo.png" alt="Logo" className="w-28 h-16 object-contain" />
      </div>

      {/* Menu Sections */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-white hover-uppercase tracking-wider px-3 mb-2">
            MÓDULOS
          </p>

          {/* Flight Consumption Predictor */}
          <Button
            variant={currentSection === "flights" ? "default" : "ghost"}
            className={`w-full justify-start text-white hover:text-[#DFBD69] hover:rounded-sm${
              currentSection === "flights" ? "bg-[#11233F] text-[#DFBD69]" : ""
            }`}
            onClick={() => onSectionChange("flights")}
          >
            <Plane className="w-4 h-4 mr-3" />
            Predictor de Consumo
          </Button>

          {/* Productivity Analytics */}
          <Button
            variant={currentSection === "productivity" ? "default" : "ghost"}
            className={`w-full justify-start text-nowrap hover:text-[#DFBD69] hover:rounded-sm${
              currentSection === "productivity"
                ? "bg-[#11233F] text-[#DFBD69]"
                : ""
            }`}
            onClick={() => onSectionChange("productivity")}
          >
            <BarChart3 className="w-4 h-4 mr-3" />
            Análisis de Productividad
          </Button>
        </div>
      </nav>

      <div className="h-px bg-[#1E293B]" />
    </aside>
  );
}
