import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getData, useStoreField } from '../Store';
import { 
    Invoice, 
    InvoiceStatus, 
    InvoicesResponse, 
    UseInvoicesReturn, 
    InvoicePosition, 
    InvoiceNavigation 
} from './types';
import { useToast } from '../Toast/useToast';

export const useInvoices = (): UseInvoicesReturn => {
    // Получаем данные авторизации из Store
    const loginData = useStoreField('login', 2);
    
    // Основное состояние
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showError } = useToast();
    
    // Refs для cleanup
    const mountedRef = useRef(true);
    const lastRequestRef = useRef<number>(0);
    
    // Навигация
    const [navigation, setNavigation] = useState<InvoiceNavigation>({
        position: 0,
        selectedInvoiceId: null,
        canGoBack: false
    });

    // Cleanup при размонтировании
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Очистка ошибок
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Общая функция загрузки заявок
    const fetchInvoicesData = useCallback(async (isRefresh = false): Promise<void> => {
        if (!loginData?.token) {
            const errorMsg = 'Нет токена авторизации';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        // Устанавливаем состояние загрузки
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        // Уникальный ID запроса для дебаунсинга
        const requestId = Date.now();
        lastRequestRef.current = requestId;

        try {
            const response = await getData('get_invoices', {
                token: loginData.token
            }) as InvoicesResponse;

            // Проверяем, что компонент все еще смонтирован и это последний запрос
            if (!mountedRef.current || lastRequestRef.current !== requestId) {
                return;
            }

            console.log('Invoices response:', response);
            
            if (response.success && response.data) {
                setInvoices(response.data);
                setError(null);
            } else {
                const errorMsg = response.message || 'Ошибка загрузки заявок';
                setError(errorMsg);
                showError(errorMsg);
            }
        } catch (err) {
            // Проверяем, что компонент все еще смонтирован
            if (!mountedRef.current || lastRequestRef.current !== requestId) {
                return;
            }

            console.error('Error loading invoices:', err);
            const errorMsg = 'Ошибка соединения. Проверьте интернет.';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            // Проверяем, что компонент все еще смонтирован
            if (mountedRef.current && lastRequestRef.current === requestId) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [loginData?.token, showError]);

    // Загрузка заявок
    const loadInvoices = useCallback(async () => {
        await fetchInvoicesData(false);
    }, [fetchInvoicesData]);

    // Обновление заявок (pull-to-refresh)
    const refreshInvoices = useCallback(async () => {
        await fetchInvoicesData(true);
    }, [fetchInvoicesData]);

    // Определение статуса заявки по срокам
    const getInvoiceStatus = useCallback((invoice: Invoice): InvoiceStatus => {
        if (!invoice || !invoice.term_end) {
            return {
                type: 'normal',
                label: 'Обычная',
                color: 'success',
                priority: 1
            };
        }

        try {
            const now = new Date();
            const termDate = new Date(invoice.term_end);
            
            // Проверяем валидность даты
            if (isNaN(termDate.getTime())) {
                return {
                    type: 'normal',
                    label: 'Обычная',
                    color: 'success',
                    priority: 1
                };
            }

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
        } catch (err) {
            console.error('Error calculating invoice status:', err);
            return {
                type: 'normal',
                label: 'Обычная',
                color: 'success',
                priority: 1
            };
        }
    }, []);

    // Форматирование даты с проверками
    const formatDate = useCallback((dateString: string): string => {
        if (!dateString || typeof dateString !== 'string') return '';
        
        try {
            const date = new Date(dateString);
            
            // Проверяем валидность даты
            if (isNaN(date.getTime())) return dateString;
            
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
        } catch (err) {
            console.error('Error formatting date:', err);
            return dateString;
        }
    }, []);

    // Форматирование телефона с проверками
    const formatPhone = useCallback((phone: string): string => {
        if (!phone || typeof phone !== 'string') return '';
        
        try {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 11 && cleaned.startsWith('7')) {
                return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
            }
            return phone;
        } catch (err) {
            console.error('Error formatting phone:', err);
            return phone;
        }
    }, []);

    // Сортированный список заявок (оптимизировано)
    const sortedInvoices = useMemo(() => {
        if (!Array.isArray(invoices) || invoices.length === 0) return [];

        return [...invoices].sort((a, b) => {
            try {
                const statusA = getInvoiceStatus(a);
                const statusB = getInvoiceStatus(b);
                
                // Сначала по приоритету (срочные вверху)
                if (statusA.priority !== statusB.priority) {
                    return statusB.priority - statusA.priority;
                }
                
                // Потом по дате (новые вверху)
                const dateA = new Date(a.date || 0).getTime();
                const dateB = new Date(b.date || 0).getTime();
                return dateB - dateA;
            } catch (err) {
                console.error('Error sorting invoices:', err);
                return 0;
            }
        });
    }, [invoices, getInvoiceStatus]);

    // Выбранная заявка
    const selectedInvoice = useMemo(() => {
        if (!navigation.selectedInvoiceId || !Array.isArray(invoices)) return null;
        return invoices.find(invoice => invoice?.id === navigation.selectedInvoiceId) || null;
    }, [invoices, navigation.selectedInvoiceId]);

    // Валидация позиции навигации
    const isValidPosition = useCallback((position: number): position is InvoicePosition => {
        return Number.isInteger(position) && position >= 0 && position <= 3;
    }, []);

    // Методы навигации с валидацией
    const navigateToPosition = useCallback((position: InvoicePosition, invoiceId?: string) => {
        if (!isValidPosition(position)) {
            console.error('Invalid navigation position:', position);
            return;
        }

        // Проверяем, что при переходе на детальную страницу есть ID заявки
        if (position > 0 && !invoiceId && !navigation.selectedInvoiceId) {
            console.error('Cannot navigate to position', position, 'without invoice ID');
            return;
        }

        setNavigation(prev => ({
            position,
            selectedInvoiceId: invoiceId || prev.selectedInvoiceId,
            canGoBack: position > 0
        }));
    }, [navigation.selectedInvoiceId, isValidPosition]);

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
        if (!invoiceId || typeof invoiceId !== 'string') {
            console.error('Invalid invoice ID:', invoiceId);
            return;
        }

        setNavigation({
            position: 1,
            selectedInvoiceId: invoiceId,
            canGoBack: true
        });
    }, []);

    // Загрузка при монтировании с дебаунсингом
    useEffect(() => {
        if (loginData?.token) {
            const timeoutId = setTimeout(() => {
                loadInvoices();
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [loginData?.token]);

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