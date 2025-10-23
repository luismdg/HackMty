
#Codigo Hannah - Version con traducción completa y limpieza de texto
from tropycal import realtime
import json
from datetime import datetime
import os
import numpy as np
import traceback
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont
import re
from tzlocal import get_localzone

# ==============================
# CONFIGURACIÓN DE DIRECTORIOS
# ==============================
fecha = datetime.now()
data_directory = "..\..\..\Data\Data"
directorio = os.path.join(data_directory, f'{fecha:%Y%m%d_%H%M%S}')
os.makedirs(directorio, exist_ok=True)

# Subcarpetas
mapas_dir = os.path.join(directorio, "Mapas")
json_dir = os.path.join(directorio, "JSON")
os.makedirs(mapas_dir, exist_ok=True)
os.makedirs(json_dir, exist_ok=True)

# Archivos base
archivo_general = f'tormentas{fecha:%Y%m%d_%H%M%S}.json'
mapa_general = f"mapa_{fecha:%Y%m%d_%H%M%S}.png"
ruta_general_mapa = os.path.join(mapas_dir, mapa_general)
ruta_general_datos = os.path.join(json_dir, archivo_general)

# ==============================
# TEXTOS A ELIMINAR (serán borrados completamente)
# ==============================
TEXTOS_A_ELIMINAR = [
    'The cone of uncertainty',
    'cone of uncertainty',
    'Plot generated using tropYcal',
    'Plot generated using tropycal',
    'Gráfico generado usando tropYcal',
    'experimental intensity',
    'using 2025 official error',
    'in this graphic after',
    'typically contains',
    'of the center location',
    'from the official NHC forecast',
]

# ==============================
# TEXTOS A MANTENER EN INGLÉS (NO se traducirán)
# Solo para el MAPA GENERAL
# ==============================
TEXTOS_NO_TRADUCIR_MAPA_GENERAL = [
    'Summary & NHC 7-Day Formation Outlook',
    'Valid',
    'UTC',
    'NHC',
]

# ==============================
# TEXTOS DE LEYENDA A ELIMINAR (escalas de categorías)
# ==============================
LEYENDA_A_ELIMINAR = [
    'Category 1',
    'Category 2',
    'Category 3',
    'Category 4',
    'Category 5',
    'Tropical Storm',
    'Tropical Depression',
    'Subtropical',
    'Non Tropical',
    'No Tropical',
    'Desconocido',
    'Unknown',
]

# ==============================
# DICCIONARIO COMPLETO DE TRADUCCIÓN
# ==============================
TRADUCCIONES = {
    # TÍTULOS Y PRINCIPALES (para mapas individuales)
    'Tropical Storm': 'Tormenta Tropical',
    'NHC Issued': 'Emitido por CNH',
    'Tropical Depression': 'Depresión Tropical',
    'Subtropical': 'Subtropical',
    'Hurricane': 'Huracán',

    # INTENSIDAD Y DATOS
    'Current Intensity': 'Intensidad Actual',
    'Maximum Intensity': 'Intensidad Máxima',
    'mph': 'mph',
    'hPa': 'hPa',
    'knots': 'nudos',
    'kt': 'kt',

    # TIPOS DE CICLÓN
    'No Tropical': 'No Tropical',
    'Non Tropical': 'No Tropical',
    'Desconocido': 'Desconocido',
    'Unknown': 'Desconocido',
    'Extratropical': 'Extratropical',
    'Category': 'Categoría',

    # TIEMPO
    'Forecast': 'Pronóstico',
    'Track': 'Trayectoria',
    'History': 'Historial',
    'Current': 'Actual',

    # DÍAS DE LA SEMANA (COMPLETOS Y ABREVIADOS)
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo',
    'Mon': 'Lun',
    'Tue': 'Mar',
    'Wed': 'Mié',
    'Thu': 'Jue',
    'Fri': 'Vie',
    'Sat': 'Sáb',
    'Sun': 'Dom',

    # MESES (COMPLETOS Y ABREVIADOS)
    'January': 'Enero',
    'February': 'Febrero',
    'March': 'Marzo',
    'April': 'Abril',
    'May': 'Mayo',
    'June': 'Junio',
    'July': 'Julio',
    'August': 'Agosto',
    'September': 'Septiembre',
    'October': 'Octubre',
    'November': 'Noviembre',
    'December': 'Diciembre',
    'Jan': 'Ene',
    'Feb': 'Feb',
    'Mar': 'Mar',
    'Apr': 'Abr',
    'Jun': 'Jun',
    'Jul': 'Jul',
    'Aug': 'Ago',
    'Sep': 'Sep',
    'Oct': 'Oct',
    'Nov': 'Nov',
    'Dec': 'Dic',

    # DIRECCIONES
    'North': 'Norte',
    'South': 'Sur',
    'East': 'Este',
    'West': 'Oeste',
    'Central': 'Central',
    'Atlantic': 'Atlántico',
    'Pacific': 'Pacífico',

    # OTROS
    'Unknown': 'Desconocido',
    'Legend': 'Leyenda',
    'Basin': 'Cuenca',
    'Formation': 'Formación',
    'Outlook': 'Pronóstico',
    'Summary': 'Resumen',
    'Day': 'Día',
}

def debe_mantener_ingles(texto, es_mapa_general=False):
    """
    Verifica si un texto debe mantenerse en inglés (NO traducir).
    Solo aplica para el mapa general.
    """
    if not texto or not isinstance(texto, str):
        return False

    # Solo aplicar la lista de no traducir si es mapa general
    if not es_mapa_general:
        return False

    texto_strip = texto.strip()

    # Verificar coincidencias exactas o parciales
    for patron in TEXTOS_NO_TRADUCIR_MAPA_GENERAL:
        if patron.lower() in texto_strip.lower():
            return True

    return False

def es_texto_leyenda(texto):
    """
    Verifica si un texto es parte de la leyenda de categorías.
    """
    if not texto or not isinstance(texto, str):
        return False

    texto_strip = texto.strip()

    for patron in LEYENDA_A_ELIMINAR:
        if texto_strip.lower() == patron.lower():
            return True

    return False

def debe_eliminar_texto(texto):
    """
    Verifica si un texto debe ser eliminado completamente.
    """
    if not texto or not isinstance(texto, str):
        return False

    texto_lower = texto.lower().strip()

    for patron in TEXTOS_A_ELIMINAR:
        if patron.lower() in texto_lower:
            return True

    return False

def traducir_texto_completo(texto, es_mapa_general=False):
    """
    Traduce un texto de forma exhaustiva, incluyendo patrones complejos.
    EXCEPTO los textos marcados para mantener en inglés (solo en mapa general).
    """
    if not texto or not isinstance(texto, str):
        return texto

    # Primero verificar si debe eliminarse
    if debe_eliminar_texto(texto):
        return ""

    # Verificar si debe mantenerse en inglés (solo mapa general)
    if debe_mantener_ingles(texto, es_mapa_general):
        return texto

    texto_traducido = texto

    # Ordenar por longitud descendente para evitar reemplazos parciales
    items_ordenados = sorted(TRADUCCIONES.items(), key=lambda x: len(x[0]), reverse=True)

    for ingles, espanol in items_ordenados:
        # Reemplazo insensible a mayúsculas/minúsculas
        texto_traducido = re.sub(
            re.escape(ingles),
            espanol,
            texto_traducido,
            flags=re.IGNORECASE
        )

    return texto_traducido

def limpiar_y_traducir_matplotlib(es_mapa_general=False):
    """
    Traduce y elimina textos no deseados de la figura actual de matplotlib.

    Args:
        es_mapa_general: True si es el mapa general, False si es mapa individual
    """
    try:
        fig = plt.gcf()

        # PRIMERO: Eliminar/traducir textos a nivel de figura
        textos_a_remover = []
        for text_obj in fig.texts:
            try:
                texto_original = text_obj.get_text()
                if texto_original and len(texto_original.strip()) > 0:
                    if debe_eliminar_texto(texto_original):
                        textos_a_remover.append(text_obj)
                        print(f"   🗑️  Eliminando: '{texto_original[:60]}...'")
                    elif debe_mantener_ingles(texto_original, es_mapa_general):
                        print(f"   🔒 Manteniendo en inglés: '{texto_original[:60]}...'")
                    else:
                        texto_traducido = traducir_texto_completo(texto_original, es_mapa_general)
                        if texto_traducido != texto_original:
                            text_obj.set_text(texto_traducido)
                            print(f"   ✏️  Traducido: '{texto_original[:40]}...'")
            except Exception as e:
                print(f"   ⚠️ Error procesando texto figura: {e}")

        # Remover textos marcados para eliminación
        for text_obj in textos_a_remover:
            text_obj.remove()

        # SEGUNDO: Procesar ejes
        for ax in fig.get_axes():
            # 1. Título principal
            titulo = ax.get_title()
            if titulo:
                titulo_traducido = traducir_texto_completo(titulo, es_mapa_general)
                if titulo_traducido:
                    ax.set_title(titulo_traducido, fontsize=ax.title.get_fontsize())

            # 2. Etiquetas de ejes
            xlabel = ax.get_xlabel()
            ylabel = ax.get_ylabel()
            if xlabel:
                xlabel_traducido = traducir_texto_completo(xlabel, es_mapa_general)
                ax.set_xlabel(xlabel_traducido)
            if ylabel:
                ylabel_traducido = traducir_texto_completo(ylabel, es_mapa_general)
                ax.set_ylabel(ylabel_traducido)

            # 3. Leyenda - ELIMINAR COMPLETAMENTE en mapas individuales
            legend = ax.get_legend()
            if legend:
                if not es_mapa_general:
                    # En mapas individuales, eliminar la leyenda completamente
                    legend.remove()
                    print(f"   🗑️  Leyenda de categorías eliminada")
                else:
                    # En mapa general, mantener la leyenda tal cual
                    handles = legend.legend_handles
                    labels_originales = [t.get_text() for t in legend.get_texts()]
                    labels_traducidas = [traducir_texto_completo(label, es_mapa_general) for label in labels_originales]

                    # Recrear leyenda
                    ax.legend(
                        handles,
                        labels_traducidas,
                        loc=legend._loc if hasattr(legend, '_loc') else 'best',
                        frameon=legend.get_frame_on(),
                        fontsize=legend.get_texts()[0].get_fontsize() if legend.get_texts() else None
                    )

            # 4. Textos dentro del eje
            textos_ax_a_remover = []
            for text in ax.texts:
                texto_original = text.get_text()
                if debe_eliminar_texto(texto_original):
                    textos_ax_a_remover.append(text)
                elif not es_mapa_general and es_texto_leyenda(texto_original):
                    # En mapas individuales, eliminar textos de leyenda
                    textos_ax_a_remover.append(text)
                else:
                    texto_traducido = traducir_texto_completo(texto_original, es_mapa_general)
                    text.set_text(texto_traducido)

            # Remover textos del eje
            for text in textos_ax_a_remover:
                text.remove()

            # 5. Etiquetas de ticks
            for label in ax.get_xticklabels():
                texto_label = label.get_text()
                if not debe_eliminar_texto(texto_label):
                    label.set_text(traducir_texto_completo(texto_label, es_mapa_general))

            for label in ax.get_yticklabels():
                texto_label = label.get_text()
                if not debe_eliminar_texto(texto_label):
                    label.set_text(traducir_texto_completo(texto_label, es_mapa_general))

        # 3. Título de figura
        if fig._suptitle:
            suptitle_texto = fig._suptitle.get_text()
            if not debe_eliminar_texto(suptitle_texto):
                fig._suptitle.set_text(traducir_texto_completo(suptitle_texto, es_mapa_general))

        # 4. Buscar y eliminar cualquier otro texto
        for obj in fig.findobj(lambda x: hasattr(x, 'get_text') and callable(x.get_text)):
            try:
                texto = obj.get_text()
                if texto and debe_eliminar_texto(texto):
                    if hasattr(obj, 'remove'):
                        obj.remove()
                elif texto and not es_mapa_general and es_texto_leyenda(texto):
                    # Eliminar textos de leyenda en mapas individuales
                    if hasattr(obj, 'remove'):
                        obj.remove()
                elif texto:
                    texto_traducido = traducir_texto_completo(texto, es_mapa_general)
                    if hasattr(obj, 'set_text'):
                        obj.set_text(texto_traducido)
            except:
                pass

    except Exception as e:
        print(f"⚠️ Error durante la limpieza y traducción: {e}")
        traceback.print_exc()

def guardar_mapa_limpio(ruta_imagen):
    """
    Guarda el mapa actual con traducciones y sin textos no deseados.
    """
    try:
        limpiar_y_traducir_matplotlib()

        plt.savefig(
            ruta_imagen,
            dpi=300,
            bbox_inches='tight',
            facecolor='white',
            edgecolor='none',
            format='png',
            pil_kwargs={'optimize': True}
        )

        print(f"✅ Mapa limpio guardado: {ruta_imagen}")
        plt.close()

    except Exception as e:
        print(f"❌ Error al guardar mapa: {e}")
        traceback.print_exc()
        plt.close()

# ==============================
# FUNCIONES AUXILIARES
# ==============================
def serializar(obj):
    """Convierte objetos no serializables a tipos básicos compatibles con JSON."""
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (np.int32, np.int64, np.float32, np.float64)):
        return obj.item()
    if isinstance(obj, (datetime,)):
        return str(obj)
    if isinstance(obj, dict):
        return {k: serializar(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [serializar(i) for i in obj]
    return obj

# ==============================
# CONFIGURAR MATPLOTLIB
# ==============================
import matplotlib
matplotlib.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica', 'sans-serif']
matplotlib.rcParams['axes.unicode_minus'] = False
matplotlib.rcParams['figure.max_open_warning'] = 50

# ==============================
# DESCARGA Y PROCESAMIENTO
# ==============================
print("=" * 60)
print("🌀 SISTEMA DE MONITOREO DE TORMENTAS TROPICALES")
print("=" * 60)
print("\n📡 Descargando tormentas activas...")

realtime_obj = realtime.Realtime()
storms_list = realtime_obj.list_active_storms()
print(f"✅ Tormentas activas detectadas: {len(storms_list)}")

if len(storms_list) == 0:
    print("ℹ️  No hay tormentas activas en este momento.")
else:
    print(f"📋 Tormentas: {', '.join(storms_list)}")

# ==============================
# MAPA GENERAL
# ==============================
print("\n" + "=" * 60)
print("🗺️  GENERANDO MAPA GENERAL")
print("=" * 60)

try:
    realtime_obj.plot_summary()
    guardar_mapa_limpio(ruta_general_mapa)
except Exception as e:
    print(f"❌ Error al generar el mapa general: {e}")
    traceback.print_exc()

# ==============================
# DATOS GENERALES DE TORMENTAS
# ==============================
print("\n" + "=" * 60)
print("📊 PROCESANDO DATOS GENERALES")
print("=" * 60)

datos_tormentas_general = {}

for i, storm_id in enumerate(storms_list):
    try:
        print(f"\n🌪️  Procesando: {storm_id}")
        storm = realtime_obj.get_storm(storm_id)

        datos_tormentas_general[i] = serializar({
            "id": storm.id,
            "name": storm.name,
            "year": storm.year,
            'date': datetime.now(),
            'zona_horaria': get_localzone(),
            "season": storm.season,
            "basin": storm.basin,
            "max_wind": storm.attrs["vmax"][-1] if "vmax" in storm.attrs and storm.attrs["vmax"].size > 0 else None,
            "min_pressure": storm.attrs["mslp"][-1] if "mslp" in storm.attrs and storm.attrs["mslp"].size > 0 else None,
            "ace": storm.ace,
            "invest": storm.invest,
            "start_time": storm.attrs["time"][0] if "time" in storm.attrs and storm.attrs["time"].size > 0 else None,
            "end_time": storm.attrs["time"][-1] if "time" in storm.attrs and storm.attrs["time"].size > 0 else None,
            "source": storm.source_info,
            "category": getattr(storm, "category", None),
            "storm_type": getattr(storm, "type", None)
        })
        print(f"   ✓ Datos extraídos correctamente")

    except Exception as e:
        print(f"   ⚠️ Error al procesar datos de {storm_id}: {e}")

# Guardar JSON general
try:
    with open(ruta_general_datos, 'w', encoding='utf-8') as f:
        json.dump(datos_tormentas_general, f, indent=4, default=str, ensure_ascii=False)
    print(f"\n✅ Archivo JSON general guardado: {ruta_general_datos}")
except Exception as e:
    print(f"\n❌ Error al guardar archivo JSON general: {e}")

# ==============================
# MAPAS Y DATOS INDIVIDUALES
# ==============================
print("\n" + "=" * 60)
print("🎯 GENERANDO MAPAS Y DATOS INDIVIDUALES")
print("=" * 60)

for storm_id in storms_list:
    print(f"\n{'='*40}")
    print(f"🌀 Tormenta: {storm_id}")
    print(f"{'='*40}")

    try:
        storm = realtime_obj.get_storm(storm_id)

        # --- Mapa individual ---
        try:
            print("   📍 Obteniendo pronóstico en tiempo real...")
            storm.get_forecast_realtime()

            print("   🎨 Generando mapa de pronóstico...")
            storm.plot_forecast_realtime()

            ruta_mapa_individual = os.path.join(mapas_dir, f"{storm_id}.png")
            guardar_mapa_limpio(ruta_mapa_individual)

        except Exception as e:
            print(f"   ⚠️ No se pudo generar mapa para {storm_id}: {e}")

        # --- Datos individuales ---
        print("   💾 Guardando datos en JSON...")
        datos_tormenta_individual = serializar({
            "id": storm.id,
            "name": storm.name,
            "year": storm.year,
            'date': datetime.now(),
            'zona_horaria': get_localzone(),
            "season": storm.season,
            "basin": storm.basin,
            "max_wind": storm.attrs["vmax"][-1] if "vmax" in storm.attrs and storm.attrs["vmax"].size > 0 else None,
            "min_pressure": storm.attrs["mslp"][-1] if "mslp" in storm.attrs and storm.attrs["mslp"].size > 0 else None,
            "ace": storm.ace,
            "invest": storm.invest,
            "start_time": storm.attrs["time"][0] if "time" in storm.attrs and storm.attrs["time"].size > 0 else None,
            "end_time": storm.attrs["time"][-1] if "time" in storm.attrs and storm.attrs["time"].size > 0 else None,
            "category": getattr(storm, "category", None),
            "storm_type": getattr(storm, "type", None),
            "source": storm.source_info
        })

        ruta_json_individual = os.path.join(json_dir, f"tormenta_{storm_id}.json")
        with open(ruta_json_individual, 'w', encoding='utf-8') as f:
            json.dump(datos_tormenta_individual, f, indent=4, default=str, ensure_ascii=False)
        print(f"   ✓ JSON guardado: {ruta_json_individual}")

    except Exception as e:
        print(f"   ❌ Error inesperado al procesar {storm_id}: {e}")
        traceback.print_exc()

print("\n" + "=" * 60)
print("✅ PROCESO FINALIZADO CORRECTAMENTE")
print("=" * 60)
print(f"\n📁 Resultados guardados en: {directorio}")
print(f"   🗺️  Mapas: {mapas_dir}")
print(f"   📄 JSON: {json_dir}")