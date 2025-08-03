import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useShutdownAct } from './useActShutdown';
import './ActShutdownForm.css';
import { IonLoading, IonModal } from '@ionic/react';
import ActShutdown from './ActShutdown';
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
  // === ОРИГИНАЛЬНАЯ ЛОГИКА ХУКА ===
  const {
    data,
    errors,
    loading,
    saving,
    handleFieldChange,
    saveAct,
    loadActByInvoice
  } = useShutdownAct();

  // Состояние для модального окна печати
  const [showPrintModal, setShowPrintModal] = useState(false);

  // === ОРИГИНАЛЬНЫЕ ЭФФЕКТЫ ===
  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    }
  }, [invoiceId, loadActByInvoice]);

  // === ОРИГИНАЛЬНЫЕ ОБРАБОТЧИКИ ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedData = await saveAct();
      if (savedData && onSave) {
        onSave(savedData);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  // Обработчик печати
  const handlePrint = () => {
    setShowPrintModal(true);
  };

  // Закрытие модального окна печати
  const handleClosePrintModal = () => {
    setShowPrintModal(false);
  };

  // === ОРИГИНАЛЬНАЯ ФУНКЦИЯ МАППИНГА ДЛЯ ПЕЧАТИ ===
  const mapDataForPrint = useMemo(() => ({
      id: data.id,
      actNumber: data.act_number || '',
      actDate: data.act_date,
      representativeName: data.representative_name,
      representativePosition: '', // Может потребоваться добавить в форму
      reason: data.reason,
      equipment: data.equipment,
      apartment: data.apartment,
      house: data.house,
      street: data.street,
      subscriberName: data.subscriber_name,
      orderIssuedBy: data.order_issued_by,
      orderIssuedPosition: '', // Может потребоваться добавить в форму
      orderReceivedBy: data.order_received_by,
      orderReceivedPosition: '', // Может потребоваться добавить в форму
      executorName: data.executor_name,
      executorPosition: '', // Может потребоваться добавить в форму
      executionDate: data.execution_date,
      executionTime: data.execution_time,
      disconnectedEquipment: data.disconnected_equipment,
      executionApartment: data.execution_apartment,
      executionHouse: data.execution_house,
      executionStreet: data.execution_street,
      reconnectionDate: data.reconnection_date || '',
      reconnectionRepresentative: data.reconnection_representative || '',
      reconnectionPosition: '', // Может потребоваться добавить в форму
      reconnectionSupervisor: data.reconnection_supervisor || '',
      reconnectionSupervisorPosition: '', // Может потребоваться добавить в форму
      reconnectionApartment: data.reconnection_apartment || '',
      reconnectionHouse: data.reconnection_house || '',
      reconnectionStreet: data.reconnection_street || '',
      reconnectionSubscriber: data.reconnection_subscriber || ''
   }), [data]);

// === МЕМОИЗИРОВАННЫЕ УТИЛИТЫ ===
  const getValue = useCallback((field: string): string => data[field] || '', [data] );
  
  const getError = useCallback((field: string): string => errors[field] || '', [errors] );

  // === МЕМОИЗИРОВАННЫЕ СЕКЦИИ ===
  const BasicInfoSection        = useMemo(() => (
    <FormSection title="Основная информация">
      <FormRow>
        <ReadOnlyField
          label="Номер акта"
          value={getValue('act_number') || (data.id ? 'Загрузка...' : 'Будет присвоен при сохранении')}
          hint={data.id ? 'Номер присвоен системой' : 'Номер будет сгенерирован автоматически при сохранении'}
        />
        <FormField
          label="Дата акта"
          name="act_date"
          type="date"
          required
          value={getValue('act_date')}
          onChange={(e) => handleFieldChange('act_date', e.target.value)}
          error={getError('act_date')}
        />
        {data.invoice_id && (
          <ReadOnlyField
            label="Связанная заявка"
            value={`Заявка №${data.invoice_id}`}
            hint="Акт создан для данной заявки"
          />
        )}
      </FormRow>
    </FormSection>
  ), [
    data.act_number, 
    data.id, 
    data.act_date, 
    data.invoice_id,
    errors.act_date,
    getValue,
    getError,
    handleFieldChange
  ]);

  const RepresentativeSection   = useMemo(() => (
    <FormSection title="Представитель и причина отключения">
      <FormRow>
        <FormField
          label="ФИО представителя"
          name="representative_name"
          required
          value={getValue('representative_name')}
          onChange={(e) => handleFieldChange('representative_name', e.target.value)}
          error={getError('representative_name')}
          placeholder="Введите ФИО представителя"
        />
        <TextAreaField
          label="Причина отключения"
          name="reason"
          required
          value={getValue('reason')}
          onChange={(e) => handleFieldChange('reason', e.target.value)}
          error={getError('reason')}
          placeholder="Укажите причину отключения"
          rows={3}
        />
      </FormRow>
    </FormSection>
  ), [
    data.representative_name,
    data.reason,
    errors.representative_name,
    errors.reason,
    getValue,
    getError,
    handleFieldChange
  ]);

  const EquipmentSection        = useMemo(() => (
    <FormSection title="Объект отключения">
      <FormRow>
        <FormField
          label="Наименование приборов"
          name="equipment"
          required
          value={getValue('equipment')}
          onChange={(e) => handleFieldChange('equipment', e.target.value)}
          error={getError('equipment')}
          placeholder="Укажите оборудование для отключения"
          className="full-width"
        />
      </FormRow>
    </FormSection>
  ), [
    data.equipment,
    errors.equipment,
    getValue,
    getError,
    handleFieldChange
  ]);

  const AddressSection          = useMemo(() => (
    <FormSection title="Адресная информация">
      <FormRow>
        <FormField
          label="Квартира"
          name="apartment"
          required
          value={getValue('apartment')}
          onChange={(e) => handleFieldChange('apartment', e.target.value)}
          error={getError('apartment')}
          placeholder="№ кв."
        />
        <FormField
          label="Дом"
          name="house"
          required
          value={getValue('house')}
          onChange={(e) => handleFieldChange('house', e.target.value)}
          error={getError('house')}
          placeholder="№ дома"
        />
        <FormField
          label="Улица"
          name="street"
          required
          value={getValue('street')}
          onChange={(e) => handleFieldChange('street', e.target.value)}
          error={getError('street')}
          placeholder="Название улицы"
        />
      </FormRow>
    </FormSection>
  ), [
    data.apartment,
    data.house,
    data.street,
    errors.apartment,
    errors.house,
    errors.street,
    getValue,
    getError,
    handleFieldChange
  ]);

  const SubscriberSection       = useMemo(() => (
    <FormSection title="Данные абонента">
      <FormRow>
        <FormField
          label="ФИО абонента"
          name="subscriber_name"
          required
          value={getValue('subscriber_name')}
          onChange={(e) => handleFieldChange('subscriber_name', e.target.value)}
          error={getError('subscriber_name')}
          placeholder="Введите ФИО абонента"
        />
      </FormRow>
    </FormSection>
  ), [
    data.subscriber_name,
    errors.subscriber_name,
    getValue,
    getError,
    handleFieldChange
  ]);

  const AdminSection            = useMemo(() => (
    <FormSection title="Административные данные">
      <FormRow>
        <FormField
          label="Наряд выдал"
          name="order_issued_by"
          value={getValue('order_issued_by')}
          onChange={(e) => handleFieldChange('order_issued_by', e.target.value)}
          placeholder="ФИО, должность"
        />
        <FormField
          label="Наряд получил"
          name="order_received_by"
          value={getValue('order_received_by')}
          onChange={(e) => handleFieldChange('order_received_by', e.target.value)}
          placeholder="ФИО, должность"
        />
      </FormRow>
    </FormSection>
  ), [
    data.order_issued_by,
    data.order_received_by,
    getValue,
    getError,
    handleFieldChange
  ]);

  const ExecutionSection        = useMemo(() => (
    <FormSection title="Выполнение работ">
      <FormRow>
        <FormField
          label="Исполнитель"
          name="executor_name"
          value={getValue('executor_name')}
          onChange={(e) => handleFieldChange('executor_name', e.target.value)}
          placeholder="ФИО исполнителя"
        />
        <FormField
          label="Дата выполнения"
          name="execution_date"
          type="date"
          value={getValue('execution_date')}
          onChange={(e) => handleFieldChange('execution_date', e.target.value)}
          error={getError('execution_date')}
        />
      </FormRow>
    </FormSection>
  ), [
    data.executor_name,
    data.execution_date,
    errors.execution_date,
    getValue,
    getError,
    handleFieldChange
  ]);

  const ReconnectionSection     = useMemo(() => (
    <FormSection title="Подключение">
      <FormRow>
        <FormField
          label="Дата подключения"
          name="reconnection_date"
          type="date"
          value={getValue('reconnection_date')}
          onChange={(e) => handleFieldChange('reconnection_date', e.target.value)}
          error={getError('reconnection_date')}
        />
        <FormField
          label="Представитель"
          name="reconnection_representative"
          value={getValue('reconnection_representative')}
          onChange={(e) => handleFieldChange('reconnection_representative', e.target.value)}
          placeholder="ФИО представителя"
        />
      </FormRow>
      <FormRow>
        <FormField
          label="Руководитель"
          name="reconnection_supervisor"
          value={getValue('reconnection_supervisor')}
          onChange={(e) => handleFieldChange('reconnection_supervisor', e.target.value)}
          placeholder="ФИО руководителя"
        />
        <FormField
          label="Квартира"
          name="reconnection_apartment"
          value={getValue('reconnection_apartment')}
          onChange={(e) => handleFieldChange('reconnection_apartment', e.target.value)}
          placeholder="№ кв."
        />
      </FormRow>
      <FormRow>
        <FormField
          label="Дом"
          name="reconnection_house"
          value={getValue('reconnection_house')}
          onChange={(e) => handleFieldChange('reconnection_house', e.target.value)}
          placeholder="№ дома"
        />
        <FormField
          label="Улица"
          name="reconnection_street"
          value={getValue('reconnection_street')}
          onChange={(e) => handleFieldChange('reconnection_street', e.target.value)}
          placeholder="Название улицы"
        />
      </FormRow>
      <FormRow>
        <FormField
          label="Абонент"
          name="reconnection_subscriber"
          value={getValue('reconnection_subscriber')}
          onChange={(e) => handleFieldChange('reconnection_subscriber', e.target.value)}
          placeholder="ФИО абонента"
          className="full-width"
        />
      </FormRow>
    </FormSection>
  ), [
    data.reconnection_date,
    data.reconnection_representative,
    data.reconnection_supervisor,
    data.reconnection_apartment,
    data.reconnection_house,
    data.reconnection_street,
    data.reconnection_subscriber,
    errors.reconnection_date,
    getValue,
    getError,
    handleFieldChange
  ]);

  return (
    <div className="shutdown-order-form">

      <IonLoading isOpen = { loading } message={ "Подождите..." }/>

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
        { BasicInfoSection }
        { RepresentativeSection }
        { EquipmentSection }
        { AddressSection }
        { SubscriberSection }
        { AdminSection }
        { ExecutionSection }
        { ReconnectionSection }

        {/* Кнопки управления */}
        <div className="form-footer">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            onClick={saveAct}
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
          data={ mapDataForPrint }
          onClose={handleClosePrintModal}
        />
      </IonModal>
    </div>
  );
};

export default ShutdownOrderForm;