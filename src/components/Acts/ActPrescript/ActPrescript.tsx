// src/components/Acts/ActPrescript/ActPrescript.tsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useActPrescript } from './useActPrescript';
import { IPrescriptionForm } from './types';
import './ActPrescript.css';
import { IonModal, IonLoading } from '@ionic/react';
import ActPrescriptPrint from './ActPrescriptPrint';
import { FormField, FormRow, FormSection, ReadOnlyField, TextAreaField } from '../Forms/Forms';

// === ТИПЫ И ИНТЕРФЕЙСЫ ===
interface ActPrescriptProps {
  invoiceId?: string;
  onSave?: (data: IPrescriptionForm) => void;
  onCancel?: () => void;
}

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const ActPrescript: React.FC<ActPrescriptProps> = ({ 
  invoiceId, 
  onSave, 
  onCancel 
}) => {
  const {
    data,
    errors,
    loading,
    saving,
    getFieldValue,
    getFieldError,
    updateField,
    loadActByInvoice,
    saveAct
  } = useActPrescript();

  const [showPrintModal, setShowPrintModal] = useState(false);

  // === ЭФФЕКТЫ ===
  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    }
  }, [invoiceId, loadActByInvoice]);

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===
  const handleSave = useCallback(async () => {
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

  // === СЕКЦИИ ФОРМЫ ===
  const BasicInfoSection = useMemo(() => (
    <FormSection title="">

      <FormRow>
        <ReadOnlyField
          label="Номер предписания"
          value={data.prescription_number || (loading ? 'Загрузка...' : 'Будет присвоен при сохранении')}
          // hint={data.id ? 'Номер присвоен системой' : 'Номер будет сгенерирован автоматически при сохранении'}
        />
        <FormField
          label="Дата предписания"
          name="prescription_date"
          type="date"
          required
          value={getFieldValue('prescription_date')}
          onChange={(e) => updateField('prescription_date', e.target.value)}
          error={getFieldError('prescription_date')}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Срок устранения"
          name="deadline_date"
          type="date"
          required
          value={getFieldValue('deadline_date')}
          onChange={(e) => updateField('deadline_date', e.target.value)}
          error={getFieldError('deadline_date')}
        />
        {data.invoice_id && (
          <ReadOnlyField
            label="Связанная заявка"
            value={`Заявка №${data.invoice_id}`}
            // hint="Предписание создано для данной заявки"
          />
        )}
      </FormRow>
    </FormSection>
  ), [
    getFieldValue,
    getFieldError,
    updateField,
    data.prescription_number,
    data.id,
    data.invoice_id,
    loading,
    handlePrint
  ]);

  const AddressSection = useMemo(() => (
    <FormSection title="Адрес и абонент">
      <FormRow>
        <FormField
          label="Адрес проверки"
          name="check_address"
          required
          value={getFieldValue('check_address')}
          onChange={(e) => updateField('check_address', e.target.value)}
          error={getFieldError('check_address')}
          placeholder="Полный адрес объекта проверки"
        />
        <FormField
          label="Лицевой счет"
          name="account_number"
          value={getFieldValue('account_number')}
          onChange={(e) => updateField('account_number', e.target.value)}
          error={getFieldError('account_number')}
          placeholder="Номер лицевого счета"
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
          placeholder="Полное имя абонента"
        />
        <FormField
          label="Телефон абонента"
          name="subscriber_phone"
          value={getFieldValue('subscriber_phone')}
          onChange={(e) => updateField('subscriber_phone', e.target.value)}
          error={getFieldError('subscriber_phone')}
          placeholder="+7 (xxx) xxx-xx-xx"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const ViolationsSection = useMemo(() => (
    <FormSection title="Нарушения">
      <FormRow>
        <TextAreaField
          label="Описание нарушений"
          name="violations_text"
          required
          value={getFieldValue('violations_text')}
          onChange={(e) => updateField('violations_text', e.target.value)}
          error={getFieldError('violations_text')}
          placeholder="Подробное описание выявленных нарушений"
          rows={6}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Тип нарушения"
          name="violation_type"
          value={getFieldValue('violation_type')}
          onChange={(e) => updateField('violation_type', e.target.value)}
          error={getFieldError('violation_type')}
          placeholder="Категория нарушения"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  const SignaturesSection = useMemo(() => (
    <FormSection title="Представители и подписи">
      <FormRow>
        <FormField
          label="Представитель организации"
          name="organization_representative"
          value={getFieldValue('organization_representative')}
          onChange={(e) => updateField('organization_representative', e.target.value)}
          error={getFieldError('organization_representative')}
          placeholder="ФИО представителя организации"
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Подпись абонента"
          name="subscriber_signature"
          value={getFieldValue('subscriber_signature')}
          onChange={(e) => updateField('subscriber_signature', e.target.value)}
          error={getFieldError('subscriber_signature')}
          placeholder="Подпись абонента"
        />
        <FormField
          label="Представитель абонента"
          name="subscriber_representative"
          value={getFieldValue('subscriber_representative')}
          onChange={(e) => updateField('subscriber_representative', e.target.value)}
          error={getFieldError('subscriber_representative')}
          placeholder="ФИО представителя абонента"
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Путь к документу"
          name="document_scan_path"
          value={getFieldValue('document_scan_path')}
          onChange={(e) => updateField('document_scan_path', e.target.value)}
          error={getFieldError('document_scan_path')}
          placeholder="Путь к скану документа"
        />
      </FormRow>
    </FormSection>
  ), [getFieldValue, getFieldError, updateField]);

  // === РЕНДЕР ===
  return (
    <>
      <IonLoading isOpen={loading} message="Загрузка данных..." />
    
      <div className="act-prescript-container">

        <div className="form-header">
          <h2>
            {data.id ? 'Редактирование' : 'Создание'} предписание за нарушение правил пользования газом в быту
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

        <div className="act-form">
          {BasicInfoSection}
          {AddressSection}
          {ViolationsSection}
          {SignaturesSection}
        </div>

        {/* Кнопка сохранить внизу */}
        <div className="bottom-actions">
          <button
            type="button"
            className="btn btn-success btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
      
      {/* Модальное окно печати */}
      <IonModal isOpen={showPrintModal} onDidDismiss={handleClosePrintModal}>
        <ActPrescriptPrint
          data={data} 
          mode="print" 
          onClose={handleClosePrintModal} 
        />
      </IonModal>
    </>
  );
};

export default ActPrescript;