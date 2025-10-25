import { useState } from "react";
import { Sidebar } from "./screens/sidebar/sidebar";
import { FlightSummary } from "./screens/flightDetails/flight-summary";
import { FlightDetails } from "./screens/flightDetails/flight-details";
import { ProductivityTable } from "./screens/productivity/productivity";

export default function Home() {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [currentSection, setCurrentSection] = useState("flights"); // 'flights' or 'productivity'

  const renderMainContent = () => {
    if (currentSection === "productivity") {
      return <ProductivityTable />;
    }

    // Flight section logic
    if (selectedFlight) {
      return (
        <FlightDetails
          flightId={selectedFlight}
          onBack={() => setSelectedFlight(null)}
        />
      );
    } else {
      return <FlightSummary onFlightSelect={setSelectedFlight} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-black via-[#050B16] to-black text-white">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      <main className="flex-1 overflow-auto">{renderMainContent()}</main>
    </div>
  );
}
