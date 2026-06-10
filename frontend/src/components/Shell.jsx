import { Activity, BarChart3, ClipboardList, LogOut, QrCode, UserCircle2 } from 'lucide-react';

const navItems = [
  { id: 'reception', label: 'Reception', icon: ClipboardList },
  { id: 'waiting', label: 'Waiting', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'register', label: 'QR', icon: QrCode }
];

export default function Shell({ activeView, onViewChange, onLogout, staff, children }) {
  return (
    <div className="min-h-screen bg-[#f6faf8]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clinic-teal">QueuePulse</p>
            <h1 className="text-2xl font-semibold text-clinic-ink">Clinic Queue Operations</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <nav className="grid grid-cols-4 gap-2 rounded-lg bg-slate-100 p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onViewChange(item.id)}
                    className={`focus-ring flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                      active ? 'bg-white text-clinic-ink shadow-sm' : 'text-slate-600 hover:text-clinic-ink'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {/* Staff identity badge */}
            {staff && (
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <UserCircle2 className="h-4 w-4 text-clinic-teal flex-shrink-0" />
                <span className="font-medium text-slate-800 hidden sm:inline">{staff.name}</span>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${
                  staff.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  staff.role === 'doctor' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-sky-100 text-sky-700'
                }`}>
                  {staff.role}
                </span>
              </div>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
