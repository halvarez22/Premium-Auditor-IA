import os
import xml.etree.ElementTree as ET
import json
from pathlib import Path

def parse_cfdi(xml_path):
    """Extrae datos clave de un CFDI real."""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        # Namespaces comunes de CFDI
        ns = {
            'cfdi': 'http://www.sat.gob.mx/cfd/4',
            'tfd': 'http://www.sat.gob.mx/TimbreFiscalDigital'
        }
        
        # Intentar con CFDI 3.3 si falla el 4.0
        if '4' not in root.tag:
            ns['cfdi'] = 'http://www.sat.gob.mx/cfd/3'

        # Datos base
        emisor = root.find('cfdi:Emisor', ns)
        receptor = root.find('cfdi:Receptor', ns)
        complemento = root.find('cfdi:Complemento', ns)
        tfd = complemento.find('tfd:TimbreFiscalDigital', ns) if complemento is not None else None
        
        data = {
            "uuid": tfd.get('UUID') if tfd is not None else "N/A",
            "rfc_emisor": emisor.get('Rfc') if emisor is not None else "N/A",
            "nombre_emisor": emisor.get('Nombre') if emisor is not None else "N/A",
            "rfc_receptor": receptor.get('Rfc') if receptor is not None else "N/A",
            "total": float(root.get('Total', 0)),
            "subtotal": float(root.get('SubTotal', 0)),
            "tipo": root.get('TipoDeComprobante'),
            "fecha": root.get('Fecha'),
            "moneda": root.get('Moneda')
        }
        return data
    except Exception as e:
        return None

def scan_directory(base_path):
    results = []
    print(f"Escaneando directorio: {base_path}")
    # Buscar XMLs en la estructura A-Z
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.lower().endswith('.xml'):
                full_path = os.path.join(root, file)
                print(f"Procesando: {file}")
                cfdi_data = parse_cfdi(full_path)
                if cfdi_data:
                    results.append(cfdi_data)
    return results

# Rutas de tus respaldos reales
elizondo_path = r"C:\IA_nubes\auditorIA_1\ctTRANSPORTES_ELIZONDO_2024-20251024-1750\other_9aa3cd70-d41b-4905-8c9d-dc96db1a6e8a"
majoba_path = r"C:\IA_nubes\auditorIA_1\ctTransportes_Majoba_SA_De_CV-20251027-1050\other_584def9a-95e2-4822-83db-889de0d559d0"

# Ejecutar escaneo rápido para Elizondo
print("--- INICIANDO EXTRACCIÓN REAL (ELIZONDO) ---")
data_elizondo = scan_directory(elizondo_path)

# Guardar en JSON para que la app lo consuma localmente antes de subir a Firebase
with open('data_elizondo_real.json', 'w', encoding='utf-8') as f:
    json.dump(data_elizondo, f, indent=4, ensure_ascii=False)

print(f"Success! Se extrajeron {len(data_elizondo)} CFDIs reales de Elizondo.")
