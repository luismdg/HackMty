# app/services/schedule.py
import os
import traceback
from datetime import datetime
from tropycal import realtime
import json
import numpy as np

DATA_PATH = "Data"


def serializar(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (np.int32, np.int64, np.float32, np.float64)):
        return obj.item()
    if isinstance(obj, datetime):
        return str(obj)
    if isinstance(obj, dict):
        return {k: serializar(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [serializar(i) for i in obj]
    return obj


def procesar_tormentas():
    fecha = datetime.now()
    directorio = os.path.join(DATA_PATH, f"{fecha:%Y%m%d_%H%M%S}")
    mapas_dir = os.path.join(directorio, "Mapas")
    json_dir = os.path.join(directorio, "JSON")
    os.makedirs(mapas_dir, exist_ok=True)
    os.makedirs(json_dir, exist_ok=True)

    archivo_general = f"tormentas{fecha:%Y%m%d_%H%M%S}.json"
    ruta_general_datos = os.path.join(json_dir, archivo_general)
    ruta_general_mapa = os.path.join(mapas_dir, f"mapa_{fecha:%Y%m%d_%H%M%S}.png")

    print("Descargando tormentas activas...")
    realtime_obj = realtime.Realtime()
    storms_list = realtime_obj.list_active_storms()
    print(f"Tormentas activas detectadas: {len(storms_list)}")

    try:
        realtime_obj.plot_summary(save_path=ruta_general_mapa)
        print(f"🗺️  Mapa general guardado en: {ruta_general_mapa}")
    except Exception as e:
        print(f"⚠️ Error al generar el mapa general: {e}")

    datos_tormentas_general = {}
    for i, storm_id in enumerate(storms_list):
        try:
            storm = realtime_obj.get_storm(storm_id)
            datos_tormentas_general[i] = serializar(
                {
                    "id": storm.id,
                    "name": storm.name,
                    "year": storm.year,
                    "season": storm.season,
                    "basin": storm.basin,
                    "max_wind": storm.attrs["vmax"][-1]
                    if "vmax" in storm.attrs and storm.attrs["vmax"].size > 0
                    else None,
                    "min_pressure": storm.attrs["mslp"][-1]
                    if "mslp" in storm.attrs and storm.attrs["mslp"].size > 0
                    else None,
                    "ace": storm.ace,
                    "invest": storm.invest,
                    "start_time": storm.attrs["time"][0]
                    if "time" in storm.attrs and storm.attrs["time"].size > 0
                    else None,
                    "end_time": storm.attrs["time"][-1]
                    if "time" in storm.attrs and storm.attrs["time"].size > 0
                    else None,
                    "source": storm.source_info,
                    "storm_type": getattr(storm, "type", None),
                }
            )
        except Exception as e:
            print(f"⚠️ Error al procesar {storm_id}: {e}")

    with open(ruta_general_datos, "w") as f:
        json.dump(datos_tormentas_general, f, indent=4, default=str)
    print(f"✅ Archivo general guardado en: {ruta_general_datos}")

    print("\nGenerando mapas y datos individuales...")
    for storm_id in storms_list:
        try:
            storm = realtime_obj.get_storm(storm_id)
            try:
                storm.get_forecast_realtime()
                ruta_mapa_individual = os.path.join(mapas_dir, f"{storm_id}.png")
                storm.plot_forecast_realtime(save_path=ruta_mapa_individual)
                print(f"🌀 Mapa generado: {ruta_mapa_individual}")
            except Exception as e:
                print(f"⚠️ No se pudo generar mapa para {storm_id}: {e}")

            ruta_json_individual = os.path.join(json_dir, f"tormenta_{storm_id}.json")
            with open(ruta_json_individual, "w") as f:
                json.dump(
                    serializar(
                        {
                            "id": storm.id,
                            "name": storm.name,
                            "year": storm.year,
                            "season": storm.season,
                            "basin": storm.basin,
                            "ace": storm.ace,
                        }
                    ),
                    f,
                    indent=4,
                    default=str,
                )
            print(f"📄 Datos guardados: {ruta_json_individual}")
        except Exception as e:
            print(f"❌ Error inesperado al procesar {storm_id}: {e}")
            traceback.print_exc()

    print("\n✅ Proceso finalizado correctamente.")


if __name__ == "__main__":
    procesar_tormentas()
