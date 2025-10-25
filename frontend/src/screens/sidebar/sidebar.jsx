import { Plane, Settings, LogOut, BarChart3 } from "lucide-react"
import { Button } from "../../components/ui/button"

export function Sidebar({ currentSection, onSectionChange }) {
    return (
        <aside className="w-64 bg-[#0A1A2F] border-r border-[#1E293B] flex flex-col">
            {/* Logo */}
            <div className="p-6 flex items-center justify-center">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-28 h-16 object-contain"
                />
            </div>

            <div className="h-px bg-[#1E293B]" />

            {/* Menu Sections */}
            <nav className="flex-1 p-4 space-y-2">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#C8D6E5] uppercase tracking-wider px-3 mb-2">
                        Módulos
                    </p>

                    {/* Flight Consumption Predictor */}
                    <Button
                        variant={currentSection === 'flights' ? 'default' : 'ghost'}
                        className={`w-full justify-start text-white ${currentSection === 'flights' ? 'bg-[#11233F] border-l-4 border-[#3B82F6]' : ''
                            }`}
                        onClick={() => onSectionChange('flights')}
                    >
                        <Plane className="w-4 h-4 mr-3" />
                        Predictor de Consumo
                    </Button>

                    {/* Productivity Analytics */}
                    <Button
                        variant={currentSection === 'productivity' ? 'default' : 'ghost'}
                        className={`w-full justify-start text-white ${currentSection === 'productivity' ? 'bg-[#11233F] border-l-4 border-[#3B82F6]' : ''
                            }`}
                        onClick={() => onSectionChange('productivity')}
                    >
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Análisis de Productividad
                    </Button>
                </div>
            </nav>

            <div className="h-px bg-[#1E293B]" />

            {/* User Profile */}
            <div className="p-4">
                <div className="flex items-center gap-3 p-3 border border-[#1E293B] rounded-sm hover:bg-[#11233F] transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full border border-[#3B82F6] overflow-hidden">
                        <img
                            src="/professional-person.png"
                            alt="Juan Delgado"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Juan Delgado</p>
                        <p className="text-xs text-[#C8D6E5] truncate">Operations Manager</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-white hover:text-[#3B82F6] hover:bg-[#11233F]"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-white hover:text-[#3B82F6] hover:bg-[#11233F]"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </aside>
    )
}