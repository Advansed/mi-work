// src/components/Toast/ToastManager.tsx
import React, { useState, useEffect } from 'react';
import { IonToast } from '@ionic/react';
import { useStoreField } from '../Store';
import './Toast.css'

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    action?: {
        text: string;
        handler: () => void;
    };
}

const ToastManager: React.FC = () => {
    const [activeToasts, setActiveToasts] = useState<ToastMessage[]>([]);
    
    // Подписываемся на toast сообщения из Store
    const toastData: any = useStoreField('toast', 1);
    
    useEffect(() => {
        console.log("toast data ")
        if (toastData && toastData.message) {
            const newToast: ToastMessage = {
                id:         Date.now().toString(),
                type:       toastData.type || 'info',
                message:    toastData.message,
                duration:   toastData.duration || 3000,
                action:     toastData.action
            };
            
            setActiveToasts(prev => [...prev, newToast]);
        }
    }, [toastData]);
    
    const handleToastDismiss = (id: string) => {
        setActiveToasts(prev => prev.filter(toast => toast.id !== id));
    };
    
    const getToastColor = (type: string) => {
        switch (type) {
            case 'success': return 'success';
            case 'error': return 'danger';
            case 'warning': return 'warning';
            case 'info': return 'primary';
            default: return 'medium';
        }
    };
    
    const getToastIcon = (type: string) => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            case 'info': return 'information-circle';
            default: return 'notifications';
        }
    };
    
    return (
        <>
            {activeToasts.map((toast) => (
                <IonToast
                    key={toast.id}
                    isOpen={true}
                    message={toast.message}
                    duration={toast.duration}
                    color={getToastColor(toast.type)}
                    position="top"
                    icon={getToastIcon(toast.type)}
                    buttons={toast.action ? [
                        {
                            text: toast.action.text,
                            role: 'cancel',
                            handler: toast.action.handler
                        }
                    ] : undefined}
                    onDidDismiss={() => handleToastDismiss(toast.id)}
                    className={`toast-${toast.type}`}
                />
            ))}
        </>
    );
};

export default ToastManager;