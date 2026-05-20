/**
 * DashboardComponents.jsx
 * Componentes del shell del dashboard: sidebar, layout, card.
 *
 * CAMBIOS CLAVE:
 * - Sidebar: animación width → translateX (elimina reflow en cada frame)
 * - isMobile elevado al DashboardLayout para evitar estado duplicado
 * - DashboardCard: whileInView → animate simple (elimina IntersectionObservers extra)
 * - will-change: transform en elementos animados continuamente
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Menu, X, Users, Leaf, Package,
  Zap, BarChart3, ChevronRight, Sparkles
} from 'lucide-react';
import React from 'react';

const SIDEBAR_W = 288; // px — debe coincidir con w-72 (18rem = 288px)

const ICON_MAP = {
  usuarios:    Users,
  finca:       Leaf,
  insumos:     Package,
  operaciones: Zap,
  reportes:    BarChart3,
  novedades:   Sparkles,
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
      {/* ── Aside: siempre fixed, anima solo con translateX (0 reflow) ── */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -SIDEBAR_W }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: 'transform', width: SIDEBAR_W }}
        className="fixed top-0 left-0 h-screen
                   bg-haverts-base border-r border-haverts-secondary/20
                   shadow-medium flex flex-col z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-haverts-secondary/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-haverts-primary
                              flex items-center justify-center shadow-soft">
                <span className="text-haverts-base font-bold">🌿</span>
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

          {/* User info */}
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
                <div className="w-1.5 h-1.5 rounded-full bg-haverts-accent animate-pulse" />
                <p className="text-[11px] text-haverts-primary/70 capitalize font-medium">
                  {user.role?.toLowerCase() || 'usuario'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
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
                {/* Fondo activo animado con layoutId — spring suave */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-haverts-primary"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-haverts-base' : 'text-haverts-primary/60'
                }`} />
                <span className="flex-1 text-left font-bold text-sm whitespace-nowrap">
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-haverts-base/80" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-haverts-secondary/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       text-haverts-primary/60 hover:text-red-600 hover:bg-red-50
                       transition-all duration-200 font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>

      {/* Overlay mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Toggle button — CSS transition, no JS animation */}
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
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(
    () => window.innerWidth >= 1024
  );
  const [isMobile, setIsMobile] = React.useState(
    () => window.innerWidth < 1024
  );

  React.useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // En escritorio siempre expandido al hacer resize a lg+
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

      {/* Main: ajuste de margen izquierdo con CSS transition (no JS) */}
      <main
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
        style={{
          marginLeft: !isMobile && sidebarOpen ? SIDEBAR_W : 0,
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Page title bar */}
        {(title || subtitle || headerAction) && (
          <div className="bg-haverts-base/60 backdrop-blur-md
                          border-b border-haverts-secondary/10
                          px-6 py-5 lg:py-6">
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
              {headerAction && <div>{headerAction}</div>}
            </div>
          </div>
        )}

        {/* Content */}
        <motion.div
          key={activeItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 overflow-auto p-4 lg:p-8"
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

/* ─── DashboardCard ────────────────────────────────────────────────────── */
/**
 * Card de sección — usa animate simple (no whileInView) para evitar
 * múltiples IntersectionObservers activos simultáneamente.
 */
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
    className={`bg-white/50 backdrop-blur-sm rounded-3xl
                border border-haverts-secondary/20 shadow-soft
                hover:shadow-medium transition-shadow duration-300
                p-6 sm:p-8 ${className}`}
  >
    {(title || subtitle || action) && (
      <div className="flex items-start justify-between mb-7">
        <div>
          {title && (
            <h3 className="text-xl font-bold text-haverts-primary
                           mb-0.5 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-[11px] text-haverts-primary/50
                          font-bold uppercase tracking-[0.18em]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div>{children}</div>
  </motion.div>
);