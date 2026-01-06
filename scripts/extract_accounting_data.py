import re
import json
from datetime import datetime
from pathlib import Path

class AccountingDataExtractor:
    def __init__(self, bak_file_path):
        self.bak_file = bak_file_path
        self.data = {
            'rfcs': set(),
            'amounts': [],
            'dates': [],
            'concepts': [],
            'metadata': {}
        }
    
    def extract_rfcs(self):
        """Extrae todos los RFCs del archivo"""
        rfc_pattern = re.compile(rb'[A-Z&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}')
        
        with open(self.bak_file, 'rb') as f:
            chunk_size = 10 * 1024 * 1024
            while True:
                data = f.read(chunk_size)
                if not data:
                    break
                for match in rfc_pattern.finditer(data):
                    self.data['rfcs'].add(match.group(0).decode('ascii', errors='ignore'))
        
        print(f"✓ Extraídos {len(self.data['rfcs'])} RFCs únicos")
        return list(self.data['rfcs'])
    
    def extract_amounts(self):
        """Extrae montos monetarios (formato decimal)"""
        # Buscar patrones como: 1234.56, 12345.67, etc.
        amount_pattern = re.compile(rb'(?<![0-9])[0-9]{1,10}\.[0-9]{2}(?![0-9])')
        
        amounts_found = []
        with open(self.bak_file, 'rb') as f:
            chunk_size = 5 * 1024 * 1024
            chunk_count = 0
            while chunk_count < 20:  # Limitar a primeros 100MB para velocidad
                data = f.read(chunk_size)
                if not data:
                    break
                for match in amount_pattern.finditer(data):
                    try:
                        amount = float(match.group(0).decode('ascii'))
                        if 0.01 <= amount <= 99999999.99:  # Filtrar montos razonables
                            amounts_found.append(amount)
                    except:
                        pass
                chunk_count += 1
        
        self.data['amounts'] = amounts_found[:1000]  # Guardar primeros 1000
        print(f"✓ Extraídos {len(amounts_found)} montos (guardados primeros 1000)")
        
        if amounts_found:
            print(f"  Monto promedio: ${sum(amounts_found)/len(amounts_found):,.2f}")
            print(f"  Monto máximo: ${max(amounts_found):,.2f}")
            print(f"  Monto mínimo: ${min(amounts_found):,.2f}")
        
        return amounts_found
    
    def extract_dates(self):
        """Extrae fechas en formato YYYY-MM-DD o DD/MM/YYYY"""
        date_patterns = [
            re.compile(rb'20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])'),
            re.compile(rb'(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/20[0-9]{2}')
        ]
        
        dates_found = []
        with open(self.bak_file, 'rb') as f:
            chunk_size = 5 * 1024 * 1024
            chunk_count = 0
            while chunk_count < 10:
                data = f.read(chunk_size)
                if not data:
                    break
                for pattern in date_patterns:
                    for match in pattern.finditer(data):
                        dates_found.append(match.group(0).decode('ascii', errors='ignore'))
                chunk_count += 1
        
        self.data['dates'] = list(set(dates_found))[:500]
        print(f"✓ Extraídas {len(set(dates_found))} fechas únicas (guardadas primeras 500)")
        return dates_found
    
    def extract_table_names(self):
        """Busca nombres de tablas comunes de ASPEL COI"""
        table_keywords = [
            b'CPOLIZA', b'POLIZA', b'CUENTAS', b'AUXILIAR', 
            b'CATALOGO', b'EMPRESA', b'PERIODO', b'BALANZA'
        ]
        
        tables_found = {}
        with open(self.bak_file, 'rb') as f:
            chunk_size = 10 * 1024 * 1024
            chunk_count = 0
            while chunk_count < 5:
                data = f.read(chunk_size)
                if not data:
                    break
                for keyword in table_keywords:
                    count = data.count(keyword)
                    if count > 0:
                        key = keyword.decode('ascii')
                        tables_found[key] = tables_found.get(key, 0) + count
                chunk_count += 1
        
        print(f"✓ Tablas/Keywords encontrados:")
        for table, count in sorted(tables_found.items(), key=lambda x: x[1], reverse=True):
            print(f"  {table}: {count} ocurrencias")
        
        return tables_found
    
    def generate_summary(self, company_name, company_rfc):
        """Genera un resumen JSON para la app"""
        summary = {
            'company': {
                'name': company_name,
                'rfc': company_rfc,
                'extraction_date': datetime.now().isoformat()
            },
            'statistics': {
                'total_rfcs': len(self.data['rfcs']),
                'total_amounts_sampled': len(self.data['amounts']),
                'total_dates_found': len(self.data['dates']),
                'avg_amount': sum(self.data['amounts']) / len(self.data['amounts']) if self.data['amounts'] else 0,
                'max_amount': max(self.data['amounts']) if self.data['amounts'] else 0,
                'min_amount': min(self.data['amounts']) if self.data['amounts'] else 0
            },
            'rfcs': sorted(list(self.data['rfcs']))[:50],  # Primeros 50 RFCs
            'sample_amounts': self.data['amounts'][:100],  # Primeros 100 montos
            'sample_dates': self.data['dates'][:50]  # Primeras 50 fechas
        }
        
        return summary
    
    def save_to_json(self, output_file):
        """Guarda los datos extraídos en JSON"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False, default=str)
        print(f"✓ Datos guardados en: {output_file}")


# Ejecutar extracción para Elizondo
if __name__ == "__main__":
    print("=" * 60)
    print("EXTRACTOR DE DATOS CONTABLES REALES - AUDITOR-IA")
    print("=" * 60)
    print()
    
    elizondo_path = r"C:\IA_nubes\auditorIA_1\ctTRANSPORTES_ELIZONDO_2024-20251024-1750\document_9aa3cd70-d41b-4905-8c9d-dc96db1a6e8a_content.bak"
    
    print(f"📂 Procesando: TRANSPORTES ELIZONDO JIMENEZ")
    print(f"📄 Archivo: {Path(elizondo_path).name}")
    print(f"💾 Tamaño: {Path(elizondo_path).stat().st_size / (1024*1024):.2f} MB")
    print()
    
    extractor = AccountingDataExtractor(elizondo_path)
    
    print("🔍 Fase 1: Extrayendo RFCs...")
    extractor.extract_rfcs()
    print()
    
    print("🔍 Fase 2: Extrayendo montos...")
    extractor.extract_amounts()
    print()
    
    print("🔍 Fase 3: Extrayendo fechas...")
    extractor.extract_dates()
    print()
    
    print("🔍 Fase 4: Buscando tablas contables...")
    extractor.extract_table_names()
    print()
    
    # Generar resumen
    summary = extractor.generate_summary(
        "TRANSPORTES ELIZONDO JIMENEZ",
        "TEJ2304191I0"
    )
    
    # Guardar en JSON
    output_path = "data_elizondo_extracted.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print("=" * 60)
    print(f"✅ EXTRACCIÓN COMPLETADA")
    print(f"📊 Resumen guardado en: {output_path}")
    print("=" * 60)
    print()
    print("📈 ESTADÍSTICAS FINALES:")
    print(f"  • RFCs únicos: {summary['statistics']['total_rfcs']}")
    print(f"  • Montos muestreados: {summary['statistics']['total_amounts_sampled']}")
    print(f"  • Promedio de montos: ${summary['statistics']['avg_amount']:,.2f}")
    print(f"  • Monto máximo: ${summary['statistics']['max_amount']:,.2f}")
    print()
