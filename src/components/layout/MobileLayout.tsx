import { Outlet, NavLink } from 'react-router-dom';
import { Home, Wrench, AlertTriangle, Bell, LifeBuoy, Receipt, CreditCard, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileLayout() {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 overflow-hidden relative">
      {/* Ambient Background for Liquid Glass Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[50%] rounded-full bg-orange-600/20 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-20%] w-[60%] h-[50%] rounded-full bg-red-600/15 blur-[120px]" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-950/40 backdrop-blur-2xl z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]">
            AC
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">AutoCarnet</h1>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/vehicles" className="p-2 rounded-full hover:bg-white/10 transition-colors border border-white/5 bg-white/5 backdrop-blur-md">
            <Car className="w-5 h-5 text-zinc-300" />
          </NavLink>
          <NavLink to="/subscription" className="p-2 rounded-full hover:bg-white/10 transition-colors border border-white/5 bg-white/5 backdrop-blur-md">
            <CreditCard className="w-5 h-5 text-zinc-300" />
          </NavLink>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-white/5 bg-zinc-950/60 backdrop-blur-2xl pb-safe z-20">
        <div className="flex items-center justify-around px-2 py-2">
          <NavItem to="/" icon={<Home />} label="Accueil" />
          <NavItem to="/maintenance" icon={<Wrench />} label="Entretien" />
          <NavItem to="/problems" icon={<AlertTriangle />} label="Problèmes" />
          <NavItem to="/sos" icon={<LifeBuoy />} label="SOS" isSos />
          <NavItem to="/reminders" icon={<Bell />} label="Rappels" />
          <NavItem to="/expenses" icon={<Receipt />} label="Dépenses" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, isSos = false }: { to: string; icon: React.ReactNode; label: string; isSos?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300",
          isSos 
            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
            : isActive 
              ? "text-orange-500" 
              : "text-zinc-500 hover:text-zinc-300"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn("mb-1 transition-transform duration-300", isActive && !isSos && "-translate-y-1", isSos && "animate-pulse")}>
            {icon}
          </div>
          <span className={cn("text-[10px] font-medium transition-opacity duration-300", isActive || isSos ? "opacity-100" : "opacity-70")}>
            {label}
          </span>
          {isActive && !isSos && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          )}
        </>
      )}
    </NavLink>
  );
}
