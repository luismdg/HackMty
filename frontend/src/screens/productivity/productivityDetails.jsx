import { useState, useEffect } from "react";
import { ArrowLeft, User, Calendar, Target, TrendingUp, MapPin, Flag, Building2, Trophy } from "lucide-react";
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

                // Convertir los datos de sesiones a array
                const sessionsArray = Object.entries(sessionsData).map(([sessionId, sessionData]) => ({
                    id: sessionId,
                    ...sessionData,
                }));

                setSessions(sessionsArray);
                setLocationData(locationData);

                // Calcular datos agregados del operario
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

                    // Fetch city statistics if we have location data
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

    // KPI objetivo hardcodeado
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
        <div className="min-h-screen bg-[#050B16] text-white p-8 space-y-6 font-sans">
            {/* Header */}
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
                        Detalles Operario - {operatorData.nombre}
                    </h1>
                    <p className="text-neutral-400 mt-1 text-sm">
                        Análisis de desempeño y métricas detalladas
                    </p>
                </div>
            </div>

            {/* Layout Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Operator Info & Location */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Operator Info Card */}
                    <div className="bg-[#0C1526] rounded-lg p-6 shadow-lg space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center text-xl font-semibold">
                                {operatorData.nombre.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-[#C8D6E5]">
                                    {operatorData.nombre}
                                </p>
                                <p className="text-sm text-[#94A3B8]">{operatorData.puesto}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                                <User className="w-4 h-4" />
                                <span>Brazo dominante: </span>
                                <span className="text-[#C8D6E5] font-semibold">{operatorData.brazoDominante}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                                <Target className="w-4 h-4" />
                                <span>Áreas de trabajo: </span>
                                <span className="text-[#C8D6E5] font-semibold">{operatorData.areasTrabajo.join(', ')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                                <Calendar className="w-4 h-4" />
                                <span>Turnos: </span>
                                <span className="text-[#C8D6E5] font-semibold">{operatorData.turnos.join(', ')}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#1E293B] space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#94A3B8]">Uso brazo izquierdo:</span>
                                <span className="text-[#C8D6E5] font-semibold">
                                    {operatorData.usoBrazoIzquierdo.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#94A3B8]">Uso brazo derecho:</span>
                                <span className="text-[#C8D6E5] font-semibold">
                                    {operatorData.usoBrazoDerecho.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Overall Score */}
                        <div className="pt-4 border-t border-[#1E293B] text-center">
                            <p className="text-sm text-[#94A3B8] mb-2">Score General</p>
                            <div
                                className={`w-20 h-20 mx-auto rounded-xl border-4 ${getOverallColor(operatorData.avgEfficiency)} flex items-center justify-center text-white font-bold text-2xl`}
                            >
                                {Math.round(operatorData.avgEfficiency)}
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-[#0C1526] rounded-lg p-6 shadow-lg space-y-4">
                        <div className="flex items-center gap-2 text-[#DFBD69]">
                            <MapPin className="w-5 h-5" />
                            <h3 className="font-semibold">Ubicación</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Flag className="w-4 h-4 text-[#94A3B8]" />
                                <span className="text-[#94A3B8]">País:</span>
                                <span className="text-[#C8D6E5] font-semibold ml-auto">{operatorData.country}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-[#94A3B8]" />
                                <span className="text-[#94A3B8]">Ciudad:</span>
                                <span className="text-[#C8D6E5] font-semibold ml-auto">{operatorData.ciudad}</span>
                            </div>
                        </div>

                        {cityStats && (
                            <div className="pt-4 border-t border-[#1E293B] space-y-2">
                                <p className="text-sm text-[#94A3B8] text-center">Estadísticas de {operatorData.ciudad}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="text-center p-2 bg-[#1E293B] rounded">
                                        <p className="text-[#C8D6E5] font-semibold">{cityStats.estadisticas_generales?.total_operarios || 0}</p>
                                        <p className="text-[#94A3B8]">Operarios</p>
                                    </div>
                                    <div className="text-center p-2 bg-[#1E293B] rounded">
                                        <p className="text-[#C8D6E5] font-semibold">{cityStats.estadisticas_generales?.eficiencia_promedio || 0}%</p>
                                        <p className="text-[#94A3B8]">Eficiencia</p>
                                    </div>
                                </div>
                                {cityStats.mejor_operario && cityStats.mejor_operario.nombre === operatorData.nombre && (
                                    <div className="flex items-center gap-2 justify-center mt-2 p-2 bg-[#172554] rounded border border-[#1E40AF]">
                                        <Trophy className="w-4 h-4 text-[#60A5FA]" />
                                        <span className="text-xs text-[#60A5FA] font-semibold">Mejor operario</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Statistics, KPI and Sessions */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Statistics and KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Statistics Cards */}
                        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[#0C1526] rounded-lg p-4 text-center">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#3B82F6]" />
                                <p className="text-2xl font-bold text-white">{operatorData.totalSessions}</p>
                                <p className="text-xs text-[#94A3B8]">Sesiones Totales</p>
                            </div>
                            <div className="bg-[#0C1526] rounded-lg p-4 text-center">
                                <Target className="w-8 h-8 mx-auto mb-2 text-[#10B981]" />
                                <p className="text-2xl font-bold text-white">{operatorData.totalItems}</p>
                                <p className="text-xs text-[#94A3B8]">Items Procesados</p>
                            </div>
                            <div className="bg-[#0C1526] rounded-lg p-4 text-center">
                                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                                    <span className="text-xl">⚡</span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {operatorData.avgItemsPerMinute.toFixed(1)}
                                </p>
                                <p className="text-xs text-[#94A3B8]">Items/Min</p>
                            </div>
                            <div className="bg-[#0C1526] rounded-lg p-4 text-center">
                                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                                    <span className="text-xl">🎯</span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {operatorData.avgPrecision.toFixed(1)}%
                                </p>
                                <p className="text-xs text-[#94A3B8]">Precisión</p>
                            </div>
                        </div>

                        {/* KPI Objective Card */}
                        <div className="md:col-span-2 bg-[#0C1526] rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-5 h-5 text-[#DFBD69]" />
                                <h3 className="font-semibold text-[#C8D6E5]">KPI Objetivo</h3>
                            </div>
                            <div className="space-y-3">
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
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-[#94A3B8]">Progreso</span>
                                        <span className="text-[#C8D6E5] font-semibold">{objectiveKPI.progress}%</span>
                                    </div>
                                    <div className="w-full bg-[#1E293B] rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getProgressColor(objectiveKPI.progress)} transition-all duration-500`}
                                            style={{ width: `${objectiveKPI.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {objectiveKPI.current >= objectiveKPI.target ? (
                                    <div className="flex items-center gap-2 text-green-400 text-xs">
                                        <Trophy className="w-4 h-4" />
                                        <span>¡Objetivo cumplido!</span>
                                    </div>
                                ) : (
                                    <div className="text-orange-400 text-xs">
                                        <span>Faltan {objectiveKPI.target - objectiveKPI.current}% para la meta</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sessions Table */}
                    <div className="bg-[#0C1526] rounded-lg shadow-lg overflow-x-auto">
                        <div className="p-4 border-b border-[#1E293B]">
                            <h3 className="font-semibold text-[#C8D6E5]">Historial de Sesiones</h3>
                            <p className="text-sm text-[#94A3B8]">{sessions.length} sesiones registradas</p>
                        </div>
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-[#0D1B2A] text-[#94A3B8] uppercase text-xs">
                                <tr>
                                    <th className="p-3 text-left">ID Sesión</th>
                                    <th className="p-3 text-left">Fecha</th>
                                    <th className="p-3 text-left">Turno</th>
                                    <th className="p-3 text-left">Área</th>
                                    <th className="p-3 text-right">Duración</th>
                                    <th className="p-3 text-right">Items</th>
                                    <th className="p-3 text-right">Items/min</th>
                                    <th className="p-3 text-center">Eficiencia</th>
                                    <th className="p-3 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr
                                        key={session.id}
                                        className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/40 transition-colors"
                                    >
                                        <td className="font-mono text-[#C8D6E5] p-3">
                                            {session.id}
                                        </td>
                                        <td className="text-[#C8D6E5] p-3">
                                            {session.fecha_inicio}
                                        </td>
                                        <td className="p-3">
                                            <Badge
                                                variant="status"
                                                className={`${session.turno === "Matutino"
                                                    ? "bg-[#172554] text-[#60A5FA] border border-[#1E40AF]"
                                                    : "bg-[#422006] text-[#FDBA74] border border-[#713F12]"
                                                    } text-xs uppercase`}
                                            >
                                                {session.turno}
                                            </Badge>
                                        </td>
                                        <td className="text-[#C8D6E5] p-3">
                                            {session.area_trabajo}
                                        </td>
                                        <td className="text-right text-[#94A3B8] p-3">
                                            {session.duracion_sesion_min} min
                                        </td>
                                        <td className="text-right text-[#C8D6E5] font-semibold p-3">
                                            {session.conteo_total_items}
                                        </td>
                                        <td className="text-right text-[#3B82F6] font-semibold p-3">
                                            {session.tasa_items_por_minuto.toFixed(1)}
                                        </td>
                                        <td className="text-center p-3">
                                            <span className={`font-semibold ${getEfficiencyColor(session.eficiencia_operario)}`}>
                                                {session.eficiencia_operario}%
                                            </span>
                                        </td>
                                        <td className="text-center p-3">
                                            <Badge
                                                variant={session.estado_sesion === "COMPLETADA" ? "accent" : "muted"}
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
                </div>
            </div>
        </div>
    );
}