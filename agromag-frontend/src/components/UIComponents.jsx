/**
 * UIComponents.jsx
 * Sistema de componentes UI compartidos y consistentes.
 * Centraliza: Spinner, PageHeader, EmptyState, Toast, ConfirmDialog.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import React from 'react';

/* ─── Spinner ──────────────────────────────────────────────────────────── */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div
        className={`${sizes[size]} rounded-full border-2
                    border-haverts-secondary/30 border-t-haverts-primary
                    animate-spin`}
      />
    </div>
  );
};

/* ─── EmptyState ───────────────────────────────────────────────────────── */
export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'Sin resultados',
  description = 'No hay elementos que mostrar.',
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-haverts-secondary/10 flex items-center justify-center mb-5">
      <Icon className="w-7 h-7 text-haverts-secondary" />
    </div>
    <h3 className="text-base font-bold text-haverts-primary mb-1">{title}</h3>
    <p className="text-sm text-haverts-primary/50 max-w-xs leading-relaxed">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ─── PageHeader ───────────────────────────────────────────────────────── */
/**
 * Header de sección reutilizable para todas las páginas del dashboard.
 * Reemplaza los 4+ bloques hero copy-paste en cada página.
 */
export const PageHeader = ({ label, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    className="bg-white/60 backdrop-blur-sm border border-haverts-secondary/20
               shadow-soft rounded-3xl px-6 py-6 sm:px-8 sm:py-7"
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {label && (
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]
                        text-haverts-primary/50 mb-2">
            {label}
          </p>
        )}
        <h1 className="text-2xl lg:text-3xl font-display font-bold
                       text-haverts-primary tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-haverts-primary/60 font-medium max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  </motion.div>
);

/* ─── Toast System ─────────────────────────────────────────────────────── */
// Estado global sin Context (ligero, sin re-renders globales)
const _state = { toasts: [], listeners: new Set() };
const _notify = () => _state.listeners.forEach(fn => fn([..._state.toasts]));

export const toast = {
  _add(message, type) {
    const id = Date.now();
    _state.toasts = [..._state.toasts, { id, message, type }];
    _notify();
    setTimeout(() => toast.dismiss(id), 4200);
    return id;
  },
  success: (msg) => toast._add(msg, 'success'),
  error:   (msg) => toast._add(msg, 'error'),
  warning: (msg) => toast._add(msg, 'warning'),
  info:    (msg) => toast._add(msg, 'info'),
  dismiss(id) {
    _state.toasts = _state.toasts.filter(t => t.id !== id);
    _notify();
  },
};

const TOAST_STYLES = {
  success: 'bg-haverts-primary  text-haverts-base  border-haverts-primary/20',
  error:   'bg-red-600          text-white          border-red-400/20',
  warning: 'bg-haverts-contrast text-haverts-base  border-haverts-contrast/20',
  info:    'bg-slate-700        text-white          border-slate-600/20',
};

export const ToastContainer = () => {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    _state.listeners.add(setToasts);
    return () => _state.listeners.delete(setToasts);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{    opacity: 0, x: 40,  scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={`pointer-events-auto flex items-center gap-3
                        px-5 py-3.5 rounded-2xl border shadow-medium
                        text-sm font-semibold max-w-[340px]
                        ${TOAST_STYLES[t.type]}`}
          >
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/* ─── ConfirmDialog ────────────────────────────────────────────────────── */
/**
 * Reemplaza window.confirm() nativo con un modal animado.
 * Uso: const { confirm, ConfirmModal } = useConfirm();
 *      await confirm('¿Eliminar este elemento?')
 */
export const useConfirm = () => {
  const [state, setState] = React.useState({
    open: false, message: '', resolve: null,
  });

  const confirm = React.useCallback((message) => {
    return new Promise(resolve => {
      setState({ open: true, message, resolve });
    });
  }, []);

  const close = (result) => {
    state.resolve?.(result);
    setState({ open: false, message: '', resolve: null });
  };

  const ConfirmModal = () => (
    <AnimatePresence>
      {state.open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]"
            onClick={() => close(false)}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       z-[301] bg-haverts-base rounded-3xl shadow-medium
                       p-8 w-full max-w-sm border border-haverts-secondary/20"
          >
            <p className="text-haverts-primary font-semibold text-center leading-relaxed mb-7">
              {state.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => close(false)}
                className="flex-1 py-3 rounded-2xl border border-haverts-secondary/30
                           text-haverts-primary/70 font-bold text-sm
                           hover:bg-haverts-secondary/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => close(true)}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white
                           font-bold text-sm hover:bg-red-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return { confirm, ConfirmModal };
};
