import re
import math
import json
import collections
from pathlib import Path

class AnomalyHunter:
    def __init__(self, bak_file_path):
        self.bak_file = bak_file_path
        self.results = {
            "benford_analysis": {},
            "round_numbers": {},
            "suspicious_concepts": [],
            "statistics": {}
        }
        self.amounts = []
        self.strings = []

    def extract_data(self):
        """Extrae montos y cadenas de texto del archivo binario con estrategia mejorada"""
        print(f"📂 Escaneando archivo (Modo Profundo): {Path(self.bak_file).name}")
        
        # 1. Patrón Específico CFDI/XML (Muy fiable)
        # Busca: Total="123.45" o Importe="123.45"
        xml_pattern = re.compile(rb'(?:Total|SubTotal|Importe|ValorUnitario|Monto|Haber|Debe)="([0-9]+\.[0-9]+)"')
        
        # 2. Patrón Genérico Numérico (Más agresivo)
        # Busca: 1234.56 (al menos 2 dígitos enteros y exactamente 2 o 4 decimales)
        generic_pattern = re.compile(rb'[0-9]{2,}\.[0-9]{2,4}')
        
        # Regex para texto legible (cadenas de >4 caracteres)
        text_pattern = re.compile(rb'[A-Za-z0-9\s\-\.\_\@]{4,}')

        with open(self.bak_file, 'rb') as f:
            chunk_size = 10 * 1024 * 1024 
            chunk_count = 0
            max_chunks = 30 # Aumentamos escaneo a 300MB
            
            while chunk_count < max_chunks:
                data = f.read(chunk_size)
                if not data:
                    break
                
                # Búsqueda Prioritaria: XML Attributes
                for match in xml_pattern.finditer(data):
                    try:
                        val = float(match.group(1).decode('ascii'))
                        if val > 1.0: 
                            self.amounts.append(val)
                    except: pass

                # Si encontramos pocos en XML, usar el genérico
                if len(self.amounts) < 100:
                    for match in generic_pattern.finditer(data):
                        try:
                            val = float(match.group(0).decode('ascii'))
                            # Filtros para reducir ruido:
                            # - Mayor a 1.0 (evitar porcentajes o factores)
                            # - Menor a 100 millones (evitar IDs o teléfonos)
                            if 1.0 < val < 100000000.0:
                                self.amounts.append(val)
                        except: pass
                
                # Extraer texto para búsqueda de keywords
                for match in text_pattern.finditer(data):
                    try:
                        s = match.group(0).decode('ascii', errors='ignore').strip()
                        if 4 < len(s) < 100: 
                            self.strings.append(s)
                    except: pass
                
                chunk_count += 1
                if chunk_count % 5 == 0:
                    print(f"  ... Procesados {chunk_count * 10} MB | Montos encontrados: {len(self.amounts)}")

        # Eliminar duplicados en montos para no sesgar Benford con copias de seguridad repetidas
        self.amounts = list(set(self.amounts))
        print(f"✓ Datos extraídos: {len(self.amounts)} montos únicos, {len(self.strings)} cadenas de texto.")

    def analyze_benford(self):
        """Aplica la Ley de Benford para detectar manipulación de cifras"""
        print("📊 Ejecutando análisis de Ley de Benford...")
        
        if not self.amounts:
            self.results["benford_analysis"] = {"status": "No data"}
            return

        first_digits = [int(str(amount)[0]) for amount in self.amounts if amount > 0]
        total = len(first_digits)
        counts = collections.Counter(first_digits)
        
        # Frecuencias esperadas por Benford
        benford_probs = {1: 30.1, 2: 17.6, 3: 12.5, 4: 9.7, 5: 7.9, 6: 6.7, 7: 5.8, 8: 5.1, 9: 4.6}
        
        analysis = {}
        suspicious_digits = []
        
        for digit in range(1, 10):
            actual_pct = (counts[digit] / total) * 100
            expected_pct = benford_probs[digit]
            deviation = actual_pct - expected_pct
            
            analysis[digit] = {
                "actual": round(actual_pct, 2),
                "expected": expected_pct,
                "deviation": round(deviation, 2)
            }
            
            # Si la desviación es mayor al 5%, es sospechoso
            if abs(deviation) > 5.0:
                suspicious_digits.append(digit)

        risk_score = "BAJO"
        if len(suspicious_digits) >= 2: risk_score = "MEDIO"
        if len(suspicious_digits) >= 4: risk_score = "ALTO"

        self.results["benford_analysis"] = {
            "risk_score": risk_score,
            "suspicious_digits": suspicious_digits,
            "details": analysis
        }
        print(f"  Resultado Benford: Riesgo {risk_score}")

    def analyze_round_numbers(self):
        """Busca excesos de números redondos (terminados en .00)"""
        print("🎯 Buscando cifras redondas sospechosas...")
        
        if not self.amounts: return

        round_count = sum(1 for x in self.amounts if x.is_integer())
        total = len(self.amounts)
        pct_round = (round_count / total) * 100
        
        # En contabilidad real (con IVA), los números redondos son raros (< 5-10%)
        risk_level = "BAJO"
        if pct_round > 15: risk_level = "MEDIO"
        if pct_round > 30: risk_level = "ALTO"
        
        self.results["round_numbers"] = {
            "percentage": round(pct_round, 2),
            "count": round_count,
            "risk_level": risk_level,
            "observation": f"El {round(pct_round, 1)}% de los importes son números exactos, lo cual es {'inusual' if pct_round > 15 else 'normal'}."
        }
        print(f"  Cifras redondas: {round(pct_round, 2)}% - Riesgo {risk_level}")

    def hunt_suspicious_concepts(self):
        """Busca palabras clave de alto riesgo en las cadenas extraídas"""
        print("🕵️ Buscando conceptos sospechosos...")
        
        keywords = [
            # Evasión / Dudoso
            "no deducible", "sin comprobante", "por comprobar", "ajuste", 
            "varios", "cancelado", "efectivo", "reposicion",
            # Personales / Ajenos
            "gastos personales", "prestamo", "anticipo nomina",
            # Riesgo Fiscal
            "multa", "recargo", "actualizacion", "donativo"
        ]
        
        found = []
        for s in self.strings:
            s_lower = s.lower()
            for kw in keywords:
                if kw in s_lower:
                    # Guardar contexto (limitar longitud)
                    found.append({
                        "keyword": kw,
                        "text": s[:50], 
                        "category": "Riesgo Fiscal/Contable"
                    })
        
        # Agrupar y contar
        summary = collections.Counter([item['keyword'] for item in found])
        
        self.results["suspicious_concepts"] = {
            "total_found": len(found),
            "top_keywords": dict(summary.most_common(5)),
            "samples": found[:20] # Guardar primeros 20 ejemplos
        }
        print(f"  Conceptos encontrados: {len(found)}")

    def save_report(self, output_path):
        """Guarda el reporte final"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        print(f"💾 Reporte guardado en: {output_path}")

if __name__ == "__main__":
    print("="*60)
    print("🔎 ENGINE DE DETECCIÓN DE ANOMALÍAS - AUDITOR-IA")
    print("="*60)
    
    # Ruta del archivo (Elizondo)
    archivo_bak = r"C:\IA_nubes\auditorIA_1\ctTRANSPORTES_ELIZONDO_2024-20251024-1750\document_9aa3cd70-d41b-4905-8c9d-dc96db1a6e8a_content.bak"
    
    hunter = AnomalyHunter(archivo_bak)
    
    # Ejecutar Pipeline de Análisis
    hunter.extract_data()
    hunter.analyze_benford()
    hunter.analyze_round_numbers()
    hunter.hunt_suspicious_concepts()
    
    # Guardar resultados
    hunter.save_report("anomaly_report_elizondo.json")
    print("\n✅ Análisis finalizado.")
