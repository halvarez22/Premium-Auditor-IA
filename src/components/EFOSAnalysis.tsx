'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface EFOSAnalysisProps {
    rfcs: string[];
}

interface EFOSResult {
    total_rfcs_analyzed: number;
    risk_summary: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    flagged_rfcs: Array<{
        rfc: string;
        risk_level: string;
        reason: string;
        recommendation: string;
    }>;
    general_observations: string;
    compliance_score: number;
}

export default function EFOSAnalysis({ rfcs }: EFOSAnalysisProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<EFOSResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const analyzeEFOS = async () => {
        setAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/analyze-efos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rfcs: rfcs.slice(0, 30) }), // Analizar primeros 30
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.analysis);
            } else {
                setError(data.error || 'Error en el análisis');
            }
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setAnalyzing(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level.toUpperCase()) {
            case 'CRITICAL':
            case 'CRÍTICO':
                return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
            case 'HIGH':
            case 'ALTO':
                return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
            case 'MEDIUM':
            case 'MEDIO':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            default:
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
        }
    };

    const getComplianceColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        return 'text-rose-400';
    };

    return (
        <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-rose-500/10">
                        <Shield className="text-rose-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Análisis de EFOS</h3>
                        <p className="text-sm text-slate-500">Detección de riesgos fiscales con IA</p>
                    </div>
                </div>

                {!result && (
                    <button
                        onClick={analyzeEFOS}
                        disabled={analyzing || rfcs.length === 0}
                        className="btn-premium flex items-center gap-2"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <Shield size={16} />
                                Analizar con IA
                            </>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-4">
                    <p className="text-rose-400 text-sm">{error}</p>
                </div>
            )}

            {result && (
                <div className="space-y-6">
                    {/* Score de Cumplimiento */}
                    <div className="p-6 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400">Score de Cumplimiento</span>
                            <span className={`text-4xl font-bold ${getComplianceColor(result.compliance_score)}`}>
                                {result.compliance_score}/100
                            </span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${result.compliance_score >= 80
                                        ? 'bg-emerald-400'
                                        : result.compliance_score >= 60
                                            ? 'bg-amber-400'
                                            : 'bg-rose-400'
                                    }`}
                                style={{ width: `${result.compliance_score}%` }}
                            />
                        </div>
                    </div>

                    {/* Distribución de Riesgo */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                            <CheckCircle className="mx-auto mb-2 text-emerald-400" size={24} />
                            <p className="text-2xl font-bold text-emerald-400">{result.risk_summary.low}</p>
                            <p className="text-xs text-slate-500">Bajo</p>
                        </div>
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                            <AlertTriangle className="mx-auto mb-2 text-amber-400" size={24} />
                            <p className="text-2xl font-bold text-amber-400">{result.risk_summary.medium}</p>
                            <p className="text-xs text-slate-500">Medio</p>
                        </div>
                        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center">
                            <AlertTriangle className="mx-auto mb-2 text-orange-400" size={24} />
                            <p className="text-2xl font-bold text-orange-400">{result.risk_summary.high}</p>
                            <p className="text-xs text-slate-500">Alto</p>
                        </div>
                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center">
                            <XCircle className="mx-auto mb-2 text-rose-400" size={24} />
                            <p className="text-2xl font-bold text-rose-400">{result.risk_summary.critical}</p>
                            <p className="text-xs text-slate-500">Crítico</p>
                        </div>
                    </div>

                    {/* RFCs Marcados */}
                    {result.flagged_rfcs.length > 0 && (
                        <div>
                            <h4 className="text-lg font-bold mb-4">RFCs con Riesgo Detectado</h4>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {result.flagged_rfcs.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border ${getRiskColor(item.risk_level)}`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="font-mono font-bold">{item.rfc}</span>
                                            <span className="text-xs px-2 py-1 rounded-full border">
                                                {item.risk_level}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2">{item.reason}</p>
                                        <p className="text-xs text-slate-400">
                                            <strong>Recomendación:</strong> {item.recommendation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Observaciones */}
                    <div className="p-4 bg-white/5 rounded-xl">
                        <h4 className="text-sm font-bold mb-2 text-slate-400">Observaciones Generales</h4>
                        <p className="text-sm">{result.general_observations}</p>
                    </div>

                    <button
                        onClick={() => setResult(null)}
                        className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Realizar nuevo análisis
                    </button>
                </div>
            )}

            {!result && !analyzing && rfcs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <Shield size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No hay RFCs disponibles para analizar</p>
                    <p className="text-sm">Ejecuta primero la extracción de datos</p>
                </div>
            )}
        </div>
    );
}
