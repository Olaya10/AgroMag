import { motion } from 'framer-motion';
import { 
  LogOut, 
  Menu, 
  X, 
  Users, 
  Leaf, 
  Package, 
  Zap, 
  BarChart3,
  ChevronRight
} from 'lucide-react';
import React from 'react';

/**
 * Sidebar del Dashboard con navegación y cierre de sesión
 */
export const DashboardSidebar = ({ 
  items = [], 
  activeItem, 
  onItemClick, 
  user,
  onLogout,
  isOpen = true,
  onToggle
}) => {
  const [expanded, setExpanded] = React.useState(isOpen);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setExpanded(isOpen);
  }, [isOpen]);

  React.useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle();
    } else {
      setExpanded((prev) => !prev);
    }
  };

  const closeSidebar = () => {
    if (onToggle) {
      onToggle();
    } else {
      setExpanded(false);
    }
  };

  const iconMap = {
    usuarios: Users,
    finca: Leaf,
    insumos: Package,
    operaciones: Zap,
    reportes: BarChart3,
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: expanded ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed md:static top-0 left-0 h-screen w-72 bg-gradient-to-b from-white to-agro-soft shadow-medium flex flex-col z-40 md:translate-x-0"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agro-emerald to-green-600 flex items-center justify-center shadow-soft">
                <span className="text-white font-bold">🌿</span>
              </div>
              <h1 className="font-display font-bold text-lg text-agro-forest">AgroMag</h1>
            </div>
            <button
              onClick={closeSidebar}
              className="md:hidden p-2 hover:bg-agro-soft rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-agro-emerald/10 rounded-xl p-3"
            >
              <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">
                Bienvenido
              </p>
              <p className="text-sm font-semibold text-agro-forest truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {user.role?.toLowerCase() || 'usuario'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {items.map((item, i) => {
            const Icon = iconMap[item.key] || Leaf;
            const isActive = activeItem === item.key;

            return (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 5 }}
                onClick={() => {
                  onItemClick(item.key);
                  if (isMobile) {
                    closeSidebar();
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-agro-emerald text-white shadow-medium'
                    : 'text-slate-600 hover:bg-white hover:text-agro-forest'
                }`}
              >
                {/* Animación de fondo activo */}
                {isActive && (
                  <motion.div
                    layoutId="activeBackground"
                    className="absolute inset-0 bg-gradient-to-r from-agro-emerald to-green-600"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}

                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="p-6 border-t border-slate-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Overlay en mobile */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 md:hidden z-30"
        />
      )}

      {/* Toggle button para mobile y desktop */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-soft hover:shadow-medium"
      >
        {expanded ? <X className="w-6 h-6 text-agro-forest" /> : <Menu className="w-6 h-6 text-agro-forest" />}
      </motion.button>
    </>
  );
};

/**
 * Layout principal del dashboard
 */
export const DashboardLayout = ({
  children,
  sidebarItems = [],
  activeItem,
  onSidebarItemClick,
  user,
  onLogout,
  title,
  subtitle,
  headerAction
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen bg-agro-light overflow-hidden"
    >
      {/* Sidebar */}
      <DashboardSidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={onSidebarItemClick}
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {(title || subtitle || headerAction) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-b border-slate-200 px-6 py-6 shadow-soft"
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                {title && (
                  <h1 className="text-3xl font-display font-bold text-agro-forest">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-slate-600 mt-1 font-light">{subtitle}</p>
                )}
              </div>
              {headerAction && <div>{headerAction}</div>}
            </div>
          </motion.div>
        )}

        {/* Content area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 overflow-auto"
        >
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

/**
 * Card para secciones dentro del dashboard
 */
export const DashboardCard = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  action 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card p-6 sm:p-8 ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600 font-light">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </motion.div>
  );
};
