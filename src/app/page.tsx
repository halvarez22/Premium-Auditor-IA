import Link from "next/link";
import { Building2, TrendingUp, AlertTriangle, ShieldCheck, FileText, ArrowRight } from "lucide-react";

const companies = [
    {
        name: "Transportes Majoba S.A. De C.V.",
        rfc: "TMA1402281S3",
        records: "167,869",
        status: "Análisis Completo",
        risk: "Bajo",
        path: "ctTransportes_Majoba_SA_De_CV-20251027-1050"
    },
    {
        name: "TRANSPORTES ELIZONDO JIMENEZ",
        rfc: "TEJ2304191I0",
        records: "14,642",
        status: "Análisis Completo",
        risk: "Medio",
        path: "ctTRANSPORTES_ELIZONDO_2024-20251024-1750"
    }
];

export default function Home() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex justify-between items-end mb-16">
                <div>
                    <h1 className="text-5xl font-bold text-gradient mb-4">Auditor-IA Pro</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Bienvenido al panel de inteligencia contable. Seleccione una empresa para iniciar la auditoría profunda mediante IA.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Motor IA Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard icon={<Building2 className="text-sky-400" />} label="Empresas" value="2" />
                <StatCard icon={<FileText className="text-cyan-400" />} label="Total Pólizas" value="182,511" />
                <StatCard icon={<AlertTriangle className="text-rose-400" />} label="Riesgos Detectados" value="24" color="rose" />
                <StatCard icon={<ShieldCheck className="text-emerald-400" />} label="Cumplimiento SAT" value="94.2%" color="emerald" />
            </div>

            {/* Company Grid */}
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                Empresas en Custodia <div className="h-px bg-white/10 flex-grow" />
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {companies.map((company) => (
                    <div key={company.rfc} className="glass-card group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Building2 size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 group-hover:text-sky-400 transition-colors">
                                        {company.name}
                                    </h3>
                                    <p className="text-slate-500 font-mono text-sm">{company.rfc}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${company.risk === 'Bajo' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                    }`}>
                                    Riesgo {company.risk}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Registros</p>
                                    <p className="text-xl font-semibold">{company.records}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Estado</p>
                                    <p className="text-xl font-semibold text-emerald-400">{company.status}</p>
                                </div>
                            </div>

                            <Link href={`/dashboard/${company.path}`} className="w-full">
                                <button className="w-full btn-premium flex items-center justify-center gap-2 group/btn">
                                    Abrir Auditoría <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color = "sky" }: any) {
    return (
        <div className="glass-card flex items-center gap-5">
            <div className={`p-4 rounded-2xl bg-${color}-500/10`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}
