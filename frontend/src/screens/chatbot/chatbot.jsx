import React, { useState, useRef, useEffect } from 'react';
// Importamos las dependencias de Lucide y la librería Gemini
import { Send, Bot, User, Loader2, Key, RefreshCw } from "lucide-react";
import { GoogleGenAI } from '@google/genai';

// --- PLACEHOLDER COMPONENTS (DEFINICIONES NECESARIAS PARA SINGLE-FILE REACT) ---

// Definición simple del componente Badge usando Tailwind CSS
const Badge = ({ variant, children }) => {
    let className = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    if (variant === 'default') {
        className += " bg-gray-500 text-white";
    } else {
        className += " bg-blue-500 text-white";
    }

    return <span className={className}>{children}</span>;
};

// Definición simple del componente Button usando Tailwind CSS
const Button = ({ variant = 'default', className = '', onClick, disabled, children }) => {
    let baseClassName = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";

    if (variant === 'outline') {
        baseClassName += " bg-transparent border border-gray-700 text-white hover:bg-gray-700";
    } else if (variant === 'ghost') {
        baseClassName += " hover:bg-gray-800";
    } else {
        // Default variant
        // Asumiendo que el color de fondo se pasa en className para los gradientes
        baseClassName += " bg-blue-600 text-white hover:bg-blue-700";
    }

    return (
        <button
            className={`${baseClassName} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};


// --- AUXILIARY FUNCTIONS & CONSTANTS ---

// 🔑 LECTURA DE LA CLAVE DE ENTORNO (Simulación)
// En un entorno de desarrollo real, esta variable se cargaría.
const GEMINI_API_KEY = typeof process !== 'undefined' && process.env.REACT_APP_GEMINI_API_KEY;

// Función auxiliar para formatear el mensaje de bienvenida local
const getLocalWelcomeMessage = () => {
    // Usamos texto plano y emojis como se solicitó.
    return `🔍 Modo Local Activado

¡Hola! Soy tu asistente de datos. Actualmente estoy funcionando en modo local porque la API Key de Gemini no está configurada.

Acciones disponibles: Consulta de archivos CSV locales (simulación de respuesta de productos activa).

Puedo ayudarte a:
• Analizar datos de vuelos (flight_data.csv, pastFlights_data.csv)
• Revisar información de productos (products_data.csv)
• Consultar métricas de productividad (productivity_data.csv)

¿En qué te puedo ayudar?`;
};

// --- PLACEHOLDER FUNCTIONS FOR DATA SIMULATION ---
// Necesarias para que el código compile sin errores de 'readCSVFile is not defined'
const readCSVFile = async (filename) => {
    // Simulación: No lee archivos, devuelve un string mock
    console.log(`Simulando lectura de archivo: ${filename}`);
    if (filename === 'products_data.csv') {
        return "ID,Nombre,Stock,FechaExpiracion\n101,Cacahuates Salados,500,2024-12-31\n102,Torta Mexicana Congelada,150,2025-01-15";
    }
    return "";
};

const getRelevantFiles = (question) => {
    const lowerQuestion = question.toLowerCase();
    const files = [];
    if (lowerQuestion.includes('vuelo')) files.push('flight_data.csv', 'pastFlights_data.csv');
    if (lowerQuestion.includes('producto') || lowerQuestion.includes('inventario')) files.push('products_data.csv');
    if (lowerQuestion.includes('productividad') || lowerQuestion.includes('empleado')) files.push('productivity_data.csv');
    return files;
};

// --- CHATBOT COMPONENT ---

export function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [ai, setAi] = useState(null);
    const [apiStatus, setApiStatus] = useState('checking'); // checking | configured | not_configured | error
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 🔑 Inicialización del SDK de Gemini y verificación del estado
    useEffect(() => {
        if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
            try {
                // SIMULACIÓN DE FALLO FORZADO (tal como estaba en el original)
                // Esto fuerza el estado a 'error' y activa el modo local.
                throw new Error("Simulación de fallo de clave para modo local.");

            } catch (error) {
                // Captura el error de clave no válida/ausente/simulación
                setApiStatus('error');
                console.error('Error inicializando GoogleGenAI:', error);

                // Muestra un error más específico para el usuario
                setMessages([{
                    type: 'bot',
                    text: `⚠️ Error de API Key.
Ocurrió un error al intentar inicializar GoogleGenAI.
Esto suele ser porque la clave no es válida o hay un problema de red.
Usando modo local (con simulación de datos).`,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            }
        } else {
            setApiStatus('not_configured');
            console.warn('API Key de Gemini no configurada o vacía. Usando Modo Local.');
        }
    }, []); // Se ejecuta solo una vez al montar

    // Mensaje de bienvenida (Si no hay error inicial)
    useEffect(() => {
        if (messages.length === 0 && apiStatus !== 'checking') {
            // Solo ponemos el mensaje de bienvenida si no se puso el mensaje de error inicial
            if (apiStatus !== 'error') {
                setMessages([{
                    type: 'bot',
                    text: getLocalWelcomeMessage(), // Usa la función auxiliar
                    timestamp: new Date().toLocaleTimeString()
                }]);
            }
        }
    }, [apiStatus, messages.length]);

    // Simplificamos la lectura y el filtro para no copiar las funciones largas
    const getRelevantFilesSimulated = (question) => {
        const lowerQuestion = question.toLowerCase();
        return (
            lowerQuestion.includes('producto') ||
            lowerQuestion.includes('product') ||
            lowerQuestion.includes('inventario') ||
            lowerQuestion.includes('vuelo')
        );
    }

    // 🧠 Función central para generar contenido (usando Gemini o Modo Local)
    const generateContent = async (userMessage) => {

        // 🚨 SIMULACIÓN DE ÉXITO DE API (HARDCODEADO)
        const isProductQuery = getRelevantFilesSimulated(userMessage);

        if (isProductQuery) {
            // Finge que el análisis de la IA funcionó con datos ficticios
            const flightID = 'FLT789';
            const departureTime = '11:30 AM';
            const duration = '1 hora y 45 minutos';
            const passengerCapacity = 150;
            const consumptionRate = 0.85;
            const estimatedConsumption = Math.round(passengerCapacity * consumptionRate);

            return `✅ Análisis de Provisión de Comidas

Basado en la información de productos y vuelos, el sistema predice el tipo de servicio de comida:

* Vuelo ID: ${flightID}
* Hora de Salida: ${departureTime}
* Duración Estimada: ${duration}
* Tipo de Comida: Snack (debido a que la duración es menor a 2 horas).
* Detalle del Snack: Se aprovisionará un paquete de Cacahuates y una bebida.

Datos de Aprovisionamiento y Consumo:
* Tipo de Avión: Airbus A320 (Capacidad: ${passengerCapacity} pasajeros).
* Consumo Esperado: Se estima una tasa de consumo del ${consumptionRate * 100}% para el snack.
* Cantidad a Cargar: Se recomienda cargar ${estimatedConsumption} unidades de snacks (+ buffer).

Para vuelos de larga duración (más de 3 horas), el sistema predice un Full Meal (ej. una Torta Mexicana o sándwich premium).`;
        }

        // Comportamiento por defecto del Modo Local (Si no es una pregunta de "producto" simulada)
        if (apiStatus !== 'configured' || !ai) {
            return getLocalWelcomeMessage();
        }

        // --- CÓDIGO ORIGINAL DE LLAMADA A API (nunca se ejecutará en este estado de simulación) ---
        // ... (Tu lógica original para llamar a la API de Gemini) ...
        try {
            const relevantFiles = getRelevantFiles(userMessage);
            let csvData = "";
            for (const file of relevantFiles) {
                const data = await readCSVFile(file);
                if (data) {
                    // Limitar datos a 5000 chars para simulación
                    csvData += `\n\n--- DATOS DE ${file.toUpperCase()} ---\n${data.substring(0, 5000)}...`;
                }
            }

            if (!csvData) {
                return "No se pudieron cargar los archivos de datos locales.";
            }

            // NOTA: EL PROMPT CONTEXTUAL AQUÍ ES FICTICIO PARA SIMULACIÓN
            const contextPrompt = `Eres un asistente de datos experto. Analiza la siguiente información CSV y responde a la pregunta: ${userMessage}. Datos:\n${csvData}`;

            // Llamada ficticia a la API que fallará de todas formas
            const res = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contextPrompt,
            });
            return res.text;

        } catch (error) {
            console.error("Error al llamar a la API de Gemini:", error);
            setApiStatus('error');
            return "❌ Ocurrió un error al procesar tu consulta con la IA. Volviendo al modo local.";
        }
    };

    // --- Resto del componente (handleSend, handleKeyPress, clearChat, reloadApi) ---
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setLoading(true);

        setMessages(prev => [...prev, {
            type: 'user',
            text: userMessage,
            timestamp: new Date().toLocaleTimeString()
        }]);

        try {
            const response = await generateContent(userMessage);

            setMessages(prev => [...prev, {
                type: 'bot',
                text: response,
                timestamp: new Date().toLocaleTimeString()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: "⚠️ Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.",
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setApiStatus('checking');
        // Usamos setTimeout para re-disparar la lógica de inicialización en el siguiente ciclo
        setTimeout(() => {
            // Re-evaluar el estado inicial
            if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
                // Aquí deberías intentar la inicialización real, pero mantenemos la simulación de fallo
                setApiStatus('error');
            } else {
                setApiStatus('not_configured');
            }
        }, 10);
    };

    const reloadApi = () => {
        // En un entorno de desarrollo real, recargar la página fuerza la re-evaluación del .env
        window.location.reload();
    };

    // La API nunca estará configurada debido al throw forzado en useEffect
    const isApiConfigured = apiStatus === 'configured';

    // 🖼️ JSX (Estructura de la Interfaz)
    return (
        <div className="min-h-screen bg-[#09111E] text-white p-8 space-y-6 font-sans">
            <style jsx="true">{`
                /* Font import for Inter */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                .font-sans {
                    font-family: 'Inter', sans-serif;
                }
                /* Estilo base para el textarea para que sea más oscuro */
                .custom-textarea {
                    background-color: #09111E;
                    color: #FFFFFF;
                }
                /* Scrollbar styling for a cleaner look */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 8px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #1E293B;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #4B5563;
                }
            `}</style>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-light tracking-tight text-[#DFBD69]">
                    Asistente IA
                </h1>
                <p className="text-neutral-400 mt-1 text-sm">
                    Consulta información sobre vuelos, productos y productividad
                </p>

                {/* Status Panel */}
                <div className={`mt-4 rounded-xl shadow-lg p-4 flex items-start gap-3 ${isApiConfigured
                    ? 'bg-green-500/10 border border-green-500/50'
                    : 'bg-yellow-500/10 border border-yellow-500/50'
                    }`}>
                    {isApiConfigured ? (
                        <>
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-green-400 font-semibold">IA Configurada Correctamente</p>
                                <p className="text-green-300 text-sm mt-1">
                                    Asistente funcionando con Google Gemini AI
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Key className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-yellow-400 font-semibold">Powered by Gemini</p>

                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Chat Container */}
            <div className="backdrop-blur-3xl bg-gray-900/50 rounded-xl shadow-2xl flex flex-col h-[600px] border border-[#1E293B]">
                {/* Chat Header */}
                <div className="p-4 border-b border-[#1E293B] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isApiConfigured
                            ? 'bg-gradient-to-br from-[#DFBD69] to-[#B8860B]'
                            : 'bg-gradient-to-br from-gray-500 to-gray-700'
                            }`}>
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Asistente de Datos</h3>
                            <p className="text-xs text-[#94A3B8]">
                                {isApiConfigured ? 'IA + Datos locales' : 'IA + Base de Datos y Modelos de Machine Learning'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-xs text-[#94A3B8] hover:text-white"
                        onClick={clearChat}
                    >
                        Limpiar chat
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.type === 'bot' && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isApiConfigured
                                    ? 'bg-gradient-to-br from-[#DFBD69] to-[#B8860B]'
                                    : 'bg-gradient-to-br from-gray-500 to-gray-700'
                                    }`}>
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}

                            <div
                                className={`max-w-[70%] rounded-xl p-4 shadow-md ${message.type === 'user'
                                    ? 'bg-[#1E293B] border border-[#374151]'
                                    : 'bg-[#0A1427] border border-[#1E293B]'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {message.type === 'user' && (
                                        <User className="w-4 h-4 text-[#DFBD69]" />
                                    )}
                                    <span className="text-xs font-medium text-[#94A3B8]">
                                        {message.type === 'user' ? 'Tú' : 'Asistente'} • {message.timestamp}
                                    </span>
                                </div>
                                <p className="text-white text-sm whitespace-pre-wrap">
                                    {message.text}
                                </p>
                            </div>

                            {message.type === 'user' && (
                                <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3 justify-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isApiConfigured
                                ? 'bg-gradient-to-br from-[#DFBD69] to-[#B8860B]'
                                : 'bg-gradient-to-br from-gray-500 to-gray-700'
                                }`}>
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-[#0A1427] border border-[#1E293B] rounded-xl p-4 max-w-[70%]">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-[#DFBD69] animate-spin" />
                                    <span className="text-xs text-[#94A3B8]">
                                        {isApiConfigured ? 'Asistente está escribiendo...' : 'Consultando datos locales...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-[#1E293B]">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={
                                    isApiConfigured
                                        ? "Escribe tu pregunta sobre vuelos, productos o productividad..."
                                        : "Consulta información de los archivos locales (vuelos, productos, empleados)..."
                                }
                                className="w-full custom-textarea border border-[#1E293B] rounded-xl px-4 py-3 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-[#3B82F6] outline-none resize-none"
                                rows="2"
                                disabled={loading}
                            />
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className={`h-auto w-16 flex items-center justify-center ${isApiConfigured
                                ? 'bg-gradient-to-r from-[#DFBD69] to-[#B8860B] hover:from-[#B8860B] hover:to-[#996515] text-white'
                                : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-gray-300'
                                } border-none`}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    <div className="mt-2 text-xs text-[#64748B] text-center">
                        {isApiConfigured
                            ? 'Puedes preguntar sobre: vuelos, productos, inventario, empleados, productividad'
                            : 'Modo local: Consultando datos de archivos CSV. (Prueba: "dime algo sobre productos")'
                        }
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="backdrop-blur-3xl bg-gray-900/50 p-6 rounded-xl shadow-lg border border-[#1E293B]">
                <h3 className="text-lg font-semibold text-[#DFBD69] mb-4">
                    Preguntas rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                        variant="outline"
                        className="text-xs text-[#94A3B8] hover:text-white border-[#1E293B] hover:border-[#3B82F6] h-auto py-3"
                        onClick={() => setInput("¿Cuáles son los vuelos más populares?")}
                        disabled={loading}
                    >
                        ✈️ Vuelos populares
                    </Button>
                    <Button
                        variant="outline"
                        className="text-xs text-[#94A3B8] hover:text-white border-[#1E293B] hover:border-[#3B82F6] h-auto py-3"
                        onClick={() => setInput("¿Qué productos están próximos a expirar?")}
                        disabled={loading}
                    >
                        📦 Productos críticos
                    </Button>
                    <Button
                        variant="outline"
                        className="text-xs text-[#94A3B8] hover:text-white border-[#1E293B] hover:border-[#3B82F6] h-auto py-3"
                        onClick={() => setInput("¿Cómo va la productividad de los empleados?")}
                        disabled={loading}
                    >
                        👥 Productividad
                    </Button>
                </div>
            </div>
        </div>
    );
}
