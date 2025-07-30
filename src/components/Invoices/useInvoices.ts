import { useState, useEffect, useCallback, useMemo } from 'react';
import { getData, useStoreField } from '../Store';
import { 
    Invoice, 
    InvoiceStatus, 
    InvoicesResponse, 
    UseInvoicesReturn, 
    InvoicePosition, 
    InvoiceNavigation 
} from './types';

export const useInvoices = (): UseInvoicesReturn => {
    // Получаем данные авторизации из Store
    const loginData = useStoreField('login', 2);
    
    // Основное состояние
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Навигация
    const [navigation, setNavigation] = useState<InvoiceNavigation>({
        position: 0,
        selectedInvoiceId: null,
        canGoBack: false
    });

    // Загрузка заявок
    const loadInvoices = useCallback(async () => {
        if (!loginData?.token) {
            setError('Нет токена авторизации');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getData('get_invoices', {
                token: loginData.token
            }) as InvoicesResponse;

            console.log('Invoices response:', response);
            
            if (response.success && response.data) {
                setInvoices(response.data);
            } else {
                setError(response.message || 'Ошибка загрузки заявок');
            }
        } catch (err) {
            console.error('Error loading invoices:', err);
            setError('Ошибка соединения. Проверьте интернет.');
        } finally {
            setLoading(false);
        }
    }, [loginData?.token]);

    // Обновление заявок (pull-to-refresh)
    const refreshInvoices = useCallback(async () => {
        if (!loginData?.token) return;

        setRefreshing(true);
        setError(null);

        try {
            const response = await getData('get_invoices', {
                token: loginData.token
            }) as InvoicesResponse;

            if (response.success && response.data) {
                setInvoices(response.data);
            } else {
                setError(response.message || 'Ошибка обновления заявок');
            }
        } catch (err) {
            console.error('Error refreshing invoices:', err);
            setError('Ошибка соединения');
        } finally {
            setRefreshing(false);
        }
    }, [loginData?.token]);

    // Очистка ошибки
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Определение статуса заявки по срокам
    const getInvoiceStatus = useCallback((invoice: Invoice): InvoiceStatus => {
        const now = new Date();
        const termDate = new Date(invoice.term_end);
        const diffHours = (termDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (diffHours < 0) {
            return {
                type: 'overdue',
                label: 'Просрочена',
                color: 'danger',
                priority: 3
            };
        } else if (diffHours <= 24) {
            return {
                type: 'urgent',
                label: 'Срочная',
                color: 'warning',
                priority: 2
            };
        } else {
            return {
                type: 'normal',
                label: 'Обычная',
                color: 'success',
                priority: 1
            };
        }
    }, []);

    // Форматирование даты
    const formatDate = useCallback((dateString: string): string => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Сегодня, ' + date.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffDays === 1) {
            return 'Вчера, ' + date.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffDays < 7) {
            return `${diffDays} дн. назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    }, []);

    // Форматирование телефона (используем функцию Phone из Store если нужно)
    const formatPhone = useCallback((phone: string): string => {
        if (!phone) return '';
        
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('7')) {
            return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
        }
        return phone;
    }, []);

    // Сортированный список заявок (по приоритету и дате)
    const sortedInvoices = useMemo(() => {
        const result = [...invoices];

        // Сортировка по приоритету и дате
        result.sort((a, b) => {
            const statusA = getInvoiceStatus(a);
            const statusB = getInvoiceStatus(b);
            
            // Сначала по приоритету (срочные вверху)
            if (statusA.priority !== statusB.priority) {
                return statusB.priority - statusA.priority;
            }
            
            // Потом по дате (новые вверху)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return result;
    }, [invoices, getInvoiceStatus]);

    // Выбранная заявка
    const selectedInvoice = useMemo(() => {
        if (!navigation.selectedInvoiceId) return null;
        return invoices.find(invoice => invoice.id === navigation.selectedInvoiceId) || null;
    }, [invoices, navigation.selectedInvoiceId]);

    // Методы навигации
    const navigateToPosition = useCallback((position: InvoicePosition, invoiceId?: string) => {
        setNavigation(prev => ({
            position,
            selectedInvoiceId: invoiceId || prev.selectedInvoiceId,
            canGoBack: position > 0
        }));
    }, []);

    const goBack = useCallback(() => {
        setNavigation(prev => {
            const newPosition = Math.max(0, prev.position - 1) as InvoicePosition;
            return {
                ...prev,
                position: newPosition,
                canGoBack: newPosition > 0
            };
        });
    }, []);

    const selectInvoice = useCallback((invoiceId: string) => {
        setNavigation({
            position: 1,
            selectedInvoiceId: invoiceId,
            canGoBack: true
        });
    }, []);

    // Загрузка при монтировании
    useEffect(() => {
        if (loginData?.token) {
            loadInvoices();
        }
    }, [loadInvoices, loginData?.token]);

    return {
        invoices: sortedInvoices,
        loading,
        refreshing,
        error,
        navigation,
        selectedInvoice,
        loadInvoices,
        refreshInvoices,
        clearError,
        getInvoiceStatus,
        formatDate,
        formatPhone,
        navigateToPosition,
        goBack,
        selectInvoice
    };
};