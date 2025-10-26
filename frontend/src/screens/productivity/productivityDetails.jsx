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
    BarChart3
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
                    fetch(`/productivity/operario/${operatorName}/ubicacion`)
                ]);

                if (!sessionsResponse.ok) {
                    throw new Error(`Error fetching operator data: ${sessionsResponse.status}`);
                }

                const sessionsData = await sessionsResponse.json();
                const locationData = locationResponse.ok ? await locationResponse.json() : null;

                const sessionsArray = Object.entries(sessionsData).map(([sessionId, sessionData]) => ({
                    id: sessionId,
                    ...sessionData,
                }));

                setSessions(sessionsArray);
                setLocationData(locationData);

                if (sessionsArray.length > 0) {
                    const firstSession = sessionsArray[0];
                    const totalSessions = sessionsArray.length;
                    const totalItems = sessionsArray.reduce((sum, session) => sum + session.conteo_total_items, 0);
                    const avgEfficiency = sessionsArray.reduce((sum, session) => sum + session.eficiencia_operario, 0) / totalSessions;
                    const avgItemsPerMinute = sessionsArray.reduce((sum, session) => sum + session.tasa_items_por_minuto, 0) / totalSessions;
                    const avgPrecision = sessionsArray.reduce((sum, session) => sum + session.precision_promedio, 0) / totalSessions;

                    setOperatorData({
                        nombre: firstSession.nombre_operario,
                        puesto: firstSession.puesto,
                        totalSessions,
                        totalItems,
                        avgEfficiency,
                        avgItemsPerMinute,
                        avgPrecision,
                        areasTrabajo: [...new Set(sessionsArray.map(session => session.area_trabajo))],
                        turnos: [...new Set(sessionsArray.map(session => session.turno))],
                        brazoDominante: firstSession.brazo_dominante,
                        usoBrazoIzquierdo: sessionsArray.reduce((sum, session) => sum + session.uso_brazo_izquierdo, 0) / totalSessions,
                        usoBrazoDerecho: sessionsArray.reduce((sum, session) => sum + session.uso_brazo_derecho, 0) / totalSessions,
                        country: firstSession.country,
                        ciudad: firstSession.ciudad
                    });

                    if (firstSession.ciudad) {
                        try {
                            const cityStatsResponse = await fetch(`/productivity/ciudad/${firstSession.ciudad}/estadisticas`);
                            if (cityStatsResponse.ok) {
                                const cityStatsData = await cityStatsResponse.json();
                                setCityStats(cityStatsData);
                            }
                        } catch (err) {
                            console.warn('Could not fetch city statistics:', err);
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
        progress: operatorData ? Math.min(100, Math.round((operatorData.avgEfficiency / 85) * 100)) : 0
    };

    if (loading)
        return <div className="p-8 text-white">📊 Cargando datos del operario...</div>;

    if (error)
        return <div className="p-8 text-red-400">{error}</div>;

    if (!operatorData)
        return (
            <div className="p-8 text-white">No se encontraron datos del operario</div>
        );

    return (
        <div className="min-h-screen text-white p-6 space-y-6 font-sans">
            {/* Header Section */}
            <div className="flex items-center justify-between">
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
                        <h1 className="text-2xl font-semibold text-[#DFBD69]">
                            {operatorData.nombre}
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            {operatorData.puesto} • {sessions.length} sesiones
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-[#94A3B8]">Score General</p>
                    <div className={`text-2xl font-bold ${getEfficiencyColor(operatorData.avgEfficiency)}`}>
                        {Math.round(operatorData.avgEfficiency)}%
                    </div>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column - Profile & Location */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-[#0C1526] rounded-xl p-6 border border-[#1E293B]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-full flex items-center justify-center text-xl font-semibold border border-[#374151]">
                                {operatorData.nombre.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{operatorData.nombre}</h3>
                                <p className="text-[#94A3B8] text-sm">{operatorData.puesto}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#94A3B8]">
                                        <User className="w-4 h-4" />
                                        <span>Brazo dominante</span>
                                    </div>
                                    <p className="text-white font-medium">{operatorData.brazoDominante}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#94A3B8]">
                                        <Calendar className="w-4 h-4" />
                                        <span>Turnos</span>
                                    </div>
                                    <p className="text-white font-medium">{operatorData.turnos.join(', ')}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                                    <Target className="w-4 h-4" />
                                    <span>Áreas de trabajo</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {operatorData.areasTrabajo.map((area, index) => (
                                        <Badge key={index} variant="outline" className="text-xs bg-[#1E293B] text-[#C8D6E5]">
                                            {area}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-[#0C1526] rounded-xl p-6 border border-[#1E293B]">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-[#DFBD69]" />
                            <h3 className="font-semibold text-white">Ubicación</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-[#1E293B] rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Flag className="w-4 h-4 text-[#94A3B8]" />
                                    <span className="text-[#94A3B8]">País</span>
                                </div>
                                <span className="text-white font-medium">{operatorData.country}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#1E293B] rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-[#94A3B8]" />
                                    <span className="text-[#94A3B8]">Ciudad</span>
                                </div>
                                <span className="text-white font-medium">{operatorData.ciudad}</span>
                            </div>
                        </div>

                        {cityStats && (
                            <div className="mt-4 pt-4 border-t border-[#1E293B]">
                                <p className="text-sm text-[#94A3B8] text-center mb-3">Estadísticas Locales</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-[#1E293B] rounded-lg">
                                        <p className="text-lg font-bold text-white">{cityStats.estadisticas_generales?.total_operarios || 0}</p>
                                        <p className="text-xs text-[#94A3B8]">Operarios</p>
                                    </div>
                                    <div className="text-center p-3 bg-[#1E293B] rounded-lg">
                                        <p className="text-lg font-bold text-[#10B981]">{cityStats.estadisticas_generales?.eficiencia_promedio || 0}%</p>
                                        <p className="text-xs text-[#94A3B8]">Eficiencia</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Column - Performance Metrics */}
                <div className="space-y-6">
                    {/* Performance Stats */}
                    <div className="bg-[#0C1526] rounded-xl p-6 border border-[#1E293B]">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-[#DFBD69]" />
                            <h3 className="font-semibold text-white">Métricas de Rendimiento</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-[#1E293B] rounded-lg">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#3B82F6]" />
                                <p className="text-2xl font-bold text-white">{operatorData.totalSessions}</p>
                                <p className="text-xs text-[#94A3B8]">Sesiones</p>
                            </div>
                            <div className="text-center p-4 bg-[#1E293B] rounded-lg">
                                <Target className="w-8 h-8 mx-auto mb-2 text-[#10B981]" />
                                <p className="text-2xl font-bold text-white">{operatorData.totalItems}</p>
                                <p className="text-xs text-[#94A3B8]">Items</p>
                            </div>
                            <div className="text-center p-4 bg-[#1E293B] rounded-lg">
                                <Zap className="w-8 h-8 mx-auto mb-2 text-[#F59E0B]" />
                                <p className="text-2xl font-bold text-white">{operatorData.avgItemsPerMinute.toFixed(1)}</p>
                                <p className="text-xs text-[#94A3B8]">Items/min</p>
                            </div>
                            <div className="text-center p-4 bg-[#1E293B] rounded-lg">
                                <Crosshair className="w-8 h-8 mx-auto mb-2 text-[#EF4444]" />
                                <p className="text-2xl font-bold text-white">{operatorData.avgPrecision.toFixed(1)}%</p>
                                <p className="text-xs text-[#94A3B8]">Precisión</p>
                            </div>
                        </div>
                    </div>

                    {/* KPI Objective */}
                    <div className="bg-[#0C1526] rounded-xl p-6 border border-[#1E293B]">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-[#DFBD69]" />
                            <h3 className="font-semibold text-white">KPI Objetivo</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-[#94A3B8]">{objectiveKPI.title}</p>
                                <p className="text-xs text-[#64748B]">{objectiveKPI.description}</p>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-white">{objectiveKPI.current}%</p>
                                    <p className="text-xs text-[#94A3B8]">Actual</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-[#DFBD69]">{objectiveKPI.target}%</p>
                                    <p className="text-xs text-[#94A3B8]">Meta</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Progreso</span>
                                    <span className="text-white font-semibold">{objectiveKPI.progress}%</span>
                                </div>
                                <div className="w-full bg-[#1E293B] rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getProgressColor(objectiveKPI.progress)} transition-all duration-500`}
                                        style={{ width: `${objectiveKPI.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {objectiveKPI.current >= objectiveKPI.target ? (
                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                    <Trophy className="w-4 h-4" />
                                    <span>¡Objetivo cumplido!</span>
                                </div>
                            ) : (
                                <div className="text-orange-400 text-sm">
                                    <span>Faltan {objectiveKPI.target - objectiveKPI.current}% para la meta</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sessions History */}
                <div className="xl:col-span-1">
                    <div className="bg-[#0C1526] rounded-xl border border-[#1E293B] h-full">
                        <div className="p-6 border-b border-[#1E293B]">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-[#DFBD69]" />
                                <h3 className="font-semibold text-white">Historial de Sesiones</h3>
                            </div>
                            <p className="text-sm text-[#94A3B8]">{sessions.length} sesiones registradas</p>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto">
                            <div className="p-4 space-y-3">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="p-4 bg-[#1E293B] rounded-lg border border-[#374151] hover:border-[#3B82F6] transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-mono text-sm text-[#C8D6E5]">{session.id}</p>
                                                <p className="text-xs text-[#94A3B8]">{session.fecha_inicio}</p>
                                            </div>
                                            <Badge
                                                variant={session.estado_sesion === "COMPLETADA" ? "accent" : "muted"}
                                                className="text-xs"
                                            >
                                                {session.estado_sesion}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-[#94A3B8]">Área:</span>
                                                <p className="text-white">{session.area_trabajo}</p>
                                            </div>
                                            <div>
                                                <span className="text-[#94A3B8]">Turno:</span>
                                                <Badge
                                                    variant="status"
                                                    className={`${session.turno === "Matutino"
                                                        ? "bg-[#172554] text-[#60A5FA]"
                                                        : "bg-[#422006] text-[#FDBA74]"
                                                        } text-xs`}
                                                >
                                                    {session.turno}
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className="text-[#94A3B8]">Duración:</span>
                                                <p className="text-white">{session.duracion_sesion_min} min</p>
                                            </div>
                                            <div>
                                                <span className="text-[#94A3B8]">Items:</span>
                                                <p className="text-white font-semibold">{session.conteo_total_items}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#374151]">
                                            <div>
                                                <span className="text-[#94A3B8] text-xs">Eficiencia:</span>
                                                <span className={`font-semibold text-sm ml-2 ${getEfficiencyColor(session.eficiencia_operario)}`}>
                                                    {session.eficiencia_operario}%
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[#94A3B8] text-xs">Items/min:</span>
                                                <span className="font-semibold text-sm ml-2 text-[#3B82F6]">
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
            </div>
        </div>
    );
}