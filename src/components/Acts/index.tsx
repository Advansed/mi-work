// ============================================
// ЭКСПОРТЫ МОДУЛЯ ACTS
// ============================================

// Основные компоненты
export { default as ActOrderForm } from './OrderActForm';

// Типы
export interface ActOrderFormData {
    actNumber?: string;
    date?: string;
    street?: string;
    house?: string;
    apartment?: string;
    subscriber?: string;
    equipment?: string;
    reason?: string;
}

export interface ActOrderFormProps {
    initialData?: ActOrderFormData;
    onBack?: () => void;
    isModal?: boolean;
}

// CSS (импортируется автоматически при использовании компонентов)
import './OrderActForm.css';