import React, { useEffect, useState } from 'react';
import { useShutdownAct } from './useActShutdown';
import './ActShutdownForm.css';
import { IonModal } from '@ionic/react';
import ActShutdown from './ActShutdown';

interface ShutdownOrderFormProps {
  invoiceId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const ShutdownOrderForm: React.FC<ShutdownOrderFormProps> = ({
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
    copyAddressData,
    saveAct,
    loadActByInvoice
  } = useShutdownAct();

// Состояние для модального окна печати
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      loadActByInvoice(invoiceId);
    }
  }, [ invoiceId, loadActByInvoice ]);

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

// Функция маппинга данных для печатного компонента
  const mapDataForPrint = () => {
    return {
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
    };
  };

  return (
    <div className="shutdown-order-form">
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
        {/* Основная информация */}
        <div className="form-section">
          <h3>Основная информация</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Номер акта</label>
              <input
                type="text"
                value={data.act_number || (data.id ? 'Загрузка...' : 'Будет присвоен при сохранении')}
                readOnly
                className="readonly"
                placeholder={data.id ? 'Загрузка номера...' : 'Номер будет присвоен автоматически'}
              />
              <small className="field-hint">
                {data.id ? 'Номер присвоен системой' : 'Номер будет сгенерирован автоматически при сохранении'}
              </small>
            </div>
            <div className="form-group">
              <label>Дата акта*</label>
              <input
                type="date"
                value={data.act_date}
                onChange={(e) => handleFieldChange('act_date', e.target.value)}
                className={errors.act_date ? 'error' : ''}
                required
              />
              {errors.act_date && <span className="error-message">{errors.act_date}</span>}
            </div>
            {data.invoice_id && (
              <div className="form-group">
                <label>Связанная заявка</label>
                <input
                  type="text"
                  value={`Заявка №${data.invoice_id}`}
                  readOnly
                  className="readonly"
                />
                <small className="field-hint">Акт создан для данной заявки</small>
              </div>
            )}
          </div>
        </div>

        {/* Представитель и причина */}
        <div className="form-section">
          <h3>Представитель и причина отключения</h3>
          <div className="form-row">
            <div className="form-group">
              <label>ФИО представителя*</label>
              <input
                type="text"
                value={data.representative_name}
                onChange={(e) => handleFieldChange('representative_name', e.target.value)}
                className={errors.representative_name ? 'error' : ''}
                placeholder="Введите ФИО представителя"
                required
              />
              {errors.representative_name && <span className="error-message">{errors.representative_name}</span>}
            </div>
            <div className="form-group">
              <label>Причина отключения*</label>
              <textarea
                value={data.reason}
                onChange={(e) => handleFieldChange('reason', e.target.value)}
                className={errors.reason ? 'error' : ''}
                placeholder="Укажите причину отключения"
                rows={3}
                required
              />
              {errors.reason && <span className="error-message">{errors.reason}</span>}
            </div>
          </div>
        </div>

        {/* Объект отключения */}
        <div className="form-section">
          <h3>Объект отключения</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Наименование приборов*</label>
              <input
                type="text"
                value={data.equipment}
                onChange={(e) => handleFieldChange('equipment', e.target.value)}
                className={errors.equipment ? 'error' : ''}
                placeholder="Укажите оборудование для отключения"
                required
              />
              {errors.equipment && <span className="error-message">{errors.equipment}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Квартира*</label>
              <input
                type="text"
                value={data.apartment}
                onChange={(e) => handleFieldChange('apartment', e.target.value)}
                className={errors.apartment ? 'error' : ''}
                placeholder="№ кв."
                required
              />
              {errors.apartment && <span className="error-message">{errors.apartment}</span>}
            </div>
            <div className="form-group">
              <label>Дом*</label>
              <input
                type="text"
                value={data.house}
                onChange={(e) => handleFieldChange('house', e.target.value)}
                className={errors.house ? 'error' : ''}
                placeholder="№ дома"
                required
              />
              {errors.house && <span className="error-message">{errors.house}</span>}
            </div>
            <div className="form-group">
              <label>Улица*</label>
              <input
                type="text"
                value={data.street}
                onChange={(e) => handleFieldChange('street', e.target.value)}
                className={errors.street ? 'error' : ''}
                placeholder="Название улицы"
                required
              />
              {errors.street && <span className="error-message">{errors.street}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label>ФИО абонента*</label>
              <input
                type="text"
                value={data.subscriber_name}
                onChange={(e) => handleFieldChange('subscriber_name', e.target.value)}
                className={errors.subscriber_name ? 'error' : ''}
                placeholder="Введите ФИО абонента"
                required
              />
              {errors.subscriber_name && <span className="error-message">{errors.subscriber_name}</span>}
            </div>
          </div>
        </div>

        {/* Административные данные */}
        <div className="form-section">
          <h3>Административные данные</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Наряд выдал</label>
              <input
                type="text"
                value={data.order_issued_by}
                onChange={(e) => handleFieldChange('order_issued_by', e.target.value)}
                placeholder="ФИО, должность"
              />
            </div>
            <div className="form-group">
              <label>Наряд получил</label>
              <input
                type="text"
                value={data.order_received_by}
                onChange={(e) => handleFieldChange('order_received_by', e.target.value)}
                placeholder="ФИО, должность"
              />
            </div>
          </div>
        </div>

        {/* Выполнение работ */}
        <div className="form-section">
          <h3>Выполнение работ</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Исполнитель</label>
              <input
                type="text"
                value={data.executor_name}
                onChange={(e) => handleFieldChange('executor_name', e.target.value)}
                placeholder="ФИО исполнителя"
              />
            </div>
            <div className="form-group">
              <label>Дата выполнения</label>
              <input
                type="date"
                value={data.execution_date}
                onChange={(e) => handleFieldChange('execution_date', e.target.value)}
                className={errors.execution_date ? 'error' : ''}
              />
              {errors.execution_date && <span className="error-message">{errors.execution_date}</span>}
            </div>
            <div className="form-group">
              <label>Время выполнения</label>
              <input
                type="time"
                value={data.execution_time}
                onChange={(e) => handleFieldChange('execution_time', e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label>Отключенное оборудование</label>
              <input
                type="text"
                value={data.disconnected_equipment}
                onChange={(e) => handleFieldChange('disconnected_equipment', e.target.value)}
                placeholder="Укажите отключенное оборудование"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Квартира</label>
              <input
                type="text"
                value={data.execution_apartment}
                onChange={(e) => handleFieldChange('execution_apartment', e.target.value)}
                placeholder="№ кв."
              />
            </div>
            <div className="form-group">
              <label>Дом</label>
              <input
                type="text"
                value={data.execution_house}
                onChange={(e) => handleFieldChange('execution_house', e.target.value)}
                placeholder="№ дома"
              />
            </div>
            <div className="form-group">
              <label>Улица</label>
              <input
                type="text"
                value={data.execution_street}
                onChange={(e) => handleFieldChange('execution_street', e.target.value)}
                placeholder="Название улицы"
              />
            </div>
            <div className="form-group">
              <button
                type="button"
                onClick={() => copyAddressData('to_execution')}
                className="btn btn-link"
              >
                Копировать адрес сверху
              </button>
            </div>
          </div>
        </div>

        {/* Подключение */}
        <div className="form-section">
          <h3>Подключение (при необходимости)</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Дата подключения</label>
              <input
                type="date"
                value={data.reconnection_date || ''}
                onChange={(e) => handleFieldChange('reconnection_date', e.target.value)}
                className={errors.reconnection_date ? 'error' : ''}
              />
              {errors.reconnection_date && <span className="error-message">{errors.reconnection_date}</span>}
            </div>
            <div className="form-group">
              <label>Представитель</label>
              <input
                type="text"
                value={data.reconnection_representative || ''}
                onChange={(e) => handleFieldChange('reconnection_representative', e.target.value)}
                placeholder="ФИО представителя"
              />
            </div>
            <div className="form-group">
              <label>Руководитель</label>
              <input
                type="text"
                value={data.reconnection_supervisor || ''}
                onChange={(e) => handleFieldChange('reconnection_supervisor', e.target.value)}
                placeholder="ФИО руководителя"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Квартира</label>
              <input
                type="text"
                value={data.reconnection_apartment || ''}
                onChange={(e) => handleFieldChange('reconnection_apartment', e.target.value)}
                placeholder="№ кв."
              />
            </div>
            <div className="form-group">
              <label>Дом</label>
              <input
                type="text"
                value={data.reconnection_house || ''}
                onChange={(e) => handleFieldChange('reconnection_house', e.target.value)}
                placeholder="№ дома"
              />
            </div>
            <div className="form-group">
              <label>Улица</label>
              <input
                type="text"
                value={data.reconnection_street || ''}
                onChange={(e) => handleFieldChange('reconnection_street', e.target.value)}
                placeholder="Название улицы"
              />
            </div>
            <div className="form-group">
              <button
                type="button"
                onClick={() => copyAddressData('to_reconnection')}
                className="btn btn-link"
              >
                Копировать адрес сверху
              </button>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label>Абонент</label>
              <input
                type="text"
                value={data.reconnection_subscriber || ''}
                onChange={(e) => handleFieldChange('reconnection_subscriber', e.target.value)}
                placeholder="ФИО абонента"
              />
            </div>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="form-footer">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            onClick={ saveAct }
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
          mode    = "print"
          data    = { mapDataForPrint() }
          onClose = { handleClosePrintModal }
        />
      </IonModal>
    </div>
  );
};

export default ShutdownOrderForm;