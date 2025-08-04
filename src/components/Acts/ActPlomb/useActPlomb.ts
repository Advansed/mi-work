import { useState, useCallback } from 'react';
import { getData } from '../../Store';
import { useToast } from '../../Toast/useToast';

// Типы данных
export interface PlombMeter {
  id?: string;
  meter_number: string;
  seal_number: string;
  current_reading?: number;
  meter_type?: string;
  notes?: string;
  sequence_order: number;
}

export interface ActPlombData {
  id?: string;
  invoice_id?: string;
  act_number?: string;
  act_date: string;
  
  // Адрес
  address: string;
  apartment: string;
  house: string;
  street: string;
  subscriber_name: string;
  
  // Представитель УСД
  usd_representative: string;
  representative_position: string;
  
  // Дата получения
  received_date?: string;
  
  // Счетчики
  meters: PlombMeter[];
}

export type PlombFormErrors = Partial<Record<Exclude<keyof ActPlombData, 'meters'>, string>> & {
  meters?: { [index: number]: Partial<Record<keyof PlombMeter, string>> };
};

// Начальные данные
const initialData: ActPlombData = {
  id: '',
  act_date: new Date().toISOString().split('T')[0],
  address: '',
  apartment: '',
  house: '',
  street: '',
  subscriber_name: '',
  usd_representative: '',
  representative_position: '',
  received_date: '',
  meters: [createNewMeter(1)]
};

function createNewMeter(sequence: number): PlombMeter {
  return {
    meter_number: '',
    seal_number: '',
    current_reading: undefined,
    meter_type: '',
    notes: '',
    sequence_order: sequence
  };
}

export const useActPlomb = (actId?: string) => {
  const [data, setData] = useState<ActPlombData>(initialData);
  const [errors, setErrors] = useState<PlombFormErrors>({ meters: {} });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  // === НОВЫЕ HELPER ФУНКЦИИ ===
  const updateField = useCallback((field: keyof ActPlombData, value: string) => {
    if (field === 'meters') return; // Метры обрабатываются отдельно
    
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очистка ошибки для поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const getFieldValue = useCallback((field: keyof ActPlombData) => {
    return (data as any)[field] || '';
  }, [data]);

  const getFieldError = useCallback((field: keyof ActPlombData) => {
    return (errors as any)[field] || '';
  }, [errors]);

  // Обработчик изменения основных полей
  const handleFieldChange = useCallback((field: keyof ActPlombData, value: string) => {
    if (field === 'meters') return; // Метры обрабатываются отдельно
    
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очистка ошибки для поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Обработчик изменения данных счетчика
  const handleMeterChange = useCallback((index: number, field: keyof PlombMeter, value: string | number) => {
    setData(prev => ({
      ...prev,
      meters: prev.meters.map((meter, i) => 
        i === index ? { ...meter, [field]: value } : meter
      )
    }));

    // Очистка ошибки для поля счетчика
    if (errors.meters?.[index]?.[field]) {
      setErrors(prev => ({
        ...prev,
        meters: {
          ...prev.meters || {},
          [index]: {
            ...prev.meters?.[index] || {},
            [field]: undefined
          }
        }
      }));
    }
  }, [errors.meters]);

  // Добавление нового счетчика
  const addMeter = useCallback(() => {
    setData(prev => ({
      ...prev,
      meters: [...prev.meters, createNewMeter(prev.meters.length + 1)]
    }));
  }, []);

  // Удаление счетчика
  const removeMeter = useCallback((index: number) => {
    if (data.meters.length <= 1) return; // Минимум один счетчик должен остаться

    setData(prev => ({
      ...prev,
      meters: prev.meters.filter((_, i) => i !== index).map((meter, i) => ({
        ...meter,
        sequence_order: i + 1
      }))
    }));

    // Удаление ошибок для удаленного счетчика
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors.meters) {
        delete newErrors.meters[index];
        // Переиндексация ошибок
        const reindexedErrors: typeof newErrors.meters = {};
        Object.entries(newErrors.meters).forEach(([key, value]) => {
          const oldIndex = parseInt(key);
          if (oldIndex < index) {
            reindexedErrors[oldIndex] = value;
          } else if (oldIndex > index) {
            reindexedErrors[oldIndex - 1] = value;
          }
        });
        newErrors.meters = reindexedErrors;
      }
      return newErrors;
    });
  }, [data.meters.length]);

  // Загрузка акта по заявке
  const loadActByInvoice = useCallback(async (invoiceId: string) => {
    try {
      setLoading(true);
      setErrors({ meters: {} });

      const response = await getData('PLOMB_ACT_GET', { invoice_id: invoiceId });
      
      if (response.success && response.data) {
        setData({
          ...response.data,
          meters: response.data.meters?.length > 0 ? response.data.meters : [createNewMeter(1)]
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки акта:', error);
      showError('Ошибка загрузки данных акта');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Валидация данных
  const validateData = useCallback((): boolean => {
    const newErrors: PlombFormErrors = { meters: {} };
    let hasErrors = false;

    // Проверка основных полей
    if (!data.act_date) {
      newErrors.act_date = 'Дата акта обязательна';
      hasErrors = true;
    }

    if (!data.street.trim()) {
      newErrors.street = 'Улица обязательна';
      hasErrors = true;
    }

    if (!data.house.trim()) {
      newErrors.house = 'Номер дома обязателен';
      hasErrors = true;
    }

    if (!data.apartment.trim()) {
      newErrors.apartment = 'Номер квартиры обязателен';
      hasErrors = true;
    }

    if (!data.subscriber_name.trim()) {
      newErrors.subscriber_name = 'ФИО абонента обязательно';
      hasErrors = true;
    }

    if (!data.usd_representative.trim()) {
      newErrors.usd_representative = 'ФИО представителя обязательно';
      hasErrors = true;
    }

    // Проверка счетчиков
    data.meters.forEach((meter, index) => {
      const meterErrors: Partial<Record<keyof PlombMeter, string>> = {};
      
      if (!meter.meter_number.trim()) {
        meterErrors.meter_number = 'Номер счетчика обязателен';
        hasErrors = true;
      }

      if (!meter.seal_number.trim()) {
        meterErrors.seal_number = 'Номер пломбы обязателен';
        hasErrors = true;
      }

      if (Object.keys(meterErrors).length > 0) {
        newErrors.meters![index] = meterErrors;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [data]);

  // Сохранение акта
  const saveAct = useCallback(async (): Promise<ActPlombData | null> => {
    if (!validateData()) {
      showError('Пожалуйста, исправьте ошибки в форме');
      return null;
    }

    try {
      setSaving(true);

      const saveData = {
        ...data,
        address: `${data.street}, ${data.house}, кв. ${data.apartment}`.trim()
      };

      const response = await getData('PLOMB_ACT_CREATE', saveData);

      if (response.success) {
        const savedData = response.data;
        setData(savedData);
        showSuccess(`Акт пломбирования ${data.id ? 'обновлен' : 'создан'} успешно`);
        return savedData;
      } else {
        throw new Error(response.message || 'Ошибка сохранения');
      }
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      showError(error.message || 'Ошибка сохранения акта');
      return null;
    } finally {
      setSaving(false);
    }
  }, [data, validateData, showSuccess, showError]);

  return {
    data,
    errors,
    loading,
    saving,
    updateField,           // Новая функция
    getFieldValue,         // Новая функция  
    getFieldError,         // Новая функция
    handleFieldChange,
    handleMeterChange,
    addMeter,
    removeMeter,
    loadActByInvoice,
    saveAct
  };
};