import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function ProductivityTable({ onOperatorSelect }) {
  const [sessions, setSessions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("any");
  const [shiftFilter, setShiftFilter] = useState("any");
  const [areaFilter, setAreaFilter] = useState("any");
  const [cityFilter, setCityFilter] = useState("any");
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    async function fetchProductivityData() {
      try {
        setLoading(true);
        const [sessionsResponse, statsResponse, citiesResponse] = await Promise.all([
          fetch("/productivity/"),
          fetch("/productivity/estadisticas/generales"),
          fetch("/productivity/ciudades/disponibles")
        ]);

        if (!sessionsResponse.ok || !statsResponse.ok) {
          throw new Error("Error fetching productivity data");
        }

        const sessionsData = await sessionsResponse.json();
        const statsData = await statsResponse.json();
        const citiesData = citiesResponse.ok ? await citiesResponse.json() : { ciudades: [] };

        const sessionsArray = Object.entries(sessionsData).map(
          ([sessionId, sessionData]) => ({
            id: sessionId,
            ...sessionData,
            // Cambiado: usar eficiencia_operario directamente como Score General
            scoreGeneral: sessionData.eficiencia_operario,
          })
        );

        setSessions(sessionsArray);
        setStatistics(statsData);
        setAvailableCities(citiesData.ciudades || []);
      } catch (error) {
        console.error("Error fetching productivity data:", error);
        setError("Error al cargar los datos de productividad");
      } finally {
        setLoading(false);
      }
    }

    fetchProductivityData();
  }, []);

  // Función getOverallColor actualizada para usar scoreGeneral
  const getOverallColor = (score) => {
    if (score >= 90) return "border-green-500";
    if (score >= 80) return "border-yellow-500";
    if (score >= 70) return "border-orange-500";
    return "border-red-500";
  };

  const getRankColor = (rank) => {
    const colors = {
      S: "bg-purple-700/50 backdrop-blur-3xl text-white border-none rounded-md",
      A: "bg-green-700/50 backdrop-blur-3xl text-white border-none rounded-md",
      B: "bg-blue-700/50 backdrop-blur-3xl text-white border-none rounded-md",
      C: "bg-yellow-400/50 backdrop-blur-3xl text-black border-none rounded-md",
      D: "bg-red-700/50 backdrop-blur-3xl text-white border-none rounded-md",
    };
    return colors[rank] || "bg-gray-600 text-white";
  };

  const uniqueOperators = [...new Set(sessions.map(session => session.nombre_operario))];
  const uniqueAreas = [...new Set(sessions.map(session => session.area_trabajo))];

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.nombre_operario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ciudad.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOperator = operatorFilter === "any" || session.nombre_operario === operatorFilter;
    const matchesShift = shiftFilter === "any" || session.turno === shiftFilter;
    const matchesArea = areaFilter === "any" || session.area_trabajo === areaFilter;
    const matchesCity = cityFilter === "any" || session.ciudad === cityFilter;

    return matchesSearch && matchesOperator && matchesShift && matchesArea && matchesCity;
  });

  const handleOperatorClick = (operatorName) => {
    if (onOperatorSelect) {
      onOperatorSelect(operatorName);
    }
  };

  const handleSessionClick = (session) => {
    if (onOperatorSelect) {
      onOperatorSelect(session.nombre_operario);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-white">📊 Cargando datos de productividad...</div>
    );

  if (error)
    return (
      <div className="p-8 text-white">
        <div className="bg-[#1A2639] border border-[#2C3E50] p-4 mb-4">
          <p className="text-red-400 font-semibold">⚠️ Error:</p>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );

  if (!sessions.length)
    return (
      <div className="p-8 text-white">
        No hay datos de productividad disponibles
      </div>
    );

  return (
    <div className="min-h-screen text-white p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight text-[#DFBD69]">
          Análisis de Productividad
        </h1>
        <p className="text-neutral-400 mt-1 text-sm">
          Desempeño y métricas de operarios
        </p>
      </div>

      {/* KPI Card */}
      <div className="bg-[#0C1526] p-6 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="flex gap-3">
              <h3 className="text-lg text-[#DFBD69] mb-4">
                KPI
              </h3>
              <h3 className="text-lg mb-4">
                Progreso Mensual
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Meta:</span>
                <span className="text-white">95% eficiencia</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Actual:</span>
                <span className="text-[#3B82F6] font-semibold">
                  {statistics?.estadisticas_generales?.eficiencia_promedio || 0}%
                </span>
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#94A3B8]">Progreso hacia la meta</span>
              <span className="text-sm font-semibold">
                {Math.round((statistics?.estadisticas_generales?.eficiencia_promedio / 95) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#09111E] rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (statistics?.estadisticas_generales?.eficiencia_promedio / 95) * 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0C1526] p-6 space-y-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">
              Buscar operario
            </label>
            <input
              placeholder="Nombre, puesto, ciudad o ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09111E] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-[#3B82F6] outline-none"
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">
              Operario
            </label>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="w-full bg-[#09111E] rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#3B82F6] outline-none"
            >
              <option value="any">- Cualquiera -</option>
              {uniqueOperators.map(operator => (
                <option key={operator} value={operator}>{operator}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">Turno</label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full bg-[#09111E] rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#3B82F6] outline-none"
            >
              <option value="any">- Cualquiera -</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
            </select>
          </div>
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">
              Área de trabajo
            </label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full bg-[#09111E] rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#3B82F6] outline-none"
            >
              <option value="any">- Cualquiera -</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">
              Ciudad
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-[#09111E] rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#3B82F6] outline-none"
            >
              <option value="any">- Cualquiera -</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-xs text-[#64748B]">
        Mostrando {filteredSessions.length} de {sessions.length} resultados.
        {cityFilter !== "any" && (
          <span className="ml-2">
            • Filtrado por ciudad: <span className="text-[#3B82F6]">{cityFilter}</span>
          </span>
        )}
      </div>

      {/* Productivity Table */}
      <div className="overflow-hidden rounded-md">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#0D1B2A] text-[#94A3B8] uppercase text-xs">
            <tr>
              <th className="p-3 font-semibold">Operario</th>
              <th className="p-3 font-semibold">Puesto</th>
              <th className="p-3 font-semibold">Ciudad</th>
              <th className="p-3 font-semibold">Turno</th>
              <th className="p-3 font-semibold">Área</th>
              <th className="p-3 font-semibold text-right">Items/min</th>
              <th className="p-3 font-semibold text-center">Score General</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr
                key={session.id}
                className="hover:bg-[#1E293B]/40 transition-colors cursor-pointer"
                onClick={() => handleSessionClick(session)}
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center text-xs font-semibold">
                      {session.nombre_operario.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white font-medium">{session.nombre_operario}</p>
                      <p className="text-xs text-[#94A3B8]">{session.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-[#E2E8F0]">{session.puesto}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#E2E8F0]">{session.ciudad}</span>
                    <Badge
                      variant="outline"
                      className="text-xs bg-[#1E293B] text-[#94A3B8] border-[#374151]"
                    >
                      {session.country}
                    </Badge>
                  </div>
                </td>
                <td className="p-3">
                  <Badge
                    variant="status"
                    className={`${session.turno === "Matutino"
                      ? "bg-[#172554] text-[#60A5FA] border border-[#1E40AF]"
                      : "bg-[#422006] text-[#FDBA74] border border-[#713F12]"
                      } tracking-wide px-2 py-1 text-xs uppercase`}
                  >
                    {session.turno}
                  </Badge>
                </td>
                <td className="p-3 text-[#E2E8F0]">{session.area_trabajo}</td>
                <td className="p-3 text-right text-white font-semibold">
                  {session.tasa_items_por_minuto.toFixed(1)}
                </td>
                <td className="p-3 text-center">
                  <div
                    className={`w-12 h-12 mx-auto rounded-lg border-2 ${getOverallColor(session.scoreGeneral)} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {Math.round(session.scoreGeneral)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Performers Section */}
      {statistics?.top_operarios && (
        <div className="bg-[#0C1526] p-6 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#DFBD69]">
              Top Operarios
            </h2>
            {cityFilter !== "any" && (
              <Badge className="bg-[#3B82F6] text-white">
                Ciudad: {cityFilter}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statistics.top_operarios.slice(0, 3).map((operario, index) => (
              <div
                key={operario.nombre}
                className="bg-[#09111E] p-4 rounded-md border border-[#1E293B] hover:border-[#3B82F6] transition-colors cursor-pointer"
                onClick={() => handleOperatorClick(operario.nombre)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0
                      ? "bg-yellow-500/50 backdrop-blur-3xl"
                      : index === 1
                        ? "bg-gray-400/50 backdrop-blur-3xl"
                        : index === 2
                          ? "bg-orange-500/50 backdrop-blur-3xl"
                          : "bg-blue-700/50 backdrop-blur-3xl"
                      }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{operario.nombre}</p>
                    <p className="text-xs text-[#94A3B8]">
                      {operario.ciudades?.join(', ') || 'Múltiples ciudades'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#C8D6E5]">Eficiencia:</span>
                    <span className="font-semibold text-blue-700/90">
                      {operario.eficiencia_promedio}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Sesiones:</span>
                    <span className="text-white">{operario.total_sesiones}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Total Items:</span>
                    <span className="text-white">{operario.total_items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Ubicaciones:</span>
                    <span className="text-[#C8D6E5] text-xs">
                      {operario.paises?.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* City Statistics */}
      {cityFilter !== "any" && (
        <div className="bg-[#0C1526] p-6 rounded-md">
          <h2 className="text-xl font-semibold text-[#DFBD69] mb-4">
            Estadísticas de {cityFilter}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#09111E] p-4 rounded-md text-center">
              <p className="text-2xl font-bold text-white">
                {filteredSessions.length}
              </p>
              <p className="text-xs text-[#94A3B8]">Sesiones</p>
            </div>
            <div className="bg-[#09111E] p-4 rounded-md text-center">
              <p className="text-2xl font-bold text-[#3B82F6]">
                {[...new Set(filteredSessions.map(s => s.nombre_operario))].length}
              </p>
              <p className="text-xs text-[#94A3B8]">Operarios</p>
            </div>
            <div className="bg-[#09111E] p-4 rounded-md text-center">
              <p className="text-2xl font-bold text-[#10B981]">
                {Math.round(filteredSessions.reduce((sum, session) => sum + session.eficiencia_operario, 0) / filteredSessions.length)}%
              </p>
              <p className="text-xs text-[#94A3B8]">Eficiencia Promedio</p>
            </div>
            <div className="bg-[#09111E] p-4 rounded-md text-center">
              <p className="text-2xl font-bold text-[#F59E0B]">
                {Math.round(filteredSessions.reduce((sum, session) => sum + session.tasa_items_por_minuto, 0) / filteredSessions.length)}
              </p>
              <p className="text-xs text-[#94A3B8]">Items/min Promedio</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}