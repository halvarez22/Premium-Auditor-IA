'use client';

import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Users,
    FileSearch,
    ShieldAlert,
    TrendingUp,
    Database,
    ArrowLeft,
    Bell,
    Search,
    Loader2
} from "lucide-react";
import Link from "next/link";

interface ExtractedData {
    company: {
        name: string;
        rfc: string;
        extraction_date: string;
    };
    statistics: {
        total_rfcs: number;
        total_amounts_sampled: number;
        avg_amount: number;
        max_amount: number;
        min_amount: number;
    };
    rfcs: string[];
    sample_amounts: number[];
}

export default function Dashboard({ params }: { params: { company: string } }) {
    const [data, setData] = useState<ExtractedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isMajoba = params.company.includes("Majoba");
    const fallbackData = {
        name: isMajoba ? "Transportes Majoba S.A. De C.V." : "TRANSPORTES ELIZONDO JIMENEZ",
        rfc: isMajoba ? "TMA1402281S3" : "TEJ2304191I0",
        totalReg: isMajoba ? 167869 : 14642,
        diskSize: isMajoba ? "2.27 GB" : "0.20 GB",
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/data?company=${params.company}`);
                if (response.ok) {
                    const result = await response.json();
                    setData(result.data);
                } else {
                    console.warn('API returned error, using fallback data');
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Using local data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.company]);

    const displayData = data || fallbackData;
    const hasRealData = data !== null;

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 glass border-r border-white/10 hidden lg:flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gradient">Auditor-IA</h2>
                </div>

                <nav className="flex-grow px-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Resumen" active />
                    <NavItem icon={<FileSearch size={20} />} label="Auditoría Pólizas" />
                    <NavItem icon={<ShieldAlert size={20} />} label="Riesgo Fiscal (EFOS)" />
                    <NavItem icon={<TrendingUp size={20} />} label="Rentabilidad" />
                    <NavItem icon={<Users size={20} />} label="Nómina" />
                    <NavItem icon={<Database size={20} />} label="Repositorio XML" />
                </nav>

                <div className="p-4 bg-white/5 m-4 rounded-xl">
                    <p className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-tighter">
                        {hasRealData ? 'Datos Reales' : 'Backup Real'}
                    </p>
                    <p className="text-sm font-medium truncate">
                        {hasRealData ? `${data.statistics.total_rfcs} RFCs` : fallbackData.diskSize}
                    </p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
                        <div className="bg-sky-400 h-full w-3/4 rounded-full animate-pulse-slow" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow flex flex-col overflow-hidden bg-slate-950/30">
                {/* Top Header */}
                <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">
                                {hasRealData ? data.company.name : fallbackData.name}
                            </h1>
                            <p className="text-xs text-slate-500 font-mono">
                                {hasRealData ? data.company.rfc : fallbackData.rfc}
                            </p>
                        </div>
                        {hasRealData && (
                            <div className="ml-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                                <span className="text-xs font-bold text-emerald-400">DATOS REALES</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar póliza o RFC..."
                                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 w-64"
                            />
                        </div>
                        <button className="relative p-2 hover:bg-white/5 rounded-full">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 border border-white/20" />
                    </div>
                </header>

                {/* Dashboard View */}
                <div className="flex-grow p-8 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-sky-400" size={48} />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <DashboardCard
                                    label="RFCs Únicos Encontrados"
                                    value={hasRealData ? data.statistics.total_rfcs.toString() : fallbackData.totalReg.toLocaleString()}
                                    subValue={hasRealData ? "Extraídos del Backup" : "Registros en Backup"}
                                    icon={<FileSearch className="text-sky-400" />}
                                />
                                <DashboardCard
                                    label="Monto Promedio"
                                    value={hasRealData ? `$${data.statistics.avg_amount.toFixed(2)}` : "$0.00"}
                                    subValue={hasRealData ? `${data.statistics.total_amounts_sampled} montos muestreados` : "Pendiente de extracción"}
                                    icon={<TrendingUp className="text-emerald-400" />}
                                    color="emerald"
                                />
                                <DashboardCard
                                    label="Monto Máximo Detectado"
                                    value={hasRealData ? `$${data.statistics.max_amount.toFixed(2)}` : "$0.00"}
                                    subValue={hasRealData ? "En muestra analizada" : "Pendiente"}
                                    icon={<ShieldAlert className="text-amber-400" />}
                                    color="amber"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* RFCs List */}
                                {hasRealData && data.rfcs.length > 0 && (
                                    <div className="glass-card">
                                        <h3 className="text-xl font-bold mb-6">RFCs Detectados (Primeros 20)</h3>
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                            {data.rfcs.slice(0, 20).map((rfc, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="font-mono text-sm">{rfc}</span>
                                                    <span className="text-xs text-slate-500">#{idx + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="glass-card">
                                    <h3 className="text-xl font-bold mb-6">Metadatos del Respaldo</h3>
                                    <div className="space-y-4">
                                        <MetaItem
                                            label="Empresa"
                                            value={hasRealData ? data.company.name : fallbackData.name}
                                        />
                                        <MetaItem
                                            label="RFC"
                                            value={hasRealData ? data.company.rfc : fallbackData.rfc}
                                        />
                                        <MetaItem label="Versión Producto" value="12.0 (SQL Server)" />
                                        <MetaItem
                                            label="Fecha Extracción"
                                            value={hasRealData ? new Date(data.company.extraction_date).toLocaleDateString() : "Pendiente"}
                                        />
                                        <MetaItem
                                            label="Estado"
                                            value={hasRealData ? "✅ Datos Extraídos" : "⏳ Pendiente"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: any) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${active
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    : "text-slate-400 hover:bg-white/5 border border-transparent"
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </div>
    );
}

function DashboardCard({ label, value, subValue, icon, color = "sky" }: any) {
    return (
        <div className="glass-card flex items-start justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-bold text-${color}-400 mb-1`}>{value}</p>
                <p className="text-slate-500 text-xs">{subValue}</p>
            </div>
            <div className={`p-4 rounded-2xl bg-${color}-500/10`}>{icon}</div>
        </div>
    );
}

function MetaItem({ label, value }: any) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
            <span className="text-slate-500 text-sm">{label}</span>
            <span className="font-medium text-sm">{value}</span>
        </div>
    );
}
