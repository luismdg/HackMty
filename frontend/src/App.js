import { useState } from "react";
import { Sidebar } from "./screens/sidebar/sidebar";
import { FlightSummary } from "./screens/flightDetails/flight-summary";
import { FlightDetails } from "./screens/flightDetails/flight-details";
import { ProductivityTable } from "./screens/productivity/productivity";
import { ProductivityDetails } from "./screens/productivity/productivityDetails";
import { ProductsTable } from "./screens/products/products";
import { ProductsDetails } from "./screens/products/productsDetails";

export default function Home() {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentSection, setCurrentSection] = useState("flights");

  const handleSectionChange = (section) => {
    setCurrentSection(section);
    setSelectedFlight(null);
    setSelectedOperator(null);
    setSelectedProduct(null);
  };

  const renderMainContent = () => {
    switch (currentSection) {
      case "productivity":
        if (selectedOperator) {
          return (
            <ProductivityDetails
              operatorName={selectedOperator}
              onBack={() => setSelectedOperator(null)}
            />
          );
        } else {
          return <ProductivityTable onOperatorSelect={setSelectedOperator} />;
        }

      case "products":
        if (selectedProduct) {
          return (
            <ProductsDetails
              productId={selectedProduct}
              onBack={() => setSelectedProduct(null)}
            />
          );
        } else {
          return <ProductsTable onProductSelect={setSelectedProduct} />;
        }

      default:
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
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-black via-[#020a17] to-black text-white relative">
      {/* Background Image with Overlay */}
      <div 
        className="ml-[200px] absolute inset-0 bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: 'url(/logo.png)' }}
      />
      {/* Gradient Overlay to maintain style */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-[#021026] to-black opacity-90" />
      
      <Sidebar
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />
      <main className="flex-1 overflow-auto relative z-10">{renderMainContent()}</main>
    </div>
  );
}