// ============================================
// ЭКСПОРТЫ МОДУЛЯ ACTS
// ============================================

// Основные компоненты
export { default as ActOrderForm } from './OrderActForm';

// Типы
// Типы (приведены в соответствие с PDF модулем)
export interface ActOrderFormData {
    actNumber: string;
    date: string;
    representative: {
        name: string;
        position: string;
        reason: string;
    };
    order: {
        equipment: string;
        apartment: string;
        house: string;
        street: string;
        subscriber: string;
        orderGiver: {
            name: string;
            position: string;
        };
        orderReceiver: {
            name: string;
            position: string;
        };
    };
    execution: {
        executor: string;
        executionDate: string;
        executionTime: string;
        disconnectedEquipment: string;
        representativeSignature: {
            name: string;
            position: string;
        };
        subscriberSignature: {
            name: string;
            position: string;
        };
    };
    reconnection: {
        reconnectionDate: string;
        reconnectionBy: string;
        reconnectionOrder: string;
        apartment: string;
        house: string;
        street: string;
        subscriber: string;
        representativeSignature: {
            name: string;
            position: string;
        };
        subscriberSignature: {
            name: string;
            position: string;
        };
    };
}

export interface ActOrderFormProps {
    initialData?: Partial<ActOrderFormData>;
    onBack?: () => void;
    isModal?: boolean;
    onDataChange?: (data: ActOrderFormData) => void;
    showPDFActions?: boolean;
}


// CSS (импортируется автоматически при использовании компонентов)
import './OrderActForm.css';