import os
import json
from google import generativeai as genai
from pathlib import Path

# Cargar variables de entorno desde .env.local
env_path = Path('.') / '.env.local'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

class EFOSDetector:
    """
    Detector de EFOS/EDOS usando Gemini AI
    Analiza RFCs contra el conocimiento del SAT
    """
    
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
    def analyze_rfcs_batch(self, rfcs: list) -> dict:
        """
        Analiza un lote de RFCs para detectar posibles EFOS/EDOS
        """
        
        prompt = f"""
Eres un experto auditor fiscal del SAT de México especializado en detectar EFOS (Empresas que Facturan Operaciones Simuladas) y EDOS (Empresas Dedicadas a Operaciones Simuladas).

Analiza los siguientes {len(rfcs)} RFCs extraídos de un respaldo contable real de una empresa de transportes:

RFCs a analizar:
{json.dumps(rfcs, indent=2)}

INSTRUCCIONES:
1. Identifica patrones sospechosos en los RFCs (ej: secuencias inusuales, fechas de constitución recientes)
2. Clasifica cada RFC en categorías de riesgo: BAJO, MEDIO, ALTO, CRÍTICO
3. Genera recomendaciones específicas para cada RFC de riesgo MEDIO o superior
4. Identifica si algún RFC tiene características típicas de EFOS (ej: alta facturación sin activos)

IMPORTANTE: Responde ÚNICAMENTE en formato JSON con esta estructura:
{{
  "total_rfcs_analyzed": número,
  "risk_summary": {{
    "low": número,
    "medium": número,
    "high": número,
    "critical": número
  }},
  "flagged_rfcs": [
    {{
      "rfc": "string",
      "risk_level": "MEDIUM|HIGH|CRITICAL",
      "reason": "descripción del riesgo",
      "recommendation": "acción recomendada"
    }}
  ],
  "general_observations": "string con observaciones generales",
  "compliance_score": número del 0-100
}}
"""

        try:
            response = self.model.generate_content(prompt)
            # Limpiar la respuesta para extraer solo el JSON
            response_text = response.text.strip()
            
            # Remover markdown code blocks si existen
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            result = json.loads(response_text.strip())
            return result
            
        except Exception as e:
            print(f"❌ Error en análisis de IA: {e}")
            return {
                "error": str(e),
                "total_rfcs_analyzed": len(rfcs),
                "risk_summary": {"low": 0, "medium": 0, "high": 0, "critical": 0},
                "flagged_rfcs": [],
                "general_observations": "Error en el análisis",
                "compliance_score": 0
            }
    
    def generate_audit_report(self, company_data: dict, efos_analysis: dict) -> str:
        """
        Genera un reporte de auditoría completo usando Gemini
        """
        
        prompt = f"""
Genera un REPORTE DE AUDITORÍA FISCAL profesional para la empresa:

DATOS DE LA EMPRESA:
- Nombre: {company_data.get('company', {}).get('name', 'N/A')}
- RFC: {company_data.get('company', {}).get('rfc', 'N/A')}
- Total RFCs detectados: {company_data.get('statistics', {}).get('total_rfcs', 0)}
- Monto promedio de transacciones: ${company_data.get('statistics', {}).get('avg_amount', 0):.2f}
- Monto máximo: ${company_data.get('statistics', {}).get('max_amount', 0):.2f}

ANÁLISIS DE RIESGO EFOS:
{json.dumps(efos_analysis, indent=2, ensure_ascii=False)}

GENERA un reporte ejecutivo que incluya:
1. Resumen Ejecutivo (2-3 párrafos)
2. Hallazgos Principales (bullet points)
3. Nivel de Riesgo Global (Bajo/Medio/Alto/Crítico)
4. Recomendaciones Prioritarias (top 5)
5. Próximos Pasos Sugeridos

Formato: Markdown profesional, directo y accionable.
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generando reporte: {e}"


# Script de ejecución
if __name__ == "__main__":
    print("=" * 70)
    print("DETECTOR DE EFOS CON GEMINI AI - AUDITOR-IA PRO")
    print("=" * 70)
    print()
    
    # Cargar API Key
    api_key = os.getenv('GOOGLE_GENERATIVE_AI_API_KEY')
    if not api_key:
        print("❌ Error: No se encontró GOOGLE_GENERATIVE_AI_API_KEY")
        print("   Configúrala en tu archivo .env.local")
        exit(1)
    
    # Cargar datos extraídos
    data_file = 'data_elizondo_extracted.json'
    if not os.path.exists(data_file):
        print(f"❌ Error: No se encontró {data_file}")
        print("   Ejecuta primero: python scripts/extract_accounting_data.py")
        exit(1)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        company_data = json.load(f)
    
    print(f"📂 Empresa: {company_data['company']['name']}")
    print(f"📄 RFC: {company_data['company']['rfc']}")
    print(f"🔍 RFCs a analizar: {company_data['statistics']['total_rfcs']}")
    print()
    
    # Inicializar detector
    detector = EFOSDetector(api_key)
    
    # Analizar RFCs (primeros 50 para no saturar)
    rfcs_to_analyze = company_data['rfcs'][:50]
    
    print("🤖 Analizando RFCs con Gemini AI...")
    print("   (Esto puede tomar 10-20 segundos)")
    print()
    
    efos_analysis = detector.analyze_rfcs_batch(rfcs_to_analyze)
    
    # Mostrar resultados
    print("=" * 70)
    print("📊 RESULTADOS DEL ANÁLISIS")
    print("=" * 70)
    print()
    print(f"✓ RFCs analizados: {efos_analysis.get('total_rfcs_analyzed', 0)}")
    print(f"✓ Score de cumplimiento: {efos_analysis.get('compliance_score', 0)}/100")
    print()
    
    risk_summary = efos_analysis.get('risk_summary', {})
    print("📈 Distribución de Riesgo:")
    print(f"  🟢 Bajo: {risk_summary.get('low', 0)}")
    print(f"  🟡 Medio: {risk_summary.get('medium', 0)}")
    print(f"  🟠 Alto: {risk_summary.get('high', 0)}")
    print(f"  🔴 Crítico: {risk_summary.get('critical', 0)}")
    print()
    
    flagged = efos_analysis.get('flagged_rfcs', [])
    if flagged:
        print(f"⚠️  RFCs Marcados ({len(flagged)}):")
        for item in flagged[:5]:  # Mostrar primeros 5
            print(f"  • {item['rfc']} - {item['risk_level']}")
            print(f"    Razón: {item['reason']}")
            print()
    
    print("💡 Observaciones Generales:")
    print(f"   {efos_analysis.get('general_observations', 'N/A')}")
    print()
    
    # Guardar análisis
    output_file = 'efos_analysis_elizondo.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(efos_analysis, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Análisis guardado en: {output_file}")
    print()
    
    # Generar reporte completo
    print("📝 Generando reporte de auditoría completo...")
    report = detector.generate_audit_report(company_data, efos_analysis)
    
    report_file = 'audit_report_elizondo.md'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ Reporte guardado en: {report_file}")
    print()
    print("=" * 70)
    print("✨ ANÁLISIS COMPLETADO")
    print("=" * 70)
