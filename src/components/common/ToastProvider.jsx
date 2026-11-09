
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ArrowUpRight,
} from 'lucide-react';

import '../../styles/toast.css';

const ToastContext = createContext(null);

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 4000;

const TOAST_TYPES = {
  success: {
    Icon: CheckCircle2,
    label: 'Success',
  },
  error: {
    Icon: AlertCircle,
    label: 'Error',
  },
  warning: {
    Icon: AlertTriangle,
    label: 'Warning',
  },
  info: {
    Icon: Info,
    label: 'Information',
  },
};

/* Individual notification */
function ToastItem({ item, onDismiss }) {
  const timerRef = useRef(null);
  const remainingRef = useRef(item.duration);
  const startedRef = useRef(0);

  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);

  const [paused, setPaused] = useState(false);

  const { Icon, label } =
    TOAST_TYPES[item.type] || TOAST_TYPES.info;

  /* Pause auto-dismiss timer */
  const pauseTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);

      timerRef.current = null;

      remainingRef.current = Math.max(
        0,
        remainingRef.current -
          (Date.now() - startedRef.current)
      );
    }

    setPaused(true);
  }, []);

  /* Resume auto-dismiss timer */
  const resumeTimer = useCallback(() => {
    if (item.duration === 0) return;

    if (timerRef.current !== null) {
      setPaused(false);
      return;
    }

    startedRef.current = Date.now();

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onDismiss(item.id);
    }, remainingRef.current);

    setPaused(false);
  }, [item.duration, item.id, onDismiss]);

  /* Start and clean up timer */
  useEffect(() => {
    remainingRef.current = item.duration;
    setPaused(false);

    if (item.duration > 0) {
      startedRef.current = Date.now();

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        onDismiss(item.id);
      }, item.duration);
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = null;
    };
  }, [
    item.id,
    item.version,
    item.duration,
    onDismiss,
  ]);

  /* Run optional action */
  const handleAction = () => {
    onDismiss(item.id);
    item.onAction?.();
  };

  /* Mouse and keyboard interaction */
  const handleMouseEnter = () => {
    hoveredRef.current = true;
    pauseTimer();
  };

  const handleMouseLeave = () => {
    hoveredRef.current = false;

    if (!focusedRef.current) {
      resumeTimer();
    }
  };

  const handleFocus = () => {
    focusedRef.current = true;
    pauseTimer();
  };

  const handleBlur = (event) => {
    if (
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      focusedRef.current = false;

      if (!hoveredRef.current) {
        resumeTimer();
      }
    }
  };

  return (
    <div
      className={`jnr-toast jnr-toast--${item.type}`}
      role={item.type === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
      data-paused={paused}
      style={{
        '--jnr-toast-duration': `${item.duration}ms`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      {/* Icon */}
      <span className="jnr-toast__icon-wrap">
        <Icon
          className="jnr-toast__icon"
          size={19}
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>

      {/* Content */}
      <div className="jnr-toast__content">
        <strong className="jnr-toast__title">
          {item.title || label}
        </strong>

        {item.message && (
          <p className="jnr-toast__message">
            {item.message}
          </p>
        )}

        {item.actionLabel &&
          typeof item.onAction === 'function' && (
            <button
              className="jnr-toast__action"
              type="button"
              onClick={handleAction}
            >
              {item.actionLabel}

              <ArrowUpRight
                size={14}
                aria-hidden="true"
              />
            </button>
          )}
      </div>

      {/* Close */}
      <button
        className="jnr-toast__close"
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Close notification"
      >
        <X
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {/* Auto dismiss progress */}
      {item.duration > 0 && (
        <div
          className="jnr-toast__progress"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/* Global notification provider */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const sequenceRef = useRef(0);

  /* Remove notification */
  const dismissToast = useCallback((id) => {
    setItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }, []);

  /* Clear all notifications */
  const clearToasts = useCallback(() => {
    setItems([]);
  }, []);

  /* Create notification */
  const showToast = useCallback(
    (message, options = {}) => {
      const version = ++sequenceRef.current;

      const id =
        options.id ?? `jnr-toast-${version}`;

      const duration =
        options.duration === 0
          ? 0
          : Number.isFinite(options.duration)
            ? Math.max(1000, options.duration)
            : DEFAULT_DURATION;

      const next = {
        id,
        version,

        type: TOAST_TYPES[options.type]
          ? options.type
          : 'info',

        title: options.title,
        message: String(message ?? ''),
        duration,

        actionLabel: options.actionLabel,
        onAction: options.onAction,
      };

      setItems((previous) => [
        ...previous.filter((item) => item.id !== id),
        next,
      ].slice(-MAX_VISIBLE));

      return id;
    },
    []
  );

  /* Public toast API */
  const toast = useMemo(
    () => ({
      show: showToast,

      success: (message, options) =>
        showToast(message, {
          ...options,
          type: 'success',
        }),

      error: (message, options) =>
        showToast(message, {
          ...options,
          type: 'error',
        }),

      warning: (message, options) =>
        showToast(message, {
          ...options,
          type: 'warning',
        }),

      info: (message, options) =>
        showToast(message, {
          ...options,
          type: 'info',
        }),

      dismiss: dismissToast,
      clear: clearToasts,
    }),
    [showToast, dismissToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div
        className="jnr-toast-viewport"
        aria-label="Notifications"
      >
        {items.map((item) => (
          <ToastItem
            key={`${item.id}:${item.version}`}
            item={item}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* Toast hook */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast must be used within ToastProvider'
    );
  }

  return context;
}
