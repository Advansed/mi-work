import { useState, useCallback } from 'react';
import { getData, Store } from '../../Store';
import { useToast } from '../../Toast/useToast';

// ============================================
// ТИПЫ ДАННЫХ
// ============================================

export interface HouseMeterData {
  id?: string;
  house_inspect_id?: string;
  sequence_order: number;
  meter_type?: string;
  meter_number: string;
  current_reading?: number;
  seal_number?: string;
  seal_color?: string;
  gas_equipment?: string;
  living_area?: number;
  non_living_area?: number;
  residents_count?: number;
  notes?: string;
}

export interface HouseInspectData {
  id?: string;
  invoice_id?: string;
  act_number?: string;
  act_date: string;
  act_time?: string;
  account_number?: string;
  address?: string;
  street?: string;
  house?: string;
  apartment?: string;
  organization_representative: string;
  subscriber_name: string;
  subscriber_document?: string;
  subscriber_representative_name?: string;
  subscriber_representative_document?: string;
  witness_name?: string;
  witness_document?: string;
  violations_found?: string;
  living_area?: number;
  non_living_area?: number;
  residents_count?: number;
  subscriber_opinion?: string;
  notes?: string;
  meters: HouseMeterData[];
}

export type HouseInspectErrors = Partial<Record<Exclude<keyof HouseInspectData, 'meters'>, string>> & {
  meters?: { [index: number]: Partial<Record<keyof HouseMeterData, string>> };
};

// ============================================
// УТИЛИТАРНЫЕ ФУНКЦИИ
// ============================================

// Преобразование даты для input[type="date"]
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return new Date().toISOString().split('T')[0];
};

// Преобразование времени для input[type="time"]
const formatTimeForInput = (timeString?: string): string => {
  if (!timeString) return new Date().toTimeString().slice(0, 5);
  
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  if (/^\d{2}:\d{2}:\d{2}/.test(timeString)) {
    return timeString.slice(0, 5);
  }
  
  return new Date().toTimeString().slice(0, 5);
};

// Начальные данные
export const initialData: HouseInspectData = {
  act_number: '',
  act_date: formatDateForInput(),
  act_time: formatTimeForInput(),
  account_number: '',
  address: '',
  street: '',
  house: '',
  apartment: '',
  organization_representative: '',
  subscriber_name: '',
  subscriber_document: '',
  subscriber_representative_name: '',
  subscriber_representative_document: '',
  witness_name: '',
  witness_document: '',
  violations_found: '',
  living_area: undefined,
  non_living_area: undefined,
  residents_count: undefined,
  subscriber_opinion: '',
  notes: '',
  meters: []
};

const createNewMeter = (sequence: number): HouseMeterData => ({
  meter_number: '',
  current_reading: undefined,
  meter_type: '',
  seal_number: '',
  seal_color: '',
  gas_equipment: '',
  living_area: undefined,
  non_living_area: undefined,
  residents_count: undefined,
  notes: '',
  sequence_order: sequence
});

// ============================================
// ОСНОВНОЙ ХУК
// ============================================

export const useActHouseInspects = (actId?: string) => {
  const [data, setData] = useState<HouseInspectData>(initialData);
  const [errors, setErrors] = useState<HouseInspectErrors>({ meters: {} });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  // ============================================
  // ОБРАБОТЧИКИ ПОЛЕЙ
  // ============================================

  // Обработчик изменения основных полей
  const handleFieldChange = useCallback((field: keyof HouseInspectData, value: string | number) => {
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
  const handleMeterChange = useCallback((index: number, field: keyof HouseMeterData, value: string | number) => {
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

  // ============================================
  // УПРАВЛЕНИЕ СЧЕТЧИКАМИ
  // ============================================

  // Добавление счетчика
  const addMeter = useCallback(() => {
    const nextSequence = Math.max(0, ...data.meters.map(m => m.sequence_order)) + 1;
    if (nextSequence <= 3) {
      setData(prev => ({
        ...prev,
        meters: [...prev.meters, createNewMeter(nextSequence)]
      }));
    } else {
      showError('Максимальное количество счетчиков - 3');
    }
  }, [data.meters, showError]);

  // Удаление счетчика
  const removeMeter = useCallback((index: number) => {
    if (data.meters.length <= 1) {
      showError('Должен быть хотя бы один счетчик');
      return;
    }

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
        const updatedMeterErrors: { [index: number]: Partial<Record<keyof HouseMeterData, string>> } = {};
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
  }, [data.meters.length, showError]);

  // ============================================
  // ВАЛИДАЦИЯ
  // ============================================

  // Валидация формы
  const validateForm = useCallback((): boolean => {
    const newErrors: HouseInspectErrors = {};
    
    // Обязательные основные поля
    const requiredFields: (keyof HouseInspectData)[] = [
      'act_date',
      'organization_representative',
      'subscriber_name'
    ];

    requiredFields.forEach(field => {
      const value = data[field];
      if (!value || value.toString().trim() === '') {
        newErrors[field] = 'Поле обязательно для заполнения';
      }
    });

    // Валидация формата даты
    if (data.act_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.act_date)) {
      newErrors.act_date = 'Дата должна быть в формате ГГГГ-ММ-ДД';
    }

    // Валидация времени
    if (data.act_time && !/^\d{2}:\d{2}$/.test(data.act_time)) {
      newErrors.act_time = 'Время должно быть в формате ЧЧ:ММ';
    }

    // Валидация счетчиков
    if (data.meters.length === 0) {
      newErrors.meters = { 0: { meter_number: 'Необходимо добавить хотя бы один счетчик' } };
    } else {
      const meterErrors: { [index: number]: Partial<Record<keyof HouseMeterData, string>> } = {};
      
      data.meters.forEach((meter, index) => {
        const errors: Partial<Record<keyof HouseMeterData, string>> = {};
        
        if (!meter.meter_number.trim()) {
          errors.meter_number = 'Номер счетчика обязателен';
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

  // ============================================
  // API МЕТОДЫ
  // ============================================

  // Загрузка акта по invoice_id
  const loadActByInvoice = useCallback(async (invoiceId: string) => {
    setLoading(true);
    try {
      const params = { 
        invoice_id: invoiceId, 
        user_id: Store.getState().login.userId 
      };
      
      const result = await getData('HOUSE_INSPECT_GET', params);
      
      if (result.success && result.data) {
        const actData = result.data;
        setData({
          ...actData,
          act_date: formatDateForInput(actData.act_date),
          act_time: formatTimeForInput(actData.act_time),
          meters: actData.meters || [createNewMeter(1)]
        });
        showSuccess('Данные акта загружены');
      } else {
        // Создаем новый акт с invoice_id и предзаполнением
        const loginData = Store.getState().login;
        setData({ 
          ...initialData, 
          invoice_id: invoiceId,
          organization_representative: loginData?.full_name || '',
          meters: [createNewMeter(1)]
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки акта по заявке:', error);
      showError('Ошибка загрузки данных акта');
      setData({ ...initialData, invoice_id: invoiceId, meters: [createNewMeter(1)] });
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  // Сохранение акта
  const saveAct = useCallback(async (): Promise<HouseInspectData | null> => {
    if (!validateForm()) {
      showError('Исправьте ошибки в форме');
      return null;
    }

    setSaving(true);
    try {
      // Подготовка данных для API
      const apiData = {
        ...data,
        act_time: data.act_time ? (
          data.act_time.length === 5 ? `${data.act_time}:00` : data.act_time
        ) : null
      };

      const result = await getData('HOUSE_INSPECT_CREATE', apiData);

      if (result.success) {
        const savedData = result.data;
        setData(savedData);
        showSuccess(`Акт проверки №${savedData.act_number || 'б/н'} успешно сохранен`);
        return savedData;
      } else {
        showError(result.message || 'Ошибка сохранения акта');
        return null;
      }
    } catch (error) {
      console.error('Ошибка сохранения акта:', error);
      showError('Ошибка сохранения данных');
      return null;
    } finally {
      setSaving(false);
    }
  }, [data, validateForm, showSuccess, showError]);

  // ============================================
  // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
  // ============================================


  // ============================================
  // ВОЗВРАТ ХУКА
  // ============================================

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