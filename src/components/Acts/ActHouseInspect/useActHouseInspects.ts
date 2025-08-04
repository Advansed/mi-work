import { useState, useCallback } from 'react';
import { getData, Store } from '../../Store';
import { useToast } from '../../Toast/useToast';

// ============================================
// ТИПЫ И ИНТЕРФЕЙСЫ
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
// УТИЛИТЫ
// ============================================

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

export const useActHouseInspects = () => {
  // === СОСТОЯНИЕ ===
  const [data, setData] = useState<HouseInspectData>(initialData);
  const [errors, setErrors] = useState<HouseInspectErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // === УТИЛИТЫ ===
  const { showSuccess, showError } = useToast();

  // ============================================
  // МЕТОДЫ ОБНОВЛЕНИЯ ДАННЫХ
  // ============================================

  // Функция обновления простых полей с очисткой ошибки
  const updateField = useCallback((fieldName: string, value: any) => {
    setData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    if (errors[fieldName as keyof HouseInspectErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName as keyof HouseInspectErrors];
        return newErrors;
      });
    }
  }, [errors]);

  // Основная функция обновления полей (поддерживает вложенные пути)
  const handleFieldChange = useCallback((fieldPath: string, value: any) => {
    setData(prev => {
      const newData = { ...prev };
      const pathParts = fieldPath.split('.');
      
      if (pathParts.length === 1) {
        (newData as any)[pathParts[0]] = value;
      } else if (pathParts.length === 3 && pathParts[0] === 'meters') {
        const meterIndex = parseInt(pathParts[1]);
        const fieldName = pathParts[2];
        
        if (newData.meters[meterIndex]) {
          (newData.meters[meterIndex] as any)[fieldName] = value;
        }
      }
      
      return newData;
    });
  }, []);

  // Функция обновления полей счетчиков
  const handleMeterChange = useCallback((index: number, field: keyof HouseMeterData, value: any) => {
    setData(prev => ({
      ...prev,
      meters: prev.meters.map((meter, i) =>
        i === index ? { ...meter, [field]: value } : meter
      )
    }));
  }, []);

  // ============================================
  // МЕТОДЫ РАБОТЫ СО СЧЕТЧИКАМИ
  // ============================================

  const addMeter = useCallback(() => {
    setData(prev => ({
      ...prev,
      meters: [...prev.meters, createNewMeter(prev.meters.length + 1)]
    }));
  }, []);

  const removeMeter = useCallback((index: number) => {
    setData(prev => ({
      ...prev,
      meters: prev.meters.filter((_, i) => i !== index)
    }));
  }, []);

  // ============================================
  // ВАЛИДАЦИЯ
  // ============================================

  const validateForm = useCallback((): boolean => {
    const newErrors: HouseInspectErrors = {};

    // Основные поля
    if (!data.act_number?.trim()) {
      newErrors.act_number = 'Номер акта обязателен';
    }

    if (!data.act_date) {
      newErrors.act_date = 'Дата акта обязательна';
    }

    if (!data.account_number?.trim()) {
      newErrors.account_number = 'Лицевой счет обязателен';
    }

    if (!data.address?.trim()) {
      newErrors.address = 'Адрес обязателен';
    }

    if (!data.organization_representative?.trim()) {
      newErrors.organization_representative = 'Представитель организации обязателен';
    }

    if (!data.subscriber_name?.trim()) {
      newErrors.subscriber_name = 'Имя абонента обязательно';
    }

    // Валидация счетчиков
    const meterErrors: { [index: number]: Partial<Record<keyof HouseMeterData, string>> } = {};
    
    data.meters.forEach((meter, index) => {
      const meterError: Partial<Record<keyof HouseMeterData, string>> = {};
      
      if (meter.meter_number && !meter.meter_type) {
        meterError.meter_type = 'Тип счетчика обязателен';
      }
      if (meter.meter_type && !meter.meter_number) {
        meterError.meter_number = 'Номер счетчика обязателен';
      }
      
      if (Object.keys(meterError).length > 0) {
        meterErrors[index] = meterError;
      }
    });

    if (Object.keys(meterErrors).length > 0) {
      newErrors.meters = meterErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  // ============================================
  // API МЕТОДЫ
  // ============================================

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
          meters: actData.meters || []
        });
        showSuccess('Данные акта загружены');
      } else {
        // Создаем новый акт с invoice_id и предзаполнением
        const loginData = Store.getState().login;
        setData({ 
          ...initialData, 
          invoice_id: invoiceId,
          organization_representative: loginData?.full_name || '',
          meters: []
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки акта по заявке:', error);
      showError('Ошибка загрузки данных акта');
      setData({ ...initialData, invoice_id: invoiceId, meters: [] });
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

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
  // ВОЗВРАТ ХУКА
  // ============================================

  return {
    // Состояние
    data,
    errors,
    loading,
    saving,
    
    // Методы
    updateField,
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