'use client';

import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} glass-surface rounded-2xl shadow-floating animate-slide-up ${className}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-muted hover:text-white" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Toast Component
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success-gradient',
      border: 'border-success/20'
    },
    error: {
      icon: AlertCircle,
      color: 'text-danger',
      bg: 'bg-danger-gradient',
      border: 'border-danger/20'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning-gradient',
      border: 'border-warning/20'
    },
    info: {
      icon: Info,
      color: 'text-secondary',
      bg: 'bg-secondary-gradient',
      border: 'border-secondary/20'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.animation = `shrink ${duration}ms linear forwards`;
    }
  }, [duration]);

  return (
    <div className={`glass-surface border ${config.border} rounded-xl p-4 shadow-floating animate-slide-right max-w-sm w-full`}>
      <div className="flex items-start space-x-3">
        <div className={`p-1 rounded-lg ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white">{title}</h4>
          {message && (
            <p className="text-sm text-muted mt-1">{message}</p>
          )}
          
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm text-primary hover:text-primary-hover font-medium mt-2"
            >
              {action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onClose(id)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          <X className="h-4 w-4 text-muted hover:text-white" />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
        <div
          ref={progressRef}
          className={`h-full ${config.bg} rounded-b-xl`}
          style={{
            width: '100%',
            transformOrigin: 'left'
          }}
        />
      </div>
    </div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose
}) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-toast space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id, onClose: removeToast };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast
  };
};

// Add CSS for progress animation
const progressCSS = `
@keyframes shrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = progressCSS;
  document.head.appendChild(style);
}

export default Modal;
