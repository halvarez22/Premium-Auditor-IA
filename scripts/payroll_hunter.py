import re
import json
import collections
from pathlib import Path

class PayrollHunter:
    def __init__(self, bak_file_path):
        self.bak_file = bak_file_path
        self.results = {
            "employee_rfcs": set(),
            "suspicious_concepts": [],
            "payroll_stats": {},
            "evasion_indicators": []
        }
        self.strings = []

    def hunt(self):
        print(f"🕵️ Escaneando NÓMINA en: {Path(self.bak_file).name}")
        
        # Regex para RFCs de personas físicas (4 letras iniciales)
        rfc_fisica_pattern = re.compile(rb'[A-Z&]{4}[0-9]{6}[A-Z0-9]{3}')
        
        # Keywords de alto riesgo en nómina
        risk_keywords = [
            "asimilados", "prevision social", "sindicato", "efectivo", 
            "viaticos", "compensacion", "bono", "gratificacion",
            "finiquito", "indemnizacion", "no acumulable"
        ]
        
        # Keywords de nómina estándar (para validar que es nómina)
        valid_keywords = ["sueldo", "salario", "imss", "infonavit", "isr", "subsidio"]

        with open(self.bak_file, 'rb') as f:
            chunk_size = 10 * 1024 * 1024 
            chunk_count = 0
            max_chunks = 50 # 500MB de escaneo profundo
            
            while chunk_count < max_chunks:
                data = f.read(chunk_size)
                if not data: break
                
                # 1. Buscar RFCs de Empleados
                for match in rfc_fisica_pattern.finditer(data):
                    try:
                        rfc = match.group(0).decode('ascii')
                        # Validar que parezca fecha válida en el RFC
                        self.results["employee_rfcs"].add(rfc)
                    except: pass
                
                # 2. Buscar Conceptos de Riesgo
                data_str = data.decode('ascii', errors='ignore').lower()
                for kw in risk_keywords:
                    if kw in data_str:
                        # Extraer contexto (20 chars antes y después)
                        idx = data_str.find(kw)
                        context = data_str[max(0, idx-20):min(len(data_str), idx+40)]
                        self.results["suspicious_concepts"].append({
                            "keyword": kw,
                            "context": context.replace('\n', ' ').strip()
                        })

                chunk_count += 1
                if chunk_count % 5 == 0:
                    print(f"  ... Procesados {chunk_count * 10} MB | Empleados detectados: {len(self.results['employee_rfcs'])}")

    def save_report(self, output_path):
        """Genera el reporte final de nómina"""
        final_report = {
            "total_employees_detected": len(self.results["employee_rfcs"]),
            "sample_employees": list(self.results["employee_rfcs"])[:50],
            "risk_findings": {
                "total_risks": len(self.results["suspicious_concepts"]),
                "breakdown": dict(collections.Counter(item['keyword'] for item in self.results["suspicious_concepts"])),
                "evidence": self.results["suspicious_concepts"][:20]
            }
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(final_report, f, indent=2, ensure_ascii=False)
        print(f"✅ Reporte de Nómina guardado en: {output_path}")

if __name__ == "__main__":
    print("="*60)
    print("💼 AUDITORÍA ESPECIAL DE NÓMINAS - MAJOBA")
    print("="*60)
    
    archivo_bak = r"C:\IA_nubes\auditorIA_1\ctTransportes_Majoba_SA_De_CV-20251027-1050\document_584def9a-95e2-4822-83db-889de0d559d0_content.bak"
    
    hunter = PayrollHunter(archivo_bak)
    hunter.hunt()
    hunter.save_report("payroll_report_majoba.json")
