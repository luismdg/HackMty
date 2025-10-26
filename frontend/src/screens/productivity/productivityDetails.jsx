import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Target,
  TrendingUp,
  MapPin,
  Flag,
  Building2,
  Trophy,
  Clock,
  Zap,
  Crosshair,
  BarChart3,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function ProductivityDetails({ operatorName, onBack }) {
  const [operatorData, setOperatorData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [locationData, setLocationData] = useState(null);
  const [cityStats, setCityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOperatorData() {
      try {
        setLoading(true);
        setError(null);

        const [sessionsResponse, locationResponse] = await Promise.all([
          fetch(`/productivity/operario/${operatorName}`),
          fetch(`/productivity/operario/${operatorName}/ubicacion`),
        ]);

        if (!sessionsResponse.ok) {
          throw new Error(
            `Error fetching operator data: ${sessionsResponse.status}`
          );
        }

        const sessionsData = await sessionsResponse.json();
        const locationData = locationResponse.ok
          ? await locationResponse.json()
          : null;

        const sessionsArray = Object.entries(sessionsData).map(
          ([sessionId, sessionData]) => ({
            id: sessionId,
            ...sessionData,
          })
        );

        setSessions(sessionsArray);
        setLocationData(locationData);

        if (sessionsArray.length > 0) {
          const firstSession = sessionsArray[0];
          const totalSessions = sessionsArray.length;
          const totalItems = sessionsArray.reduce(
            (sum, session) => sum + session.conteo_total_items,
            0
          );
          const avgEfficiency =
            sessionsArray.reduce(
              (sum, session) => sum + session.eficiencia_operario,
              0
            ) / totalSessions;
          const avgItemsPerMinute =
            sessionsArray.reduce(
              (sum, session) => sum + session.tasa_items_por_minuto,
              0
            ) / totalSessions;
          const avgPrecision =
            sessionsArray.reduce(
              (sum, session) => sum + session.precision_promedio,
              0
            ) / totalSessions;

          setOperatorData({
            nombre: firstSession.nombre_operario,
            puesto: firstSession.puesto,
            totalSessions,
            totalItems,
            avgEfficiency,
            avgItemsPerMinute,
            avgPrecision,
            areasTrabajo: [
              ...new Set(sessionsArray.map((session) => session.area_trabajo)),
            ],
            turnos: [...new Set(sessionsArray.map((session) => session.turno))],
            brazoDominante: firstSession.brazo_dominante,
            usoBrazoIzquierdo:
              sessionsArray.reduce(
                (sum, session) => sum + session.uso_brazo_izquierdo,
                0
              ) / totalSessions,
            usoBrazoDerecho:
              sessionsArray.reduce(
                (sum, session) => sum + session.uso_brazo_derecho,
                0
              ) / totalSessions,
            country: firstSession.country,
            ciudad: firstSession.ciudad,
          });

          if (firstSession.ciudad) {
            try {
              const cityStatsResponse = await fetch(
                `/productivity/ciudad/${firstSession.ciudad}/estadisticas`
              );
              if (cityStatsResponse.ok) {
                const cityStatsData = await cityStatsResponse.json();
                setCityStats(cityStatsData);
              }
            } catch (err) {
              console.warn("Could not fetch city statistics:", err);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOperatorData();
  }, [operatorName]);

  const getOverallColor = (efficiency) => {
    if (efficiency >= 90) return "border-green-500";
    if (efficiency >= 80) return "border-yellow-500";
    if (efficiency >= 70) return "border-orange-500";
    return "border-red-500";
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return "text-green-400";
    if (efficiency >= 80) return "text-yellow-400";
    if (efficiency >= 70) return "text-orange-400";
    return "text-red-400";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const objectiveKPI = {
    target: 85,
    current: operatorData ? Math.round(operatorData.avgEfficiency) : 0,
    title: "Objetivo Eficiencia Mensual",
    description: "Meta establecida para el trimestre actual",
    progress: operatorData
      ? Math.min(100, Math.round((operatorData.avgEfficiency / 85) * 100))
      : 0,
  };

  if (loading)
    return (
      <div className="p-8 text-white">📊 Cargando datos del operario...</div>
    );

  if (error) return <div className="p-8 text-red-400">{error}</div>;

  if (!operatorData)
    return (
      <div className="p-8 text-white">No se encontraron datos del operario</div>
    );

  return (
    <div className="min-h-screen text-white p-6 space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-[#1E293B]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-light tracking-tight text-[#DFBD69]">
            Dashboard de Productividad
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            {operatorData.nombre} • {operatorData.puesto}
          </p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Large KPI Card - Spans 2 columns */}
        <div className="xl:col-span-2">
          <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">KPI Objetivo</h2>
                <p className="text-[#94A3B8] text-sm">{objectiveKPI.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center py-16">
                <p className="text-sm text-[#94A3B8] mb-2">Eficiencia Actual</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#1E293B"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={
                        objectiveKPI.current >= 90
                          ? "#10B981"
                          : objectiveKPI.current >= 80
                          ? "#F59E0B"
                          : "#EF4444"
                      }
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${
                        (objectiveKPI.current / 100) * 553
                      } 553`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute">
                    <p className="text-5xl font-bold text-white">
                      {objectiveKPI.current}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-6">
                <div className="p-6 bg-[#0C1526] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#94A3B8] text-sm">
                      Meta Objetivo
                    </span>
                    <Flag className="w-5 h-5 text-[#DFBD69]" />
                  </div>
                  <p className="text-4xl font-bold text-[#DFBD69]">
                    {objectiveKPI.target}%
                  </p>
                </div>

                <div className="p-6 bg-[#0C1526] rounded-lg ">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#94A3B8] text-sm">Progreso</span>
                    <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <p className="text-4xl font-bold text-white">
                    {objectiveKPI.progress}%
                  </p>
                  <div className="mt-3 w-full bg-[#0C1526] rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(
                        objectiveKPI.progress
                      )} transition-all duration-500`}
                      style={{ width: `${objectiveKPI.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operator Profile Card - Combined with Location */}
        <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 ">
          <div className="flex items-center gap-4 mb-6 pb-6">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold">
              {operatorData.nombre
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {operatorData.nombre}
              </h3>
              <p className="text-[#94A3B8] text-sm">{operatorData.puesto}</p>
              <div className="flex items-center gap-2 mt-1"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0C1526] rounded-lg">
                <div className="flex items-center gap-2 text-[#94A3B8] text-xs mb-1">
                  <User className="w-3 h-3" />
                  <span>Brazo dominante</span>
                </div>
                <p className="text-white font-semibold">
                  {operatorData.brazoDominante}
                </p>
              </div>
              <div className="p-3 bg-[#0C1526] rounded-lg">
                <div className="flex items-center gap-2 text-[#94A3B8] text-xs mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>Turnos</span>
                </div>
                <p className="text-white font-semibold">
                  {operatorData.turnos.join(", ")}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0C1526] rounded-lg">
              <div className="flex items-center gap-2 text-[#94A3B8] text-xs mb-2">
                <Target className="w-3 h-3" />
                <span>Áreas de trabajo</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {operatorData.areasTrabajo.map((area, index) => (
                  <Badge
                    key={index}
                    className="text-xs bg-[#0C1526] text-[#C8D6E5] border-none"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 ">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#DFBD69]" />
                <span className="font-semibold text-white">Ubicación</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#0C1526] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8] text-sm">País</span>
                  </div>
                  <span className="text-white font-semibold">
                    {operatorData.country}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0C1526] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8] text-sm">Ciudad</span>
                  </div>
                  <span className="text-white font-semibold">
                    {operatorData.ciudad}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sesiones - Mini Bar Chart */}
        <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] opacity-10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-[#3B82F6]" />
            <p className="text-3xl font-bold text-white">
              {operatorData.totalSessions}
            </p>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">Sesiones Totales</p>

          <div className="flex items-end justify-between gap-1 h-24">
            {sessions.slice(0, 8).map((session, idx) => {
              const height =
                (session.conteo_total_items /
                  Math.max(...sessions.map((s) => s.conteo_total_items))) *
                100;
              return (
                <div key={idx} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-gradient-to-t from-[#3B82F6] to-[#60A5FA] rounded-t transition-all duration-300 hover:opacity-80"
                    style={{ height: `${height}%`, minHeight: "8px" }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items - Circular Progress */}
        <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981] opacity-10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-[#10B981]" />
            <p className="text-3xl font-bold text-white">
              {operatorData.totalItems.toLocaleString()}
            </p>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">Items Procesados</p>

          <div className="relative flex items-center justify-center h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#1E293B"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#10B981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${
                  (operatorData.totalItems /
                    (operatorData.totalSessions * 200)) *
                  251
                } 251`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-xs text-[#94A3B8]">Promedio</p>
              <p className="text-lg font-bold text-white">
                {Math.round(
                  operatorData.totalItems / operatorData.totalSessions
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Items/min - Area Chart */}
        <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B] opacity-10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-[#F59E0B]" />
            <p className="text-3xl font-bold text-white">
              {operatorData.avgItemsPerMinute.toFixed(1)}
            </p>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">Items por Minuto</p>

          <div className="relative h-24">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="areaGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0,${
                  100 - (sessions[0]?.tasa_items_por_minuto || 0) * 10
                } ${sessions
                  .slice(0, 8)
                  .map(
                    (s, i) =>
                      `L ${(i + 1) * (200 / 8)},${
                        100 - s.tasa_items_por_minuto * 10
                      }`
                  )
                  .join(" ")} L 200,100 L 0,100 Z`}
                fill="url(#areaGradient)"
              />
              <path
                d={`M 0,${
                  100 - (sessions[0]?.tasa_items_por_minuto || 0) * 10
                } ${sessions
                  .slice(0, 8)
                  .map(
                    (s, i) =>
                      `L ${(i + 1) * (200 / 8)},${
                        100 - s.tasa_items_por_minuto * 10
                      }`
                  )
                  .join(" ")}`}
                stroke="#F59E0B"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Precisión - Gauge Chart */}
        <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EF4444] opacity-10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-4">
            <Crosshair className="w-8 h-8 text-[#EF4444]" />
            <p className="text-3xl font-bold text-white">
              {operatorData.avgPrecision.toFixed(1)}%
            </p>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">Precisión Promedio</p>

          <div className="relative flex items-center justify-center h-24">
            <svg className="w-32 h-20" viewBox="0 0 100 60">
              <path
                d="M 10,50 A 40,40 0 0,1 90,50"
                stroke="#1E293B"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 10,50 A 40,40 0 0,1 90,50"
                stroke={
                  operatorData.avgPrecision >= 90
                    ? "#10B981"
                    : operatorData.avgPrecision >= 75
                    ? "#F59E0B"
                    : "#EF4444"
                }
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${
                  (operatorData.avgPrecision / 100) * 126
                } 126`}
                className="transition-all duration-1000"
              />
              <circle
                cx={
                  10 +
                  Math.cos(Math.PI * (1 - operatorData.avgPrecision / 100)) * 40
                }
                cy={
                  50 -
                  Math.sin(Math.PI * (1 - operatorData.avgPrecision / 100)) * 40
                }
                r="4"
                fill="#EF4444"
                className="animate-pulse"
              />
            </svg>
            <div className="absolute bottom-0 text-center">
              <p className="text-xs text-[#94A3B8]">Objetivo: 95%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2"></div>
          <h3 className="font-semibold text-white">Vídeo de Capacitación</h3>
        </div>

        <div className="aspect-video bg-[#0C1526] relative flex items-center justify-center">
          {/* Placeholder para video */}
          <div className="text-center">
            <p className="text-[#94A3B8]">Video no disponible</p>
            <p className="text-sm text-[#64748B] mt-1">
              El video de esta sesión se cargará aquí
            </p>
          </div>

          {/* Aquí se puede integrar un video player cuando esté disponible */}
          {/* <video className="w-full h-full" controls>
            <source src="/path/to/video.mp4" type="video/mp4" />
          </video> */}
        </div>
      </div>

      {/* Sessions History */}
      <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">Historial de Sesiones</h3>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">
            {sessions.length} sesiones registradas
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-[#0C1526] rounded-lg hover:border-[#3B82F6] transition-all "
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-mono text-xs text-[#C8D6E5] mb-1">
                      {session.id}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {session.fecha_inicio}
                    </p>
                  </div>
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
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Área</span>
                    <span className="text-white font-medium">
                      {session.area_trabajo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Turno</span>
                    <Badge
                      variant="status"
                      className={`${
                        session.turno === "Matutino"
                          ? "bg-[#172554] text-[#60A5FA]"
                          : "bg-[#422006] text-[#DFBD69]"
                      } text-xs`}
                    >
                      {session.turno}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Duración</span>
                    <span className="text-white font-medium">
                      {session.duracion_sesion_min} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Items</span>
                    <span className="text-white font-semibold">
                      {session.conteo_total_items}
                    </span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">Eficiencia</span>
                    <span
                      className={`font-bold text-sm ${getEfficiencyColor(
                        session.eficiencia_operario
                      )}`}
                    >
                      {session.eficiencia_operario}%
                    </span>
                  </div>
                  <div className="w-full bg-[#0C1526] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getProgressColor(
                        session.eficiencia_operario
                      )}`}
                      style={{ width: `${session.eficiencia_operario}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">Items/min</span>
                    <span className="font-semibold text-sm text-[#3B82F6]">
                      {session.tasa_items_por_minuto.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
