import { useState, useCallback } from 'react';
import { produce } from 'immer';
import { getData, Store } from '../../Store';
import { useToast } from '../../Toast/useToast';

// Типы остаются те же
export interface ActShutdownData {
  id?: string;
  invoice_id?: string;
  act_number?: string;
  act_date: string;
  
  // Представитель и причина
  representative_name: string;
  reason: string;
  
  // Объект отключения
  equipment: string;
  apartment: string;
  house: string;
  street: string;
  subscriber_name: string;
  
  // Административные данные
  order_issued_by: string;
  order_received_by: string;
  
  // Выполнение работ
  executor_name: string;
  execution_date: string;
  execution_time: string;
  disconnected_equipment: string;
  execution_apartment: string;
  execution_house: string;
  execution_street: string;
  
  // Подключение (опциональные)
  reconnection_date?: string;
  reconnection_representative?: string;
  reconnection_supervisor?: string;
  reconnection_apartment?: string;
  reconnection_house?: string;
  reconnection_street?: string;
  reconnection_subscriber?: string;
  
}

export type ShutdownFormErrors = Partial<Record<keyof ActShutdownData, string>>;
export type AddressCopyDirection = 'to_execution' | 'to_reconnection';

// Начальные данные
const initialData: ActShutdownData = {
  id:                           '',
  act_date:                     new Date().toISOString().split('T')[0],
  representative_name:          '',
  reason:                       '',
  equipment:                    '',
  apartment:                    '',
  house:                        '',
  street:                       '',
  subscriber_name:              '',
  order_issued_by:              '',
  order_received_by:            '',
  executor_name:                '',
  execution_date:               '',
  execution_time:               '',
  disconnected_equipment:       '',
  execution_apartment:          '',
  execution_house:              '',
  execution_street:             '',
  reconnection_date:            '',
  reconnection_representative:  '',
  reconnection_supervisor:      '',
  reconnection_apartment:       '',
  reconnection_house:           '',
  reconnection_street:          '',
  reconnection_subscriber:      ''
};

export const useShutdownAct = (actId?: string) => {
  const [data, setData] = useState<ActShutdownData>(initialData);
  const [errors, setErrors] = useState<ShutdownFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  // ============================================
  // ОПТИМИЗИРОВАННЫЕ ОБРАБОТЧИКИ С IMMER
  // ============================================

  // Главный обработчик изменения полей - БЕЗ ЗАВИСИМОСТЕЙ!
  const handleFieldChange = useCallback((field: keyof ActShutdownData, value: string) => {
    setData(produce(draft => {
      // Immer автоматически проверит изменения и создаст новый объект только при необходимости
      draft[field] = value;
    }));
  }, []); // Пустой массив зависимостей - функция стабильна!

  // Отдельная функция для очистки ошибок - тоже оптимизирована
  const clearFieldError = useCallback((field: keyof ActShutdownData) => {
    setErrors(produce(draft => {
      // Удаляем ошибку только если она существует
      if (draft[field]) {
        delete draft[field];
      }
    }));
  }, []);

  // Комбинированная функция - изменение поля + очистка ошибки
  const updateField = useCallback((field: keyof ActShutdownData, value: string) => {
    // Обновляем данные
    setData(produce(draft => {
      draft[field] = value;
    }));
    
    // Очищаем ошибку если она была
    setErrors(produce(draft => {
      if (draft[field]) {
        delete draft[field];
      }
    }));
  }, []);

  // ============================================
  // КОПИРОВАНИЕ АДРЕСНЫХ ДАННЫХ С IMMER
  // ============================================

  const copyAddressData = useCallback((direction: AddressCopyDirection) => {
    setData(produce(draft => {
      if (direction === 'to_execution') {
        // Копируем адресные данные в секцию выполнения
        draft.execution_apartment = draft.apartment;
        draft.execution_house = draft.house;
        draft.execution_street = draft.street;
      } else if (direction === 'to_reconnection') {
        // Копируем адресные данные в секцию подключения
        draft.reconnection_apartment = draft.apartment;
        draft.reconnection_house = draft.house;
        draft.reconnection_street = draft.street;
        draft.reconnection_subscriber = draft.subscriber_name;
      }
    }));
  }, []);

  // ============================================
  // МАССОВОЕ ОБНОВЛЕНИЕ ПОЛЕЙ
  // ============================================

  const updateMultipleFields = useCallback((updates: Partial<ActShutdownData>) => {
    setData(produce(draft => {
      // Immer эффективно применит только реальные изменения
      Object.assign(draft, updates);
    }));
  }, []);

  // ============================================
  // ВАЛИДАЦИЯ (БЕЗ ИЗМЕНЕНИЙ)
  // ============================================

  const validateForm = useCallback((): boolean => {
    const newErrors: ShutdownFormErrors = {};
    
    // Обязательные поля
    const requiredFields: (keyof ActShutdownData)[] = [
      'act_date',
      'representative_name',
      'reason',
      'equipment',
      'apartment',
      'house',
      'street',
      'subscriber_name'
    ];

    requiredFields.forEach(field => {
      if (!data[field] || data[field]!.toString().trim() === '') {
        newErrors[field] = 'Поле обязательно для заполнения';
      }
    });

    // Валидация дат
    if (data.execution_date && new Date(data.execution_date) > new Date()) {
      newErrors.execution_date = 'Дата выполнения не может быть в будущем';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]); // Единственная зависимость - data

  // ============================================
  // ЗАГРУЗКА ДАННЫХ С IMMER
  // ============================================

  const loadActByInvoice = useCallback(async (invoiceId: string) => {
    setLoading(true);
    try {
      const params = { invoice_id: invoiceId, user_id: Store.getState().login.userId };
      
      const result = await getData('SHUTDOWN_ORDER_GET', params);
      
      if (result.success) {
        const actData = result.data;
      
        // Используем Immer для установки загруженных данных
        setData(produce(draft => {
          // Сбрасываем к начальным данным и применяем загруженные
          Object.assign(draft, initialData, actData);
        }));
      }
    } catch (error) {
      console.error('Ошибка загрузки акта по заявке:', error);
      // При ошибке создаем новый акт с invoice_id
      setData(produce(draft => {
        Object.assign(draft, initialData, { invoice_id: invoiceId });
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // СОХРАНЕНИЕ (БЕЗ ИЗМЕНЕНИЙ)
  // ============================================

  const saveAct = useCallback(async (): Promise<ActShutdownData | null> => {
    if (!validateForm()) {
      return null;
    }

    setSaving(true);

    try {
      const method = 'SHUTDOWN_ORDER_CREATE';
      const params = data;
      
      const result = await getData(method, params);

      if (result.success) {
        showSuccess("Данные сохранены");
        
        // Обновляем данные результатом с сервера
        setData(produce(draft => {
          Object.assign(draft, result.data);
        }));
      } else {
        showError("Ошибка сохранения данных");
      }

      return result;

    } catch (error) {
      console.error('Ошибка сохранения акта:', error);
      showError("Ошибка сохранения данных");
      throw error;
    } finally {
      setSaving(false);
    }
  }, [data, validateForm, showSuccess, showError]);

  // ============================================
  // ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ С IMMER
  // ============================================

  // Сброс формы
  const resetForm = useCallback((keepInvoiceId = false) => {
    setData(produce(draft => {
      const invoiceId = keepInvoiceId ? draft.invoice_id : undefined;
      Object.assign(draft, initialData, invoiceId ? { invoice_id: invoiceId } : {});
    }));
    setErrors({});
  }, []);

  // Получение значения поля (мемоизированное)
  const getFieldValue = useCallback((field: keyof ActShutdownData): string => {
    return data[field] || '';
  }, [data]);

  // Получение ошибки поля (мемоизированное)  
  const getFieldError = useCallback((field: keyof ActShutdownData): string => {
    return errors[field] || '';
  }, [errors]);

  // ============================================
  // ВОЗВРАТ ХУКА
  // ============================================

  return {
    // Состояние
    data,
    errors,
    loading,
    saving,
    
    // Основные методы (оптимизированные)
    handleFieldChange,    // Стабильная ссылка!
    updateField,          // Изменение + очистка ошибки
    clearFieldError,      // Отдельная очистка ошибок
    
    // Групповые операции
    copyAddressData,      // Копирование адреса
    updateMultipleFields, // Массовое обновление
    
    // API операции
    validateForm,
    loadActByInvoice,
    saveAct,
    
    // Утилиты
    resetForm,
    getFieldValue,       // Вместо getValue
    getFieldError,       // Вместо getError
    setData,             // Для прямого доступа если нужно
    setErrors            // Для прямого доступа если нужно
  };
};