/**
 * Configuración de colores y tema de AgroMag
 * Paleta profesional para startup de Silicon Valley
 */

export const colors = {
  primary: {
    forest: '#1a2e1a',      // Verde bosque profundo
    emerald: '#10b981',     // Verde esmeralda vibrante
    light: '#f9faf8',       // Blanco hueso
    soft: '#f5f5f4',        // Gris ultra claro
    dark: '#0f0f0f',        // Casi negro
  },
  secondary: {
    slate: {
      50: '#f8f8f8',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    green: {
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
    },
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

/**
 * Variantes de animación comunes
 */
export const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  },
  slideIn: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
  },
};

/**
 * Configuración de sombras suaves
 */
export const shadows = {
  soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(16, 185, 129, 0.15)',
  glowStrong: '0 0 30px rgba(16, 185, 129, 0.25)',
};

/**
 * Utilitarios globales
 */
export const utils = {
  /**
   * Aplicar estilo de degradado a texto
   */
  gradientText: (from = 'from-agro-forest', to = 'to-agro-emerald') =>
    `bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent`,

  /**
   * Clase para efecto hover flotante
   */
  hoverFloat: 'hover:shadow-medium hover:-translate-y-2 transition-all duration-300',

  /**
   * Clase para transiciones suaves
   */
  smoothTransition: 'transition-all duration-300 ease-out',

  /**
   * Clase para centrar contenido
   */
  flexCenter: 'flex items-center justify-center',

  /**
   * Clase para contenedor responsivo
   */
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
};
