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
    
    // Refs для cleanup и отмены запросов
    const mountedRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);
    
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
            // Отменяем активный запрос при размонтировании
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Очистка ошибок
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Общая функция загрузки заявок с корректной отменой запросов
    const fetchInvoicesData = useCallback(async (isRefresh = false): Promise<void> => {
        if (!loginData?.token) {
            const errorMsg = 'Нет токена авторизации';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        // Отменяем предыдущий запрос
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Создаем новый AbortController
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Устанавливаем состояние загрузки
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await getData('get_invoices', {
                token: loginData.token
            }) as InvoicesResponse;

            // Проверяем, что компонент все еще смонтирован и запрос не отменен
            if (!mountedRef.current || abortController.signal.aborted) {
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
        } catch (err: any) {
            // Проверяем, что компонент все еще смонтирован и это не отмена запроса
            if (!mountedRef.current || err.name === 'AbortError') {
                return;
            }

            console.error('Error loading invoices:', err);
            const errorMsg = 'Ошибка соединения при загрузке заявок';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            // Проверяем, что компонент все еще смонтирован
            if (mountedRef.current) {
                setLoading(false);
                setRefreshing(false);
            }
            
            // Очищаем ссылку на AbortController
            if (abortControllerRef.current === abortController) {
                abortControllerRef.current = null;
            }
        }
    }, [loginData?.token, showError]);

    // Основная функция загрузки
    const loadInvoices = useCallback(() => {
        return fetchInvoicesData(false);
    }, [fetchInvoicesData]);

    // Функция обновления
    const refreshInvoices = useCallback(() => {
        return fetchInvoicesData(true);
    }, [fetchInvoicesData]);

    // Валидация позиции навигации
    const isValidPosition = useCallback((position: any): position is InvoicePosition => {
        return typeof position === 'number' && position >= 0 && position <= 3;
    }, []);

    // Мемоизированная сортировка заявок
    const sortedInvoices = useMemo(() => {
        return [...invoices].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // Новые сначала
        });
    }, [invoices]);

    // Мемоизированный поиск выбранной заявки
    const selectedInvoice = useMemo(() => {
        if (!navigation.selectedInvoiceId) return null;
        return invoices.find(invoice => invoice.id === navigation.selectedInvoiceId) || null;
    }, [invoices, navigation.selectedInvoiceId]);

    // Определение статуса заявки
    const getInvoiceStatus = useCallback((invoice: Invoice): InvoiceStatus => {
        if (!invoice.term_end || !invoice.date) {
            return {
                type: 'normal',
                label: 'Обычная',
                color: 'success',
                priority: 1
            };
        }

        try {
            const termEnd = new Date(invoice.term_end);
            const now = new Date();
            const diffDays = Math.ceil((termEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                return {
                    type: 'overdue',
                    label: 'Просрочена',
                    color: 'danger',
                    priority: 3
                };
            } else if (diffDays <= 3) {
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

    // Завершенная функция formatDate
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
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks} нед. назад`;
            } else if (diffDays < 365) {
                const months = Math.floor(diffDays / 30);
                return `${months} мес. назад`;
            } else {
                // Для старых дат показываем полную дату
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

    // Форматирование телефона
    const formatPhone = useCallback((phone: string): string => {
        if (!phone || typeof phone !== 'string') return '';
        
        // Убираем все символы кроме цифр
        const digits = phone.replace(/\D/g, '');
        
        if (digits.length === 11 && digits.startsWith('7')) {
            // Российский номер: +7 (999) 999-99-99
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
        } else if (digits.length === 10) {
            // Номер без кода страны: (999) 999-99-99
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
        } else {
            // Возвращаем как есть, если формат неизвестен
            return phone;
        }
    }, []);

    // Навигация по позициям
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
    }, [loginData?.token, loadInvoices]);

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