import { useState, useCallback } from 'react';
import { getData, Store } from '../../Store';
import { useToast } from '../../Toast/useToast';

// Типы
export interface ActShutdownData {
  id?: string;
  invoice_id?: string; // Связь с заявкой
  act_number?: string; // Опциональное поле - автогенерируется в SQL
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

// Начальные данные (без act_number - будет автогенерирован в SQL)
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
    
    // Обязательные поля (act_number не проверяем, т.к. автогенерируется)
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

    // if (data.reconnection_date && new Date(data.reconnection_date) < new Date(data.execution_date)) {
    //   newErrors.reconnection_date = 'Дата подключения не может быть раньше даты отключения';
    // }
    console.log(data)
    console.log( newErrors )
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);


  // Загрузка акта по invoice_id
  const loadActByInvoice = useCallback(async (invoiceId: string) => {
    setLoading(true);
    try {
      const params = { invoice_id: invoiceId, user_id: Store.getState().login.userId }
      console.log( params )
      const result = await getData('SHUTDOWN_ORDER_GET', params );
      
      if(result.success){
        // Если акт найден - режим редактирования, если нет - создание нового с invoice_id
        const actData = result.data

        console.log( actData )

        setData(actData);

      } 

    } catch (error) {
      console.error('Ошибка загрузки акта по заявке:', error);
      // При ошибке создаем новый акт с invoice_id
      setData({ ...initialData, invoice_id: invoiceId });
    } finally {
      setLoading(false);
    }
  }, []);

  // Сохранение акта
  const saveAct = useCallback(async (): Promise<ActShutdownData | null> => {
    if (!validateForm()) {
      console.log( "no validate" )
      return null;
    }

    console.log( "saveAct" )

    setSaving(true);

    try {
      const method = 'SHUTDOWN_ORDER_CREATE';
      const params = data;
      
      const result = await getData(method, params);

      if( result.success ){
        showSuccess("Данные сохранены")
        console.log(result)
      } else {
        showError( "Ошибка сохранения данных" ) 
      }

      return result;

    } catch (error) {
      console.error('Ошибка сохранения акта:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [data, actId, validateForm]);

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
    loadActByInvoice,
    saveAct,
    
    // Утилиты
    setData,
    setErrors
  };
};