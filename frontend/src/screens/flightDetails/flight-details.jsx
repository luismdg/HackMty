import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plane,
  Award,
  Clock,
  Users,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function FlightDetails({ flightId, onBack }) {
  const [flightDetails, setFlightDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [consumptionPredictions, setConsumptionPredictions] = useState([]);
  const [recommendedOperators, setRecommendedOperators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFlightData() {
      try {
        setLoading(true);
        setError(null);

        const [detailsResponse, productsResponse, predictionResponse, operatorResponse] =
          await Promise.all([
            fetch(`/data/${flightId}`),
            fetch(`/products/all`),
            fetch(`/prediction/flight-recommendation/${flightId}`),
            fetch(`/productivity/recomendacion/vuelo/${flightId}`),
          ]);

        if (!detailsResponse.ok)
          throw new Error(
            `Error fetching flight details: ${detailsResponse.status}`
          );
        if (!productsResponse.ok)
          throw new Error(
            `Error fetching products: ${productsResponse.status}`
          );

        const [detailsData, productsData, predictionData, operatorData] = await Promise.all([
          detailsResponse.json(),
          productsResponse.json(),
          predictionResponse.ok ? predictionResponse.json() : null,
          operatorResponse.ok ? operatorResponse.json() : null,
        ]);

        setFlightDetails(detailsData);
        setProducts(productsData.products || []);
        setConsumptionPredictions(predictionData || {});
        setRecommendedOperators(operatorData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFlightData();
  }, [flightId]);

  // Determinar tipo de tripulación basado en duración
  const getCrewType = (duration) => {
    return duration > 3 ? "high" : duration > 1.5 ? "medium" : "low";
  };

  const getCrewDescription = (crewType) => {
    const descriptions = {
      high: "Tripulación de Alta Eficiencia (Vuelos Largos)",
      medium: "Tripulación Estándar (Vuelos Medianos)",
      low: "Tripulación Básica (Vuelos Cortos)",
    };
    return descriptions[crewType];
  };

  // Función para obtener justificación basada en la predicción
  const getConsumptionJustification = (product, prediction) => {
    const duration = flightDetails?.duration || 0;
    const acceptanceRate = prediction?.metrics?.acceptance_rate || 0;

    if (duration > 3) {
      return "Extra por vuelo largo + alta demanda";
    } else if (duration > 1.5) {
      if (acceptanceRate > 80) {
        return "Stock estándar + alta aceptación";
      } else if (acceptanceRate > 60) {
        return "Stock estándar + aceptación media";
      } else {
        return "Stock ajustado + baja aceptación";
      }
    } else {
      return "Mínimo necesario + vuelo corto";
    }
  };

  // Función para obtener cantidad sugerida basada en predicción
  const getSuggestedQuantity = (product, prediction) => {
    if (prediction && prediction.prediction) {
      return Math.round(prediction.prediction.suggested_units);
    }
    // Fallback a datos del producto si no hay predicción
    return product.suggested_units || product.standard_quantity;
  };

  // Función para obtener margen basado en predicción
  const getOverloadQuantity = (product, prediction) => {
    if (prediction && prediction.prediction) {
      return Math.round(prediction.prediction.overload_units);
    }
    // Fallback a datos del producto si no hay predicción
    return product.overload_units || 0;
  };

  // Obtener productos principales para mostrar (bebidas y snacks)
  const getMainProducts = () => {
    return products
      .filter(product =>
        product.tipo === 'beverage' ||
        product.tipo === 'snack' ||
        product.tipo === 'main_meal'
      )
      .slice(0, 6);
  };

  if (loading)
    return <div className="p-8 text-white"> Cargando datos del vuelo...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!flightDetails)
    return (
      <div className="p-8 text-white">No se encontraron datos del vuelo</div>
    );

  const crewType = getCrewType(flightDetails.duration);
  const mainProducts = getMainProducts();

  return (
    <div className="min-h-screen text-white p-6 space-y-6 font-sans">
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
            {flightId} - {flightDetails.airline}
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            {flightDetails.origin} → {flightDetails.destination} •{" "}
            {flightDetails.duration} hrs
          </p>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Flight Information */}
        <div className="space-y-6">
          {/* Flight Overview Card */}
          <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-white">
                Información del Vuelo
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#94A3B8]">Aeronave</p>
                  <p className="text-white font-medium">
                    {flightDetails.aircraft}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">Capacidad</p>
                  <p className="text-white font-medium">
                    {flightDetails.maxCapacity} pasajeros
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">Tickets Vendidos</p>
                  <p className="text-[#3B82F6] font-semibold">
                    {flightDetails.ticketsSold}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#94A3B8]">Duración</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">
                      {flightDetails.duration} horas
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">Salida</p>
                  <p className="text-white font-medium">
                    {flightDetails.departureDate}
                  </p>
                  <p className="text-sm text-[#94A3B8]">
                    {flightDetails.departureTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0C1526] rounded-lg">
              <div className="text-center">
                <p className="text-sm text-[#94A3B8]">Origen</p>
                <p className="text-white font-semibold">
                  {flightDetails.origin}
                </p>
              </div>
              <Plane className="w-5 h-5 text-[#3B82F6] rotate-90" />
              <div className="text-center">
                <p className="text-sm text-[#94A3B8]">Destino</p>
                <p className="text-white font-semibold">
                  {flightDetails.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Products Card */}
          <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-white">
                Productos Sugeridos
              </h2>
              {consumptionPredictions.metrics && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
                  {consumptionPredictions.metrics.acceptance_rate}% Tasa Aceptación
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {mainProducts.map((product) => {
                const suggestedQty = getSuggestedQuantity(product, consumptionPredictions);
                const overloadQty = getOverloadQuantity(product, consumptionPredictions);
                const justification = getConsumptionJustification(product, consumptionPredictions);

                return (
                  <div
                    key={product.product_id || product.productId}
                    className="flex items-center justify-between p-4 bg-[#0C1526] rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center">
                        <p className="font-mono text-sm text-[#94A3B8]">ID</p>
                        <p className="font-mono text-white">
                          {product.product_id || product.productId}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {product.product_name || product.productName}
                        </p>
                        <p className="text-xs text-[#94A3B8] capitalize">
                          {product.tipo}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-[#94A3B8]">Sugeridos</p>
                          <p className="text-[#3B82F6] font-semibold">
                            {suggestedQty}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A3B8]">Margen</p>
                          <p className="text-[#10B981] font-semibold">
                            +{overloadQty}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#94A3B8] max-w-[150px]">
                        {justification}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Información de Predicción */}
            {consumptionPredictions.prediction && (
              <div className="mt-6 pt-4 border-t border-[#1E293B]">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-[#94A3B8]">Total Sugerido</p>
                    <p className="text-[#3B82F6] font-semibold">
                      {consumptionPredictions.prediction.total_required}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Eficiencia</p>
                    <p className="text-[#10B981] font-semibold">
                      {consumptionPredictions.metrics?.efficiency_score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Confianza</p>
                    <p className="text-[#F59E0B] font-semibold capitalize">
                      {consumptionPredictions.recommendations?.confidence_level}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Crew Recommendations */}
        <div className="space-y-6">
          {/* Crew Type Indicator */}
          <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Tripulación Esperada
                  </h2>
                  <p className="text-sm text-[#94A3B8]">
                    {getCrewDescription(crewType)}
                  </p>
                </div>
              </div>
              <Badge
                className={
                  crewType === "high"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : crewType === "medium"
                      ? "bg-yellow-500/20 text-yellow-400 rounded-md"
                      : "bg-blue-500/20 text-blue-400 rounded-md"
                }
              >
                {crewType === "high"
                  ? "Alta Demanda"
                  : crewType === "medium"
                    ? "Demanda Media"
                    : "Demanda Baja"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-[#0C1526] rounded-lg">
                <p className="text-[#94A3B8]">Duración del Vuelo</p>
                <p className="text-white font-semibold text-lg">
                  {flightDetails.duration}h
                </p>
              </div>
              <div className="text-center p-3 bg-[#0C1526] rounded-lg">
                <p className="text-[#94A3B8]">Pasajeros</p>
                <p className="text-[#3B82F6] font-semibold text-lg">
                  {flightDetails.ticketsSold}
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Operators */}
          {recommendedOperators &&
            recommendedOperators.recommended_operators && (
              <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    Operarios Recomendados
                  </h2>
                </div>

                <div className="space-y-4">
                  {recommendedOperators.recommended_operators
                    .slice(0, 2)
                    .map((operator, index) => (
                      <div key={index} className="p-4 bg-[#0C1526] rounded-lg">
                        <div className="flex items-center gap-4">
                          {/* Profile Photo Placeholder */}
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-slate-700">
                            {operator.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-white font-semibold">
                                {operator.nombre}
                              </p>
                              <Badge
                                className={
                                  index === 0
                                    ? "bg-green-500/20 text-green-400 rounded-md border-none"
                                    : "bg-purple-500/20 text-purple-400 rounded-md border-none"
                                }
                              >
                                #{index + 1} Recomendado
                              </Badge>
                            </div>
                            <p className="text-sm text-[#94A3B8]">
                              {operator.puesto}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                          <div>
                            <p className="text-xs text-[#94A3B8]">Score</p>
                            <p className="text-white font-semibold">
                              {operator.score}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Eficiencia</p>
                            <p className="text-[#10B981] font-semibold">
                              {operator.eficiencia_promedio}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Items/min</p>
                            <p className="text-[#3B82F6] font-semibold">
                              {operator.items_por_minuto_promedio}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar for Efficiency */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#94A3B8]">
                              Nivel de Eficiencia
                            </span>
                            <span className="text-white">
                              {operator.eficiencia_promedio}%
                            </span>
                          </div>
                          <div className="w-full bg-[#0C1526] rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${operator.eficiencia_promedio >= 90
                                ? "bg-green-500"
                                : operator.eficiencia_promedio >= 80
                                  ? "bg-yellow-500"
                                  : operator.eficiencia_promedio >= 70
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                                }`}
                              style={{
                                width: `${operator.eficiencia_promedio}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Location Info */}
                <div className="mt-6 pt-4">
                  <p className="text-sm text-[#94A3B8] mb-2">
                    Ubicación de la Tripulación
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-[#0C1526] rounded-lg">
                    <MapPin className="w-4 h-4 text-white" />
                    <p className="text-white">
                      {recommendedOperators.recommended_operators[0].ubicacion}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}