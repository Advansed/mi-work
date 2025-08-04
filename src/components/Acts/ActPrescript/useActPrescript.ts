// src/components/Acts/ActPrescript/useActPrescript.ts

import { useState, useCallback } from 'react';
import { getData, Store } from '../../Store';
import { useToast } from '../../Toast/useToast';
import { IPrescriptionForm, prescriptionValidationSchema, initialPrescriptionData } from './types';

export const useActPrescript = () => {
  const [data, setData] = useState<IPrescriptionForm>(initialPrescriptionData);
  const [errors, setErrors] = useState<Partial<Record<keyof IPrescriptionForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  // === HELPER ФУНКЦИИ ===
  const getFieldValue = useCallback((field: keyof IPrescriptionForm) => {
    return data[field] || '';
  }, [data]);

  const getFieldError = useCallback((field: keyof IPrescriptionForm) => {
    return errors[field] || '';
  }, [errors]);

  // === ОБНОВЛЕНИЕ ПОЛЯ С ОЧИСТКОЙ ОШИБКИ ===
  const updateField = useCallback((field: keyof IPrescriptionForm, value: string) => {
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

  // === ВАЛИДАЦИЯ ФОРМЫ ===
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof IPrescriptionForm, string>> = {};

    Object.entries(prescriptionValidationSchema).forEach(([field, rule]) => {
      const fieldValue = data[field as keyof IPrescriptionForm];
      
      if (rule.required && (!fieldValue || fieldValue.toString().trim() === '')) {
        newErrors[field as keyof IPrescriptionForm] = rule.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  // === ЗАГРУЗКА ПРЕДПИСАНИЯ ПО ID ЗАЯВКИ ===
  const loadActByInvoice = useCallback(async (invoiceId: string) => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      
      const response = await getData('prescription_get', { 
        invoice_id: invoiceId, 
        user_id: Store.getState().login.userId 
      });

      if (response?.success && response?.data) {
        setData({
          ...initialPrescriptionData,
          ...response.data,
          prescription_date: response.data.prescription_date || new Date().toISOString().split('T')[0],
          deadline_date: response.data.deadline_date || ''
        });
      } else {
        setData({
          ...initialPrescriptionData,
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

  // === СОХРАНЕНИЕ ПРЕДПИСАНИЯ ===
  const saveAct = useCallback(async (): Promise<IPrescriptionForm | null> => {
    if (!validateForm()) {
      showError('Пожалуйста, исправьте ошибки в форме');
      return null;
    }

    try {
      setSaving(true);

      // ИСПРАВЛЕНО: prescription_create вместо rescription_create
      const response = await getData('prescription_create', { 
        ...data, 
        user_id: Store.getState().login.userId 
      });

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
    getFieldValue,
    getFieldError,
    updateField,
    loadActByInvoice,
    saveAct
  };
};