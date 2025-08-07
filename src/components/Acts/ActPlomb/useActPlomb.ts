import { useState, useCallback, useMemo } from 'react';
import { 
  generateActPlombPDF, 
  validateActPlombData,
  generateActPlombFilename,
  convertFormDataToActPlomb 
} from '../../PDF';
import { useToast } from '../../Toast/useToast';
import { getData } from '../../Store';

// === ТИПЫ ===
export interface PlombMeter {
  meter_number: string;
  seal_number: string;
  current_reading?: string;
  meter_type?: string;
  notes?: string;
  sequence_order?: number;
}

export interface ActPlombData {
  id?: string;
  act_number?: string;
  act_date: string;
  subscriber_name: string;
  address?: string;
  street: string;
  house: string;
  apartment: string;
  usd_representative: string;
  notes?: string;
  invoice_id?: string;
  meters: PlombMeter[];
  recipient_signature?: string;
  receipt_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlombFormErrors {
  act_date?: string;
  subscriber_name?: string;
  street?: string;
  house?: string;
  apartment?: string;
  usd_representative?: string;
  meters?: Record<number, Partial<Record<keyof PlombMeter, string>>>;
}

// === ФУНКЦИЯ СОЗДАНИЯ НОВОГО СЧЕТЧИКА ===
const createNewMeter = (sequenceOrder: number = 1): PlombMeter => ({
  meter_number: '',
  seal_number: '',
  current_reading: '',
  meter_type: '',
  notes: '',
  sequence_order: sequenceOrder
});

// === ГЛАВНЫЙ ХУК ===
export const useActPlomb = () => {
  // === СОСТОЯНИЯ ===
  const [data, setData] = useState<ActPlombData>({
    act_date: new Date().toISOString().split('T')[0],
    subscriber_name: '',
    street: '',
    house: '',
    apartment: '',
    usd_representative: '',
    notes: '',
    meters: [createNewMeter(1)]
  });

  const [errors, setErrors] = useState<PlombFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  // === УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ ПОЛЯ ===
  const updateField = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку для этого поля
    setErrors(prev => {
      if (prev[field as keyof PlombFormErrors]) {
        const newErrors = { ...prev };
        delete newErrors[field as keyof PlombFormErrors];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // === СТАБИЛЬНАЯ ФУНКЦИЯ ДЛЯ ОБРАБОТКИ ИЗМЕНЕНИЙ ===
  const handleFieldChange = useCallback((field: string) => {
    return (value: string) => updateField(field, value);
  }, [updateField]);

  // === РАБОТА СО СЧЕТЧИКАМИ ===
  const handleMeterChange = useCallback((index: number, field: keyof PlombMeter, value: string) => {
    setData(prev => ({
      ...prev,
      meters: prev.meters.map((meter, i) => 
        i === index ? { ...meter, [field]: value } : meter
      )
    }));

    // Очищаем ошибку для этого поля счетчика
    setErrors(prev => {
      if (prev.meters?.[index]?.[field]) {
        const newErrors = { ...prev };
        if (newErrors.meters && newErrors.meters[index]) {
          delete newErrors.meters[index][field];
          if (Object.keys(newErrors.meters[index]).length === 0) {
            delete newErrors.meters[index];
          }
        }
        return newErrors;
      }
      return prev;
    });
  }, []);

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

    // Очищаем ошибки для удаленного счетчика
    setErrors(prev => {
      if (prev.meters?.[index]) {
        const newErrors = { ...prev };
        if (newErrors.meters) {
          delete newErrors.meters[index];
        }
        return newErrors;
      }
      return prev;
    });
  }, []);

  // === ЗАГРУЗКА ДАННЫХ ===
  const loadActByInvoice = useCallback(async (invoiceId: string) => {
    if (!invoiceId) return;

    try {
      setLoading(true);
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

  // === ВАЛИДАЦИЯ ДАННЫХ ===
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

  // === СОХРАНЕНИЕ АКТА ===
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
        throw new Error(response.message || 'Неизвестная ошибка при сохранении');
      }
    } catch (error : any) {
      console.error('Ошибка сохранения:', error);
      showError(`Ошибка сохранения: ${error.message}`);
      return null;
    } finally {
      setSaving(false);
    }
  }, [data, validateData, showSuccess, showError]);

  // === PDF ФУНКЦИИ ===
  const generatePDF = useCallback(async (autoDownload: boolean = true): Promise<Blob | null> => {
    setPdfLoading(true);
    try {
      // Конвертируем данные формы в формат PDF
      const pdfData = convertFormDataToActPlomb(data);
      
      // Валидация данных
      const validation = validateActPlombData(pdfData);
      if (!validation.isValid) {
        showError(`Ошибки в данных:\n${validation.errors.join('\n')}`);
        return null;
      }

      // Генерируем PDF
      const filename = autoDownload ? generateActPlombFilename(pdfData) : undefined;
      const blob = await generateActPlombPDF(pdfData, filename);
      
      if (autoDownload) {
        showSuccess('PDF файл создан и скачан');
      }
      
      return blob;
    } catch (error: any) {
      console.error('Ошибка генерации PDF:', error);
      showError(`Ошибка создания PDF: ${error.message}`);
      return null;
    } finally {
      setPdfLoading(false);
    }
  }, [data, showSuccess, showError]);

  const previewPDF = useCallback(async (): Promise<string | null> => {
    setPdfLoading(true);
    try {
      const blob = await generatePDF(false);
      if (blob) {
        const url = URL.createObjectURL(blob);
        return url;
      }
      return null;
    } catch (error: any) {
      console.error('Ошибка предпросмотра PDF:', error);
      showError(`Ошибка создания предпросмотра: ${error.message}`);
      return null;
    } finally {
      setPdfLoading(false);
    }
  }, [generatePDF, showError]);

  // === МЕМОИЗИРОВАННЫЕ ЗНАЧЕНИЯ ===
  const formattedAddress = useMemo(() => {
    return data.address || `${data.street || ''}, ${data.house || ''}, кв. ${data.apartment || ''}`.trim();
  }, [data.address, data.street, data.house, data.apartment]);

  const isFormValid = useMemo(() => {
    return data.act_date && 
           data.subscriber_name.trim() && 
           data.street.trim() && 
           data.house.trim() && 
           data.apartment.trim() && 
           data.usd_representative.trim() &&
           data.meters.every(meter => meter.meter_number.trim() && meter.seal_number.trim());
  }, [data]);

  // === ВОЗВРАЩАЕМЫЕ ЗНАЧЕНИЯ ===
  return {
    // Данные и состояния
    data,
    errors,
    loading,
    saving,
    pdfLoading,
    
    // Вычисляемые значения
    formattedAddress,
    isFormValid,
    
    // Функции обновления данных
    updateField,
    handleFieldChange,
    handleMeterChange,
    addMeter,
    removeMeter,
    
    // Функции работы с данными
    loadActByInvoice,
    validateData,
    saveAct,
    
    // PDF функции
    generatePDF,
    previewPDF,
    
    // Утилиты
    setData,
    setErrors
  };
};