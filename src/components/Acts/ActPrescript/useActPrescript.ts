import { useState, useCallback } from 'react';
import { getData, Store } from '../../Store';
import { useToast } from '../../Toast/useToast';

// Типы данных
export interface PrescriptionData {
  id?: string;
  invoice_id?: string;
  prescription_number?: string;
  prescription_date: string;
  check_address: string;
  account_number: string;
  subscriber_name: string;
  subscriber_phone: string;
  violations_text: string;
  deadline_date: string;
  organization_representative: string;
  subscriber_signature: string;
  subscriber_representative: string;
  violation_type: string;
  status: string;
  document_scan_path: string;
}

export type PrescriptionFormErrors = Partial<Record<keyof PrescriptionData, string>>;

// Начальные данные
const initialData: PrescriptionData = {
  id: '',
  prescription_date: new Date().toISOString().split('T')[0],
  check_address: '',
  account_number: '',
  subscriber_name: '',
  subscriber_phone: '',
  violations_text: '',
  deadline_date: '',
  organization_representative: '',
  subscriber_signature: '',
  subscriber_representative: '',
  violation_type: '',
  status: 'created',
  document_scan_path: ''
};

export const useActPrescript = (prescriptionId?: string) => {
  const [data, setData] = useState<PrescriptionData>(initialData);
  const [errors, setErrors] = useState<PrescriptionFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  // Обработчик изменения основных полей
  const handleFieldChange = useCallback((field: keyof PrescriptionData, value: string) => {
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

  // Валидация формы
  const validateForm = useCallback((): boolean => {
    const newErrors: PrescriptionFormErrors = {};

    if (!data.prescription_date) {
      newErrors.prescription_date = 'Дата предписания обязательна';
    }

    if (!data.check_address || data.check_address.trim() === '') {
      newErrors.check_address = 'Адрес проверки обязателен';
    }

    if (!data.subscriber_name || data.subscriber_name.trim() === '') {
      newErrors.subscriber_name = 'ФИО абонента обязательно';
    }

    if (!data.violations_text || data.violations_text.trim() === '') {
      newErrors.violations_text = 'Описание нарушений обязательно';
    }

    if (!data.deadline_date) {
      newErrors.deadline_date = 'Срок устранения обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  // Загрузка предписания по ID заявки
  const loadActByInvoice = useCallback(async (invoiceId: string) => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      
      const response = await getData( 'prescription_get', { invoice_id: invoiceId, user_id: Store.getState().login.userId });

      if (response?.success && response?.data) {
        setData({
          ...initialData,
          ...response.data,
          prescription_date: response.data.prescription_date || new Date().toISOString().split('T')[0],
          deadline_date: response.data.deadline_date || ''
        });
      } else {
        setData({
          ...initialData,
          invoice_id: invoiceId,
          prescription_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки предписания:', error);
      showError('Ошибка загрузки данных предписания');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Сохранение предписания
  const saveAct = useCallback(async (): Promise<PrescriptionData | null> => {
    if (!validateForm()) {
      showError('Пожалуйста, исправьте ошибки в форме');
      return null;
    }

    try {
      setSaving(true);

      const response = await getData('rescription_create', { ...data, user_id: Store.getState().login.userId });

      if (response?.success && response?.data) {
        const savedData = {
          ...data,
          ...response.data
        };
        
        setData(savedData);
        showSuccess('Предписание успешно сохранено');
        return savedData;
      } else {
        throw new Error(response?.message || 'Ошибка сохранения предписания');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showError(error instanceof Error ? error.message : 'Ошибка сохранения предписания');
      return null;
    } finally {
      setSaving(false);
    }
  }, [data, validateForm, showSuccess, showError]);

  return {
    data,
    errors,
    loading,
    saving,
    handleFieldChange,
    loadActByInvoice,
    saveAct
  };
};