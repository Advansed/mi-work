import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useActPlomb } from './useActPlomb';
import './ActPlombForm.css';
import { IonLoading, IonModal } from '@ionic/react';
import { FormField, FormRow, FormSection, ReadOnlyField, TextAreaField } from '../Forms/Forms';

import { PDFDoc } from '../../Files/Files';


// === ТИПЫ И ИНТЕРФЕЙСЫ ===
interface ActPlombFormProps {
  invoiceId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const ActPlombForm: React.FC<ActPlombFormProps> = ({
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
    updateField,            // Новая функция: обновление + очистка ошибки
    setLoading,             // Теперь стабильная ссылка!
    handleMeterChange,
    addMeter,
    removeMeter,
    loadActByInvoice,
    saveAct,
    getPDF
  } = useActPlomb();

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [ pdf, setPDF ] = useState( '' )

  const handleGeneratePDF = useCallback(async () => {
    setLoading(true);
    try {
      // Конвертируем данные формы в формат PDF
      const pdfData = await getPDF();
      setPDF( pdfData )
      setShowPrintModal( true )
      console.log('PDF успешно создан и скачан');
    } catch (error: any) {
      console.error('Ошибка генерации PDF:', error);
      alert(`Ошибка создания PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [data]);


  // === HELPER ФУНКЦИИ ===
  const getFieldValue = useCallback((field: string) => {
    return (data as any)[field] || '';
  }, [data]);

  const getFieldError = useCallback((field: string) => {
    return (errors as any)[field] || '';
  }, [errors]);

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===
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
  }, [saveAct, onSave]);

  const handlePrint = useCallback(() => {
    setShowPrintModal(true);
  }, []);

  const handleClosePrintModal = useCallback(() => {
    setShowPrintModal(false);
  }, []);

  // === ЭФФЕКТЫ ===
  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    }
  }, [invoiceId, loadActByInvoice]);

  // === СЕКЦИИ ФОРМЫ ===
  const BasicInfoSection = useMemo(() => (
    <FormSection title="Основная информация">
      <FormRow>
        <ReadOnlyField
          label="Номер акта"
          value={data.act_number || (loading ? 'Загрузка...' : 'Будет присвоен при сохранении')}
          // hint={data.id ? 'Номер присвоен системой' : 'Номер будет сгенерирован автоматически при сохранении'}
        />
        <FormField
          label="Дата акта"
          name="act_date"
          type="date"
          required
          value={getFieldValue('act_date')}
          onChange={(e) => updateField('act_date', e.target.value)}
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
    loading,
    getFieldValue,
    getFieldError,
    updateField
  ]);

  const AddressSection = useMemo(() => (
    <FormSection title="Адрес и абонент">
      <FormRow>
        <FormField
          label="Улица"
          name="street"
          required
          value={getFieldValue('street')}
          onChange={(e) => updateField('street', e.target.value)}
          error={getFieldError('street')}
          placeholder="Название улицы"
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
          label="Квартира"
          name="apartment"
          required
          value={getFieldValue('apartment')}
          onChange={(e) => updateField('apartment', e.target.value)}
          error={getFieldError('apartment')}
          placeholder="№ кв."
        />
      </FormRow>
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

  const RepresentativeSection = useMemo(() => (
    <FormSection title="Представитель УСД">
      <FormRow>
        <FormField
          label="ФИО представителя"
          name="usd_representative"
          required
          value={getFieldValue('usd_representative')}
          onChange={(e) => updateField('usd_representative', e.target.value)}
          error={getFieldError('usd_representative')}
          placeholder="Введите ФИО представителя"
        />
        <FormField
          label="Должность представителя"
          name="representative_position"
          value={getFieldValue('representative_position')}
          onChange={(e) => updateField('representative_position', e.target.value)}
          error={getFieldError('representative_position')}
          placeholder="Должность"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const MetersSection = useMemo(() => (
    <FormSection title="Приборы учета">
      {data.meters.map((meter, index) => (
        <div key={index} className="meter-group">
          <FormRow>
            <FormField
              label="Номер счетчика"
              name={`meter_${index}_number`}
              required
              value={meter.meter_number}
              onChange={(e) => handleMeterChange(index, 'meter_number', e.target.value)}
              error={errors.meters?.[index]?.meter_number}
              placeholder="Номер прибора учета"
            />
            <FormField
              label="Номер пломбы"
              name={`meter_${index}_seal`}
              required
              value={meter.seal_number}
              onChange={(e) => handleMeterChange(index, 'seal_number', e.target.value)}
              error={errors.meters?.[index]?.seal_number}
              placeholder="Номер пломбы"
            />
            <FormField
              label="Текущие показания"
              name={`meter_${index}_reading`}
              type="number"
              value={meter.current_reading?.toString() || ''}
              onChange={(e) => handleMeterChange(index, 'current_reading', e.target.value || '0')}
              error={errors.meters?.[index]?.current_reading}
              placeholder="м³"
            />
          </FormRow>
          <FormRow>
            <FormField
              label="Тип счетчика"
              name={`meter_${index}_type`}
              value={meter.meter_type || ''}
              onChange={(e) => handleMeterChange(index, 'meter_type', e.target.value)}
              error={errors.meters?.[index]?.meter_type}
              placeholder="Тип прибора учета"
            />
            <TextAreaField
              label="Примечания"
              name={`meter_${index}_notes`}
              value={meter.notes || ''}
              onChange={(e) => handleMeterChange(index, 'notes', e.target.value)}
              error={errors.meters?.[index]?.notes}
              placeholder="Дополнительная информация"
              rows={2}
            />
            {data.meters.length > 1 && (
              <div className="form-group">
                <label>&nbsp;</label>
                <button
                  type="button"
                  onClick={() => removeMeter(index)}
                  className="btn btn-small btn-outline btn-danger"
                >
                  Удалить
                </button>
              </div>
            )}
          </FormRow>
        </div>
      ))}
      
      <div className="add-meter-section">
        <button
          type="button"
          onClick={addMeter}
          className="btn btn-small btn-outline"
        >
          Добавить прибор учета
        </button>
      </div>
    </FormSection>
  ), [data.meters, errors.meters, handleMeterChange, addMeter, removeMeter]);

  const AdminSection = useMemo(() => (
    <FormSection title="Дополнительная информация">
      <FormRow>
        <FormField
          label="Дата получения"
          name="received_date"
          type="date"
          value={getFieldValue('received_date')}
          onChange={(e) => updateField('received_date', e.target.value)}
          error={getFieldError('received_date')}
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  // === УСЛОВНЫЙ РЕНДЕР ===
  if (loading) {
    return (
      <div className="plomb-form">
        <div className="plomb-form-loading">
          <IonLoading isOpen={loading} message="Загрузка данных..." />
          Загрузка акта...
        </div>
      </div>
    );
  }

  // === ОСНОВНОЙ РЕНДЕР ===
  return (
    <div className="plomb-form">
      <div className="form-header">
        <h2>
          {data.id ? 'Редактирование' : 'Создание'} акта пломбирования
          {data.invoice_id && ` (Заявка №${data.invoice_id})`}
        </h2>
        <div className="form-actions">
          <button type="button" onClick={handleGeneratePDF} className="btn btn-secondary">
            Печать
          </button>
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Отмена
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="plomb-act-form">
        {BasicInfoSection}
        {AddressSection}
        {RepresentativeSection}
        {MetersSection}
        {AdminSection}

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
      <IonModal isOpen={ showPrintModal } onDidDismiss={handleClosePrintModal}>
        <PDFDoc url = { pdf } name = { "PDF" }  title = { "PDF"}/>
      </IonModal>
    </div>
  );
};

export default ActPlombForm;