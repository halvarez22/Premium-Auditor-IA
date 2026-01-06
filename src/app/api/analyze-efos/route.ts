import { NextResponse } from 'next/server';
import { auditModel } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const { rfcs } = await request.json();

        if (!rfcs || !Array.isArray(rfcs) || rfcs.length === 0) {
            return NextResponse.json({
                error: 'Invalid input',
                message: 'Please provide an array of RFCs'
            }, { status: 400 });
        }

        const prompt = `
Eres un experto auditor fiscal del SAT de México especializado en detectar EFOS (Empresas que Facturan Operaciones Simuladas).

Analiza los siguientes ${rfcs.length} RFCs extraídos de un respaldo contable real:

RFCs: ${JSON.stringify(rfcs)}

INSTRUCCIONES:
1. Identifica patrones sospechosos
2. Clasifica cada RFC en: BAJO, MEDIO, ALTO, CRÍTICO
3. Genera recomendaciones específicas

Responde ÚNICAMENTE en formato JSON:
{
  "total_rfcs_analyzed": número,
  "risk_summary": {
    "low": número,
    "medium": número,
    "high": número,
    "critical": número
  },
  "flagged_rfcs": [
    {
      "rfc": "string",
      "risk_level": "MEDIUM|HIGH|CRITICAL",
      "reason": "descripción",
      "recommendation": "acción"
    }
  ],
  "general_observations": "string",
  "compliance_score": número_0_a_100
}
`;

        const result = await auditModel.generateContent(prompt);
        const response = await result.response;
        let responseText = response.text();

        // Limpiar markdown
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
            const analysis = JSON.parse(responseText);

            return NextResponse.json({
                success: true,
                analysis: analysis,
                timestamp: new Date().toISOString()
            });
        } catch (parseError) {
            // Si no se puede parsear, devolver el texto raw
            return NextResponse.json({
                success: false,
                error: 'Failed to parse AI response',
                raw_response: responseText
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('EFOS Analysis Error:', error);
        return NextResponse.json({
            error: 'Analysis failed',
            message: error.message
        }, { status: 500 });
    }
}
