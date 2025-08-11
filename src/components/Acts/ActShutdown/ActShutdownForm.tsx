import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useShutdownAct } from './useActShutdown';
import './ActShutdownForm.css';
import { IonLoading, IonModal } from '@ionic/react';
import ActShutdown from './ActShutdownPrint';
import { FormField, FormRow, FormSection, ReadOnlyField, TextAreaField } from '../Forms/Forms';

// === ТИПЫ И ИНТЕРФЕЙСЫ ===
interface ShutdownOrderFormProps {
  invoiceId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const ShutdownOrderForm: React.FC<ShutdownOrderFormProps> = ({
  invoiceId,
  onSave,
  onCancel
}) => {
  // === НОВЫЙ ОПТИМИЗИРОВАННЫЙ ХУК ===
  const {
    data,
    errors,
    loading,
    saving,
    updateField,           // Новая функция: обновление + очистка ошибки
    handleFieldChange,     // Теперь стабильная ссылка!
    copyAddressData,
    getFieldValue,         // Заменяет getValue
    getFieldError,         // Заменяет getError
    saveAct,
    loadActByInvoice
  } = useShutdownAct();

  // Состояние для модального окна печати
  const [showPrintModal, setShowPrintModal] = useState(false);

  // === ЭФФЕКТЫ (БЕЗ ИЗМЕНЕНИЙ) ===
  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    }
  }, [invoiceId, loadActByInvoice]);

  // === ОБРАБОТЧИКИ (ОПТИМИЗИРОВАННЫЕ) ===
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedData = await saveAct();
      if (savedData && onSave) {
        onSave(savedData);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }, [saveAct, onSave]); // Стабильные зависимости

  // Обработчики модального окна
  const handlePrint = useCallback(() => {
    setShowPrintModal(true);
  }, []);

  const handleClosePrintModal = useCallback(() => {
    setShowPrintModal(false);
  }, []);

  // === МЕМОИЗИРОВАННЫЕ ДАННЫЕ ДЛЯ ПЕЧАТИ ===
  // Теперь пересчитывается только при реальных изменениях благодаря Immer
  const mapDataForPrint = useMemo(() => ({
    id: data.id,
    actNumber: data.act_number || '',
    actDate: data.act_date,
    representativeName: data.representative_name,
    representativePosition: '',
    reason: data.reason,
    equipment: data.equipment,
    apartment: data.apartment,
    house: data.house,
    street: data.street,
    subscriberName: data.subscriber_name,
    orderIssuedBy: data.order_issued_by,
    orderIssuedPosition: '',
    orderReceivedBy: data.order_received_by,
    orderReceivedPosition: '',
    executorName: data.executor_name,
    executorPosition: '',
    executionDate: data.execution_date,
    executionTime: data.execution_time,
    disconnectedEquipment: data.disconnected_equipment,
    executionApartment: data.execution_apartment,
    executionHouse: data.execution_house,
    executionStreet: data.execution_street,
    reconnectionDate: data.reconnection_date || '',
    reconnectionRepresentative: data.reconnection_representative || '',
    reconnectionPosition: '',
    reconnectionSupervisor: data.reconnection_supervisor || '',
    reconnectionSupervisorPosition: '',
    reconnectionApartment: data.reconnection_apartment || '',
    reconnectionHouse: data.reconnection_house || '',
    reconnectionStreet: data.reconnection_street || '',
    reconnectionSubscriber: data.reconnection_subscriber || ''
  }), [data]); // Одна зависимость вместо 20+

  // === МЕМОИЗИРОВАННЫЕ СЕКЦИИ (ОПТИМИЗИРОВАННЫЕ) ===
  
  // Теперь каждая секция имеет минимальные зависимости
  const BasicInfoSection = useMemo(() => (
    <FormSection title="Основная информация">
      <FormRow>
        <ReadOnlyField
          label="Номер акта"
          value={getFieldValue('act_number') || (data.id ? 'Загрузка...' : 'Будет присвоен при сохранении')}
          // hint={data.id ? 'Номер присвоен системой' : 'Номер будет сгенерирован автоматически при сохранении'}
        />
        <FormField
          label="Дата акта"
          name="act_date"
          type="date"
          required
          value={getFieldValue('act_date')}
          onChange={(e) => updateField('act_date', e.target.value)} // Используем updateField
          error={getFieldError('act_date')}
        />
        {data.invoice_id && (
          <ReadOnlyField
            label="Связанная заявка"
            value={`Заявка №${data.invoice_id}`}
            // hint="Акт создан для данной заявки"
          />
        )}
      </FormRow>
    </FormSection>
  ), [
    data.act_number,
    data.id,
    data.invoice_id,
    getFieldValue,
    getFieldError,
    updateField
  ]); // Стабильные зависимости!

  const RepresentativeSection = useMemo(() => (
    <FormSection title="Представитель и причина отключения">
      <FormRow>
        <FormField
          label="ФИО представителя"
          name="representative_name"
          required
          value={getFieldValue('representative_name')}
          onChange={(e) => updateField('representative_name', e.target.value)}
          error={getFieldError('representative_name')}
          placeholder="Введите ФИО представителя"
        />
        <TextAreaField
          label="Причина отключения"
          name="reason"
          required
          value={getFieldValue('reason')}
          onChange={(e) => updateField('reason', e.target.value)}
          error={getFieldError('reason')}
          placeholder="Укажите причину отключения"
          rows={3}
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const EquipmentSection = useMemo(() => (
    <FormSection title="Объект отключения">
      <FormRow>
        <FormField
          label="Наименование приборов"
          name="equipment"
          required
          value={getFieldValue('equipment')}
          onChange={(e) => updateField('equipment', e.target.value)}
          error={getFieldError('equipment')}
          placeholder="Укажите оборудование для отключения"
          className="full-width"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const AddressSection = useMemo(() => (
    <FormSection title="Адресная информация">
      <FormRow>
        <FormField
          label="Квартира"
          name="apartment"
          required
          value={getFieldValue('apartment')}
          onChange={(e) => updateField('apartment', e.target.value)}
          error={getFieldError('apartment')}
          placeholder="№ кв."
        />
        <FormField
          label="Дом"
          name="house"
          required
          value={getFieldValue('house')}
          onChange={(e) => updateField('house', e.target.value)}
          error={getFieldError('house')}
          placeholder="№ дома"
        />
        <FormField
          label="Улица"
          name="street"
          required
          value={getFieldValue('street')}
          onChange={(e) => updateField('street', e.target.value)}
          error={getFieldError('street')}
          placeholder="Название улицы"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const SubscriberSection = useMemo(() => (
    <FormSection title="Абонент">
      <FormRow>
        <FormField
          label="ФИО абонента"
          name="subscriber_name"
          required
          value={getFieldValue('subscriber_name')}
          onChange={(e) => updateField('subscriber_name', e.target.value)}
          error={getFieldError('subscriber_name')}
          placeholder="Введите ФИО абонента"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const AdminSection = useMemo(() => (
    <FormSection title="Административные данные">
      <FormRow>
        <FormField
          label="Наряд выдал"
          name="order_issued_by"
          value={getFieldValue('order_issued_by')}
          onChange={(e) => updateField('order_issued_by', e.target.value)}
          error={getFieldError('order_issued_by')}
          placeholder="ФИО выдавшего наряд"
        />
        <FormField
          label="Наряд получил"
          name="order_received_by"
          value={getFieldValue('order_received_by')}
          onChange={(e) => updateField('order_received_by', e.target.value)}
          error={getFieldError('order_received_by')}
          placeholder="ФИО получившего наряд"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const ExecutionSection = useMemo(() => (
    <FormSection title="Выполнение работ">
      <div className="address-copy-hint">
        <button 
          type="button" 
          onClick={() => copyAddressData('to_execution')}
          className="btn btn-small btn-outline"
        >
          Копировать адрес из основной информации
        </button>
      </div>
      
      <FormRow>
        <FormField
          label="Исполнитель"
          name="executor_name"
          value={getFieldValue('executor_name')}
          onChange={(e) => updateField('executor_name', e.target.value)}
          error={getFieldError('executor_name')}
          placeholder="ФИО исполнителя"
        />
        <FormField
          label="Дата выполнения"
          name="execution_date"
          type="date"
          value={getFieldValue('execution_date')}
          onChange={(e) => updateField('execution_date', e.target.value)}
          error={getFieldError('execution_date')}
        />
        <FormField
          label="Время выполнения"
          name="execution_time"
          type="time"
          value={getFieldValue('execution_time')}
          onChange={(e) => updateField('execution_time', e.target.value)}
          error={getFieldError('execution_time')}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Отключенное оборудование"
          name="disconnected_equipment"
          value={getFieldValue('disconnected_equipment')}
          onChange={(e) => updateField('disconnected_equipment', e.target.value)}
          error={getFieldError('disconnected_equipment')}
          placeholder="Описание отключенного оборудования"
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Квартира (выполнение)"
          name="execution_apartment"
          value={getFieldValue('execution_apartment')}
          onChange={(e) => updateField('execution_apartment', e.target.value)}
          error={getFieldError('execution_apartment')}
          placeholder="№ кв."
        />
        <FormField
          label="Дом (выполнение)"
          name="execution_house"
          value={getFieldValue('execution_house')}
          onChange={(e) => updateField('execution_house', e.target.value)}
          error={getFieldError('execution_house')}
          placeholder="№ дома"
        />
        <FormField
          label="Улица (выполнение)"
          name="execution_street"
          value={getFieldValue('execution_street')}
          onChange={(e) => updateField('execution_street', e.target.value)}
          error={getFieldError('execution_street')}
          placeholder="Название улицы"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField, copyAddressData]);

  const ReconnectionSection = useMemo(() => (
    <FormSection title="Подключение (опционально)">
      <div className="address-copy-hint">
        <button 
          type="button" 
          onClick={() => copyAddressData('to_reconnection')}
          className="btn btn-small btn-outline"
        >
          Копировать адрес из основной информации
        </button>
      </div>

      <FormRow>
        <FormField
          label="Дата подключения"
          name="reconnection_date"
          type="date"
          value={getFieldValue('reconnection_date')}
          onChange={(e) => updateField('reconnection_date', e.target.value)}
          error={getFieldError('reconnection_date')}
        />
        <FormField
          label="Представитель организации"
          name="reconnection_representative"
          value={getFieldValue('reconnection_representative')}
          onChange={(e) => updateField('reconnection_representative', e.target.value)}
          error={getFieldError('reconnection_representative')}
          placeholder="ФИО представителя"
        />
        <FormField
          label="Руководитель"
          name="reconnection_supervisor"
          value={getFieldValue('reconnection_supervisor')}
          onChange={(e) => updateField('reconnection_supervisor', e.target.value)}
          error={getFieldError('reconnection_supervisor')}
          placeholder="ФИО руководителя"
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Квартира (подключение)"
          name="reconnection_apartment"
          value={getFieldValue('reconnection_apartment')}
          onChange={(e) => updateField('reconnection_apartment', e.target.value)}
          error={getFieldError('reconnection_apartment')}
          placeholder="№ кв."
        />
        <FormField
          label="Дом (подключение)"
          name="reconnection_house"
          value={getFieldValue('reconnection_house')}
          onChange={(e) => updateField('reconnection_house', e.target.value)}
          error={getFieldError('reconnection_house')}
          placeholder="№ дома"
        />
        <FormField
          label="Улица (подключение)"
          name="reconnection_street"
          value={getFieldValue('reconnection_street')}
          onChange={(e) => updateField('reconnection_street', e.target.value)}
          error={getFieldError('reconnection_street')}
          placeholder="Название улицы"
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Абонент (подключение)"
          name="reconnection_subscriber"
          value={getFieldValue('reconnection_subscriber')}
          onChange={(e) => updateField('reconnection_subscriber', e.target.value)}
          error={getFieldError('reconnection_subscriber')}
          placeholder="ФИО абонента"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField, copyAddressData]);

  // === УСЛОВНЫЙ РЕНДЕР ===
  if (loading) {
    return (
      <div className="shutdown-order-form">
        <div className="shutdown-form-loading">
          <IonLoading isOpen={loading} message="Загрузка данных..." />
          Загрузка акта...
        </div>
      </div>
    );
  }

  // === ОСНОВНОЙ РЕНДЕР ===
  return (
    <div className="shutdown-order-form">
      <div className="form-header">
        <h2>
          {data.id ? 'Редактирование' : 'Создание'} акта-наряда на отключение
          {data.invoice_id && ` (Заявка №${data.invoice_id})`}
        </h2>
        <div className="form-actions">
          <button type="button" onClick={handlePrint} className="btn btn-secondary">
            Печать
          </button>
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Отмена
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="shutdown-form">
        {BasicInfoSection}
        {RepresentativeSection}
        {EquipmentSection}
        {AddressSection}
        {SubscriberSection}
        {AdminSection}
        {ExecutionSection}
        {ReconnectionSection}

        {/* Кнопки управления */}
        <div className="form-footer">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="btn btn-outline"
          >
            Отмена
          </button>
        </div>
      </form>

      {/* Модальное окно печати */}
      <IonModal isOpen={showPrintModal} onDidDismiss={handleClosePrintModal}>
        <ActShutdown 
          mode="print"
          data={mapDataForPrint}
          onClose={handleClosePrintModal}
        />
      </IonModal>
    </div>
  );
};

export default ShutdownOrderForm;