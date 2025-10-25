import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function ProductivityTable() {
  const [sessions, setSessions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchProductivityData() {
      try {
        setLoading(true);
        const [sessionsResponse, statsResponse] = await Promise.all([
          fetch("/productivity/"),
          fetch("/productivity/estadisticas/generales"),
        ]);

        if (!sessionsResponse.ok || !statsResponse.ok) {
          throw new Error("Error fetching productivity data");
        }

        const sessionsData = await sessionsResponse.json();
        const statsData = await statsResponse.json();

        const sessionsArray = Object.entries(sessionsData).map(
          ([sessionId, sessionData]) => ({
            id: sessionId,
            ...sessionData,
            rank: calculateRank(sessionData),
          })
        );

        setSessions(sessionsArray);
        setStatistics(statsData);
      } catch (error) {
        console.error("Error fetching productivity data:", error);
        setError("Error al cargar los datos de productividad");
      } finally {
        setLoading(false);
      }
    }

    fetchProductivityData();
  }, []);

  const calculateRank = (session) => {
    const score =
      session.eficiencia_operario * 0.7 + session.tasa_items_por_minuto * 0.3;
    if (score >= 95) return "S";
    if (score >= 85) return "A";
    if (score >= 75) return "B";
    if (score >= 65) return "C";
    return "D";
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

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true;
    if (filter === "high") return session.rank === "S" || session.rank === "A";
    if (filter === "matutino") return session.turno === "Matutino";
    if (filter === "vespertino") return session.turno === "Vespertino";
    return true;
  });

  if (loading)
    return (
      <div className="p-8 text-white">Cargando datos de productividad...</div>
    );
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!sessions.length)
    return (
      <div className="p-8 text-white">
        No hay datos de productividad disponibles
      </div>
    );

  return (
    <div className="p-8 space-y-6 min-h-screen text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight text-[#DFBD69]">
          Análisis de Productividad
        </h1>
        <p className="text-neutral-400 mt-1 text-sm">
          Desempeño y métricas de operarios
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
          {Object.entries(statistics.estadisticas_generales).map(
            ([key, value]) => (
              <div
                key={key}
                className="backdrop-blur-3xl bg-blue-300/10 rounded-md px-4 py-6"
              >
                <p className="text-xs pb-2 text-[#C8D6E5] capitalize">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 text-xs">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="appearance-none bg-transparent border border-slate-900 flex pl-5 items-center rounded-md text-white"
        >
          <option value="all">Todos los operarios</option>
          <option value="high">Alto desempeño (A-S)</option>
          <option value="matutino">Turno Matutino</option>
          <option value="vespertino">Turno Vespertino</option>
        </select>
        <Button className=" text-white hover:bg-[#0C1526] border-none text-xs">
          Exportar Reporte
        </Button>
      </div>

      {/* Results Info */}
      <div className="text-sm text-[#C8D6E5]">
        Mostrando {filteredSessions.length} de {sessions.length} sesiones
      </div>

      {/* Productivity Table */}
      <div className="overflow-x-auto rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="ackdrop-blur-3xl bg-blue-300/10 text-[#C8D6E5] text-xs uppercase">
              <th className="p-4 text-left">Rank</th>
              <th className="p-4 text-left">Operario</th>
              <th className="p-4 text-left">Puesto</th>
              <th className="p-4 text-left">Turno</th>
              <th className="p-4 text-left">Área</th>
              <th className="p-4 text-right">Items</th>
              <th className="p-4 text-right">Tasa/min</th>
              <th className="p-4 text-right">Eficiencia</th>
              <th className="p-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr
                key={session.id}
                className="backdrop-blur-3xl bg-slate-900/20 hover:bg-[#1E293B]/40 transition-colors text-xs"
              >
                <td className="p-4">
                  <Badge
                    className={`${getRankColor(
                      session.rank
                    )} text-xs font-bold`}
                  >
                    {session.rank}
                  </Badge>
                </td>
                <td className="p-4">
                  <p className="font-medium">{session.nombre_operario}</p>
                  <p className="text-xs text-[#C8D6E5]">{session.id}</p>
                </td>
                <td className="p-4">{session.puesto}</td>
                <td className="p-4">
                  <Badge
                    variant={
                      session.turno === "Matutino" ? "accent" : "outline"
                    }
                    className="text-xs"
                  >
                    {session.turno}
                  </Badge>
                </td>
                <td className="p-4">{session.area_trabajo}</td>
                <td className="p-4 text-right">{session.conteo_total_items}</td>
                <td className="p-4 text-right">
                  {session.tasa_items_por_minuto}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-semibold">
                      {session.eficiencia_operario}%
                    </span>
                    <div className="w-16 bg-[#1E293B] rounded-full h-2">
                      <div
                        className="bg-[#3B82F6] h-2 rounded-full"
                        style={{ width: `${session.eficiencia_operario}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <Badge
                    variant={
                      session.estado_sesion === "COMPLETADA"
                        ? "accent"
                        : "muted"
                    }
                    className="text-xs"
                  >
                    {session.estado_sesion}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Performers */}
      {statistics?.top_operarios && (
        <div className="backdrop-blur-3xl bg-blue-300/10 p-6 shadow-md rounded-md text-xs">
          <h2 className="text-sm font-bold mb-4">Top Operarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statistics.top_operarios.map((operario, index) => (
              <div
                key={operario.nombre}
                className=" p-4 hover:bg-[#1E293B]/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
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
                    <p className="font-semibold">{operario.nombre}</p>
                    <p className="text-xs text-[#C8D6E5]">
                      {operario.total_sesiones} sesiones
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
                  <div className="flex justify-between text-sm">
                    <span className="text-[#C8D6E5]">Total Items:</span>
                    <span className="font-semibold">
                      {operario.total_items}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
