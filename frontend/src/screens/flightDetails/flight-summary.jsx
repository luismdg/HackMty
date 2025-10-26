import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function FlightSummary({ onFlightSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [airline, setAirline] = useState("any");
  const [country, setCountry] = useState("any");
  const [durationFilter, setDurationFilter] = useState("any");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFlights() {
      try {
        setLoading(true);
        const response = await fetch("/data/");
        if (!response.ok) throw new Error("Failed to fetch flights");
        const allFlights = await response.json();
        const flightsArray = Object.entries(allFlights).map(
          ([flightId, flightData]) => ({
            id: flightId,
            airline: flightData.airline,
            origin: flightData.origin.split(" - ")[0],
            destination: flightData.destination.split(" - ")[0],
            passengers: flightData.ticketsSold,
            duration: flightData.duration,
            durationLabel: `${flightData.duration} HRS`,
            status: "ACTIVO",
            country: "USA",
            type:
              flightData.origin.includes("USA") &&
                flightData.destination.includes("USA")
                ? "Domestic"
                : "International",
            ...flightData,
          })
        );
        setFlights(flightsArray);
      } catch (error) {
        console.error("Error fetching flights:", error);
        setError("Error al cargar los vuelos desde el servidor");
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, []);

  const filteredFlights = flights.filter((flight) => {
    const matchesSearch =
      flight.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAirline = airline === "any" || flight.airline === airline;
    const matchesCountry = country === "any" || flight.country === country;
    const matchesDuration =
      durationFilter === "any" ||
      (durationFilter === "short" && flight.duration <= 3) ||
      (durationFilter === "medium" &&
        flight.duration > 3 &&
        flight.duration <= 6) ||
      (durationFilter === "long" && flight.duration > 6);
    return matchesSearch && matchesAirline && matchesCountry && matchesDuration;
  });

  if (loading)
    return (
      <div className="p-8 text-white">Cargando información de vuelos...</div>
    );
  if (error)
    return (
      <div className="p-8 text-white">
        <div className="bg-[#1A2639] border border-[#2C3E50] p-4 mb-4">
          <p className="text-red-400 font-semibold">⚠️ Error:</p>
          <p className="text-red-300">{error}</p>
          <p className="text-red-500 text-sm mt-2">
            Mostrando datos de ejemplo...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen  text-white p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-[#DFBD69]">
          Resumen de Vuelos
        </h1>
        <p className="text-neutral-400 mt-1 text-sm">
          Explora y filtra los vuelos disponibles.
        </p>
      </div>

      <div className="backdrop-blur-3xl bg-blue-300/10 p-6 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">
              Buscar vuelo
            </label>
            <input
              placeholder="AA1234 o American Airlines"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09111E] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-[#3B82F6] outline-none"
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">
              Aerolínea
            </label>
            <select
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="appearance-none bg-transparent border border-[#09111E] flex px-2 py-2 items-center rounded-md text-[#94A3B8] text-sm"
            >
              <option value="any">- Cualquiera -</option>
              <option value="American Airlines">American Airlines</option>
              <option value="Delta Airlines">Delta Airlines</option>
              <option value="United Airlines">United Airlines</option>
            </select>
          </div>
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">País</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="appearance-none bg-transparent border border-[#09111E] flex px-2 py-2 items-center rounded-md text-[#94A3B8] text-sm"
            >
              <option value="any">- Cualquiera -</option>
              <option value="USA">USA</option>
              <option value="Mexico">Mexico</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
          <div>
            <label className="text-xs mb-1.5 block text-[#94A3B8]">
              Duración
            </label>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="appearance-none bg-transparent border border-[#09111E] flex px-2 py-2 items-center rounded-md text-[#94A3B8] text-sm"
            >
              <option value="any">- Cualquiera -</option>
              <option value="short">Corto (&lt;= 3h)</option>
              <option value="medium">Medio (3-6h)</option>
              <option value="long">Largo (&gt; 6h)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-xs text-[#64748B]">
        Mostrando {filteredFlights.length} de {flights.length} resultados.
      </div>

      <div className="overflow-hidden rounded-md">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="backdrop-blur-3xl bg-blue-300/10 text-[#94A3B8] uppercase text-xs">
            <tr>
              <th className="p-3 font-semibold">Aerolínea</th>
              <th className="p-3 font-semibold">ID</th>
              <th className="p-3 font-semibold">Origen</th>
              <th className="p-3 font-semibold">Destino</th>
              <th className="p-3 font-semibold">Pasajeros</th>
              <th className="p-3 font-semibold">Duración</th>
              <th className="p-3 font-semibold">Tipo</th>
              <th className="p-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlights.map((flight, i) => (
              <tr
                key={`${flight.id}-${i}`}
                onClick={() => onFlightSelect(flight.id)}
                className="cursor-pointer backdrop-blur-3xl bg-slate-900/20 hover:bg-[#1E293B]/40 transition-colors"
              >
                <td className="p-3 ">{flight.airline}</td>
                <td className="p-3 text-[#E2E8F0]">{flight.id}</td>
                <td className="p-3 text-[#E2E8F0]">{flight.origin}</td>
                <td className="p-3 text-[#E2E8F0]">{flight.destination}</td>
                <td className="p-3">{flight.passengers}</td>
                <td className="p-3">{flight.durationLabel}</td>
                <td className="p-3 text-[#E2E8F0]">{flight.type}</td>
                <td className="p-3">
                  <Badge
                    variant="status"
                    className="bg-[#172554]/10 backdrop-blur-3xl  text-[#60A5FA] tracking-wide px-2 py-1 text-xs uppercase border-none"
                  >
                    {flight.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
