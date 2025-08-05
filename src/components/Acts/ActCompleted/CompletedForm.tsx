import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCompleted } from './useCompleted';
import './CompletedForm.css';
import { IonLoading, IonModal } from '@ionic/react';
import CompletedPrint from './CompletedPrint';
import { FormField, FormRow, FormSection, ReadOnlyField, TextAreaField } from '../Forms/Forms';

// === ТИПЫ И ИНТЕРФЕЙСЫ ===
interface CompletedFormProps {
  invoiceId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const CompletedForm: React.FC<CompletedFormProps> = ({
  invoiceId,
  onSave,
  onCancel
}) => {
  // === ОПТИМИЗИРОВАННЫЙ ХУК ===
  const {
    data,
    errors,
    loading,
    saving,
    updateField,           // Основной метод обновления
    handleFieldChange,     // Стабильная ссылка
    getFieldValue,         // Мемоизированный доступ
    getFieldError,         // Мемоизированный доступ
    validateForm,
    loadActByInvoice,
    saveAct,
    resetForm,
    setExecutorFromProfile,
    setDefaultQualityAssessment
  } = useCompleted();

  // === СОСТОЯНИЕ КОМПОНЕНТА ===
  const [showPrintModal, setShowPrintModal] = useState(false);

  // === ЗАГРУЗКА ДАННЫХ ===
  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    } else {
      // Для нового акта автоматически заполняем данные исполнителя
      setExecutorFromProfile();
    }
  }, [invoiceId, loadActByInvoice, setExecutorFromProfile]);

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await saveAct();
      if (result && onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Ошибка сохранения акта:', error);
    }
  }, [saveAct, onSave]);

  const handlePrint = useCallback(() => {
    setShowPrintModal(true);
  }, []);

  const handleAutoFillExecutor = useCallback(() => {
    setExecutorFromProfile();
  }, [setExecutorFromProfile]);

  const handleAutoFillQuality = useCallback(() => {
    setDefaultQualityAssessment();
  }, [setDefaultQualityAssessment]);

  // === ОПТИМИЗИРОВАННЫЕ СЕКЦИИ С USEMEMO ===

  const BasicInfoSection = useMemo(() => (
    <FormSection title="Основная информация">
      <FormRow>
        <ReadOnlyField
          label="Номер акта"
          value={data.act_number || (data.id ? 'Загрузка...' : 'Будет присвоен при сохранении')}
        //   hint={data.id ? 'Номер присвоен системой' : 'Номер будет сгенерирован автоматически при сохранении'}
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
    getFieldValue,
    getFieldError,
    updateField
  ]);

  const ExecutorSection = useMemo(() => (
    <FormSection title="Исполнитель работ">
      <FormRow>
        <FormField
          label="ФИО исполнителя"
          name="executor_name"
          required
          value={getFieldValue('executor_name')}
          onChange={(e) => updateField('executor_name', e.target.value)}
          error={getFieldError('executor_name')}
          placeholder="Введите ФИО исполнителя"
        />
        <FormField
          label="Должность"
          name="executor_position"
          value={getFieldValue('executor_position')}
          onChange={(e) => updateField('executor_position', e.target.value)}
          error={getFieldError('executor_position')}
          placeholder="Должность исполнителя"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField, handleAutoFillExecutor]);

  const ClientSection = useMemo(() => (
    <FormSection title="Заказчик (абонент)">
      <FormRow>
        <FormField
          label="ФИО заказчика"
          name="client_name"
          required
          value={getFieldValue('client_name')}
          onChange={(e) => updateField('client_name', e.target.value)}
          error={getFieldError('client_name')}
          placeholder="Введите ФИО заказчика"
        />
        <FormField
          label="Адрес выполнения работ"
          name="address"
          value={getFieldValue('address')}
          onChange={(e) => updateField('address', e.target.value)}
          error={getFieldError('address')}
          placeholder="Полный адрес"
          className="full-width"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const WorkDescriptionSection = useMemo(() => (
    <FormSection title="Описание выполненных работ">
      <FormRow>
        <TextAreaField
          label="Описание работ"
          name="work_description"
          required
          value={getFieldValue('work_description')}
          onChange={(e) => updateField('work_description', e.target.value)}
          error={getFieldError('work_description')}
          placeholder="Подробно опишите выполненные работы..."
          rows={4}
          className="full-width"
        />
      </FormRow>
      <FormRow>
        <TextAreaField
          label="Использованные материалы и оборудование"
          name="equipment_used"
          value={getFieldValue('equipment_used')}
          onChange={(e) => updateField('equipment_used', e.target.value)}
          error={getFieldError('equipment_used')}
          placeholder="Укажите использованные материалы, инструменты, оборудование..."
          rows={3}
          className="full-width"
        />
      </FormRow>
      <FormRow>
        <FormField
          label="Дата начала работ"
          name="work_started_date"
          type="date"
          value={getFieldValue('work_started_date')}
          onChange={(e) => updateField('work_started_date', e.target.value)}
          error={getFieldError('work_started_date')}
        />
        <FormField
          label="Дата окончания работ"
          name="work_completed_date"
          type="date"
          value={getFieldValue('work_completed_date')}
          onChange={(e) => updateField('work_completed_date', e.target.value)}
          error={getFieldError('work_completed_date')}
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const QualitySection = useMemo(() => (
    <FormSection title="Оценка качества работ">
      <FormRow>
        <FormField
          label="Оценка качества"
          name="quality_assessment"
          value={getFieldValue('quality_assessment')}
          onChange={(e) => updateField('quality_assessment', e.target.value)}
          error={getFieldError('quality_assessment')}
          placeholder="Оценка качества выполненных работ"
          className="full-width"
        />
      </FormRow>
      <FormRow>
        <div className="quality-auto-fill">
          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={handleAutoFillQuality}
          >
            ⭐ Стандартная оценка
          </button>
          <span className="auto-fill-hint">Заполнит стандартную формулировку качества</span>
        </div>
      </FormRow>
      <FormRow>
        <TextAreaField
          label="Обнаруженные недостатки"
          name="defects_found"
          value={getFieldValue('defects_found')}
          onChange={(e) => updateField('defects_found', e.target.value)}
          error={getFieldError('defects_found')}
          placeholder="Опишите выявленные недостатки (если есть)..."
          rows={3}
          className="full-width"
        />
      </FormRow>
      <FormRow>
        <TextAreaField
          label="Рекомендации"
          name="recommendations"
          value={getFieldValue('recommendations')}
          onChange={(e) => updateField('recommendations', e.target.value)}
          error={getFieldError('recommendations')}
          placeholder="Рекомендации по дальнейшей эксплуатации..."
          rows={3}
          className="full-width"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField, handleAutoFillQuality]);

  const SignaturesSection = useMemo(() => (
    <FormSection title="Подписи сторон">
      <FormRow>
        <FormField
          label="Подпись исполнителя"
          name="executor_signature"
          value={getFieldValue('executor_signature')}
          onChange={(e) => updateField('executor_signature', e.target.value)}
          error={getFieldError('executor_signature')}
          placeholder="ФИО исполнителя для подписи"
        />
        <FormField
          label="Подпись заказчика"
          name="client_signature"
          value={getFieldValue('client_signature')}
          onChange={(e) => updateField('client_signature', e.target.value)}
          error={getFieldError('client_signature')}
          placeholder="ФИО заказчика для подписи"
        />
      </FormRow>
      <FormRow>
        <FormField
          label="Подпись представителя (опционально)"
          name="representative_signature"
          value={getFieldValue('representative_signature')}
          onChange={(e) => updateField('representative_signature', e.target.value)}
          error={getFieldError('representative_signature')}
          placeholder="ФИО представителя организации"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const NotesSection = useMemo(() => (
    <FormSection title="Дополнительные сведения">
      <FormRow>
        <TextAreaField
          label="Примечания"
          name="notes"
          value={getFieldValue('notes')}
          onChange={(e) => updateField('notes', e.target.value)}
          error={getFieldError('notes')}
          placeholder="Дополнительные примечания, особые условия выполнения работ..."
          rows={3}
          className="full-width"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  // === УСЛОВНЫЙ РЕНДЕР ===
  if (loading) {
    return (
      <div className="completed-form">
        <div className="form-loading">
          <IonLoading isOpen={loading} message="Загрузка данных..." />
          Загрузка акта выполненных работ...
        </div>
      </div>
    );
  }

  // === ОСНОВНОЙ РЕНДЕР ===
  return (
    <div className="completed-form">
      <div className="form-header">
        <h2>
          {data.id ? 'Редактирование' : 'Создание'} акта выполненных работ
          {data.invoice_id && ` (Заявка №${data.invoice_id})`}
        </h2>
        <div className="form-actions">
          <button type="button" onClick={handlePrint} className="btn btn-secondary">
            🖨️ Печать
          </button>
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Отмена
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="completed-form-content">
        {BasicInfoSection}
        {ExecutorSection}
        {ClientSection}
        {WorkDescriptionSection}
        {QualitySection}
        {SignaturesSection}
        {NotesSection}

        {/* Кнопки управления */}
        <div className="form-footer">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? '💾 Сохранение...' : '💾 Сохранить акт'}
          </button>
        </div>
      </form>

      {/* Модальное окно печати */}
      <IonModal 
        isOpen={showPrintModal} 
        onDidDismiss={() => setShowPrintModal(false)}
        className="print-modal"
      >
        <CompletedPrint
          mode="print"
          data={data}
          onClose={() => setShowPrintModal(false)}
        />
      </IonModal>
    </div>
  );
};

export default CompletedForm;