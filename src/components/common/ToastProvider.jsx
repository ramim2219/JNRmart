import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X, ArrowUpRight } from 'lucide-react';
import '../../styles/toast.css';

const ToastContext = createContext(null);
const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 4000;

const types = {
  success: { Icon: CheckCircle2, label: 'Success' },
  error: { Icon: AlertCircle, label: 'Error' },
  warning: { Icon: AlertTriangle, label: 'Notice' },
  info: { Icon: Info, label: 'Information' },
};

function ToastItem({ item, onDismiss }) {
  const timerRef = useRef(null);
  const remainingRef = useRef(item.duration);
  const startedRef = useRef(0);
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const { Icon, label } = types[item.type] || types.info;

  const pauseTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedRef.current));
  }, []);

  const resumeTimer = useCallback(() => {
    if (item.duration === 0 || timerRef.current !== null) return;
    startedRef.current = Date.now();
    timerRef.current = window.setTimeout(() => onDismiss(item.id), remainingRef.current);
  }, [item.duration, item.id, onDismiss]);

  useEffect(() => {
    remainingRef.current = item.duration;
    if (item.duration > 0) {
      startedRef.current = Date.now();
      timerRef.current = window.setTimeout(() => onDismiss(item.id), item.duration);
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [item.id, item.version, item.duration, onDismiss]);

  const handleAction = () => {
    onDismiss(item.id);
    item.onAction?.();
  };

  return (
    <div
      className={`jnr-toast jnr-toast--${item.type}`}
      role={item.type === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
      onMouseEnter={() => { hoveredRef.current = true; pauseTimer(); }}
      onMouseLeave={() => { hoveredRef.current = false; if (!focusedRef.current) resumeTimer(); }}
      onFocusCapture={() => { focusedRef.current = true; pauseTimer(); }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focusedRef.current = false;
          if (!hoveredRef.current) resumeTimer();
        }
      }}
    >
      <Icon className="jnr-toast__icon" size={19} strokeWidth={2} aria-hidden="true" />
      <div className="jnr-toast__content">
        <strong className="jnr-toast__title">{item.title || label}</strong>
        {item.message && <p className="jnr-toast__message">{item.message}</p>}
        {item.actionLabel && typeof item.onAction === 'function' && (
          <button className="jnr-toast__action" type="button" onClick={handleAction}>
            {item.actionLabel} <ArrowUpRight size={13} aria-hidden="true" />
          </button>
        )}
      </div>
      <button
        className="jnr-toast__close"
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const sequenceRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
  }, []);

  // Reusing an `id` replaces the earlier toast and restarts its timer.
  const showToast = useCallback((message, options = {}) => {
    const version = ++sequenceRef.current;
    const id = options.id ?? `jnr-toast-${version}`;
    const duration = options.duration === 0
      ? 0
      : Number.isFinite(options.duration) ? Math.max(1000, options.duration) : DEFAULT_DURATION;
    const next = {
      id,
      version,
      type: types[options.type] ? options.type : 'info',
      title: options.title,
      message: String(message ?? ''),
      duration,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    };
    setItems((previous) => [...previous.filter((item) => item.id !== id), next].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const toast = useMemo(() => ({
    show: showToast,
    success: (message, options) => showToast(message, { ...options, type: 'success' }),
    error: (message, options) => showToast(message, { ...options, type: 'error' }),
    warning: (message, options) => showToast(message, { ...options, type: 'warning' }),
    info: (message, options) => showToast(message, { ...options, type: 'info' }),
    dismiss: dismissToast,
    clear: () => setItems([]),
  }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="jnr-toast-viewport" aria-label="Notifications">
        {items.map((item) => (
          <ToastItem key={`${item.id}:${item.version}`} item={item} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
