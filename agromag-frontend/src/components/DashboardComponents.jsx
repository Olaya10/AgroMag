import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Menu, X, Users, Leaf, Package,
  Zap, BarChart3, ChevronRight, Sparkles,
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const SIDEBAR_W = 288; // px — debe coincidir con w-72 (18rem = 288px)

const ICON_MAP = {
  home: BarChart3,
  usuarios: Users,
  finca: Leaf,
  insumos: Package,
  operaciones: Zap,
  reportes: BarChart3,
  novedades: Sparkles,
};

/* ─── Sidebar ──────────────────────────────────────────────────────────── */
export const DashboardSidebar = ({
  items = [],
  activeItem,
  onItemClick,
  user,
  onLogout,
  isOpen = true,
  isMobile = false,
  onToggle,
}) => {
  const closeSidebar = () => onToggle?.(false);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -SIDEBAR_W }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: 'transform', width: SIDEBAR_W }}
        className="fixed top-0 left-0 h-screen
                   bg-haverts-base border-r border-haverts-secondary/20
                   shadow-medium flex flex-col z-50 overflow-hidden"
      >
        <div className="p-6 border-b border-haverts-secondary/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-haverts-primary
                              flex items-center justify-center shadow-soft text-haverts-base">
                <Leaf className="w-5 h-5" />
              </div>
              <h1 className="font-display font-bold text-lg
                             text-haverts-primary tracking-tight">
                AgroMag
              </h1>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 hover:bg-haverts-secondary/10
                         rounded-lg text-haverts-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {user && (
            <div className="bg-haverts-secondary/10 rounded-2xl p-4
                            border border-haverts-secondary/20">
              <p className="text-[10px] text-haverts-primary/50
                            uppercase tracking-[0.1em] font-bold mb-1">
                Bienvenido
              </p>
              <p className="text-sm font-bold text-haverts-primary truncate">
                {user.name || user.email}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-haverts-secondary animate-pulse" />
                <p className="text-[11px] text-haverts-primary/70 capitalize font-medium">
                  {user.role?.toLowerCase() || 'usuario'}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.key] || Leaf;
            const isActive = activeItem === item.key;

            return (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                whileHover={{ x: 4 }}
                onClick={() => {
                  onItemClick(item.key);
                  if (isMobile) closeSidebar();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3
                            rounded-xl transition-all duration-200 relative overflow-hidden
                            ${isActive
                    ? 'text-haverts-base shadow-soft'
                    : 'text-haverts-primary/70 hover:bg-haverts-secondary/10 hover:text-haverts-primary'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-haverts-primary"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-haverts-base' : 'text-haverts-primary/60'
                  }`} />
                <span className="flex-1 text-left font-bold text-sm whitespace-nowrap relative z-10">
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-haverts-base/80 relative z-10" />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-haverts-secondary/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       text-haverts-primary/60 hover:text-red-600 hover:bg-red-500/10
                       transition-all duration-200 font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => onToggle(!isOpen)}
        style={{
          left: isOpen && !isMobile ? SIDEBAR_W + 12 : 16,
          transition: `left 0.28s cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
        className="fixed top-4 z-50 p-2
                   bg-haverts-base rounded-xl shadow-soft hover:shadow-medium
                   border border-haverts-secondary/20 text-haverts-primary
                   hover:bg-haverts-secondary/10 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </>
  );
};

/* ─── Layout ───────────────────────────────────────────────────────────── */
export const DashboardLayout = ({
  children,
  sidebarItems = [],
  activeItem,
  onSidebarItemClick,
  user,
  onLogout,
  title,
  subtitle,
  headerAction,
  data = [],
  fetchData,
}) => {
  // ⇢ RF48 – filtro global por rango de fechas
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

  // ⇢ RF44 – KPI Volumen de agua
  const aguaKPI = useMemo(() => {
    const start = new Date(fechaInicio);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fechaFin);
    end.setHours(23, 59, 59, 999);
    
    return data
      .filter(item => {
        if (!item.fecha) return false;
        const fechaParts = item.fecha.split('T')[0];
        const f = new Date(fechaParts);
        f.setHours(12, 0, 0, 0); 
        return f >= start && f <= end;
      })
      .reduce((acc, cur) => acc + (cur.volumenAgua || 0), 0);
  }, [data, fechaInicio, fechaFin]);

  // ⇢ RF45 – Top 3 insumos
  const topInsumos = useMemo(() => {
  const start = new Date(fechaInicio);
  start.setHours(0, 0, 0, 0);
  const end = new Date(fechaFin);
  end.setHours(23, 59, 59, 999);
  
  const datofiltrados = data.filter(item => {
    if (!item.fecha) return false;
    const fechaParts = item.fecha.split('T')[0];
    const f = new Date(fechaParts);
    f.setHours(12, 0, 0, 0);
    return f >= start && f <= end && item.insumo?.nombre;
  });
  
  const grouped = datofiltrados.reduce((map, cur) => {
    const key = cur.insumo?.nombre || 'Desconocido';
    map[key] = (map[key] || 0) + (cur.cantidad || 0);
    return map;
  }, {});
  
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nombre, total]) => ({ nombre, total }));
}, [data, fechaInicio, fechaFin]);

  // ⇢ RF46 – Datos gráfico dona
  const insumoChartData = useMemo(() => {
    const start = new Date(fechaInicio);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fechaFin);
    end.setHours(23, 59, 59, 999);
    
    const datofiltrados = data.filter(item => {
      if (!item.fecha) return false;
      const fechaParts = item.fecha.split('T')[0];
      const f = new Date(fechaParts);
      f.setHours(12, 0, 0, 0);
      return f >= start && f <= end && item.insumo;
    });
    
    const catMap = datofiltrados.reduce((map, cur) => {
      const cat = cur.insumo?.categoria || 'Sin categoría';
      map[cat] = (map[cat] || 0) + (cur.cantidad || 0);
      return map;
    }, {});
    return Object.entries(catMap).map(([categoria, total]) => ({
      categoria,
      total,
    }));
  }, [data, fechaInicio, fechaFin]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex h-screen bg-haverts-base overflow-hidden">
      <DashboardSidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={onSidebarItemClick}
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onToggle={setSidebarOpen}
      />

      <main
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
        style={{
          marginLeft: !isMobile && sidebarOpen ? SIDEBAR_W : 0,
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {(title || subtitle || headerAction) && (
          <div className="bg-haverts-base/80 backdrop-blur-md
                          border-b border-haverts-secondary/10
                          px-6 py-5 lg:py-6 sticky top-0 z-20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center
                            justify-between gap-4 max-w-7xl mx-auto pl-10 lg:pl-0">
              <div>
                {title && (
                  <h2 className="text-xl lg:text-2xl font-display font-bold
                               text-haverts-primary tracking-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-haverts-primary/50 mt-0.5 text-xs
                               font-bold uppercase tracking-wider">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {activeItem === 'home' && (
                <div className="flex items-center gap-3 mt-2 sm:mt-0 flex-wrap">
                  <div className="flex items-center bg-haverts-base border border-haverts-secondary/30 rounded-lg overflow-hidden p-1 shadow-sm">
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={e => setFechaInicio(e.target.value)}
                      className="bg-transparent text-sm text-haverts-primary outline-none px-2 py-1"
                      aria-label="Fecha inicio"
                    />
                    <span className="text-haverts-primary/30 mx-1">-</span>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={e => setFechaFin(e.target.value)}
                      className="bg-transparent text-sm text-haverts-primary outline-none px-2 py-1"
                      aria-label="Fecha fin"
                    />
                  </div>
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-haverts-primary text-haverts-base text-sm font-bold rounded-lg hover:bg-haverts-primary/90 transition-colors shadow-soft"
                  >
                    Refrescar
                  </button>
                </div>
              )}
              {headerAction && <div>{headerAction}</div>}
            </div>
          </div>
        )}

        <motion.div
          key={activeItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 overflow-auto p-4 lg:p-8"
        >
          <div className="max-w-7xl mx-auto w-full">

            {activeItem === 'home' && (
              <>
                {/* ==== FILA SUPERIOR: GRÁFICOS Y KPIs ==== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                  <DashboardCard title="Volumen de Agua (L)" subtitle={`Del ${fechaInicio} al ${fechaFin}`}>
                    <div className="mt-4 flex items-center h-full pb-8">
                      <p className="text-5xl font-bold text-haverts-primary">{aguaKPI.toLocaleString()}</p>
                    </div>
                  </DashboardCard>

                  <DashboardCard title="Top 3 Insumos" subtitle="Cantidad usada">
                    <ul className="space-y-4 mt-4">
                      {topInsumos.map((item, index) => (
                        <li key={item.nombre} className="flex justify-between items-center border-b border-haverts-secondary/10 pb-3">
                          <span className="font-medium text-haverts-primary flex items-center gap-2">
                            <span className="text-haverts-secondary/50 font-bold">{index + 1}.</span> 
                            {item.nombre}
                          </span>
                          <span className="font-bold text-sm bg-haverts-secondary/20 text-haverts-secondary px-2.5 py-1 rounded-md">
                            {item.total}
                          </span>
                        </li>
                      ))}
                      {topInsumos.length === 0 && <p className="text-sm text-haverts-primary/50 text-center py-8">Sin datos en esta fecha.</p>}
                    </ul>
                  </DashboardCard>

                  <DashboardCard title="Insumos por Categoría">
                    <div className="flex justify-center -mt-4 pb-4">
                      <PieChart width={220} height={220}>
                        <Pie
                          data={insumoChartData}
                          dataKey="total"
                          nameKey="categoria"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={50}
                          fill="#8884d8"
                          stroke="none"
                        >
                          {insumoChartData.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={['#3B755E', '#85B48A', '#D8D174', '#C4A54A'][idx % 4]} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                           itemStyle={{ color: '#3B755E', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </div>
                  </DashboardCard>
                </div>

                {/* ==== FILA INFERIOR: ACCESOS RÁPIDOS ==== */}
                <div className="pt-8 border-t border-haverts-secondary/20">
                  <h3 className="text-xl font-bold text-haverts-primary mb-6 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-haverts-secondary" />
                    Módulos Principales
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sidebarItems.filter(item => item.key !== 'home').map((item) => {
                      const Icon = ICON_MAP[item.key] || ChevronRight;
                      const descripciones = {
                        usuarios: 'Administra roles y permisos del personal.',
                        finca: 'Gestiona lotes y etapas del cultivo.',
                        insumos: 'Supervisa el stock y alertas de bodega.',
                        operaciones: 'Registra riegos y aplicaciones en campo.',
                        novedades: 'Reporta plagas, daños o eventos imprevistos.',
                        reportes: 'Genera y exporta análisis de rendimiento.'
                      };

                      return (
                        <motion.button
                          key={item.key}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSidebarItemClick(item.key)}
                          className="flex flex-col items-start p-6 text-left card hover:border-haverts-secondary/50 group cursor-pointer"
                        >
                          <div className="p-3 bg-haverts-secondary/10 rounded-xl mb-4 
                                          group-hover:bg-haverts-secondary group-hover:text-white 
                                          transition-colors text-haverts-secondary">
                            <Icon className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-lg text-haverts-primary mb-1">{item.label}</h4>
                          <p className="text-sm text-haverts-primary/60 leading-relaxed">
                            {descripciones[item.key] || 'Accede a este módulo del sistema.'}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

/* ─── DashboardCard ────────────────────────────────────────────────────── */
export const DashboardCard = ({
  title,
  subtitle,
  children,
  className = '',
  action,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    className={`card p-6 sm:p-8 flex flex-col h-full ${className}`}
  >
    {(title || subtitle || action) && (
      <div className="flex items-start justify-between mb-4">
        <div>
          {title && (
            <h3 className="text-lg font-bold text-haverts-primary mb-1 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-[10px] text-haverts-primary/50 font-bold uppercase tracking-[0.15em]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="flex-1">{children}</div>
  </motion.div>
);