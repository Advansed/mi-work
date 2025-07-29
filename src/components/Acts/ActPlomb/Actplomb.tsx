import React, { useEffect } from 'react';
import { useActPlomb, ActPlombData } from './useActPlomb';

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
    console.log('Печать акта - будет реализовано в ActPlombPrint.tsx');
  };

  // Стили
  const styles = `
    .act-plomb-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Times New Roman', serif;
    }

    .act-header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #0066cc;
      padding-bottom: 15px;
    }

    .company-info {
      font-size: 14px;
      color: #333;
      margin-bottom: 10px;
    }

    .act-title {
      font-size: 18px;
      font-weight: bold;
      margin: 15px 0;
      text-transform: uppercase;
    }

    .act-form {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 25px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 15px;
    }

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e0e0e0;
    }

    .form-row {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      align-items: flex-start;
    }

    .form-group {
      flex: 1;
      min-width: 0;
    }

    .form-group.half {
      flex: 0 0 48%;
    }

    .form-group.third {
      flex: 0 0 32%;
    }

    .form-label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-input:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
    }

    .form-input.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }

    .meters-section {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 15px;
    }

    .meter-item {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
      position: relative;
    }

    .meter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .meter-number {
      font-weight: bold;
      color: #0066cc;
    }

    .remove-meter-btn {
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 12px;
    }

    .remove-meter-btn:hover {
      background: #c82333;
    }

    .add-meter-btn {
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
    }

    .add-meter-btn:hover {
      background: #218838;
    }

    .add-meter-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background: #0066cc;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #218838;
    }

    .btn:disabled {
      background: #e9ecef;
      color: #6c757d;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }
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
              
              <div className="form-group half">
                <label className="form-label">Дата получения</label>
                <input
                  type="date"
                  className="form-input"
                  value={data.received_date || ''}
                  onChange={(e) => handleFieldChange('received_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Адрес и абонент */}
          <div className="form-section">
            <div className="section-title">Адрес и абонент</div>
            
            <div className="form-row">
              <div className="form-group third">
                <label className="form-label">Квартира *</label>
                <input
                  type="text"
                  className={`form-input ${errors.apartment ? 'error' : ''}`}
                  value={data.apartment}
                  onChange={(e) => handleFieldChange('apartment', e.target.value)}
                />
                {errors.apartment && <div className="error-message">{errors.apartment}</div>}
              </div>
              
              <div className="form-group third">
                <label className="form-label">Дом *</label>
                <input
                  type="text"
                  className={`form-input ${errors.house ? 'error' : ''}`}
                  value={data.house}
                  onChange={(e) => handleFieldChange('house', e.target.value)}
                />
                {errors.house && <div className="error-message">{errors.house}</div>}
              </div>
              
              <div className="form-group third">
                <label className="form-label">Улица *</label>
                <input
                  type="text"
                  className={`form-input ${errors.street ? 'error' : ''}`}
                  value={data.street}
                  onChange={(e) => handleFieldChange('street', e.target.value)}
                />
                {errors.street && <div className="error-message">{errors.street}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
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
              <div className="form-group half">
                <label className="form-label">ФИО представителя *</label>
                <input
                  type="text"
                  className={`form-input ${errors.representative_name ? 'error' : ''}`}
                  value={data.representative_name}
                  onChange={(e) => handleFieldChange('representative_name', e.target.value)}
                />
                {errors.representative_name && <div className="error-message">{errors.representative_name}</div>}
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
    </>
  );
};

export default ActPlomb;