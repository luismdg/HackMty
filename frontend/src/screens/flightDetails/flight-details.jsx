import { useState, useEffect } from "react";
import { ArrowLeft, Plane } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function FlightDetails({ flightId, onBack }) {
    const [flightDetails, setFlightDetails] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFlightData() {
            try {
                setLoading(true);
                setError(null);

                const [detailsResponse, productsResponse] = await Promise.all([
                    fetch(`/data/${flightId}`),
                    fetch(`/enfoque2/${flightId}/products`)
                ]);

                if (!detailsResponse.ok) throw new Error(`Error fetching flight details: ${detailsResponse.status}`);
                if (!productsResponse.ok) throw new Error(`Error fetching products: ${productsResponse.status}`);

                const [detailsData, productsData] = await Promise.all([
                    detailsResponse.json(),
                    productsResponse.json()
                ]);

                setFlightDetails(detailsData);
                setProducts(productsData);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchFlightData();
    }, [flightId]);

    if (loading) return <div className="p-8 text-white">✈️ Cargando datos del vuelo...</div>;
    if (error) return <div className="p-8 text-red-400">{error}</div>;
    if (!flightDetails) return <div className="p-8 text-white">No se encontraron datos del vuelo</div>;

    return (
        <div className="min-h-screen bg-[#050B16] text-white p-8 space-y-6 font-sans">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-[#1E293B]">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[#C8D6E5]">Detalles Vuelo - {flightId}</h1>
                    <p className="text-[#7F8FA6] mt-1">Predicción de consumo y inventario</p>
                </div>
            </div>

            {/* Layout Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Flight Info Card */}
                <div className="bg-[#0C1526] border border-[#1E293B] rounded-lg p-6 shadow-lg space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{flightDetails.airlineIcon}</span>
                        <div>
                            <p className="text-xl font-semibold text-[#C8D6E5]">{flightDetails.airline}</p>
                            <p className="text-sm font-mono text-[#3B82F6]">{flightId}</p>
                        </div>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-[#1E293B] shadow">
                        <img
                            src="/commercial-airplane-side-view.jpg"
                            alt="Aircraft"
                            className="w-full h-48 object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-[#94A3B8]">
                        <div>
                            <p>Aeronave</p>
                            <p className="text-[#C8D6E5] font-semibold">{flightDetails.aircraft}</p>
                        </div>
                        <div>
                            <p>Capacidad Máxima</p>
                            <p className="text-[#C8D6E5] font-semibold">{flightDetails.maxCapacity}</p>
                        </div>
                        <div>
                            <p>Tickets Vendidos</p>
                            <p className="text-[#3B82F6] font-semibold">{flightDetails.ticketsSold}</p>
                        </div>
                        <div>
                            <p>Duración</p>
                            <p className="text-[#C8D6E5] font-semibold">{flightDetails.duration} hrs</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between text-sm text-[#94A3B8]">
                        <div>
                            <p>Origen</p>
                            <p className="text-[#C8D6E5] font-semibold">{flightDetails.origin}</p>
                        </div>
                        <Plane className="w-5 h-5 text-[#3B82F6] rotate-90" />
                        <div>
                            <p>Destino</p>
                            <p className="text-[#C8D6E5] font-semibold">{flightDetails.destination}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#1E293B] text-sm text-[#94A3B8]">
                        <p>Fecha y Hora de Salida</p>
                        <p className="text-[#C8D6E5] font-semibold">{flightDetails.departureDate} - {flightDetails.departureTime}</p>
                    </div>
                </div>

                {/* Consumption Prediction Table */}
                <div className="md:col-span-2 bg-[#0C1526] border border-[#1E293B] rounded-lg shadow-lg overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-[#0D1B2A] text-[#94A3B8] uppercase text-xs">
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
                                <tr key={product.productId} className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/40 transition-colors cursor-pointer">
                                    <td className="font-mono text-[#C8D6E5] p-3">{product.productId}</td>
                                    <td className="text-[#C8D6E5] font-medium p-3">{product.productName}</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="text-xs">{product.foodType}</Badge>
                                    </td>
                                    <td className="text-right text-[#C8D6E5] p-3">${product.unitCost.toFixed(2)}</td>
                                    <td className="text-center p-3">
                                        <Badge variant={product.reusableFlag ? "accent" : "muted"} className="text-xs">
                                            {product.reusableFlag ? "Sí" : "No"}
                                        </Badge>
                                    </td>
                                    <td className="text-right text-[#C8D6E5] p-3">{product.standardQuantity}</td>
                                    <td className="text-right text-[#94A3B8] p-3">{product.unitsReturned}</td>
                                    <td className="text-right text-[#C8D6E5] p-3">{product.unitsConsumed}</td>
                                    <td className="text-right text-[#3B82F6] font-semibold p-3">{product.suggestedUnits}</td>
                                    <td className="text-right text-[#3B82F6] font-semibold p-3">+{product.overloadUnits}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
