'use client';

import { useState, useEffect } from 'react';
import { Users, Banknote, AlertCircle, UserCheck } from 'lucide-react';

interface PayrollData {
    total_employees_detected: number;
    sample_employees: string[];
    risk_findings: {
        total_risks: number;
        breakdown: Record<string, number>;
        evidence: Array<{ keyword: string; context: string }>;
    };
}

export default function PayrollAuditor({ companyId }: { companyId: string }) {
    const [data, setData] = useState<PayrollData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPayroll() {
            try {
                const res = await fetch(`/api/payroll?company=${companyId}`);
                const result = await res.json();
                if (result.success && result.hasPayroll) {
                    setData(result.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPayroll();
    }, [companyId]);

    if (loading || !data) return null;

    return (
        <div className="glass-card mt-8 border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                    <Users className="text-indigo-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Auditoría de Nómina</h3>
                    <p className="text-sm text-indigo-300/80">
                        Análisis de empleados y conceptos retributivos
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                    <UserCheck className="mx-auto mb-2 text-indigo-400" />
                    <div className="text-2xl font-bold">{data.total_employees_detected}</div>
                    <div className="text-xs text-slate-400">Empleados (RFCs Únicos)</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                    <AlertCircle className="mx-auto mb-2 text-amber-400" />
                    <div className="text-2xl font-bold">{data.risk_findings.total_risks}</div>
                    <div className="text-xs text-slate-400">Conceptos de Riesgo</div>
                </div>
                {Object.entries(data.risk_findings.breakdown).slice(0, 1).map(([key, val]) => (
                    <div key={key} className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-center">
                        <Banknote className="mx-auto mb-2 text-rose-400" />
                        <div className="text-2xl font-bold">{val}</div>
                        <div className="text-xs text-rose-300/80 capitalize">Alertas de "{key}"</div>
                    </div>
                ))}
            </div>

            <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Hallazgos en Conceptos de Pago
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {data.risk_findings.evidence.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/30 rounded-lg text-sm font-mono text-slate-300 border border-white/5">
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-1 rounded mr-2 uppercase">{item.keyword}</span>
                        {item.context}
                    </div>
                ))}
            </div>
        </div>
    );
}
