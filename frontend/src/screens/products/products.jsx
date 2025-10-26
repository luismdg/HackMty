import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

// Mapeo hardcode mejorado de nombres de productos
const PRODUCT_NAMES = {
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

    // Fallbacks genéricos por categoría
    "BEV": "Bebida Refrescante",
    "SNK": "Snack de Acompañamiento",
    "MEA": "Comida Principal",

    // IDs alternativos que puedan existir
    "PROD-BEV001": "Coca-Cola 330ml",
    "PROD-SNK001": "Pretzels Salados",
    "PROD-MEA001": "Pasta con Pollo"
};

// Función mejorada para obtener el nombre del producto
const getProductName = (productId, category = "") => {
    if (!productId) return "Producto Sin Nombre";

    // Limpiar y estandarizar el ID
    const cleanId = productId.toString().toUpperCase().trim();

    console.log(`🔍 Buscando nombre para: "${cleanId}"`);

    // 1. Intentar coincidencia exacta
    if (PRODUCT_NAMES[cleanId]) {
        console.log(`✅ Nombre exacto encontrado: ${PRODUCT_NAMES[cleanId]}`);
        return PRODUCT_NAMES[cleanId];
    }

    // 2. Intentar con prefijos estandarizados (BEV001, SNK002, etc.)
    const prefixes = ['BEV', 'SNK', 'MEA'];
    for (const prefix of prefixes) {
        if (cleanId.includes(prefix)) {
            // Extraer números del ID
            const numbers = cleanId.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                const standardId = prefix + numbers[0].padStart(3, '0');
                if (PRODUCT_NAMES[standardId]) {
                    console.log(`✅ Nombre estandarizado encontrado: ${PRODUCT_NAMES[standardId]}`);
                    return PRODUCT_NAMES[standardId];
                }
            }

            // Usar prefijo genérico si no hay coincidencia exacta
            if (PRODUCT_NAMES[prefix]) {
                console.log(`🔄 Usando nombre genérico: ${PRODUCT_NAMES[prefix]}`);
                return PRODUCT_NAMES[prefix];
            }
        }
    }

    // 3. Fallback basado en categoría
    if (category && PRODUCT_NAMES[category.toUpperCase().substring(0, 3)]) {
        const categoryPrefix = category.toUpperCase().substring(0, 3);
        return PRODUCT_NAMES[categoryPrefix];
    }

    // 4. Fallback final
    console.log(`❌ No se encontró nombre para ${cleanId}, usando fallback`);
    return `Producto ${cleanId}`;
};

export function ProductsTable({ onProductSelect }) {
    const [products, setProducts] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("any");
    const [airlineFilter, setAirlineFilter] = useState("any");
    const [serviceFilter, setServiceFilter] = useState("any");
    const [statusFilter, setStatusFilter] = useState("any");
    const [availableAirlines, setAvailableAirlines] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);

    useEffect(() => {
        async function fetchProductsData() {
            try {
                setLoading(true);
                console.log("🔄 Iniciando fetch de datos de productos desde /products...");

                const [productsResponse, statsResponse, categoryResponse, airlineResponse] =
                    await Promise.all([
                        fetch("/products/all"),
                        fetch("/products/dashboard/stats"),
                        fetch("/products/analysis/category"),
                        fetch("/products/analysis/airline"),
                    ]);

                if (!productsResponse.ok) {
                    throw new Error("Error fetching products data");
                }

                const productsData = await productsResponse.json();
                const statsData = statsResponse.ok ? await statsResponse.json() : null;
                const categoryData = categoryResponse.ok ? await categoryResponse.json() : { analysis_by_category: {} };
                const airlineData = airlineResponse.ok ? await airlineResponse.json() : { analysis_by_airline: {} };

                console.log("📦 Estructura completa de productsData:", productsData);

                // FUNCIÓN MEJORADA para obtener nombre - VERSIÓN CORREGIDA
                const getEnhancedProductName = (product) => {
                    // Primero intentar con nuestro mapeo hardcode usando el ID
                    const productId = product.product_id || product.id;

                    console.log(`🔍 Buscando nombre para ID: ${productId}`);

                    if (productId) {
                        // Limpiar el ID para que coincida con nuestras claves
                        const cleanId = productId.toUpperCase().trim();

                        // Intentar coincidencia exacta primero
                        if (PRODUCT_NAMES[cleanId]) {
                            console.log(`✅ Nombre encontrado por ID exacto: ${PRODUCT_NAMES[cleanId]}`);
                            return PRODUCT_NAMES[cleanId];
                        }

                        // Intentar con prefijos comunes
                        const prefixes = ['BEV', 'SNK', 'MEA'];
                        for (const prefix of prefixes) {
                            if (cleanId.startsWith(prefix)) {
                                // Extraer la parte numérica
                                const numericPart = cleanId.replace(prefix, '');
                                const standardId = prefix + numericPart.padStart(3, '0');

                                if (PRODUCT_NAMES[standardId]) {
                                    console.log(`✅ Nombre encontrado por ID estandarizado: ${PRODUCT_NAMES[standardId]}`);
                                    return PRODUCT_NAMES[standardId];
                                }

                                // Si no encuentra el ID exacto, usar el prefijo genérico
                                if (PRODUCT_NAMES[prefix]) {
                                    console.log(`🔄 Usando nombre genérico para prefijo: ${PRODUCT_NAMES[prefix]}`);
                                    return PRODUCT_NAMES[prefix];
                                }
                            }
                        }
                    }

                    // Fallback: buscar en campos existentes del producto
                    const nameFields = ['product_name', 'nombre_producto', 'Name', 'name', 'nombre'];
                    for (const field of nameFields) {
                        if (product[field] && product[field].toString().trim() !== '') {
                            console.log(`📝 Nombre encontrado en campo ${field}: ${product[field]}`);
                            return product[field].toString();
                        }
                    }

                    // Último fallback - crear nombre basado en categoría y aerolínea
                    const category = product.Category || product.categoria || 'Producto';
                    const airline = product.aerolinea || 'Aerolínea';
                    const fallbackName = `${category} - ${airline}`;
                    console.log(`❌ Usando fallback: ${fallbackName}`);
                    return fallbackName;
                };

                // FUNCIÓN SIMPLIFICADA - La API ya genera IDs
                const getProductId = (product) => {
                    const idFields = ['product_id', 'id'];
                    for (const field of idFields) {
                        if (product[field] && product[field].toString().trim() !== '') {
                            return product[field].toString();
                        }
                    }
                    return `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                };

                // Procesar datos de productos
                const productsArray = productsData.products.map((product, index) => {
                    const productId = getProductId(product);
                    const productName = getEnhancedProductName(product);

                    console.log(`🎯 Producto ${index}: ID=${productId}, Nombre=${productName}`);

                    return {
                        id: productId,
                        nombre: productName, // ← Ahora con nombres reales del mapeo
                        acceptance_rate: calculateAcceptanceRate(product),
                        estado_expiracion: product.estado_expiracion || "OPTIMO",
                        reusable: product.reusable || false,
                        aerolinea: product.aerolinea || "Sin aerolínea",
                        tipo_servicio: product.tipo_servicio || "Sin tipo",
                        vida_util: product.vida_util_dias || 0,
                        freshness_score: product.freshness_score || 0,
                        dias_restantes: product.dias_restantes || 0,
                        color_estado: product.color_estado || "green",
                        categoria: product.Category || "Sin categoría",
                        nivel_riesgo: product.nivel_riesgo || "bajo",
                        recomendacion_vuelo: product.recomendacion_vuelo || "Largos y Cortos",
                        fecha_estimada_expiracion: product.fecha_estimada_expiracion,
                        unit_cost: product.unit_cost,
                        precio_consumidor: product.precio_consumidor,
                        // Campos adicionales del CSV aumentado
                        Supplier: product.Supplier,
                        Storage_Temperature: product.Storage_Temperature,
                        Quality_Status: product.Quality_Status,
                        Stock_Status: product.Stock_Status,
                        Passenger_Count: product.Passenger_Count
                    };
                });

                console.log("✅ Productos procesados:", productsArray);
                console.log(`📊 Resumen: ${productsArray.length} productos procesados`);

                setProducts(productsArray);
                setStatistics(statsData);
                setAvailableAirlines(Object.keys(airlineData.analysis_by_airline || {}));
                setAvailableCategories(Object.keys(categoryData.analysis_by_category || {}));

            } catch (error) {
                console.error("❌ Error fetching products data:", error);
                setError("Error al cargar los datos de productos");
            } finally {
                setLoading(false);
            }
        }

        fetchProductsData();
    }, []);

    // Calcular acceptance rate basado en unidades devueltas y consumidas
    const calculateAcceptanceRate = (product) => {
        const unitsReturned = product.units_returned || 0;
        const unitsConsumed = product.units_consumed || 0;
        const total = unitsReturned + unitsConsumed;

        if (total === 0) return 100;
        return Math.round((unitsConsumed / total) * 100);
    };

    const getExpirationColor = (estado) => {
        const colors = {
            "ÓPTIMO": "border-green-500",
            "OPTIMO": "border-green-500",
            "ATENCIÓN": "border-yellow-500",
            "ATENCION": "border-yellow-500",
            "CRÍTICO": "border-orange-500",
            "CRITICO": "border-orange-500",
            "EXPIRADO": "border-red-500"
        };
        return colors[estado] || "border-gray-500";
    };

    const getAcceptanceColor = (rate) => {
        if (rate >= 90) return "text-green-400";
        if (rate >= 80) return "text-yellow-400";
        if (rate >= 70) return "text-orange-400";
        return "text-red-400";
    };

    const getStatusColor = (estado) => {
        const colors = {
            "ÓPTIMO": "bg-green-700/50 backdrop-blur-3xl text-white border-none rounded-md",
            "OPTIMO": "bg-green-700/50 backdrop-blur-3xl text-white border-none rounded-md",
            "ATENCIÓN": "bg-yellow-700/50 backdrop-blur-3xl text-white border-none rounded-md",
            "ATENCION": "bg-yellow-700/50 backdrop-blur-3xl text-white border-none rounded-md",
            "CRÍTICO": "bg-orange-700/50 backdrop-blur-3xl text-white border-none rounded-md",
            "CRITICO": "bg-orange-700/50 backdrop-blur-3xl text-white border-none rounded-md",
            "EXPIRADO": "bg-red-700/50 backdrop-blur-3xl text-white border-none rounded-md"
        };
        return colors[estado] || "bg-gray-600/50 backdrop-blur-3xl text-white border-none rounded-md";
    };

    const getReusableBadge = (reusable) => {
        return reusable ?
            "bg-green-700/50 backdrop-blur-3xl text-white border-none rounded-md" :
            "bg-red-700/50 backdrop-blur-3xl text-white border-none rounded-md";
    };

    const uniqueServices = [
        ...new Set(products.map((product) => product.tipo_servicio)),
    ];

    const filteredProducts = products.filter((product) => {
        const productDisplayName = getProductName(product.id, product.categoria);
        const matchesSearch =
            productDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.aerolinea.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.tipo_servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            categoryFilter === "any" || product.categoria === categoryFilter;
        const matchesAirline =
            airlineFilter === "any" || product.aerolinea === airlineFilter;
        const matchesService =
            serviceFilter === "any" || product.tipo_servicio === serviceFilter;
        const matchesStatus =
            statusFilter === "any" || product.estado_expiracion === statusFilter;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesAirline &&
            matchesService &&
            matchesStatus
        );
    });

    const handleProductClick = (product) => {
        console.log("🖱️ Producto clickeado:", product);
        if (onProductSelect) {
            onProductSelect(product.id);
        } else {
            // AHORA USA LA RUTA /products/{id} EN LUGAR DE /expiration/product/{id}
            window.location.href = `/productos/${product.id}`;
        }
    };

    if (loading)
        return (
            <div className="p-8 text-white">Cargando datos de productos...</div>
        );

    if (error)
        return (
            <div className="p-8 text-white">
                <div className="bg-[#1A2639] border border-[#2C3E50] p-4 mb-4">
                    <p className="text-red-400 font-semibold"> Error:</p>
                    <p className="text-red-300">{error}</p>
                </div>
            </div>
        );

    if (!products.length)
        return (
            <div className="p-8 text-white">
                No hay datos de productos disponibles
            </div>
        );

    return (
        <div className="min-h-screen text-white p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-light tracking-tight text-[#DFBD69]">
                    Gestión de Productos
                </h1>
                <p className="text-neutral-400 mt-1 text-sm">
                    Control de inventario, frescura y estado de productos
                </p>
            </div>

            {/* KPI Card */}
            <div className="bg-[#0C1526] p-6 rounded-md backdrop-blur-3xl bg-blue-300/10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="col-span-1">
                        <div className="flex gap-3">
                            <h3 className="text-lg text-[#DFBD69] mb-4">KPI</h3>
                            <h3 className="text-lg mb-4">Estado General</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#94A3B8]">Productos Óptimos:</span>
                                <span className="text-green-400 font-semibold">
                                    {statistics?.alerts?.stable || 0}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#94A3B8]">Atención Requerida:</span>
                                <span className="text-orange-400 font-semibold">
                                    {statistics?.alerts?.immediate_attention || 0}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#94A3B8]">Total Productos:</span>
                                <span className="text-blue-400 font-semibold">
                                    {statistics?.overview?.total_products || products.length}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[#94A3B8]">
                                Frescura Promedio del Inventario
                            </span>
                            <span className="text-sm font-semibold">
                                {statistics?.overview?.avg_freshness_score ||
                                    Math.round(products.reduce((sum, p) => sum + p.freshness_score, 0) / products.length)}%
                            </span>
                        </div>
                        <div className="w-full bg-[#09111E] rounded-full h-3 ">
                            <div
                                className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] h-3 rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        statistics?.overview?.avg_freshness_score ||
                                        Math.round(products.reduce((sum, p) => sum + p.freshness_score, 0) / products.length)
                                    )}%`,
                                }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-[#94A3B8]">
                            <span>0%</span>
                            <span>Meta: 80%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#0C1526] p-6 space-y-4 rounded-md backdrop-blur-3xl bg-blue-300/10">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="text-xs mb-1.5 block text-[#94A3B8]">
                            Buscar producto
                        </label>
                        <input
                            placeholder="Nombre, aerolínea, categoría o servicio"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#09111E] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-[#3B82F6] outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs mb-1.5 block text-[#94A3B8]">
                            Categoría
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="appearance-none bg-transparent border border-[#09111E] flex px-2 py-2 items-center rounded-md text-[#94A3B8] text-sm"
                        >
                            <option value="any">- Cualquiera -</option>
                            {availableCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs mb-1.5 block text-[#94A3B8]">Aerolínea</label>
                        <select
                            value={airlineFilter}
                            onChange={(e) => setAirlineFilter(e.target.value)}
                            className="appearance-none bg-transparent border border-[#09111E] flex px-2 py-2 items-center rounded-md text-[#94A3B8] text-sm"
                        >
                            <option value="any">- Cualquiera -</option>
                            {availableAirlines.map((airline) => (
                                <option key={airline} value={airline}>
                                    {airline}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs mb-1.5 block text-[#94A3B8]">
                            Tipo de Servicio
                        </label>
                        <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                            className="appearance-none bg-transparent border border-[#09111E] flex py-2 items-center rounded-md text-[#94A3B8] text-sm"
                        >
                            <option value="any">- Cualquiera -</option>
                            {uniqueServices.map((service) => (
                                <option key={service} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs mb-1.5 block text-[#94A3B8]">
                            Estado
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-transparent border border-[#09111E] flex px-2 py-2 items-center rounded-md text-[#94A3B8] text-sm"
                        >
                            <option value="any">- Cualquiera -</option>
                            <option value="OPTIMO">Óptimo</option>
                            <option value="ATENCION">Atención</option>
                            <option value="CRITICO">Crítico</option>
                            <option value="EXPIRADO">Expirado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Info */}
            <div className="text-xs text-[#64748B]">
                Mostrando {filteredProducts.length} de {products.length} resultados.
                {airlineFilter !== "any" && (
                    <span className="ml-2">
                        • Filtrado por aerolínea:{" "}
                        <span className="text-[#3B82F6]">{airlineFilter}</span>
                    </span>
                )}
                {categoryFilter !== "any" && (
                    <span className="ml-2">
                        • Categoría:{" "}
                        <span className="text-[#3B82F6]">{categoryFilter}</span>
                    </span>
                )}
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-md ">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-[#0D1B2A] text-[#94A3B8] uppercase text-xs">
                        <tr className="backdrop-blur-3xl bg-blue-300/10">
                            <th className="p-3 font-semibold">Producto</th>
                            <th className="p-3 font-semibold">Aerolínea</th>
                            <th className="p-3 font-semibold">Categoría</th>
                            <th className="p-3 font-semibold">Tipo Servicio</th>
                            <th className="p-3 font-semibold">Estado</th>
                            <th className="p-3 font-semibold text-right">Acceptance Rate</th>
                            <th className="p-3 font-semibold text-center">Frescura</th>
                            <th className="p-3 font-semibold text-center">Vida Útil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => {
                            const productDisplayName = getProductName(product.id, product.categoria);
                            return (
                                <tr
                                    key={product.id}
                                    className="hover:bg-[#1E293B]/40 transition-colors cursor-pointer"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center text-xs font-semibold">
                                                {productDisplayName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">
                                                    {productDisplayName}
                                                </p>
                                                <p className="text-xs text-[#94A3B8]">{product.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-[#E2E8F0]">{product.aerolinea}</td>
                                    <td className="p-3">
                                        <Badge
                                            variant="outline"
                                            className="text-xs bg-[#1E293B] text-[#94A3B8] border-[#374151]"
                                        >
                                            {product.categoria}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-[#E2E8F0]">{product.tipo_servicio}</td>
                                    <td className="p-3">
                                        <Badge
                                            variant="status"
                                            className={`${getStatusColor(product.estado_expiracion)} tracking-wide px-2 py-1 text-xs uppercase`}
                                        >
                                            {product.estado_expiracion}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right">
                                        <span className={`font-semibold ${getAcceptanceColor(product.acceptance_rate)}`}>
                                            {product.acceptance_rate}%
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div
                                            className={`w-12 h-12 mx-auto rounded-lg border-2 ${getExpirationColor(
                                                product.estado_expiracion
                                            )} flex items-center justify-center text-white font-bold text-sm`}
                                        >
                                            {Math.round(product.freshness_score)}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center text-white font-semibold">
                                        {product.vida_util}d
                                        <div className="text-xs text-[#94A3B8]">
                                            {product.dias_restantes}d rest.
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Statistics Section */}
            <div className="bg-[#0C1526] p-6 rounded-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#DFBD69]">
                        Resumen de Productos
                    </h2>
                    {(airlineFilter !== "any" || categoryFilter !== "any") && (
                        <Badge className="bg-[#3B82F6] text-white">
                            {airlineFilter !== "any" ? `Aerolínea: ${airlineFilter}` : ''}
                            {categoryFilter !== "any" ? `Categoría: ${categoryFilter}` : ''}
                        </Badge>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#09111E] p-4 rounded-md text-center">
                        <p className="text-2xl font-bold text-white">
                            {filteredProducts.length}
                        </p>
                        <p className="text-xs text-[#94A3B8]">Productos Filtrados</p>
                    </div>
                    <div className="bg-[#09111E] p-4 rounded-md text-center">
                        <p className="text-2xl font-bold text-[#3B82F6]">
                            {Math.round(
                                filteredProducts.reduce(
                                    (sum, product) => sum + product.acceptance_rate,
                                    0
                                ) / filteredProducts.length
                            )}
                            %
                        </p>
                        <p className="text-xs text-[#94A3B8]">Acceptance Rate Promedio</p>
                    </div>
                    <div className="bg-[#09111E] p-4 rounded-md text-center">
                        <p className="text-2xl font-bold text-[#10B981]">
                            {Math.round(
                                filteredProducts.reduce(
                                    (sum, product) => sum + product.freshness_score,
                                    0
                                ) / filteredProducts.length
                            )}
                            %
                        </p>
                        <p className="text-xs text-[#94A3B8]">Frescura Promedio</p>
                    </div>
                    <div className="bg-[#09111E] p-4 rounded-md text-center">
                        <p className="text-2xl font-bold text-[#F59E0B]">
                            {
                                filteredProducts.filter(product =>
                                    product.estado_expiracion === "CRITICO" ||
                                    product.estado_expiracion === "EXPIRADO"
                                ).length
                            }
                        </p>
                        <p className="text-xs text-[#94A3B8]">Productos Críticos</p>
                    </div>
                </div>
            </div>

            {/* Status Distribution */}
            {filteredProducts.length > 0 && (
                <div className="bg-[#0C1526] p-6 rounded-md">
                    <h2 className="text-xl font-semibold text-[#DFBD69] mb-4">
                        Distribución por Estado
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {["OPTIMO", "ATENCION", "CRITICO", "EXPIRADO"].map((estado) => {
                            const count = filteredProducts.filter(p => p.estado_expiracion === estado).length;
                            const percentage = filteredProducts.length > 0 ? (count / filteredProducts.length) * 100 : 0;

                            return (
                                <div
                                    key={estado}
                                    className="bg-[#09111E] p-4 rounded-md border border-[#1E293B] hover:border-[#3B82F6] transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${getExpirationColor(
                                                estado
                                            )} border-2`}
                                        >
                                            {count}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">
                                                {estado}
                                            </p>
                                            <p className="text-xs text-[#94A3B8]">
                                                {Math.round(percentage)}% del total
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-[#1E293B] rounded-full h-2 mt-2">
                                        <div
                                            className={`h-2 rounded-full ${getExpirationColor(estado).replace('border-', 'bg-')}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}