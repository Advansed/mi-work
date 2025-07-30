import React, { useState, useEffect } from 'react';
import { 
  useActHouseInspects, 
  HouseInspectData, 
  HouseMeterData 
} from './useActHouseInspects';
import './ActHouseInspect.css';
import { IonModal } from '@ionic/react';
import ActHouseInspectPrint from './ActHouseInspectPrint';

// ============================================
// ИНТЕРФЕЙСЫ КОМПОНЕНТА
// ============================================

interface ActHouseInspectsProps {
  invoiceId?: string;
  onSave?: (data: HouseInspectData) => void;
  onCancel?: () => void;
  readonly?: boolean;
}

interface AccordionState {
  main: boolean;
  participants: boolean;
  results: boolean;
  meters: boolean;
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

const ActHouseInspects: React.FC<ActHouseInspectsProps> = ({
  invoiceId,
  onSave,
  onCancel,
  readonly = false
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
  } = useActHouseInspects();

  // Состояние аккордеонов
  const [accordions, setAccordions] = useState<AccordionState>({
    main: true,
    participants: false,
    results: false,
    meters: false
  });

  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
  };

  const handlePrint = ()=>{
    setShowPrintModal( true )
  }
  // ============================================
  // ЭФФЕКТЫ
  // ============================================

  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    }
  }, [invoiceId, loadActByInvoice]);

  // ============================================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ============================================

  const handleSave = async () => {
    const savedData = await saveAct();
    if (savedData && onSave) {
      onSave(savedData);
    }
  };

  const toggleAccordion = (section: keyof AccordionState) => {
    setAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ============================================
  // РЕНДЕР ФУНКЦИИ
  // ============================================

  const renderHeader = () => (
    <div className="house-inspect-header">
      <div className="header-content">
        <h2 className="header-title">
          {data.id ? 'Редактирование акта проверки' : 'Создание акта проверки'}
        </h2>
        {invoiceId && (
          <p className="header-subtitle">Заявка #{invoiceId}</p>
        )}
      </div>
      <div className="header-actions">
        {!readonly && (
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={saving}
            >
              Отмена
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={ handlePrint }
            >
              Печать
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderMainSection = () => (
    <div className="form-section">
      <div 
        className="section-header"
        onClick={() => toggleAccordion('main')}
      >
        <h3>Основная информация</h3>
        <span className={`accordion-icon ${accordions.main ? 'open' : ''}`}>▼</span>
      </div>
      
      {accordions.main && (
        <div className="section-content">
          <div className="form-row">
            <div className="form-group half">
              <label className="form-label required">Номер акта</label>
              <input
                type="text"
                className={`form-input ${errors.act_number ? 'error' : ''}`}
                value={data.act_number || ''}
                onChange={(e) => !readonly && handleFieldChange('act_number', e.target.value)}
                placeholder="Номер акта"
                readOnly={readonly}
              />
              {errors.act_number && (
                <span className="error-text">{errors.act_number}</span>
              )}
            </div>
            
            <div className="form-group quarter">
              <label className="form-label required">Дата</label>
              <input
                type="date"
                className={`form-input ${errors.act_date ? 'error' : ''}`}
                value={data.act_date}
                onChange={(e) => !readonly && handleFieldChange('act_date', e.target.value)}
                readOnly={readonly}
              />
              {errors.act_date && (
                <span className="error-text">{errors.act_date}</span>
              )}
            </div>
            
            <div className="form-group quarter">
              <label className="form-label">Время</label>
              <input
                type="time"
                className={`form-input ${errors.act_time ? 'error' : ''}`}
                value={data.act_time || ''}
                onChange={(e) => !readonly && handleFieldChange('act_time', e.target.value)}
                readOnly={readonly}
              />
              {errors.act_time && (
                <span className="error-text">{errors.act_time}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">Номер лицевого счета</label>
              <input
                type="text"
                className="form-input"
                value={data.account_number || ''}
                onChange={(e) => !readonly && handleFieldChange('account_number', e.target.value)}
                placeholder="Лицевой счет"
                readOnly={readonly}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-100">
              <label className="form-label">Адрес проверки</label>
              <input
                type="text"
                className="form-input"
                value={data.address || ''}
                onChange={(e) => !readonly && handleFieldChange('address', e.target.value)}
                placeholder="Полный адрес"
                readOnly={readonly}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">Улица</label>
              <input
                type="text"
                className="form-input"
                value={data.street || ''}
                onChange={(e) => !readonly && handleFieldChange('street', e.target.value)}
                placeholder="Название улицы"
                readOnly={readonly}
              />
            </div>
            <div className="form-group quarter">
              <label className="form-label">Дом</label>
              <input
                type="text"
                className="form-input"
                value={data.house || ''}
                onChange={(e) => !readonly && handleFieldChange('house', e.target.value)}
                placeholder="№ дома"
                readOnly={readonly}
              />
            </div>
            <div className="form-group quarter">
              <label className="form-label">Квартира</label>
              <input
                type="text"
                className="form-input"
                value={data.apartment || ''}
                onChange={(e) => !readonly && handleFieldChange('apartment', e.target.value)}
                placeholder="№ кв."
                readOnly={readonly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderParticipantsSection = () => (
    <div className="form-section">
      <div 
        className="section-header"
        onClick={() => toggleAccordion('participants')}
      >
        <h3>Участники проверки</h3>
        <span className={`accordion-icon ${accordions.participants ? 'open' : ''}`}>▼</span>
      </div>
      
      {accordions.participants && (
        <div className="section-content">
          <div className="form-row">
            <div className="form-group w-100">
              <label className="form-label required">Представитель организации</label>
              <input
                type="text"
                className={`form-input ${errors.organization_representative ? 'error' : ''}`}
                value={data.organization_representative}
                onChange={(e) => !readonly && handleFieldChange('organization_representative', e.target.value)}
                placeholder="ФИО представителя организации"
                readOnly={readonly}
              />
              {errors.organization_representative && (
                <span className="error-text">{errors.organization_representative}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label className="form-label required">ФИО абонента</label>
              <input
                type="text"
                className={`form-input ${errors.subscriber_name ? 'error' : ''}`}
                value={data.subscriber_name}
                onChange={(e) => !readonly && handleFieldChange('subscriber_name', e.target.value)}
                placeholder="Полное ФИО абонента"
                readOnly={readonly}
              />
              {errors.subscriber_name && (
                <span className="error-text">{errors.subscriber_name}</span>
              )}
            </div>
            <div className="form-group half">
              <label className="form-label">Документ абонента</label>
              <input
                type="text"
                className="form-input"
                value={data.subscriber_document || ''}
                onChange={(e) => !readonly && handleFieldChange('subscriber_document', e.target.value)}
                placeholder="Реквизиты документа"
                readOnly={readonly}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">ФИО представителя абонента</label>
              <input
                type="text"
                className="form-input"
                value={data.subscriber_representative_name || ''}
                onChange={(e) => !readonly && handleFieldChange('subscriber_representative_name', e.target.value)}
                placeholder="ФИО представителя"
                readOnly={readonly}
              />
            </div>
            <div className="form-group half">
              <label className="form-label">Документ представителя</label>
              <input
                type="text"
                className="form-input"
                value={data.subscriber_representative_document || ''}
                onChange={(e) => !readonly && handleFieldChange('subscriber_representative_document', e.target.value)}
                placeholder="Реквизиты документа"
                readOnly={readonly}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">ФИО понятого</label>
              <input
                type="text"
                className="form-input"
                value={data.witness_name || ''}
                onChange={(e) => !readonly && handleFieldChange('witness_name', e.target.value)}
                placeholder="ФИО понятого"
                readOnly={readonly}
              />
            </div>
            <div className="form-group half">
              <label className="form-label">Документ понятого</label>
              <input
                type="text"
                className="form-input"
                value={data.witness_document || ''}
                onChange={(e) => !readonly && handleFieldChange('witness_document', e.target.value)}
                placeholder="Реквизиты документа"
                readOnly={readonly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderResultsSection = () => (
    <div className="form-section">
      <div 
        className="section-header"
        onClick={() => toggleAccordion('results')}
      >
        <h3>Результаты проверки</h3>
        <span className={`accordion-icon ${accordions.results ? 'open' : ''}`}>▼</span>
      </div>
      
      {accordions.results && (
        <div className="section-content">
          <div className="form-row">
            <div className="form-group w-100">
              <label className="form-label">Выявленные нарушения</label>
              <textarea
                className="form-textarea"
                rows={6}
                value={data.violations_found || ''}
                onChange={(e) => !readonly && handleFieldChange('violations_found', e.target.value)}
                placeholder="Подробное описание выявленных нарушений..."
                readOnly={readonly}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group third">
              <label className="form-label">Жилая площадь (м²)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={data.living_area || ''}
                onChange={(e) => !readonly && handleFieldChange('living_area', parseFloat(e.target.value) || '')}
                placeholder="0.00"
                readOnly={readonly}
              />
            </div>
            <div className="form-group third">
              <label className="form-label">Нежилая площадь (м²)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={data.non_living_area || ''}
                onChange={(e) => !readonly && handleFieldChange('non_living_area', parseFloat(e.target.value) || '')}
                placeholder="0.00"
                readOnly={readonly}
              />
            </div>
            <div className="form-group third">
              <label className="form-label">Количество жильцов</label>
              <input
                type="number"
                className="form-input"
                value={data.residents_count || ''}
                onChange={(e) => !readonly && handleFieldChange('residents_count', parseInt(e.target.value) || '')}
                placeholder="0"
                readOnly={readonly}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-100">
              <label className="form-label">Мнение абонента</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={data.subscriber_opinion || ''}
                onChange={(e) => !readonly && handleFieldChange('subscriber_opinion', e.target.value)}
                placeholder="Мнение абонента по результатам проверки..."
                readOnly={readonly}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-100">
              <label className="form-label">Примечания</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={data.notes || ''}
                onChange={(e) => !readonly && handleFieldChange('notes', e.target.value)}
                placeholder="Дополнительные примечания..."
                readOnly={readonly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMeter = (meter: HouseMeterData, index: number) => (
    <div key={index} className="meter-item">
      <div className="meter-header">
        <h4>Счетчик #{index + 1}</h4>
        {!readonly && data.meters.length > 1 && (
          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={() => removeMeter(index)}
          >
            Удалить
          </button>
        )}
      </div>

      <div className="form-row">
        <div className="form-group third">
          <label className="form-label">Тип (G)</label>
          <input
            type="text"
            className="form-input"
            value={meter.meter_type || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'meter_type', e.target.value)}
            placeholder="G4"
            readOnly={readonly}
          />
        </div>
        <div className="form-group third">
          <label className="form-label required">Номер счетчика</label>
          <input
            type="text"
            className={`form-input ${errors.meters?.[index]?.meter_number ? 'error' : ''}`}
            value={meter.meter_number}
            onChange={(e) => !readonly && handleMeterChange(index, 'meter_number', e.target.value)}
            placeholder="Заводской номер"
            readOnly={readonly}
          />
          {errors.meters?.[index]?.meter_number && (
            <span className="error-text">{errors.meters[index]?.meter_number}</span>
          )}
        </div>
        <div className="form-group third">
          <label className="form-label">Показания (м³)</label>
          <input
            type="number"
            step="0.001"
            className="form-input"
            value={meter.current_reading || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'current_reading', parseFloat(e.target.value) || '')}
            placeholder="0.000"
            readOnly={readonly}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half">
          <label className="form-label">Номер пломбы</label>
          <input
            type="text"
            className="form-input"
            value={meter.seal_number || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'seal_number', e.target.value)}
            placeholder="Номер пломбы"
            readOnly={readonly}
          />
        </div>
        <div className="form-group half">
          <label className="form-label">Цвет пломбы</label>
          <input
            type="text"
            className="form-input"
            value={meter.seal_color || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'seal_color', e.target.value)}
            placeholder="Цвет"
            readOnly={readonly}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group w-100">
          <label className="form-label">Газовое оборудование</label>
          <textarea
            className="form-textarea"
            rows={2}
            value={meter.gas_equipment || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'gas_equipment', e.target.value)}
            placeholder="Описание газового оборудования..."
            readOnly={readonly}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group third">
          <label className="form-label">Жилая площадь (м²)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={meter.living_area || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'living_area', parseFloat(e.target.value) || '')}
            placeholder="0.00"
            readOnly={readonly}
          />
        </div>
        <div className="form-group third">
          <label className="form-label">Нежилая площадь (м²)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={meter.non_living_area || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'non_living_area', parseFloat(e.target.value) || '')}
            placeholder="0.00"
            readOnly={readonly}
          />
        </div>
        <div className="form-group third">
          <label className="form-label">Количество жильцов</label>
          <input
            type="number"
            className="form-input"
            value={meter.residents_count || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'residents_count', parseInt(e.target.value) || '')}
            placeholder="0"
            readOnly={readonly}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group w-100">
          <label className="form-label">Примечания</label>
          <textarea
            className="form-textarea"
            rows={2}
            value={meter.notes || ''}
            onChange={(e) => !readonly && handleMeterChange(index, 'notes', e.target.value)}
            placeholder="Примечания по счетчику..."
            readOnly={readonly}
          />
        </div>
      </div>
    </div>
  );

  const renderMetersSection = () => (
    <div className="form-section">
      <div 
        className="section-header"
        onClick={() => toggleAccordion('meters')}
      >
        <h3>Счетчики газа</h3>
        <span className={`accordion-icon ${accordions.meters ? 'open' : ''}`}>▼</span>
      </div>
      
      {accordions.meters && (
        <div className="section-content">
          <div className="meters-container">
            {data.meters.map((meter, index) => renderMeter(meter, index))}
          </div>
          
          {!readonly && data.meters.length < 3 && (
            <button
              type="button"
              className="btn btn-outline add-meter-btn"
              onClick={addMeter}
            >
              + Добавить счетчик
            </button>
          )}

          {/* Ошибка если нет счетчиков */}
          {errors.meters?.[0]?.meter_number && data.meters.length === 0 && (
            <div className="error-text">{errors.meters[0].meter_number}</div>
          )}
        </div>
      )}
    </div>
  );

  // ============================================
  // ОСНОВНОЙ РЕНДЕР
  // ============================================

  if (loading) {
    return (
      <div className="house-inspect-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <>
      <div className="house-inspect-form">
        {renderHeader()}
        
        <div className="house-inspect-content">
          {Object.keys(errors).length > 0 && (
            <div className="error-banner">
              Исправьте ошибки в форме перед сохранением
            </div>
          )}
          
          {renderMainSection()}
          {renderParticipantsSection()}
          {renderResultsSection()}
          {renderMetersSection()}
        </div>
      </div>

      {/* Модальное окно печати */}
      <IonModal isOpen={showPrintModal} onDidDismiss={handleClosePrintModal}>
          <ActHouseInspectPrint
              data = { data } 
              mode="print" 
              onClose={ handleClosePrintModal } 
          />
      </IonModal>

    </>
  );
};

export default ActHouseInspects;