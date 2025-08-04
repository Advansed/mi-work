import React from 'react';
import './ActShutdown.css';
import { PrintRow } from '../Forms/Forms';

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
      <div className="print-form-container fs-10">
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
              <div className='fs-10'>
                <b>АКТ-НАРЯД №<span className="field-value">{data.actNumber || '_______'}</span></b>
              </div>
              <div className='fs-9'><b>НА ОТКЛЮЧЕНИЕ ГАЗОИСПОЛЬЗУЮЩЕГО<br />ОБОРУДОВАНИЯ ЖИЛЫХ ЗДАНИЙ</b></div>
              

              <div className='flex fl-space'>
                <div></div>

                <div className="date-line field-value">
                  «<span className="">{actDateFormatted.day}</span>» 
                  <span className="">{ ' ' + actDateFormatted.month}</span>
                  <span className="">{' 20' + actDateFormatted.year}</span>г.
                </div>

              </div>
            </div>

            {/* Основное содержимое */}
            <div className="document-content">

              {/* <div className="content-line t-underline">
                Представителю эксплуатационной организации 
                <span className="ml-1">{ data.representativeName || '_'.repeat(42)}</span>
              </div> */}

              <PrintRow prefix = { 'Представителю эксплуатационной организации' } data = { '' } />
              <PrintRow prefix = { '' } data = { data.representativeName } />
              <div className="field-description">ф.и.о., должность</div>

              <PrintRow prefix = { 'ввиду'} data = { data.reason } />
              <div className="field-description">указать причину</div>

              <PrintRow prefix = { 'поручается отключить'} data = { data.equipment || '_'.repeat(63) } />
              <div className="field-description">наименование приборов</div>

              <PrintRow prefix = { 'квартире' } data = { (data.apartment || '___') + ' дома ' + (data.house || '_____') + ' по ул. ' + (data.street || '______________') } />

              <PrintRow prefix = { 'у абонента'} data = { data.subscriberName || '' } />
              <div className="field-description">ф.и.о.</div>

              <PrintRow prefix = { 'Наряд выдал'} data = { data.orderIssuedBy || '' } />
              <div className="field-description">должность, ф.и.о., подпись</div>
              
              <PrintRow prefix = { 'Наряд получил'} data = { data.orderReceivedBy || '' } />
              <div className="field-description">должность, ф.и.о., подпись</div>

              <PrintRow prefix = { 'мною'} data = { (data.executorName || '')
                  + ' "' + (executionDateFormatted.day || '__') + '"'
                  + ' ' + (executionDateFormatted.month || '__') + ''
                  + ' 20' + (executionDateFormatted.year || '__') + ''
                  + ' в ' + (executionTimeFormatted.hours || '__') + ''
                  + ':' + (executionTimeFormatted.minutes || '__') + ''
                  + ' произведено отключение газоиспользующего оборудования ' + (data.disconnectedEquipment || '_____')
                  + ' квартире №' + (data.apartment || '__') + ' дома ' + (data.house || '__') 
                  + ' по ул ' + (data.street || '____________')
                  
               } />
                <div className="field-description">указать наименование, количество приборов, способ отключения</div>

              <div className="execution-section">
                  <div className="signatures-title">Подписи:</div>

                  <PrintRow prefix = { 'Представитель эксплуатационной организации'} data = { '' } />
                  <PrintRow prefix = { ''} data = { ' ' } />
                  <div className="field-description">ф.и.о., подпись</div>

                  <PrintRow prefix = { 'Ответственный квартиросъёмщик (абонент)'} data = { '' } />
                  <PrintRow prefix = { ''} data = { ' ' } />
                  <div className="field-description">ф.и.о., подпись</div>

              </div>

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