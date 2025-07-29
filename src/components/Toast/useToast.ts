// src/components/Toast/useToast.ts
import { useCallback } from 'react';
import { Store } from '../Store';

export interface ToastOptions {
    duration?: number;
    action?: {
        text: string;
        handler: () => void;
    };
}

export const useToast = () => {
    
    const showSuccess = useCallback((message: string, options?: ToastOptions) => {
        console.log("show success toast")
        Store.dispatch({
            type: 'toast',
            data: {
                type: 'success',
                message,
                duration: options?.duration || 3000,
                action: options?.action
            }
        });
    }, []);
    
    const showError = useCallback((message: string, options?: ToastOptions) => {
        Store.dispatch({
            type: 'toast',
            data: {
                type: 'error',
                message,
                duration: options?.duration || 4000,
                action: options?.action
            }
        });
    }, []);
    
    const showWarning = useCallback((message: string, options?: ToastOptions) => {
        Store.dispatch({
            type: 'toast',
            data: {
                type: 'warning',
                message,
                duration: options?.duration || 3500,
                action: options?.action
            }
        });
    }, []);
    
    const showInfo = useCallback((message: string, options?: ToastOptions) => {
        Store.dispatch({
            type: 'toast',
            data: {
                type: 'info',
                message,
                duration: options?.duration || 3000,
                action: options?.action
            }
        });
    }, []);
    
    // Универсальный метод
    const showToast = useCallback((
        type: 'success' | 'error' | 'warning' | 'info',
        message: string,
        options?: ToastOptions
    ) => {
        Store.dispatch({
            type: 'toast',
            data: {
                type,
                message,
                duration: options?.duration || 3000,
                action: options?.action
            }
        });
    }, []);
    
    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showToast
    };
};