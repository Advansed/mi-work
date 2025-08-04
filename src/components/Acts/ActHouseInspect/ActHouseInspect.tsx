import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useActHouseInspects } from './useActHouseInspects';
import './ActHouseInspect.css';
import { IonLoading, IonModal } from '@ionic/react';
import ActHouseInspectPrint from './ActHouseInspectPrint';
import { FormField, FormRow, FormSection, TextAreaField } from '../Forms/Forms';

// === ТИПЫ И ИНТЕРФЕЙСЫ ===
interface ActHouseInspectProps {
  invoiceId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  readonly?: boolean;
}

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const ActHouseInspect: React.FC<ActHouseInspectProps> = ({
  invoiceId,
  onSave,
  onCancel,
  readonly = false
}) => {
  // === ХУК ДАННЫХ ===
  const {
    data,
    errors,
    loading,
    saving,
    updateField,
    handleFieldChange,
    addMeter,
    removeMeter,
    loadActByInvoice,
    saveAct
  } = useActHouseInspects();

  const [showPrintModal, setShowPrintModal] = useState(false);

  // === ЭФФЕКТЫ ===
  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    }
  }, [invoiceId, loadActByInvoice]);

  // === ОБРАБОТЧИКИ ===
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const savedData = await saveAct();
    if (savedData && onSave) {
      onSave(savedData);
    }
  }, [saveAct, onSave]);

  const handlePrint = useCallback(() => {
    setShowPrintModal(true);
  }, []);

  const handleClosePrintModal = useCallback(() => {
    setShowPrintModal(false);
  }, []);

  // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
  const getFieldValue = useCallback((fieldName: string) => {
    return (data as any)[fieldName] || '';
  }, [data]);

  const getFieldError = useCallback((fieldName: string) => {
    return errors[fieldName];
  }, [errors]);

  // === МЕМОИЗИРОВАННЫЕ СЕКЦИИ ===
  
  // Основная информация
  const BasicInfoSection = useMemo(() => (
    <FormSection title="Основная информация">
      <FormRow>
        <FormField
          label="Номер акта"
          name="act_number"
          value={getFieldValue('act_number')}
          onChange={(e) => updateField('act_number', e.target.value)}
          error={getFieldError('act_number')}
          placeholder="№ акта"
          readonly={readonly}
        />
        <FormField
          label="Дата акта"
          name="act_date"
          type="date"
          value={getFieldValue('act_date')}
          onChange={(e) => updateField('act_date', e.target.value)}
          error={getFieldError('act_date')}
          readonly={readonly}
        />
        <FormField
          label="Время акта"
          name="act_time"
          type="time"
          value={getFieldValue('act_time')}
          onChange={(e) => updateField('act_time', e.target.value)}
          error={getFieldError('act_time')}
          readonly={readonly}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Лицевой счет"
          name="account_number"
          value={getFieldValue('account_number')}
          onChange={(e) => updateField('account_number', e.target.value)}
          error={getFieldError('account_number')}
          placeholder="Номер лицевого счета"
          readonly={readonly}
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField, readonly]);

  // Адрес
  const AddressSection = useMemo(() => (
    <FormSection title="Адрес проверки">
      <FormRow>
        <FormField
          label="Улица"
          name="street"
          value={getFieldValue('street')}
          onChange={(e) => updateField('street', e.target.value)}
          error={getFieldError('street')}
          placeholder="Название улицы"
          readonly={readonly}
        />
        <FormField
          label="Дом"
          name="house"
          value={getFieldValue('house')}
          onChange={(e) => updateField('house', e.target.value)}
          error={getFieldError('house')}
          placeholder="№ дома"
          readonly={readonly}
        />
        <FormField
          label="Квартира"
          name="apartment"
          value={getFieldValue('apartment')}
          onChange={(e) => updateField('apartment', e.target.value)}
          error={getFieldError('apartment')}
          placeholder="№ квартиры"
          readonly={readonly}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Полный адрес"
          name="address"
          value={getFieldValue('address')}
          onChange={(e) => updateField('address', e.target.value)}
          error={getFieldError('address')}
          placeholder="Полный адрес объекта"
          readonly={readonly}
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField, readonly]);

  // Участники проверки
  const ParticipantsSection = useMemo(() => (
    <FormSection title="Участники проверки">
      <FormRow>
        <FormField
          label="Представитель организации"
          name="organization_representative"
          value={getFieldValue('organization_representative')}
          onChange={(e) => updateField('organization_representative', e.target.value)}
          error={getFieldError('organization_representative')}
          placeholder="ФИО представителя организации"
          readonly={readonly}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Абонент"
          name="subscriber_name"
          value={getFieldValue('subscriber_name')}
          onChange={(e) => updateField('subscriber_name', e.target.value)}
          error={getFieldError('subscriber_name')}
          placeholder="ФИО абонента"
          readonly={readonly}
        />
        <FormField
          label="Документ абонента"
          name="subscriber_document"
          value={getFieldValue('subscriber_document')}
          onChange={(e) => updateField('subscriber_document', e.target.value)}
          error={getFieldError('subscriber_document')}
          placeholder="Паспорт, серия, номер"
          readonly={readonly}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Представитель абонента"
          name="subscriber_representative_name"
          value={getFieldValue('subscriber_representative_name')}
          onChange={(e) => updateField('subscriber_representative_name', e.target.value)}
          error={getFieldError('subscriber_representative_name')}
          placeholder="ФИО представителя абонента"
          readonly={readonly}
        />
        <FormField
          label="Документ представителя"
          name="subscriber_representative_document"
          value={getFieldValue('subscriber_representative_document')}
          onChange={(e) => updateField('subscriber_representative_document', e.target.value)}
          error={getFieldError('subscriber_representative_document')}
          placeholder="Документ представителя"
          readonly={readonly}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Свидетель"
          name="witness_name"
          value={getFieldValue('witness_name')}
          onChange={(e) => updateField('witness_name', e.target.value)}
          error={getFieldError('witness_name')}
          placeholder="ФИО свидетеля"
          readonly={readonly}
        />
        <FormField
          label="Документ свидетеля"
          name="witness_document"
          value={getFieldValue('witness_document')}
          onChange={(e) => updateField('witness_document', e.target.value)}
          error={getFieldError('witness_document')}
          placeholder="Документ свидетеля"
          readonly={readonly}
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField, readonly]);

  // Результаты проверки
  const ResultsSection = useMemo(() => (
    <FormSection title="Результаты проверки">
      <FormRow>
        <FormField
          label="Жилая площадь (м²)"
          name="living_area"
          type="number"
          value={getFieldValue('living_area')}
          onChange={(e) => updateField('living_area', e.target.value ? parseFloat(e.target.value) : undefined)}
          error={getFieldError('living_area')}
          placeholder="0.00"
          readonly={readonly}
        />
        <FormField
          label="Нежилая площадь (м²)"
          name="non_living_area"
          type="number"
          value={getFieldValue('non_living_area')}
          onChange={(e) => updateField('non_living_area', e.target.value ? parseFloat(e.target.value) : undefined)}
          error={getFieldError('non_living_area')}
          placeholder="0.00"
          readonly={readonly}
        />
        <FormField
          label="Количество проживающих"
          name="residents_count"
          type="number"
          value={getFieldValue('residents_count')}
          onChange={(e) => updateField('residents_count', e.target.value ? parseInt(e.target.value) : undefined)}
          error={getFieldError('residents_count')}
          placeholder="0"
          readonly={readonly}
        />
      </FormRow>

      <FormRow>
        <TextAreaField
          label="Выявленные нарушения"
          name="violations_found"
          value={getFieldValue('violations_found')}
          onChange={(e) => updateField('violations_found', e.target.value)}
          error={getFieldError('violations_found')}
          placeholder="Описание выявленных нарушений"
          rows={4}
          readonly={readonly}
        />
      </FormRow>

      <FormRow>
        <TextAreaField
          label="Мнение абонента"
          name="subscriber_opinion"
          value={getFieldValue('subscriber_opinion')}
          onChange={(e) => updateField('subscriber_opinion', e.target.value)}
          error={getFieldError('subscriber_opinion')}
          placeholder="Мнение абонента по результатам проверки"
          rows={3}
          readonly={readonly}
        />
      </FormRow>

      <FormRow>
        <TextAreaField
          label="Примечания"
          name="notes"
          value={getFieldValue('notes')}
          onChange={(e) => updateField('notes', e.target.value)}
          error={getFieldError('notes')}
          placeholder="Дополнительные примечания"
          rows={2}
          readonly={readonly}
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField, readonly]);

  // Счетчики
  const MetersSection = useMemo(() => (
    <FormSection title="Показания приборов учета">
      {data.meters?.map((meter, index) => (
        <div key={index} className="meter-block">
          <div className="meter-header">
            <h4>Прибор учета #{index + 1}</h4>
            {!readonly && (
              <button 
                type="button" 
                onClick={() => removeMeter(index)}
                className="btn btn-small btn-outline"
              >
                Удалить
              </button>
            )}
          </div>
          
          <FormRow>
            <FormField
              label="Номер счетчика"
              name={`meter_${index}_number`}
              value={meter.meter_number || ''}
              onChange={(e) => handleFieldChange(`meters.${index}.meter_number`, e.target.value)}
              placeholder="Номер прибора учета"
              readonly={readonly}
            />
            <FormField
              label="Тип счетчика"
              name={`meter_${index}_type`}
              value={meter.meter_type || ''}
              onChange={(e) => handleFieldChange(`meters.${index}.meter_type`, e.target.value)}
              placeholder="Тип прибора"
              readonly={readonly}
            />
            <FormField
              label="Текущие показания"
              name={`meter_${index}_reading`}
              type="number"
              value={meter.current_reading || ''}
              onChange={(e) => handleFieldChange(`meters.${index}.current_reading`, e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.000"
              readonly={readonly}
            />
          </FormRow>

          <FormRow>
            <FormField
              label="Номер пломбы"
              name={`meter_${index}_seal_number`}
              value={meter.seal_number || ''}
              onChange={(e) => handleFieldChange(`meters.${index}.seal_number`, e.target.value)}
              placeholder="Номер пломбы"
              readonly={readonly}
            />
            <FormField
              label="Цвет пломбы"
              name={`meter_${index}_seal_color`}
              value={meter.seal_color || ''}
              onChange={(e) => handleFieldChange(`meters.${index}.seal_color`, e.target.value)}
              placeholder="Цвет пломбы"
              readonly={readonly}
            />
            <FormField
              label="Газовое оборудование"
              name={`meter_${index}_gas_equipment`}
              value={meter.gas_equipment || ''}
              onChange={(e) => handleFieldChange(`meters.${index}.gas_equipment`, e.target.value)}
              placeholder="Описание газового оборудования"
              readonly={readonly}
            />
          </FormRow>

          {meter.notes && (
            <FormRow>
              <TextAreaField
                label="Примечания к прибору"
                name={`meter_${index}_notes`}
                value={meter.notes || ''}
                onChange={(e) => handleFieldChange(`meters.${index}.notes`, e.target.value)}
                placeholder="Примечания к прибору учета"
                rows={2}
                readonly={readonly}
              />
            </FormRow>
          )}
        </div>
      ))}
      
      {!readonly && (
        <button 
          type="button" 
          onClick={addMeter}
          className="btn btn-outline add-meter-btn"
        >
          + Добавить прибор учета
        </button>
      )}
    </FormSection>
  ), [data.meters, readonly, removeMeter, handleFieldChange, addMeter]);

  // === УСЛОВНЫЙ РЕНДЕР ===
  if (loading) {
    return (
      <div className="house-inspect-form">
        <div className="house-inspect-loading">
          <IonLoading isOpen={loading} message="Загрузка данных..." />
          Загрузка акта проверки...
        </div>
      </div>
    );
  }

  // === ОСНОВНОЙ РЕНДЕР ===
  return (
    <div className="house-inspect-form">
      <div className="form-header">
        <h2>
          {data.id ? 'Редактирование' : 'Создание'} акта проверки газифицированного объекта
          {data.account_number && ` (л/с №${data.account_number})`}
        </h2>
        <div className="form-actions">
          <button type="button" onClick={handlePrint} className="btn btn-secondary">
            Печать
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-outline">
              Отмена
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="house-inspect-form-content">
        {BasicInfoSection}
        {AddressSection}
        {ParticipantsSection}
        {ResultsSection}
        {MetersSection}

        {/* Кнопки управления */}
        {!readonly && (
          <div className="form-footer">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="btn btn-outline"
              >
                Отмена
              </button>
            )}
          </div>
        )}
      </form>

      {/* Модальное окно печати */}
      <IonModal isOpen={showPrintModal} onDidDismiss={handleClosePrintModal}>
        <ActHouseInspectPrint
          data={data}
          onClose={handleClosePrintModal}
        />
      </IonModal>
    </div>
  );
};

export default ActHouseInspect;