'use client';

import { useState, useEffect } from 'react';
import { Siren, ShieldAlert, FileWarning, Search, AlertOctagon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

interface SuspiciousSample {
    keyword: string;
    text: string;
    category: string;
}

interface AnomalyData {
    suspicious_concepts: {
        total_found: number;
        top_keywords: Record<string, number>;
        samples: SuspiciousSample[];
    };
    benford_analysis: {
        risk_score: string;
    };
}

export default function ForensicAlerts({ companyId }: { companyId: string }) {
    const [data, setData] = useState<AnomalyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnomalies() {
            try {
                const res = await fetch(`/api/anomalies?company=${companyId}`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result.data);
                }
            } catch (err) {
                console.error("Error fetching anomalies:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnomalies();
    }, [companyId]);

    if (loading) return <div className="p-4 text-center text-slate-500">Cargando análisis forense...</div>;
    if (!data || data.suspicious_concepts.total_found === 0) return null;

    const { suspicious_concepts, benford_analysis } = data;

    return (
        <div className="glass-card border-rose-500/20 bg-rose-500/5 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/30">
                    <AlertOctagon className="text-rose-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Alertas Forenses</h3>
                    <p className="text-sm text-rose-300/80">
                        Evidencia encontrada en descripciones de pólizas (Metadata)
                    </p>
                </div>
                {benford_analysis?.risk_score === 'ALTO' && (
                    <span className="ml-auto px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full animate-pulse">
                        RIESGO MATEMÁTICO ALTO
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Keywords Card */}
                <div className="p-5 rounded-xl bg-slate-950/50 border border-white/5">
                    <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Search size={14} />
                        Patrones Recurrentes
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(suspicious_concepts.top_keywords).map(([keyword, count]) => (
                            <div key={keyword} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <span className="text-rose-400 font-mono font-bold capitalize">{keyword}</span>
                                <span className="bg-rose-500/20 text-rose-300 text-xs px-2 py-0.5 rounded-md font-bold">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Context */}
                <div className="p-5 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="text-4xl font-bold text-white">{suspicious_concepts.total_found}</div>
                        <div className="text-sm text-slate-400 leading-tight">
                            Hallazgos sospechosos<br />detectados en texto
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        * El sistema detectó términos asociados a evasión fiscal o ajustes contables irregulares.
                    </p>
                </div>
            </div>

            {/* Evidence List */}
            <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <FileWarning size={14} />
                Evidencia Reciente
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {suspicious_concepts.samples.slice(0, 10).map((sample, idx) => (
                    <div key={idx} className="group p-3 rounded-lg bg-white/5 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-rose-400 uppercase border border-rose-500/20 px-1.5 py-0.5 rounded bg-rose-500/10">
                                {sample.keyword}
                            </span>
                            <span className="text-[10px] text-slate-500">{sample.category}</span>
                        </div>
                        <p className="text-sm text-slate-300 font-mono break-all line-clamp-2 group-hover:line-clamp-none transition-all">
                            "{sample.text}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
