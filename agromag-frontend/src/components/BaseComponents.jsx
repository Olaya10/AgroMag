import { motion } from 'framer-motion';
import React from 'react';

/**
 * Navbar transparente con efecto backdrop-blur
 * Se fija al hacer scroll automáticamente
 */
export const Navbar = ({ logo = 'AgroMag', onLoginClick, isLoggedIn = false, onLogout }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-haverts-base/80 backdrop-blur-md shadow-soft border-b border-haverts-secondary/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-haverts-primary flex items-center justify-center shadow-soft">
              <span className="text-haverts-base font-bold text-lg">🌿</span>
            </div>
            <span className="font-display font-bold text-xl text-haverts-primary tracking-tight hidden sm:block">
              {logo}
            </span>
          </motion.div>

          {/* Botones de acción */}
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="btn-primary"
              >
                Iniciar Sesión
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="btn-ghost"
              >
                Cerrar Sesión
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

/**
 * Tarjeta de características con efecto hover flotante
 */
export const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, delay }}
      className="card p-6 sm:p-8 border border-haverts-secondary/10 bg-haverts-base/40 backdrop-blur-sm"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-12 h-12 rounded-xl bg-haverts-secondary/20 flex items-center justify-center mb-4 border border-haverts-secondary/30"
      >
        {Icon && <Icon className="w-6 h-6 text-haverts-primary" />}
      </motion.div>
      <h3 className="text-lg font-bold text-haverts-primary mb-2 tracking-tight">{title}</h3>
      <p className="text-haverts-primary/70 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

/**
 * Tarjeta de vidrio con efecto Glassmorphism
 */
export const GlassCard = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-haverts-base/60 backdrop-blur-md rounded-3xl border border-haverts-secondary/20 shadow-soft hover:shadow-medium transition-all duration-300 p-6 sm:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * Botón animado con brillo pulsante
 */
export const GlowButton = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseClasses = variant === 'primary' ? 'btn-primary' : 'btn-cta';
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative ${baseClasses} overflow-hidden group ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, x: '-100%' }}
        whileHover={{ opacity: 1, x: '100%' }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-white/10"
      />
      <span className="relative">{children}</span>
    </motion.button>
  );
};

/**
 * Contenedor con animación fade-in al hacer scroll
 */
export const ScrollReveal = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: '-100px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Layout principal con sidebar
 */
export const DashboardLayout = ({ children, sidebar }) => {
  return (
    <div className="flex h-screen bg-haverts-base">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex md:w-64 bg-haverts-base border-r border-haverts-secondary/20 shadow-soft flex-col"
      >
        {sidebar}
      </motion.aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

/**
 * Footer premium con diseño orgánico
 */
export const Footer = () => {
  return (
    <footer className="bg-haverts-base border-t border-haverts-secondary/20 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-haverts-primary flex items-center justify-center shadow-soft">
              <span className="text-haverts-base font-bold text-lg">🌿</span>
            </div>
            <span className="font-display font-bold text-2xl text-haverts-primary tracking-tight">
              AgroMag
            </span>
          </div>
          
          <p className="text-haverts-primary/50 text-sm font-medium tracking-wide">
            © {new Date().getFullYear()} AgroMag. Gestión agrícola inteligente para el futuro.
          </p>

          <div className="flex items-center gap-6">
            {['Privacidad', 'Términos', 'Contacto'].map((link) => (
              <a 
                key={link} 
                href="#" 
                className="text-haverts-primary/60 hover:text-haverts-primary transition-colors text-sm font-bold uppercase tracking-wider"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
