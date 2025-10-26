// Mapeo centralizado de nombres de productos
export const PRODUCT_NAMES = {
  // Bebidas
  "BEV001": "Coca-Cola 330ml",
  "BEV002": "Café Premium", 
  "BEV003": "Agua con Gas 330ml",
  "BEV004": "Agua Natural 500ml",
  "BEV005": "Jugo de Naranja 200ml",
  "BEV006": "Infusión de Hierbas",
  
  // Snacks
  "SNK001": "Pretzels Salados",
  "SNK002": "Chocolate Negro 50g",
  "SNK003": "Galletas con Mantequilla 75g", 
  "SNK004": "Mix de Frutos Secos 30g",
  "SNK005": "Caja de Snacks Económica",
  "SNK006": "Panecillos Integrales",
  
  // Comidas
  "MEA001": "Pasta con Pollo",
  "MEA002": "Panini de Carne",
  "MEA003": "Wrap Vegetariano",
  "MEA004": "Sándwich de Pollo", 
  "MEA005": "Club de Pavo",
  
  // Fallbacks genéricos
  "BEV": "Bebida Refrescante",
  "SNK": "Snack de Acompañamiento",
  "MEA": "Comida Principal"
};

export const getProductName = (productId, category = "") => {
  // Intentar con el ID exacto
  if (PRODUCT_NAMES[productId]) {
    return PRODUCT_NAMES[productId];
  }
  
  // Intentar con el prefijo de categoría
  const categoryPrefix = productId.substring(0, 3);
  if (PRODUCT_NAMES[categoryPrefix]) {
    return `${PRODUCT_NAMES[categoryPrefix]} ${productId}`;
  }
  
  // Fallback final
  return `Producto ${productId}`;
};

export const getProductCategory = (productId) => {
  const prefix = productId.substring(0, 3);
  const categories = {
    "BEV": "Bebidas",
    "SNK": "Snacks", 
    "MEA": "Comidas"
  };
  return categories[prefix] || "General";
};