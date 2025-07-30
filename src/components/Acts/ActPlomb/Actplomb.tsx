import React, { useEffect, useState } from 'react';
import { useActPlomb, ActPlombData } from './useActPlomb';
import './ActPlomb.css'
import { IonModal } from '@ionic/react';
import ActPlombPrint from './ActPlombPrint';

interface ActPlombProps {
  invoiceId?: string;
  onSave?: (data: ActPlombData) => void;
  onCancel?: () => void;
}

const ActPlomb: React.FC<ActPlombProps> = ({ 
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
    handleMeterChange,
    addMeter,
    removeMeter,
    loadActByInvoice,
    saveAct
  } = useActPlomb();

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

  // Обработчик печати (заглушка)
  const handlePrint = () => {
    // TODO: Открыть ActPlombPrint.tsx
    setShowPrintModal( true )
    console.log('Печать акта - будет реализовано в ActPlombPrint.tsx');
  };

  // Стили
  const styles = `
  `;

  if (loading) {
    return (
      <div className="act-plomb-container">
        <div className="loading">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="act-plomb-container">
        <div className="act-header">
          <div className="company-info">
            Структурное подразделение Управление по сбытовой деятельности «Сахатранснефтегаз»
          </div>
          <div className="act-title">
            Акт пломбирования прибора учета газа
          </div>
          {data.act_number && (
            <div>№ {data.act_number}</div>
          )}
        </div>

        <div className="act-form">
          {/* Основная информация */}
          <div className="form-section">
            <div className="section-title">Основная информация</div>
            
            <div className="form-row">

              <div className="form-group half">
                <label className="form-label">Дата акта *</label>
                <input
                  type="date"
                  className={`form-input ${errors.act_date ? 'error' : ''}`}
                  value={data.act_date}
                  onChange={(e) => handleFieldChange('act_date', e.target.value)}
                />
                {errors.act_date && <div className="error-message">{errors.act_date}</div>}
              </div>
              
            </div>
          </div>

          {/* Адрес и абонент */}
          <div className="form-section">
            <div className="section-title">Адрес и абонент</div>
            
            <div className="form-row">

              <div className="form-group third w-100">
                <label className="form-label">Улица *</label>
                <input
                  type="text"
                  className={`form-input ${errors.street ? 'error' : ''}`}
                  value={data.street}
                  onChange={(e) => handleFieldChange('street', e.target.value)}
                />
                {errors.street && <div className="error-message">{errors.street}</div>}
              </div>

              <div className='flex fl-space w-100'>

                <div className="form-group third w-50">
                  <label className="form-label">Дом *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.house ? 'error' : ''}`}
                    value={data.house}
                    onChange={(e) => handleFieldChange('house', e.target.value)}
                  />
                  {errors.house && <div className="error-message">{errors.house}</div>}
                </div>

                <div className="form-group third w-50">
                  <label className="form-label">Квартира *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.apartment ? 'error' : ''}`}
                    value={data.apartment}
                    onChange={(e) => handleFieldChange('apartment', e.target.value)}
                  />
                  {errors.apartment && <div className="error-message">{errors.apartment}</div>}
                </div>

              </div>

            </div>

            <div className="form-row">
              <div className="form-group w-100">
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

          {/* Представитель УСД */}
          <div className="form-section">
            <div className="section-title">Представитель УСД</div>
            
            <div className="form-row">
              <div className="form-group w-100">
                <label className="form-label">ФИО представителя *</label>
                <input
                  type="text"
                  className={`form-input ${errors.usd_representative ? 'error' : ''}`}
                  value={data.usd_representative}
                  onChange={(e) => handleFieldChange('usd_representative', e.target.value)}
                />
                {errors.usd_representative && <div className="error-message">{errors.usd_representative}</div>}
              </div>
              
              <div className="form-group half">
                <label className="form-label">Должность *</label>
                <input
                  type="text"
                  className={`form-input ${errors.representative_position ? 'error' : ''}`}
                  value={data.representative_position}
                  onChange={(e) => handleFieldChange('representative_position', e.target.value)}
                />
                {errors.representative_position && <div className="error-message">{errors.representative_position}</div>}
              </div>
            </div>
          </div>

          {/* Счетчики */}
          <div className="form-section">
            <div className="section-title">Приборы учета</div>
            
            <div className="meters-section">
              {data.meters.map((meter, index) => (
                <div key={index} className="meter-item">
                  <div className="meter-header">
                    <div className="meter-number">Счетчик #{index + 1}</div>
                    <button
                      type="button"
                      className="remove-meter-btn"
                      onClick={() => removeMeter(index)}
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label className="form-label">Номер счетчика *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.meters?.[index]?.meter_number ? 'error' : ''}`}
                        value={meter.meter_number}
                        onChange={(e) => handleMeterChange(index, 'meter_number', e.target.value)}
                      />
                      {errors.meters?.[index]?.meter_number && (
                        <div className="error-message">{errors.meters[index].meter_number}</div>
                      )}
                    </div>

                    <div className="form-group half">
                      <label className="form-label">Номер пломбы *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.meters?.[index]?.seal_number ? 'error' : ''}`}
                        value={meter.seal_number}
                        onChange={(e) => handleMeterChange(index, 'seal_number', e.target.value)}
                      />
                      {errors.meters?.[index]?.seal_number && (
                        <div className="error-message">{errors.meters[index].seal_number}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group third">
                      <label className="form-label">Текущие показания (м³)</label>
                      <input
                        type="number"
                        step="0.001"
                        className="form-input"
                        value={meter.current_reading || ''}
                        onChange={(e) => handleMeterChange(index, 'current_reading', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="form-group third">
                      <label className="form-label">Тип счетчика</label>
                      <input
                        type="text"
                        className="form-input"
                        value={meter.meter_type || ''}
                        onChange={(e) => handleMeterChange(index, 'meter_type', e.target.value)}
                      />
                    </div>

                    <div className="form-group third">
                      <label className="form-label">Примечания</label>
                      <input
                        type="text"
                        className="form-input"
                        value={meter.notes || ''}
                        onChange={(e) => handleMeterChange(index, 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="add-meter-btn"
                onClick={addMeter}
                disabled={data.meters.length >= 10}
              >
                + Добавить счетчик
              </button>

              {errors.meters?.[0]?.meter_number && data.meters.length === 0 && (
                <div className="error-message">{errors.meters[0].meter_number}</div>
              )}
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
          <ActPlombPrint
              data={data} 
              mode="print" 
              onClose={ handleClosePrintModal } 
          />
      </IonModal>

    </>
  );
};

export default ActPlomb;