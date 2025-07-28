import { useState, useCallback } from 'react';

// Типы
export interface ActShutdownData {
  id?: string;
  act_number: string;
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
  act_number: '',
  act_date: new Date().toISOString().split('T')[0],
  representative_name: '',
  reason: '',
  equipment: '',
  apartment: '',
  house: '',
  street: '',
  subscriber_name: '',
  order_issued_by: '',
  order_received_by: '',
  executor_name: '',
  execution_date: '',
  execution_time: '',
  disconnected_equipment: '',
  execution_apartment: '',
  execution_house: '',
  execution_street: '',
  reconnection_date: '',
  reconnection_representative: '',
  reconnection_supervisor: '',
  reconnection_apartment: '',
  reconnection_house: '',
  reconnection_street: '',
  reconnection_subscriber: ''
};

export const useShutdownAct = (actId?: string) => {
  const [data, setData] = useState<ActShutdownData>(initialData);
  const [errors, setErrors] = useState<ShutdownFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Обработчик изменения полей
  const handleFieldChange = useCallback((field: keyof ActShutdownData, value: string) => {
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

  // Копирование адресных данных
  const copyAddressData = useCallback((direction: AddressCopyDirection) => {
    if (direction === 'to_execution') {
      setData(prev => ({
        ...prev,
        execution_apartment: prev.apartment,
        execution_house: prev.house,
        execution_street: prev.street
      }));
    } else if (direction === 'to_reconnection') {
      setData(prev => ({
        ...prev,
        reconnection_apartment: prev.apartment,
        reconnection_house: prev.house,
        reconnection_street: prev.street,
        reconnection_subscriber: prev.subscriber_name
      }));
    }
  }, []);

  // Валидация формы
  const validateForm = useCallback((): boolean => {
    const newErrors: ShutdownFormErrors = {};
    
    // Обязательные поля
    const requiredFields: (keyof ActShutdownData)[] = [
      'act_number',
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
      if (!data[field] || data[field].toString().trim() === '') {
        newErrors[field] = 'Поле обязательно для заполнения';
      }
    });

    // Валидация дат
    if (data.execution_date && new Date(data.execution_date) > new Date()) {
      newErrors.execution_date = 'Дата выполнения не может быть в будущем';
    }

    if (data.reconnection_date && new Date(data.reconnection_date) < new Date(data.execution_date)) {
      newErrors.reconnection_date = 'Дата подключения не может быть раньше даты отключения';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  // Загрузка акта
  const loadAct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/acts/shutdown/${id}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки акта');
      }
      const actData = await response.json();
      setData(actData);
    } catch (error) {
      console.error('Ошибка загрузки акта:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Генерация номера акта
  const generateActNumber = useCallback(async () => {
    try {
      const response = await fetch('/api/acts/shutdown/next-number');
      if (!response.ok) {
        throw new Error('Ошибка генерации номера');
      }
      const { number } = await response.json();
      setData(prev => ({ ...prev, act_number: number }));
    } catch (error) {
      console.error('Ошибка генерации номера:', error);
      throw error;
    }
  }, []);

  // Сохранение акта
  const saveAct = useCallback(async (): Promise<ActShutdownData | null> => {
    if (!validateForm()) {
      return null;
    }

    setSaving(true);
    try {
      const url = actId ? `/api/acts/shutdown/${actId}` : '/api/acts/shutdown';
      const method = actId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения акта');
      }

      const savedData = await response.json();
      setData(savedData);
      return savedData;
    } catch (error) {
      console.error('Ошибка сохранения акта:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [data, actId, validateForm]);

  // Автогенерация номера при создании нового акта
  const initializeNewAct = useCallback(async () => {
    if (!actId) {
      await generateActNumber();
    }
  }, [actId, generateActNumber]);

  return {
    // Состояние
    data,
    errors,
    loading,
    saving,
    
    // Методы
    handleFieldChange,
    copyAddressData,
    validateForm,
    loadAct,
    saveAct,
    generateActNumber,
    initializeNewAct,
    
    // Утилиты
    setData,
    setErrors
  };
};