import React, { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';
import type { Toast } from '../types';

const ToastItem: React.FC<{ toast: Toast, onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 4000);

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);

    return (
        <div className="bg-brand-surface border border-brand-primary/20 rounded-lg shadow-lg p-3 flex items-start gap-3 animate-slide-in-up w-full">
            <Icon name="check-circle" className="text-brand-primary w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-brand-text flex-grow break-words">{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-brand-text-secondary hover:text-brand-text p-1 -m-1 rounded-full flex-shrink-0"
                aria-label="Close notification"
            >
                <Icon name="close" className="w-4 h-4" />
            </button>
        </div>
    );
};


export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (!toasts.length) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-[100] w-full max-w-xs space-y-2" role="region" aria-live="polite">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};