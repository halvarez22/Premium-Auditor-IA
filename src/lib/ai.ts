import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export const auditModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Analiza un conjunto de pólizas reales en busca de anomalías fiscales o contables.
 */
export async function analyzePolicies(policiesData: any) {
    const prompt = `
    Eres un auditor fiscal experto en el sector transportes de México.
    Analiza los siguientes datos de pólizas reales extraídos de un sistema ASPEL COI.
    Busca:
    1. Pólizas cuadradas artificialmente (cuentas puente inusuales).
    2. Duplicidad de registros.
    3. Montos inusuales de diesel o mantenimiento para el sector transportes.
    4. Posibles discrepancias en IVA.

    Datos de las pólizas:
    ${JSON.stringify(policiesData)}

    Entrega un reporte ejecutivo en formato JSON con:
    - nivel_riesgo (Bajo, Medio, Crítico)
    - hallazgos (lista de objetos con descripcion y monto)
    - recomendaciones (lista de pasos a seguir)
  `;

    try {
        const result = await auditModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error en Auditoría AI:", error);
        return null;
    }
}
