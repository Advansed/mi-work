import React, { useEffect, useState } from 'react';
import { useActPrescript, PrescriptionData } from './useActPrescript';
import './ActPrescript.css'
import { IonModal } from '@ionic/react';
import ActPrescriptPrint from './ActPrescriptPrint';

interface ActPrescriptProps {
  invoiceId?: string;
  onSave?: (data: PrescriptionData) => void;
  onCancel?: () => void;
}

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
    handleFieldChange,
    loadActByInvoice,
    saveAct
  } = useActPrescript();

  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    }
  }, [invoiceId, loadActByInvoice]);

  // Обработчик сохранения
  const handleSave = async () => {
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

  if (loading) {
    return (
      <div className="act-prescript-container">
        <div className="loading">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <>
      <div className="act-prescript-container">
        <div className="act-header">
          <div className="company-info">
            Структурное подразделение Управление по сбытовой деятельности «Сахатранснефтегаз»
          </div>
          <div className="act-title">
            Предписание за нарушение правил пользования газом в быту
          </div>
          {data.prescription_number && (
            <div>№ {data.prescription_number}</div>
          )}
        </div>

        <div className="act-form">
          {/* Основная информация */}
          <div className="form-section">
            <div className="section-title">Основная информация</div>
            
            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">Дата предписания *</label>
                <input
                  type="date"
                  className={`form-input ${errors.prescription_date ? 'error' : ''}`}
                  value={data.prescription_date}
                  onChange={(e) => handleFieldChange('prescription_date', e.target.value)}
                />
                {errors.prescription_date && <div className="error-message">{errors.prescription_date}</div>}
              </div>

              <div className="form-group half">
                <label className="form-label">Срок устранения *</label>
                <input
                  type="date"
                  className={`form-input ${errors.deadline_date ? 'error' : ''}`}
                  value={data.deadline_date}
                  onChange={(e) => handleFieldChange('deadline_date', e.target.value)}
                />
                {errors.deadline_date && <div className="error-message">{errors.deadline_date}</div>}
              </div>
            </div>
          </div>

          {/* Адрес и абонент */}
          <div className="form-section">
            <div className="section-title">Адрес и абонент</div>
            
            <div className="form-row">
              <div className="form-group full">
                <label className="form-label">Адрес проверки *</label>
                <input
                  type="text"
                  className={`form-input ${errors.check_address ? 'error' : ''}`}
                  value={data.check_address}
                  onChange={(e) => handleFieldChange('check_address', e.target.value)}
                />
                {errors.check_address && <div className="error-message">{errors.check_address}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">Лицевой счет</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.account_number}
                  onChange={(e) => handleFieldChange('account_number', e.target.value)}
                />
              </div>

              <div className="form-group half">
                <label className="form-label">Номер телефона</label>
                <input
                  type="tel"
                  className="form-input"
                  value={data.subscriber_phone}
                  onChange={(e) => handleFieldChange('subscriber_phone', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label className="form-label">ФИО абонента *</label>
                <input
                  type="text"
                  className={`form-input ${errors.subscriber_name ? 'error' : ''}`}
                  value={data.subscriber_name}
                  onChange={(e) => handleFieldChange('subscriber_name', e.target.value)}
                />
                {errors.subscriber_name && <div className="error-message">{errors.subscriber_name}</div>}
              </div>
            </div>
          </div>

          {/* Нарушения */}
          <div className="form-section">
            <div className="section-title">Нарушения</div>
            
            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">Тип нарушения</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.violation_type}
                  onChange={(e) => handleFieldChange('violation_type', e.target.value)}
                />
              </div>

              <div className="form-group half">
                <label className="form-label">Статус</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label className="form-label">Описание нарушений *</label>
                <textarea
                  className={`form-input ${errors.violations_text ? 'error' : ''}`}
                  value={data.violations_text}
                  onChange={(e) => handleFieldChange('violations_text', e.target.value)}
                  rows={6}
                />
                {errors.violations_text && <div className="error-message">{errors.violations_text}</div>}
              </div>
            </div>
          </div>

          {/* Представители */}
          <div className="form-section">
            <div className="section-title">Представители</div>
            
            <div className="form-row">
              <div className="form-group full">
                <label className="form-label">Представитель организации</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.organization_representative}
                  onChange={(e) => handleFieldChange('organization_representative', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">Подпись абонента</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.subscriber_signature}
                  onChange={(e) => handleFieldChange('subscriber_signature', e.target.value)}
                />
              </div>

              <div className="form-group half">
                <label className="form-label">Представитель абонента</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.subscriber_representative}
                  onChange={(e) => handleFieldChange('subscriber_representative', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label className="form-label">Путь к документу</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.document_scan_path}
                  onChange={(e) => handleFieldChange('document_scan_path', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="action-buttons">
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Отмена
              </button>
            )}
            
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
            >
              Печать
            </button>
            
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
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