import { useState, useCallback } from 'react';
import { produce } from 'immer';
import { getData, Store } from '../../Store';
import { useToast } from '../../Toast/useToast';

// ==========================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ==========================================

export interface ActCompletedData {
  id?: string;
  invoice_id?: string;
  act_number?: string;
  act_date: string;
  
  // Исполнитель работ
  executor_name: string;
  executor_position: string;
  
  // Заказчик/абонент
  client_name: string;
  address: string;
  
  // Описание выполненных работ
  work_description: string;
  equipment_used: string;
  work_started_date: string;
  work_completed_date: string;
  
  // Оценка качества
  quality_assessment: string;
  defects_found: string;
  recommendations: string;
  
  // Подписи сторон
  executor_signature: string;
  client_signature: string;
  representative_signature: string;
  
  // Дополнительные сведения
  notes: string;
}

export type CompletedFormErrors = Partial<Record<keyof ActCompletedData, string>>;

// ==========================================
// НАЧАЛЬНЫЕ ДАННЫЕ
// ==========================================

const initialData: ActCompletedData = {
  id: '',
  invoice_id: '',
  act_number: '',
  act_date: new Date().toISOString().split('T')[0],
  
  // Исполнитель
  executor_name: '',
  executor_position: '',
  
  // Заказчик
  client_name: '',
  address: '',
  
  // Работы
  work_description: '',
  equipment_used: '',
  work_started_date: new Date().toISOString().split('T')[0],
  work_completed_date: new Date().toISOString().split('T')[0],
  
  // Качество
  quality_assessment: '',
  defects_found: '',
  recommendations: '',
  
  // Подписи
  executor_signature: '',
  client_signature: '',
  representative_signature: '',
  
  // Примечания
  notes: ''
};

// ==========================================
// ГЛАВНЫЙ ХУК
// ==========================================

export const useCompleted = (actId?: string) => {
  const [data, setData] = useState<ActCompletedData>(initialData);
  const [errors, setErrors] = useState<CompletedFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  // ============================================
  // ОПТИМИЗИРОВАННЫЕ ОБРАБОТЧИКИ С IMMER
  // ============================================

  // Главный обработчик изменения полей - БЕЗ ЗАВИСИМОСТЕЙ!
  const handleFieldChange = useCallback((field: keyof ActCompletedData, value: string) => {
    setData(produce(draft => {
      // Immer автоматически проверит изменения и создаст новый объект только при необходимости
      draft[field] = value;
    }));
  }, []); // Пустой массив зависимостей - функция стабильна!

  // Отдельная функция для очистки ошибок - тоже оптимизирована
  const clearFieldError = useCallback((field: keyof ActCompletedData) => {
    setErrors(produce(draft => {
      // Удаляем ошибку только если она существует
      if (draft[field]) {
        delete draft[field];
      }
    }));
  }, []);

  // Комбинированная функция - изменение поля + очистка ошибки
  const updateField = useCallback((field: keyof ActCompletedData, value: string) => {
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
  // МАССОВОЕ ОБНОВЛЕНИЕ ПОЛЕЙ
  // ============================================

  const updateMultipleFields = useCallback((updates: Partial<ActCompletedData>) => {
    setData(produce(draft => {
      // Immer эффективно применит только реальные изменения
      Object.assign(draft, updates);
    }));
  }, []);

  // ============================================
  // ВАЛИДАЦИЯ ФОРМЫ
  // ============================================

  const validateForm = useCallback((): boolean => {
    const newErrors: CompletedFormErrors = {};
    
    // Обязательные поля
    const requiredFields: (keyof ActCompletedData)[] = [
      'act_date',
      'executor_name',
      'client_name',
      'work_description'
    ];

    requiredFields.forEach(field => {
      if (!data[field] || data[field]!.toString().trim() === '') {
        newErrors[field] = 'Поле обязательно для заполнения';
      }
    });

    // Валидация дат
    if (data.act_date && new Date(data.act_date) > new Date()) {
      newErrors.act_date = 'Дата акта не может быть в будущем';
    }

    if (data.work_started_date && new Date(data.work_started_date) > new Date()) {
      newErrors.work_started_date = 'Дата начала работ не может быть в будущем';
    }

    if (data.work_completed_date && new Date(data.work_completed_date) > new Date()) {
      newErrors.work_completed_date = 'Дата окончания работ не может быть в будущем';
    }

    // Проверка логики дат
    if (data.work_started_date && data.work_completed_date) {
      if (new Date(data.work_started_date) > new Date(data.work_completed_date)) {
        newErrors.work_completed_date = 'Дата окончания не может быть раньше даты начала';
      }
    }

    // Валидация длины текстовых полей
    if (data.work_description && data.work_description.length < 10) {
      newErrors.work_description = 'Описание работ должно содержать не менее 10 символов';
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
      
      const result = await getData('COMPLETED_GET', params);
      
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
  // СОХРАНЕНИЕ АКТА
  // ============================================

  const saveAct = useCallback(async (): Promise<ActCompletedData | null> => {
    if (!validateForm()) {
      return null;
    }
    setSaving(true);

    try {
      const method = 'COMPLETED_CREATE';
      const params = data;
      
      const result = await getData(method, params);

      if (result.success) {
        showSuccess("Акт выполненных работ сохранен");
        
        // Обновляем данные результатом с сервера
        setData(produce(draft => {
          Object.assign(draft, result.data);
        }));
        
        return result.data;
      } else {
        showError(result.message || "Ошибка сохранения акта");
        return null;
      }

    } catch (error) {
      console.error('Ошибка сохранения акта:', error);
      showError("Ошибка сохранения акта");
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
  const getFieldValue = useCallback((field: keyof ActCompletedData): string => {
    return data[field] || '';
  }, [data]);

  // Получение ошибки поля (мемоизированное)  
  const getFieldError = useCallback((field: keyof ActCompletedData): string => {
    return errors[field] || '';
  }, [errors]);

  // Предустановка данных исполнителя из профиля пользователя
  const setExecutorFromProfile = useCallback(() => {
    const userState = Store.getState().login;
    if (userState.userProfile) {
      updateMultipleFields({
        executor_name: userState.userProfile.full_name || '',
        executor_position: userState.userProfile.position || ''
      });
    }
  }, [updateMultipleFields]);

  // Автозаполнение качественной оценки
  const setDefaultQualityAssessment = useCallback(() => {
    if (!data.quality_assessment) {
      updateField('quality_assessment', 'Работы выполнены в соответствии с техническими требованиями');
    }
  }, [data.quality_assessment, updateField]);

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
    
    // Массовые операции
    updateMultipleFields, // Массовое обновление
    
    // API операции
    validateForm,
    loadActByInvoice,
    saveAct,
    
    // Утилиты
    resetForm,
    getFieldValue,       // Вместо getValue
    getFieldError,       // Вместо getError
    setExecutorFromProfile, // Автозаполнение исполнителя
    setDefaultQualityAssessment, // Автозаполнение оценки
    
    // Прямой доступ к состоянию (если нужно)
    setData,             
    setErrors            
  };
};