import { useState, useEffect } from "react";
import { ArrowLeft, Plane, Award } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function FlightDetails({ flightId, onBack }) {
  const [flightDetails, setFlightDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [recommendedOperators, setRecommendedOperators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFlightData() {
      try {
        setLoading(true);
        setError(null);

        const [detailsResponse, productsResponse, operatorResponse] = await Promise.all([
          fetch(`/data/${flightId}`),
          fetch(`/enfoque2/${flightId}/products`),
          fetch(`/productivity/recomendacion/vuelo/${flightId}`)
        ]);

        if (!detailsResponse.ok)
          throw new Error(`Error fetching flight details: ${detailsResponse.status}`);
        if (!productsResponse.ok)
          throw new Error(`Error fetching products: ${productsResponse.status}`);

        const [detailsData, productsData, operatorData] = await Promise.all([
          detailsResponse.json(),
          productsResponse.json(),
          operatorResponse.ok ? operatorResponse.json() : null
        ]);

        setFlightDetails(detailsData);
        setProducts(productsData);
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

  if (loading)
    return <div className="p-8 text-white"> ✈️ Cargando datos del vuelo...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!flightDetails)
    return (
      <div className="p-8 text-white">No se encontraron datos del vuelo</div>
    );

  return (
    <div className="min-h-screen text-white p-8 space-y-6 font-sans">
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
            Detalles Vuelo - {flightId}
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            Predicción de consumo y asignación de personal
          </p>
        </div>
      </div>

      {/* Layout Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Flight Info Card */}
        <div className="backdrop-blur-3xl bg-blue-300/10 rounded-md p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xl font-semibold text-[#C8D6E5]">
                {flightDetails.airline}
              </p>
              <p className="text-sm font-mono text-[#3B82F6]">{flightId}</p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-[#1E293B] shadow">
            <img
              src="/commercial-airplane-side-view.jpg"
              alt="Aircraft"
              className="w-full h-32 object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-[#94A3B8]">
            <div>
              <p>Aeronave</p>
              <p className="text-[#C8D6E5] font-semibold">
                {flightDetails.aircraft}
              </p>
            </div>
            <div>
              <p>Capacidad Máxima</p>
              <p className="text-[#C8D6E5] font-semibold">
                {flightDetails.maxCapacity}
              </p>
            </div>
            <div>
              <p>Tickets Vendidos</p>
              <p className="text-[#3B82F6] font-semibold">
                {flightDetails.ticketsSold}
              </p>
            </div>
            <div>
              <p>Duración</p>
              <p className="text-[#C8D6E5] font-semibold">
                {flightDetails.duration} hrs
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between text-sm text-[#94A3B8]">
            <div>
              <p>Origen</p>
              <p className="text-[#C8D6E5] font-semibold">
                {flightDetails.origin}
              </p>
            </div>
            <Plane className="w-5 h-5 text-[#3B82F6] rotate-90" />
            <div>
              <p>Destino</p>
              <p className="text-[#C8D6E5] font-semibold">
                {flightDetails.destination}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B] text-sm text-[#94A3B8]">
            <p>Fecha y Hora de Salida</p>
            <p className="text-[#C8D6E5] font-semibold">
              {flightDetails.departureDate} - {flightDetails.departureTime}
            </p>
          </div>
        </div>

        {/* Recommended Operators Card */}
        {recommendedOperators && recommendedOperators.recommended_operators && recommendedOperators.recommended_operators.length > 0 && (
          <div className="lg:col-span-1 bg-[#0C1526] rounded-lg p-6 shadow-lg space-y-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#DFBD69]" />
              <h2 className="text-lg font-semibold text-[#DFBD69]">
                Operarios Recomendados
              </h2>
            </div>

            {/* Primer operario recomendado */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center text-sm font-semibold">
                  {recommendedOperators.recommended_operators[0].nombre.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-[#C8D6E5]">
                    {recommendedOperators.recommended_operators[0].nombre}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {recommendedOperators.recommended_operators[0].puesto}
                  </p>
                </div>
                <Badge className="bg-[#10B981] text-white ml-auto">
                  #{1}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Score:</span>
                  <span className="text-[#C8D6E5] font-semibold">
                    {recommendedOperators.recommended_operators[0].score}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Eficiencia:</span>
                  <span className="text-[#C8D6E5] font-semibold">
                    {recommendedOperators.recommended_operators[0].eficiencia_promedio}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Items/min:</span>
                  <span className="text-[#C8D6E5] font-semibold">
                    {recommendedOperators.recommended_operators[0].items_por_minuto_promedio}
                  </span>
                </div>
              </div>
            </div>

            {/* Segundo operario recomendado */}
            {recommendedOperators.recommended_operators.length > 1 && (
              <>
                <div className="border-t border-[#1E293B] pt-4"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#6366F1] rounded-full flex items-center justify-center text-sm font-semibold">
                      {recommendedOperators.recommended_operators[1].nombre.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-[#C8D6E5]">
                        {recommendedOperators.recommended_operators[1].nombre}
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        {recommendedOperators.recommended_operators[1].puesto}
                      </p>
                    </div>
                    <Badge className="bg-[#8B5CF6] text-white ml-auto">
                      #{2}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94A3B8]">Score:</span>
                      <span className="text-[#C8D6E5] font-semibold">
                        {recommendedOperators.recommended_operators[1].score}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94A3B8]">Eficiencia:</span>
                      <span className="text-[#C8D6E5] font-semibold">
                        {recommendedOperators.recommended_operators[1].eficiencia_promedio}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94A3B8]">Items/min:</span>
                      <span className="text-[#C8D6E5] font-semibold">
                        {recommendedOperators.recommended_operators[1].items_por_minuto_promedio}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Ubicación común */}
            <div className="pt-4 border-t border-[#1E293B]">
              <p className="text-xs text-[#94A3B8] mb-1">Ubicación:</p>
              <p className="text-sm text-[#C8D6E5]">
                {recommendedOperators.recommended_operators[0].ubicacion}
              </p>
            </div>

            {/* Alternativas adicionales */}
            {recommendedOperators.alternative_operators && recommendedOperators.alternative_operators.length > 0 && (
              <div className="pt-4 border-t border-[#1E293B]">
                <p className="text-xs text-[#94A3B8] mb-2">También disponibles:</p>
                <div className="space-y-2">
                  {recommendedOperators.alternative_operators.slice(0, 2).map((operator, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-[#C8D6E5] truncate">{operator.nombre}</span>
                      <Badge variant="outline" className="text-xs">
                        {operator.eficiencia_promedio}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Consumption Prediction Table */}
        <div className="md:col-span-2 backdrop-blur-3xl bg-slate-900/20 rounded-md shadow-lg overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="backdrop-blur-3xl bg-blue-300/10 text-[#94A3B8] uppercase text-xs">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-right">Costo</th>
                <th className="p-3 text-center">Reusable</th>
                <th className="p-3 text-right">Std Qty</th>
                <th className="p-3 text-right">Devueltos</th>
                <th className="p-3 text-right">Consumidos</th>
                <th className="p-3 text-right">Sugeridos</th>
                <th className="p-3 text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.productId}
                  className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/40 transition-colors cursor-pointer"
                >
                  <td className="font-mono text-[#C8D6E5] p-3">
                    {product.productId}
                  </td>
                  <td className="text-[#C8D6E5] font-medium p-3">
                    {product.productName}
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {product.foodType}
                    </Badge>
                  </td>
                  <td className="text-right text-[#C8D6E5] p-3">
                    ${product.unitCost.toFixed(2)}
                  </td>
                  <td className="text-center p-3">
                    <Badge
                      variant={product.reusableFlag ? "accent" : "muted"}
                      className="text-xs"
                    >
                      {product.reusableFlag ? "Sí" : "No"}
                    </Badge>
                  </td>
                  <td className="text-right text-[#C8D6E5] p-3">
                    {product.standardQuantity}
                  </td>
                  <td className="text-right text-[#94A3B8] p-3">
                    {product.unitsReturned}
                  </td>
                  <td className="text-right text-[#C8D6E5] p-3">
                    {product.unitsConsumed}
                  </td>
                  <td className="text-right text-[#3B82F6] font-semibold p-3">
                    {product.suggestedUnits}
                  </td>
                  <td className="text-right text-[#3B82F6] font-semibold p-3">
                    +{product.overloadUnits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}