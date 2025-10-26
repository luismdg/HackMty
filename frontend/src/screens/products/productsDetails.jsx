import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Package,
    Calendar,
    Target,
    TrendingUp,
    Clock,
    Zap,
    AlertTriangle,
    CheckCircle,
    XCircle,
    BarChart3,
    DollarSign,
    Plane,
    Recycle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function ProductsDetails({ productId, onBack }) {
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        async function fetchProductData() {
            try {
                setLoading(true);
                setError(null);

                console.log("🔍 Buscando detalles del producto:", productId);

                // AHORA USAMOS LA RUTA DE /products EN LUGAR DE /expiration
                let productResponse = await fetch(`/products/${productId}`);

                // Si falla, buscar en todos los productos
                if (!productResponse.ok) {
                    console.log("❌ Ruta específica falló, buscando en todos los productos...");
                    const allProductsResponse = await fetch("/products/all");
                    if (allProductsResponse.ok) {
                        const allProductsData = await allProductsResponse.json();
                        const foundProduct = allProductsData.products.find(p =>
                            p.product_id === productId ||
                            p.id === productId
                        );

                        if (foundProduct) {
                            console.log("✅ Producto encontrado en lista general");
                            setProductData(foundProduct);
                        } else {
                            throw new Error(`Producto ${productId} no encontrado`);
                        }
                    } else {
                        throw new Error(`Error fetching product data: ${productResponse.status}`);
                    }
                } else {
                    const productData = await productResponse.json();
                    setProductData(productData);
                }

                // Buscar productos relacionados
                try {
                    const relatedResponse = await fetch("/products/all");
                    if (relatedResponse.ok) {
                        const relatedData = await relatedResponse.json();
                        // Filtrar productos relacionados (misma categoría o aerolínea, excluyendo el actual)
                        const related = relatedData.products
                            .filter(p => p.product_id !== productId &&
                                (p.Category === productData?.Category || p.aerolinea === productData?.aerolinea))
                            .slice(0, 6);

                        setRelatedProducts(related);
                        console.log(`🔗 ${related.length} productos relacionados encontrados`);
                    }
                } catch (err) {
                    console.warn("No se pudieron cargar productos relacionados:", err);
                }

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchProductData();
    }, [productId]);

    const getFreshnessColor = (score) => {
        if (score >= 80) return "border-green-500";
        if (score >= 60) return "border-yellow-500";
        if (score >= 40) return "border-orange-500";
        return "border-red-500";
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

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return "bg-green-500";
        if (percentage >= 60) return "bg-yellow-500";
        if (percentage >= 40) return "bg-orange-500";
        return "bg-red-500";
    };

    const calculateAcceptanceRate = (product) => {
        const unitsReturned = product.units_returned || 0;
        const unitsConsumed = product.units_consumed || 0;
        const total = unitsReturned + unitsConsumed;

        if (total === 0) return 100;
        return Math.round((unitsConsumed / total) * 100);
    };

    if (loading)
        return (
            <div className="p-8 text-white">📦 Cargando datos del producto...</div>
        );

    if (error) return <div className="p-8 text-red-400">{error}</div>;

    if (!productData)
        return (
            <div className="p-8 text-white">No se encontraron datos del producto</div>
        );

    const acceptanceRate = calculateAcceptanceRate(productData);

    return (
        <div className="min-h-screen text-white p-6 space-y-6 font-sans">
            {/* Header Section */}
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
                        Detalles del Producto
                    </h1>
                    <p className="text-neutral-400 mt-1 text-sm">
                        {productData.product_name || productData.nombre_producto || "Sin nombre"} • {productData.product_id}
                    </p>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Large KPI Card - Spans 2 columns */}
                <div className="xl:col-span-2">
                    <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-white">Estado de Frescura</h2>
                                <p className="text-[#94A3B8] text-sm">Análisis completo del producto</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="text-center py-16">
                                <p className="text-sm text-[#94A3B8] mb-2">Puntuación de Frescura</p>
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-48 h-48 transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="#1E293B"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke={getProgressColor(productData.freshness_score).replace('bg-', '')}
                                            strokeWidth="12"
                                            fill="none"
                                            strokeDasharray={`${(productData.freshness_score / 100) * 553} 553`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute">
                                        <p className="text-5xl font-bold text-white">
                                            {Math.round(productData.freshness_score)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center space-y-6">
                                <div className="p-6 bg-[#0C1526] rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#94A3B8] text-sm">Estado Actual</span>
                                        {productData.estado_expiracion === "OPTIMO" ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : productData.estado_expiracion === "ATENCION" ? (
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                    <Badge className={`${getStatusColor(productData.estado_expiracion)} text-lg px-4 py-2`}>
                                        {productData.estado_expiracion}
                                    </Badge>
                                </div>

                                <div className="p-6 bg-[#0C1526] rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#94A3B8] text-sm">Días Restantes</span>
                                        <Clock className="w-5 h-5 text-[#3B82F6]" />
                                    </div>
                                    <p className="text-4xl font-bold text-white">
                                        {Math.round(productData.dias_restantes)}
                                    </p>
                                    <div className="mt-3 w-full bg-[#0C1526] rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${getProgressColor((productData.dias_restantes / productData.vida_util_dias) * 100)} transition-all duration-500`}
                                            style={{ width: `${(productData.dias_restantes / productData.vida_util_dias) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Profile Card */}
                <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6 pb-6">
                        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold">
                            {(productData.product_name || productData.nombre_producto || "P")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                {productData.product_name || productData.nombre_producto || "Sin nombre"}
                            </h3>
                            <p className="text-[#94A3B8] text-sm">{productData.Category || "Sin categoría"}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-[#0C1526] text-[#C8D6E5] border-none">
                                    ID: {productData.product_id}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-[#0C1526] rounded-lg">
                                <div className="flex items-center gap-2 text-[#94A3B8] text-xs mb-1">
                                    <Plane className="w-3 h-3" />
                                    <span>Aerolínea</span>
                                </div>
                                <p className="text-white font-semibold">
                                    {productData.aerolinea || "No especificada"}
                                </p>
                            </div>
                            <div className="p-3 bg-[#0C1526] rounded-lg">
                                <div className="flex items-center gap-2 text-[#94A3B8] text-xs mb-1">
                                    <Package className="w-3 h-3" />
                                    <span>Tipo Servicio</span>
                                </div>
                                <p className="text-white font-semibold">
                                    {productData.tipo_servicio || productData.tipo || "No especificado"}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 bg-[#0C1526] rounded-lg">
                            <div className="flex items-center gap-2 text-[#94A3B8] text-xs mb-2">
                                <Target className="w-3 h-3" />
                                <span>Información de Inventario</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Cantidad Estándar:</span>
                                    <span className="text-white">{productData.standard_quantity || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Unidades Sugeridas:</span>
                                    <span className="text-white">{productData.suggested_units || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Sobrecarga:</span>
                                    <span className="text-white">{productData.overload_units || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="w-4 h-4 text-[#DFBD69]" />
                                <span className="font-semibold text-white">Información Económica</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-[#0C1526] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-[#94A3B8]" />
                                        <span className="text-[#94A3B8] text-sm">Costo Unitario</span>
                                    </div>
                                    <span className="text-white font-semibold">
                                        ${productData.unit_cost || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#0C1526] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-[#94A3B8]" />
                                        <span className="text-[#94A3B8] text-sm">Precio Consumidor</span>
                                    </div>
                                    <span className="text-white font-semibold">
                                        ${productData.precio_consumidor || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Vida Útil - Circular Progress */}
                <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] opacity-10 rounded-full blur-3xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="w-8 h-8 text-[#3B82F6]" />
                        <p className="text-3xl font-bold text-white">
                            {productData.vida_util_dias}d
                        </p>
                    </div>
                    <p className="text-sm text-[#94A3B8] mb-4">Vida Útil Total</p>

                    <div className="relative flex items-center justify-center h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="#1E293B"
                                strokeWidth="8"
                                fill="none"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="#3B82F6"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(productData.dias_restantes / productData.vida_util_dias) * 251} 251`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <p className="text-xs text-[#94A3B8]">Restantes</p>
                            <p className="text-lg font-bold text-white">
                                {Math.round(productData.dias_restantes)}d
                            </p>
                        </div>
                    </div>
                </div>

                {/* Acceptance Rate - Gauge Chart */}
                <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981] opacity-10 rounded-full blur-3xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <CheckCircle className="w-8 h-8 text-[#10B981]" />
                        <p className="text-3xl font-bold text-white">
                            {acceptanceRate}%
                        </p>
                    </div>
                    <p className="text-sm text-[#94A3B8] mb-4">Tasa de Aceptación</p>

                    <div className="relative flex items-center justify-center h-24">
                        <svg className="w-32 h-20" viewBox="0 0 100 60">
                            <path
                                d="M 10,50 A 40,40 0 0,1 90,50"
                                stroke="#1E293B"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 10,50 A 40,40 0 0,1 90,50"
                                stroke={acceptanceRate >= 80 ? "#10B981" : acceptanceRate >= 60 ? "#F59E0B" : "#EF4444"}
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(acceptanceRate / 100) * 126} 126`}
                                className="transition-all duration-1000"
                            />
                            <circle
                                cx={10 + Math.cos(Math.PI * (1 - acceptanceRate / 100)) * 40}
                                cy={50 - Math.sin(Math.PI * (1 - acceptanceRate / 100)) * 40}
                                r="4"
                                fill={acceptanceRate >= 80 ? "#10B981" : acceptanceRate >= 60 ? "#F59E0B" : "#EF4444"}
                                className="animate-pulse"
                            />
                        </svg>
                        <div className="absolute bottom-0 text-center">
                            <p className="text-xs text-[#94A3B8]">Meta: 85%</p>
                        </div>
                    </div>
                </div>

                {/* Recomendación de Uso */}
                <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B] opacity-10 rounded-full blur-3xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <Plane className="w-8 h-8 text-[#F59E0B]" />
                        <p className="text-3xl font-bold text-white text-center text-sm">
                            {productData.recomendacion_vuelo?.split(' ')[0] || "N/A"}
                        </p>
                    </div>
                    <p className="text-sm text-[#94A3B8] mb-4">Recomendación de Vuelo</p>

                    <div className="h-24 flex items-center justify-center">
                        <Badge className={`${getStatusColor(productData.estado_expiracion)} text-lg px-4 py-2`}>
                            {productData.recomendacion_vuelo || "Sin recomendación"}
                        </Badge>
                    </div>
                </div>

                {/* Reutilizable */}
                <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6] opacity-10 rounded-full blur-3xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <Recycle className="w-8 h-8 text-[#8B5CF6]" />
                        <p className="text-3xl font-bold text-white">
                            {productData.reusable ? "Sí" : "No"}
                        </p>
                    </div>
                    <p className="text-sm text-[#94A3B8] mb-4">Producto Reutilizable</p>

                    <div className="h-24 flex items-center justify-center">
                        {productData.reusable ? (
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        ) : (
                            <XCircle className="w-16 h-16 text-red-500" />
                        )}
                    </div>
                </div>
            </div>

            {/* Información Adicional */}
            <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Información Adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-[#0C1526] rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Fechas Importantes</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Fecha Estimada Expiración:</span>
                                    <span className="text-white">{productData.fecha_estimada_expiracion || "No disponible"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Días Transcurridos:</span>
                                    <span className="text-white">{Math.round(productData.dias_transcurridos || 0)}d</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-[#0C1526] rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Información de Almacenamiento</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Proveedor:</span>
                                    <span className="text-white">{productData.Supplier || "No especificado"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Temperatura:</span>
                                    <span className="text-white">{productData.Storage_Temperature || "No especificada"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Estado Stock:</span>
                                    <Badge className={`${productData.Stock_Status === "Adequate" ? "bg-green-700/50" :
                                            productData.Stock_Status === "Low" ? "bg-yellow-700/50" :
                                                productData.Stock_Status === "Overstocked" ? "bg-blue-700/50" : "bg-gray-700/50"
                                        } text-white border-none`}>
                                        {productData.Stock_Status || "No especificado"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-[#0C1526] rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Estadísticas de Uso</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Unidades Consumidas:</span>
                                    <span className="text-white">{productData.units_consumed || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Unidades Devueltas:</span>
                                    <span className="text-white">{productData.units_returned || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Nivel de Riesgo:</span>
                                    <Badge className={`${productData.nivel_riesgo === "bajo" ? "bg-green-700/50" :
                                            productData.nivel_riesgo === "medio" ? "bg-yellow-700/50" :
                                                productData.nivel_riesgo === "alto" ? "bg-orange-700/50" : "bg-red-700/50"
                                        } text-white border-none`}>
                                        {productData.nivel_riesgo || "No especificado"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Pasajeros:</span>
                                    <span className="text-white">{productData.Passenger_Count || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-[#0C1526] rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Calidad</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Estado Calidad:</span>
                                    <Badge className={`${productData.Quality_Status === "Good" ? "bg-green-700/50" :
                                            productData.Quality_Status === "Under Review" ? "bg-yellow-700/50" :
                                                productData.Quality_Status === "Damaged" ? "bg-red-700/50" : "bg-gray-700/50"
                                        } text-white border-none`}>
                                        {productData.Quality_Status || "No especificado"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#94A3B8]">Lote:</span>
                                    <span className="text-white">{productData.Batch_Number || "No especificado"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Productos Relacionados */}
            {relatedProducts.length > 0 && (
                <div className="backdrop-blur-3xl bg-blue-300/10 rounded-xl">
                    <div className="p-6">
                        <h3 className="font-semibold text-white">Productos Relacionados</h3>
                        <p className="text-sm text-[#94A3B8] mt-1">
                            {relatedProducts.length} productos de la misma categoría o aerolínea
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {relatedProducts.map((product) => (
                                <div
                                    key={product.product_id}
                                    className="p-4 bg-[#0C1526] rounded-lg hover:border-[#3B82F6] transition-all cursor-pointer"
                                    onClick={() => window.location.href = `/productos/${product.product_id}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <p className="font-semibold text-white text-sm mb-1">
                                                {product.product_name || product.nombre_producto}
                                            </p>
                                            <p className="text-xs text-[#94A3B8]">
                                                {product.Category} • {product.aerolinea}
                                            </p>
                                        </div>
                                        <Badge className={`${getStatusColor(product.estado_expiracion)} text-xs`}>
                                            {Math.round(product.freshness_score)}%
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#94A3B8]">Frescura</span>
                                            <div className={`w-8 h-8 rounded-lg border-2 ${getFreshnessColor(product.freshness_score)} flex items-center justify-center text-white font-bold text-xs`}>
                                                {Math.round(product.freshness_score)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#94A3B8]">Días Rest.</span>
                                            <span className="text-white font-medium">
                                                {Math.round(product.dias_restantes)}d
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#1E293B] rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${getProgressColor(product.freshness_score)}`}
                                                style={{ width: `${product.freshness_score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}