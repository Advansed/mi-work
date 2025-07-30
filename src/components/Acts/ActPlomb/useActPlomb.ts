import { useState, useCallback } from 'react';
import { getData, Store } from '../../Store';
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
  apartment: '',
  house: '',
  street: '',
  subscriber_name: '',
  usd_representative: '',
  representative_position: '',
  received_date: '',
  meters: []
};

const createNewMeter = (sequence: number): PlombMeter => ({
  meter_number: '',
  seal_number: '',
  current_reading: undefined,
  meter_type: '',
  notes: '',
  sequence_order: sequence
});

export const useActPlomb = (actId?: string) => {
  const [data, setData] = useState<ActPlombData>(initialData);
  const [errors, setErrors] = useState<PlombFormErrors>({ meters: {} });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

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
  }, [errors]);

  // Добавление счетчика
  const addMeter = useCallback(() => {
    const nextSequence = Math.max(0, ...data.meters.map(m => m.sequence_order)) + 1;
    if (nextSequence <= 10) {
      setData(prev => ({
        ...prev,
        meters: [...prev.meters, createNewMeter(nextSequence)]
      }));
    }
  }, [data.meters]);

  // Удаление счетчика
  const removeMeter = useCallback((index: number) => {
    setData(prev => ({
      ...prev,
      meters: prev.meters
        .filter((_, i) => i !== index)
        .map((meter, i) => ({ ...meter, sequence_order: i + 1 }))
    }));

    // Очистка ошибок для удаленного счетчика
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors.meters) {
        delete newErrors.meters[index];
        // Пересчитываем индексы ошибок
        const updatedMeterErrors: { [index: number]: Partial<Record<keyof PlombMeter, string>> } = {};
        Object.entries(newErrors.meters).forEach(([idx, err]) => {
          const numIdx = parseInt(idx);
          if (numIdx < index) {
            updatedMeterErrors[numIdx] = err;
          } else if (numIdx > index) {
            updatedMeterErrors[numIdx - 1] = err;
          }
        });
        newErrors.meters = updatedMeterErrors;
      }
      return newErrors;
    });
  }, []);

  // Валидация формы
  const validateForm = useCallback((): boolean => {
    const newErrors: PlombFormErrors = {};
    
    // Обязательные основные поля
    const requiredFields: (keyof ActPlombData)[] = [
      'act_date',
      'house', 
      'street',
      'subscriber_name',
      'usd_representative',
    ];

    requiredFields.forEach(field => {
      if (!data[field] || data[field]!.toString().trim() === '') {
        newErrors[field] = 'Поле обязательно для заполнения';
      }
    });

    // Валидация счетчиков
    if (data.meters.length === 0) {
      newErrors.meters = { 0: { meter_number: 'Необходимо добавить хотя бы один счетчик' } };
    } else {
      const meterErrors: { [index: number]: Partial<Record<keyof PlombMeter, string>> } = {};
      
      data.meters.forEach((meter, index) => {
        const errors: Partial<Record<keyof PlombMeter, string>> = {};
        
        if (!meter.meter_number.trim()) {
          errors.meter_number = 'Номер счетчика обязателен';
        }
        
        if (!meter.seal_number.trim()) {
          errors.seal_number = 'Номер пломбы обязателен';
        }

        if (Object.keys(errors).length > 0) {
          meterErrors[index] = errors;
        }
      });

      if (Object.keys(meterErrors).length > 0) {
        newErrors.meters = meterErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  // Загрузка акта по invoice_id
  const loadActByInvoice = useCallback(async (invoiceId: string) => {
    setLoading(true);
    try {
      const params = { 
        invoice_id: invoiceId, 
        user_id: Store.getState().login.userId 
      };
      
      const result = await getData('PLOMB_ACT_GET', params);
      
      if (result.success && result.data) {
        const actData = result.data;
        setData({
          ...actData,
          meters: actData.meters || []
        });
      } else {
        // Создаем новый акт с invoice_id
        setData({ ...initialData, invoice_id: invoiceId });
      }
    } catch (error) {
      console.error('Ошибка загрузки акта по заявке:', error);
      setData({ ...initialData, invoice_id: invoiceId });
    } finally {
      setLoading(false);
    }
  }, []);

  // Сохранение акта
  const saveAct = useCallback(async (): Promise<ActPlombData | null> => {
    if (!validateForm()) {
      return null;
    }

    setSaving(true);
    try {
      const result = await getData('PLOMB_ACT_CREATE', data);

      if (result.success) {
          showSuccess("Акт сохранен")
      } else {
          showError("Не получилось сохранить")
      }
      return result
    } catch (error) {
      console.error('Ошибка сохранения акта:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [data, validateForm]);

  return {
    // Состояние
    data,
    errors,
    loading,
    saving,
    
    // Методы
    handleFieldChange,
    handleMeterChange,
    addMeter,
    removeMeter,
    validateForm,
    loadActByInvoice,
    saveAct,
    
    // Утилиты
    setData,
    setErrors
  };
};