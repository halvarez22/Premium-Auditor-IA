import {
    LayoutDashboard,
    Users,
    FileSearch,
    ShieldAlert,
    TrendingUp,
    Database,
    ArrowLeft,
    Bell,
    Search
} from "lucide-react";
import Link from "next/link";

export default function Dashboard({ params }: { params: { company: string } }) {
    // En un entorno real, aquí leeríamos los datos del .bak o de Firestore
    // Basado en el nombre de la carpeta (params.company)
    const isMajoba = params.company.includes("Majoba");
    const data = {
        name: isMajoba ? "Transportes Majoba S.A. De C.V." : "TRANSPORTES ELIZONDO JIMENEZ",
        rfc: isMajoba ? "TMA1402281S3" : "TEJ2304191I0",
        totalReg: isMajoba ? 167869 : 14642,
        diskSize: isMajoba ? "2.27 GB" : "0.20 GB",
    };

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
                    <p className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-tighter">Backup Real</p>
                    <p className="text-sm font-medium truncate">{data.diskSize}</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
                        <div className="bg-sky-400 h-full w-3/4 rounded-full" />
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
                            <h1 className="font-bold text-lg">{data.name}</h1>
                            <p className="text-xs text-slate-500 font-mono">{data.rfc}</p>
                        </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <DashboardCard
                            label="Registros de Pólizas"
                            value={data.totalReg.toLocaleString()}
                            subValue="Encontrados en Backup"
                            icon={<FileSearch className="text-sky-400" />}
                        />
                        <DashboardCard
                            label="Alerta de Riesgo"
                            value="Crítico"
                            subValue="Detectado por IA"
                            icon={<ShieldAlert className="text-rose-400" />}
                            color="rose"
                        />
                        <DashboardCard
                            label="I.V.A. Determinado"
                            value="$0.00"
                            subValue="Pendiente de extracción"
                            icon={<TrendingUp className="text-emerald-400" />}
                            color="emerald"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Chart Placeholder / Info Section */}
                        <div className="glass-card min-h-[400px] flex flex-col justify-center items-center text-center">
                            <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mb-6">
                                <Database className="text-sky-400" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Motor de Extracción Listo</h3>
                            <p className="text-slate-400 max-w-md">
                                Estamos listos para procesar los <b>{data.totalReg.toLocaleString()}</b> registros de este respaldo.
                                Inicie la auditoría profunda para que la IA clasifique cada movimiento.
                            </p>
                            <button className="mt-8 btn-premium">Iniciar Auditoría IA</button>
                        </div>

                        <div className="glass-card">
                            <h3 className="text-xl font-bold mb-6">Metadatos del Respaldo</h3>
                            <div className="space-y-4">
                                <MetaItem label="Empresa" value={data.name} />
                                <MetaItem label="RFC" value={data.rfc} />
                                <MetaItem label="Versión Producto" value="12.0 (SQL Server)" />
                                <MetaItem label="Fecha Respaldo" value={isMajoba ? "2025-10-27" : "2025-10-24"} />
                                <MetaItem label="Tolerancia Fiscal" value="95%" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: any) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}>
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
            <div className={`p-4 rounded-2xl bg-${color}-500/10`}>
                {icon}
            </div>
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
