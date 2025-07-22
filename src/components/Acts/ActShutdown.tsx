import React, { useState, useEffect } from 'react';
import './ActShutdown.css';

interface ActShutdownData {
  id?: string;
  actNumber: string;
  actDate: string;
  representativeName: string;
  representativePosition: string;
  reason: string;
  equipment: string;
  apartment: string;
  house: string;
  street: string;
  subscriberName: string;
  orderIssuedBy: string;
  orderIssuedPosition: string;
  orderReceivedBy: string;
  orderReceivedPosition: string;
  executorName: string;
  executorPosition: string;
  executionDate: string;
  executionTime: string;
  disconnectedEquipment: string;
  executionApartment: string;
  executionHouse: string;
  executionStreet: string;
  reconnectionDate: string;
  reconnectionRepresentative: string;
  reconnectionPosition: string;
  reconnectionSupervisor: string;
  reconnectionSupervisorPosition: string;
  reconnectionApartment: string;
  reconnectionHouse: string;
  reconnectionStreet: string;
  reconnectionSubscriber: string;
}

interface ActShutdownProps {
  actId?: string;
  mode?: 'create' | 'edit' | 'view' | 'print';
  onSave?: (data: ActShutdownData) => void;
  onCancel?: () => void;
}

const ActShutdown: React.FC<ActShutdownProps> = ({
  actId,
  mode = 'create',
  onSave,
  onCancel
}) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [data, setData] = useState<ActShutdownData>({
    actNumber: '',
    actDate: new Date().toISOString().split('T')[0],
    representativeName: '',
    representativePosition: '',
    reason: '',
    equipment: '',
    apartment: '',
    house: '',
    street: '',
    subscriberName: '',
    orderIssuedBy: '',
    orderIssuedPosition: '',
    orderReceivedBy: '',
    orderReceivedPosition: '',
    executorName: '',
    executorPosition: '',
    executionDate: '',
    executionTime: '',
    disconnectedEquipment: '',
    executionApartment: '',
    executionHouse: '',
    executionStreet: '',
    reconnectionDate: '',
    reconnectionRepresentative: '',
    reconnectionPosition: '',
    reconnectionSupervisor: '',
    reconnectionSupervisorPosition: '',
    reconnectionApartment: '',
    reconnectionHouse: '',
    reconnectionStreet: '',
    reconnectionSubscriber: ''
  });

  const [activeSection, setActiveSection] = useState<string>('header');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (actId) {
      loadActData(actId);
    } else {
      generateActNumber();
    }
  }, [actId]);

  const loadActData = async (id: string) => {
    try {
      const response = await fetch(`/api/acts/shutdown/${id}`);
      if (response.ok) {
        const actData = await response.json();
        setData(actData);
      }
    } catch (error) {
      console.error('Ошибка загрузки акта:', error);
    }
  };

  const generateActNumber = async () => {
    try {
      const response = await fetch('/api/acts/shutdown/next-number');
      if (response.ok) {
        const { number } = await response.json();
        setData(prev => ({ ...prev, actNumber: number }));
      }
    } catch (error) {
      console.error('Ошибка генерации номера:', error);
    }
  };

  const handleFieldChange = (field: keyof ActShutdownData, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const copyAddressData = (direction: 'toExecution' | 'toReconnection') => {
    if (direction === 'toExecution') {
      setData(prev => ({
        ...prev,
        executionApartment: prev.apartment,
        executionHouse: prev.house,
        executionStreet: prev.street
      }));
    } else {
      setData(prev => ({
        ...prev,
        reconnectionApartment: prev.apartment,
        reconnectionHouse: prev.house,
        reconnectionStreet: prev.street,
        reconnectionSubscriber: prev.subscriberName
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!data.actNumber) newErrors.actNumber = 'Номер акта обязателен';
    if (!data.actDate) newErrors.actDate = 'Дата акта обязательна';
    if (!data.representativeName) newErrors.representativeName = 'ФИО представителя обязательно';
    if (!data.reason) newErrors.reason = 'Причина обязательна';
    if (!data.equipment) newErrors.equipment = 'Наименование приборов обязательно';
    if (!data.apartment) newErrors.apartment = 'Номер квартиры обязателен';
    if (!data.house) newErrors.house = 'Номер дома обязателен';
    if (!data.street) newErrors.street = 'Улица обязательна';
    if (!data.subscriberName) newErrors.subscriberName = 'ФИО абонента обязательно';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const url = actId ? `/api/acts/shutdown/${actId}` : '/api/acts/shutdown';
      const method = actId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const savedData = await response.json();
        onSave?.(savedData);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handlePrint = () => {
    setCurrentMode('print');
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return { day: '', month: '', year: '' };
    const date = new Date(dateStr);
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return {
      day: date.getDate().toString(),
      month: months[date.getMonth()],
      year: date.getFullYear().toString().slice(-2)
    };
  };

  const formatTimeForDisplay = (timeStr: string) => {
    if (!timeStr) return { hours: '', minutes: '' };
    const [hours, minutes] = timeStr.split(':');
    return { hours, minutes };
  };

  if (currentMode === 'print') {
    return <PrintForm data={data} onClose={() => setCurrentMode('edit')} />;
  }

  const isReadOnly = currentMode === 'view';

  return (
    <div className="act-shutdown">
      <div className="act-shutdown-header">
        <h1>
          {mode === 'create' ? 'Создание' : mode === 'edit' ? 'Редактирование' : 'Просмотр'} 
          акта-наряда на отключение
        </h1>
        <div className="act-shutdown-actions">
          {!isReadOnly && (
            <>
              <button className="btn btn-primary" onClick={handleSave}>
                Сохранить
              </button>
              <button className="btn btn-secondary" onClick={handlePrint}>
                Печать
              </button>
            </>
          )}
          <button className="btn btn-outline" onClick={onCancel}>
            {isReadOnly ? 'Закрыть' : 'Отмена'}
          </button>
        </div>
      </div>

      <div className="act-shutdown-content">
        <div className="accordion">
          {/* Заголовок документа */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${activeSection === 'header' ? 'active' : ''}`}
              onClick={() => setActiveSection(activeSection === 'header' ? '' : 'header')}
            >
              <h3>Заголовок документа</h3>
              <span className="accordion-toggle">
                {activeSection === 'header' ? '−' : '+'}
              </span>
            </div>
            {activeSection === 'header' && (
              <div className="accordion-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Номер акта-наряда</label>
                    <input
                      type="text"
                      value={data.actNumber}
                      onChange={(e) => handleFieldChange('actNumber', e.target.value)}
                      readOnly={isReadOnly}
                      className={errors.actNumber ? 'error' : ''}
                    />
                    {errors.actNumber && <span className="error-text">{errors.actNumber}</span>}
                  </div>
                  <div className="form-group">
                    <label>Дата акта</label>
                    <input
                      type="date"
                      value={data.actDate}
                      onChange={(e) => handleFieldChange('actDate', e.target.value)}
                      readOnly={isReadOnly}
                      className={errors.actDate ? 'error' : ''}
                    />
                    {errors.actDate && <span className="error-text">{errors.actDate}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Представитель организации */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${activeSection === 'representative' ? 'active' : ''}`}
              onClick={() => setActiveSection(activeSection === 'representative' ? '' : 'representative')}
            >
              <h3>Представитель организации</h3>
              <span className="accordion-toggle">
                {activeSection === 'representative' ? '−' : '+'}
              </span>
            </div>
            {activeSection === 'representative' && (
              <div className="accordion-content">
                <div className="form-row">
                  <div className="form-group flex-2">
                    <label>ФИО представителя</label>
                    <input
                      type="text"
                      value={data.representativeName}
                      onChange={(e) => handleFieldChange('representativeName', e.target.value)}
                      readOnly={isReadOnly}
                      className={errors.representativeName ? 'error' : ''}
                    />
                    {errors.representativeName && <span className="error-text">{errors.representativeName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Должность</label>
                    <input
                      type="text"
                      value={data.representativePosition}
                      onChange={(e) => handleFieldChange('representativePosition', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Причина отключения</label>
                  <textarea
                    value={data.reason}
                    onChange={(e) => handleFieldChange('reason', e.target.value)}
                    readOnly={isReadOnly}
                    className={errors.reason ? 'error' : ''}
                    rows={2}
                  />
                  {errors.reason && <span className="error-text">{errors.reason}</span>}
                </div>
                <div className="form-group">
                  <label>Наименование приборов для отключения</label>
                  <input
                    type="text"
                    value={data.equipment}
                    onChange={(e) => handleFieldChange('equipment', e.target.value)}
                    readOnly={isReadOnly}
                    className={errors.equipment ? 'error' : ''}
                  />
                  {errors.equipment && <span className="error-text">{errors.equipment}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Адрес и абонент */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${activeSection === 'address' ? 'active' : ''}`}
              onClick={() => setActiveSection(activeSection === 'address' ? '' : 'address')}
            >
              <h3>Адрес и абонент</h3>
              <span className="accordion-toggle">
                {activeSection === 'address' ? '−' : '+'}
              </span>
            </div>
            {activeSection === 'address' && (
              <div className="accordion-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Квартира №</label>
                    <input
                      type="text"
                      value={data.apartment}
                      onChange={(e) => handleFieldChange('apartment', e.target.value)}
                      readOnly={isReadOnly}
                      className={errors.apartment ? 'error' : ''}
                    />
                    {errors.apartment && <span className="error-text">{errors.apartment}</span>}
                  </div>
                  <div className="form-group">
                    <label>Дом</label>
                    <input
                      type="text"
                      value={data.house}
                      onChange={(e) => handleFieldChange('house', e.target.value)}
                      readOnly={isReadOnly}
                      className={errors.house ? 'error' : ''}
                    />
                    {errors.house && <span className="error-text">{errors.house}</span>}
                  </div>
                  <div className="form-group flex-2">
                    <label>Улица</label>
                    <input
                      type="text"
                      value={data.street}
                      onChange={(e) => handleFieldChange('street', e.target.value)}
                      readOnly={isReadOnly}
                      className={errors.street ? 'error' : ''}
                    />
                    {errors.street && <span className="error-text">{errors.street}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label>ФИО абонента</label>
                  <input
                    type="text"
                    value={data.subscriberName}
                    onChange={(e) => handleFieldChange('subscriberName', e.target.value)}
                    readOnly={isReadOnly}
                    className={errors.subscriberName ? 'error' : ''}
                  />
                  {errors.subscriberName && <span className="error-text">{errors.subscriberName}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Выдача/получение наряда */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${activeSection === 'order' ? 'active' : ''}`}
              onClick={() => setActiveSection(activeSection === 'order' ? '' : 'order')}
            >
              <h3>Выдача/получение наряда</h3>
              <span className="accordion-toggle">
                {activeSection === 'order' ? '−' : '+'}
              </span>
            </div>
            {activeSection === 'order' && (
              <div className="accordion-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Наряд выдал (должность)</label>
                    <input
                      type="text"
                      value={data.orderIssuedPosition}
                      onChange={(e) => handleFieldChange('orderIssuedPosition', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>ФИО</label>
                    <input
                      type="text"
                      value={data.orderIssuedBy}
                      onChange={(e) => handleFieldChange('orderIssuedBy', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Наряд получил (должность)</label>
                    <input
                      type="text"
                      value={data.orderReceivedPosition}
                      onChange={(e) => handleFieldChange('orderReceivedPosition', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>ФИО</label>
                    <input
                      type="text"
                      value={data.orderReceivedBy}
                      onChange={(e) => handleFieldChange('orderReceivedBy', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Выполнение работ */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${activeSection === 'execution' ? 'active' : ''}`}
              onClick={() => setActiveSection(activeSection === 'execution' ? '' : 'execution')}
            >
              <h3>Выполнение работ</h3>
              <span className="accordion-toggle">
                {activeSection === 'execution' ? '−' : '+'}
              </span>
            </div>
            {activeSection === 'execution' && (
              <div className="accordion-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Исполнитель (должность)</label>
                    <input
                      type="text"
                      value={data.executorPosition}
                      onChange={(e) => handleFieldChange('executorPosition', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>ФИО</label>
                    <input
                      type="text"
                      value={data.executorName}
                      onChange={(e) => handleFieldChange('executorName', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Дата выполнения</label>
                    <input
                      type="date"
                      value={data.executionDate}
                      onChange={(e) => handleFieldChange('executionDate', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group">
                    <label>Время выполнения</label>
                    <input
                      type="time"
                      value={data.executionTime}
                      onChange={(e) => handleFieldChange('executionTime', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Описание отключенного оборудования</label>
                  <textarea
                    value={data.disconnectedEquipment}
                    onChange={(e) => handleFieldChange('disconnectedEquipment', e.target.value)}
                    readOnly={isReadOnly}
                    rows={2}
                    placeholder="указать наименование, количество приборов, способ отключения"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Квартира №</label>
                    <input
                      type="text"
                      value={data.executionApartment}
                      onChange={(e) => handleFieldChange('executionApartment', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group">
                    <label>Дом</label>
                    <input
                      type="text"
                      value={data.executionHouse}
                      onChange={(e) => handleFieldChange('executionHouse', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>Улица</label>
                    <input
                      type="text"
                      value={data.executionStreet}
                      onChange={(e) => handleFieldChange('executionStreet', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  {!isReadOnly && (
                    <div className="form-group">
                      <button 
                        className="btn btn-small"
                        onClick={() => copyAddressData('toExecution')}
                        type="button"
                      >
                        Копировать адрес
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Подключение обратно */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${activeSection === 'reconnection' ? 'active' : ''}`}
              onClick={() => setActiveSection(activeSection === 'reconnection' ? '' : 'reconnection')}
            >
              <h3>Подключение обратно</h3>
              <span className="accordion-toggle">
                {activeSection === 'reconnection' ? '−' : '+'}
              </span>
            </div>
            {activeSection === 'reconnection' && (
              <div className="accordion-content">
                <div className="form-group">
                  <label>Дата подключения</label>
                  <input
                    type="date"
                    value={data.reconnectionDate}
                    onChange={(e) => handleFieldChange('reconnectionDate', e.target.value)}
                    readOnly={isReadOnly}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Представитель (должность)</label>
                    <input
                      type="text"
                      value={data.reconnectionPosition}
                      onChange={(e) => handleFieldChange('reconnectionPosition', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>ФИО</label>
                    <input
                      type="text"
                      value={data.reconnectionRepresentative}
                      onChange={(e) => handleFieldChange('reconnectionRepresentative', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Руководитель (должность)</label>
                    <input
                      type="text"
                      value={data.reconnectionSupervisorPosition}
                      onChange={(e) => handleFieldChange('reconnectionSupervisorPosition', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>ФИО</label>
                    <input
                      type="text"
                      value={data.reconnectionSupervisor}
                      onChange={(e) => handleFieldChange('reconnectionSupervisor', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Квартира №</label>
                    <input
                      type="text"
                      value={data.reconnectionApartment}
                      onChange={(e) => handleFieldChange('reconnectionApartment', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group">
                    <label>Дом</label>
                    <input
                      type="text"
                      value={data.reconnectionHouse}
                      onChange={(e) => handleFieldChange('reconnectionHouse', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>Улица</label>
                    <input
                      type="text"
                      value={data.reconnectionStreet}
                      onChange={(e) => handleFieldChange('reconnectionStreet', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                  {!isReadOnly && (
                    <div className="form-group">
                      <button 
                        className="btn btn-small"
                        onClick={() => copyAddressData('toReconnection')}
                        type="button"
                      >
                        Копировать адрес
                      </button>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>ФИО абонента</label>
                  <input
                    type="text"
                    value={data.reconnectionSubscriber}
                    onChange={(e) => handleFieldChange('reconnectionSubscriber', e.target.value)}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент формы печати
const PrintForm: React.FC<{ data: ActShutdownData; onClose: () => void }> = ({ data, onClose }) => {
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return { day: '_____', month: '__________________', year: '___' };
    const date = new Date(dateStr);
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return {
      day: date.getDate().toString(),
      month: months[date.getMonth()],
      year: date.getFullYear().toString().slice(-2)
    };
  };

  const formatTimeForDisplay = (timeStr: string) => {
    if (!timeStr) return { hours: '_____', minutes: '______' };
    const [hours, minutes] = timeStr.split(':');
    return { hours, minutes };
  };

  const actDateFormatted = formatDateForDisplay(data.actDate);
  const executionDateFormatted = formatDateForDisplay(data.executionDate);
  const executionTimeFormatted = formatTimeForDisplay(data.executionTime);
  const reconnectionDateFormatted = formatDateForDisplay(data.reconnectionDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-form">
      <div className="print-actions no-print">
        <button className="btn btn-primary" onClick={handlePrint}>
          Печать PDF
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          Вернуться к редактированию
        </button>
      </div>

      <div className="print-content">
        {/* Заголовок с логотипом */}
        <div className="document-header">
          <div className="logo-section">
            <div className="logo-circle">
              <span className="logo-text">СТНГ</span>
            </div>
            <div className="company-info">
              <div className="company-name">САХАТРАНСНЕФТЕГАЗ</div>
              <div className="department">УСД</div>
            </div>
          </div>
        </div>

        {/* Заголовок документа */}
        <div className="document-title">
          <h1>
            АКТ-НАРЯД №<span className="field-value">{data.actNumber || '_______'}</span>
          </h1>
          <h2>НА ОТКЛЮЧЕНИЕ ГАЗОИСПОЛЬЗУЮЩЕГО<br />ОБОРУДОВАНИЯ ЖИЛЫХ ЗДАНИЙ</h2>
          
          <div className="date-line">
            «<span className="field-value">{actDateFormatted.day}</span>»
            <span className="field-value">{actDateFormatted.month}</span>
            20<span className="field-value">{actDateFormatted.year}</span>г.
          </div>
        </div>

        {/* Основное содержание */}
        <div className="document-content">
          <div className="content-line">
            Представителю эксплуатационной организации 
            <span className="field-value underline">{data.representativeName || '_'.repeat(39)}</span>
          </div>
          <div className="field-description">ф.и.о., должность</div>

          <div className="content-line">
            ввиду <span className="field-value underline">{data.reason || '_'.repeat(75)}</span>
          </div>
          <div className="field-description">указать причину</div>

          <div className="content-line">
            поручается отключить 
            <span className="field-value underline">{data.equipment || '_'.repeat(60)}</span>
          </div>
          <div className="field-description">наименование приборов</div>

          <div className="content-line">
            в квартире №<span className="field-value">{data.apartment || '________'}</span>
            дома<span className="field-value">{data.house || '________'}</span>
            по ул.<span className="field-value underline">{data.street || '_'.repeat(42)}</span>
          </div>

          <div className="content-line">
            у абонента <span className="field-value underline">{data.subscriberName || '_'.repeat(70)}</span>
          </div>
          <div className="field-description">ф.и.о.</div>

          <div className="signatures-section">
            <div className="signature-line">
              Наряд выдал <span className="field-value underline">{data.orderIssuedBy || '_'.repeat(70)}</span>
            </div>
            <div className="field-description">должность, ф.и.о., подпись</div>

            <div className="signature-line">
              Наряд получил <span className="field-value underline">{data.orderReceivedBy || '_'.repeat(70)}</span>
            </div>
            <div className="field-description">должность, ф.и.о., подпись</div>
          </div>

          <div className="execution-section">
            <div className="content-line">
              Мною <span className="field-value underline">{data.executorName || '_'.repeat(75)}</span>
            </div>
            <div className="field-description">должность, ф.и.о.</div>

            <div className="content-line">
              «<span className="field-value">{executionDateFormatted.day}</span>» 
              <span className="field-value">{executionDateFormatted.month}</span> 
              20<span className="field-value">{executionDateFormatted.year}</span>г. в 
              <span className="field-value">{executionTimeFormatted.hours}</span> ч. 
              <span className="field-value">{executionTimeFormatted.minutes}</span> мин.
            </div>

            <div className="content-line">
              произведено отключение газоиспользующего оборудования 
              <span className="field-value underline">{data.disconnectedEquipment || '_'.repeat(27)}</span>
            </div>
            <div className="field-description">указать наименование, количество приборов, способ отключения</div>

            <div className="content-line">
              в квартире №<span className="field-value">{data.executionApartment || '______'}</span>
              дома <span className="field-value">{data.executionHouse || '_______'}</span>
              по ул. <span className="field-value underline">{data.executionStreet || '_'.repeat(42)}</span>
            </div>

            <div className="signatures-section">
              <div className="signatures-title">Подписи:</div>
              <div className="signature-line">
                Представитель эксплуатационной организации 
                <span className="field-value">________________________</span>
              </div>
              <div className="signature-line">
                Ответственный квартиросъёмщик (абонент) 
                <span className="field-value">__________________________</span>
              </div>
            </div>
          </div>

          <div className="reconnection-section">
            <div className="content-line">
              Газоиспользующее оборудование подключено 
              «<span className="field-value">{reconnectionDateFormatted.day}</span>»
              <span className="field-value">{reconnectionDateFormatted.month}</span>
              20<span className="field-value">{reconnectionDateFormatted.year}</span>г.
            </div>

            <div className="content-line">
              представителем эксплуатационной организации 
              <span className="field-value underline">{data.reconnectionRepresentative || '_'.repeat(42)}</span>
            </div>
            <div className="field-description">должность, ф.и.о.</div>

            <div className="content-line">
              по указанию 
              <span className="field-value underline">{data.reconnectionSupervisor || '_'.repeat(73)}</span>
            </div>
            <div className="field-description">должность, ф.и.о.</div>

            <div className="content-line">
              в квартире №<span className="field-value">{data.reconnectionApartment || '________'}</span>
              дома<span className="field-value">{data.reconnectionHouse || '________'}</span>
              по ул.<span className="field-value underline">{data.reconnectionStreet || '_'.repeat(42)}</span>
            </div>

            <div className="content-line">
              у абонента <span className="field-value underline">{data.reconnectionSubscriber || '_'.repeat(70)}</span>
            </div>
            <div className="field-description">ф.и.о.</div>

            <div className="signatures-section">
              <div className="signatures-title">Подписи:</div>
              <div className="signature-line">
                Представитель эксплуатационной организации 
                <span className="field-value">________________________</span>
              </div>
              <div className="signature-line">
                Ответственный квартиросъёмщик (абонент) 
                <span className="field-value">___________________________</span>
              </div>
            </div>
          </div>

          <div className="note-section">
            <strong>Примечание:</strong> Акт-наряд составляется в двух экземплярах, 
            один из которых выдаётся на руки абоненту, другой хранится в эксплуатационной организации.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActShutdown;