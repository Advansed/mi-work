import React from 'react';
import './ActShutdown.css';

// Интерфейс данных для печатной формы
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

// Обновленный интерфейс props
interface ActShutdownProps {
  mode: 'print';
  data: ActShutdownData;
  onClose: () => void;
}

const ActShutdown: React.FC<ActShutdownProps> = ({
  mode,
  data,
  onClose
}) => {
  // Функции форматирования
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

  // Форматированные данные
  const actDateFormatted = formatDateForDisplay(data.actDate);
  const executionDateFormatted = formatDateForDisplay(data.executionDate);
  const executionTimeFormatted = formatTimeForDisplay(data.executionTime);
  const reconnectionDateFormatted = formatDateForDisplay(data.reconnectionDate);

  const handlePrint = () => {
    window.print();
  };

  // Режим печати - возвращаем только печатную форму
  if (mode === 'print') {
    return (
      <div className="print-form-container scroll">
        <div className="print-actions no-print">
          <button className="btn btn-primary" onClick={handlePrint}>
            Печать PDF
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Вернуться к редактированию
          </button>
        </div>

        <div className="print-content-scrollable">
          <div className="print-content">
            {/* Заголовок с логотипом */}
            <div className="document-header">
              <div className="logo-section">
                <img src="USD.png" alt="USD" className='h-4'/>
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

            {/* Основное содержимое */}
            <div className="document-content">
              <div className="content-line">
                Представителю эксплуатационной организации 
                <span className="field-value underline">{data.representativeName || '_'.repeat(42)}</span>
              </div>
              <div className="field-description">ф.и.о., должность</div>

              <div className="content-line">
                ввиду 
                <span className="field-value underline">{data.reason || '_'.repeat(78)}</span>
              </div>
              <div className="field-description">указать причину</div>

              <div className="content-line">
                поручается отключить 
                <span className="field-value underline">{data.equipment || '_'.repeat(63)}</span>
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

              <div className="administrative-section">
                <div className="content-line">
                  Наряд выдал <span className="field-value underline">{data.orderIssuedBy || '_'.repeat(50)}</span>
                </div>
                <div className="field-description">должность, ф.и.о., подпись</div>

                <div className="content-line">
                  Наряд получил <span className="field-value underline">{data.orderReceivedBy || '_'.repeat(47)}</span>
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
                  <span className="field-value underline">{data.disconnectedEquipment || '_'.repeat(35)}</span>
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
                    <span className="field-value">___________________________</span>
                  </div>
                </div>
              </div>

              {/* Секция подключения (если есть данные) */}
              {(data.reconnectionDate || data.reconnectionRepresentative || data.reconnectionSupervisor) && (
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
              )}

              <div className="note-section">
                <strong>Примечание:</strong> Акт-наряд составляется в двух экземплярах, 
                один из которых выдаётся на руки абоненту, другой хранится в эксплуатационной организации.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // В других режимах возвращаем null (или можно добавить другие режимы в будущем)
  return null;
};

export default ActShutdown;