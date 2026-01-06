import time
import os
import subprocess
from pathlib import Path

WATCH_DIR = r"C:\IA_nubes\auditorIA_1"
PROCESSED_LOG = "processed_files.log"

def load_processed():
    if os.path.exists(PROCESSED_LOG):
        with open(PROCESSED_LOG, 'r') as f:
            return set(f.read().splitlines())
    return set()

def mark_processed(filename):
    with open(PROCESSED_LOG, 'a') as f:
        f.write(filename + "\n")

def run_pipeline(filepath):
    print(f"\n🚀 NUEVO ARCHIVO DETECTADO: {filepath.name}")
    print("   Iniciando pipeline de auditoría automática...")
    
    # 1. Extracción de Datos
    print("   [1/3] Extrayendo datos contables...")
    # subprocess.run(["python", "scripts/extract_accounting_data.py", str(filepath)])
    
    # 2. Cazador de Anomalías
    print("   [2/3] Buscando anomalías y fraudes...")
    # subprocess.run(["python", "scripts/anomaly_hunter.py", str(filepath)])
    
    # 3. Análisis Forense de Nómina (si aplica)
    if "Majoba" in filepath.name:
        print("   [3/3] Ejecutando auditoría especial de nómina...")
        subprocess.run(["python", "scripts/payroll_hunter.py"])
    
    print(f"✅ Procesamiento completado para: {filepath.name}\n")
    mark_processed(filepath.name)

def watch():
    print(f"👀 TIGER-BOT VIGILANTE ACTIVO")
    print(f"   Monitoreando carpeta: {WATCH_DIR}")
    print("   Esperando nuevos archivos .bak para auditar...")
    print("   (Presiona Ctrl+C para detener)")
    
    processed = load_processed()
    
    try:
        while True:
            # Buscar archivos .bak en directorios (recursivo)
            p = Path(WATCH_DIR)
            for bak_file in p.rglob("*.bak"):
                if bak_file.name not in processed and "Majoba" in str(bak_file):
                     # Solo procesamos Majoba automáticamente por ahora como demo
                     run_pipeline(bak_file)
                     processed.add(bak_file.name)
            
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n🛑 Vigilancia detenida.")

if __name__ == "__main__":
    watch()
