import React from 'react';
import '../ActsPrint.css'; // НОВЫЙ ИМПОРТ ЕДИНОГО CSS
import { PrintRow } from '../Forms/Forms';
import { HouseInspectData } from './useActHouseInspects';

// Интерфейс props компонента
interface ActHouseInspectPrintProps {
  data: HouseInspectData;
  onClose: () => void;
}

const ActHouseInspectPrint: React.FC<ActHouseInspectPrintProps> = ({
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

  const formatAddress = () => {
    const parts: any = [];
    if (data.street) parts.push(`ул. ${data.street}`);
    if (data.house) parts.push(`д. ${data.house}`);
    if (data.apartment) parts.push(`кв. ${data.apartment}`);
    return parts.join(', ') || data.address || '____________________________________';
  };

  // Форматированные данные
  const actDateFormatted = formatDateForDisplay(data.act_date);
  const actTimeFormatted = formatTimeForDisplay(data.act_time || '');

  const handlePrint = () => {
    window.print();
  };

  // Режим печати - возвращаем только печатную форму
    return (
      <div className="acts-print-wrapper">
        <div className="acts-print-actions">
          <button className="acts-btn acts-btn-primary" onClick={handlePrint}>
            Печать PDF
          </button>
          <button className="acts-btn acts-btn-secondary" onClick={onClose}>
            Вернуться к редактированию
          </button>
        </div>

        <div className="acts-print-scrollable">
          <div className="acts-print-content">
            {/* Заголовок с логотипом */}
            <div className="acts-document-header">
              <div className="acts-logo-section">
                <img src="USD.png" alt="USD" className='h-4'/>
              </div>
            </div>

            {/* Заголовок акта */}
            <div className="acts-document-title">
              <div className='acts-title'><b>{'АКТ №' + (data.act_number || '____')}</b></div>
              <div className='acts-subtitle'><b>проверки газифицированного объекта по адресу:</b></div>
            </div>

            <div className='flex fl-space'>
              <div></div>
              <div className="acts-date-line">
                от «{actDateFormatted.day}» {actDateFormatted.month} 20{actDateFormatted.year}г.
              </div>
            </div>

            {/* Содержание документа */}
            <div className="acts-document-content">
              <PrintRow prefix={'Мной, представителем организации УСД АО «Сахатранснефтегаз»'} data={data.organization_representative || ''} />
              <div className="acts-field-description">должность, ф.и.о.</div>

              <PrintRow prefix={'в присутствии абонента:'} data={data.subscriber_name || ''} />
              <div className="acts-field-description">ф.и.о.</div>

              {data.subscriber_document && (
                <>
                  <PrintRow prefix={'реквизиты документа, удостоверяющего личность:'} data={data.subscriber_document || ''} />
                </>
              )}

              {data.subscriber_representative_name && (
                <>
                  <PrintRow prefix={'представителя абонента:'} data={data.subscriber_representative_name || ''} />
                  <div className="acts-field-description">ф.и.о.</div>
                  <PrintRow prefix={'реквизиты документа, удостоверяющего личность:'} data={data.subscriber_representative_document || ''} />
                </>
              )}

              {data.witness_name && (
                <>
                  <PrintRow prefix={'при свидетеле:'} data={data.witness_name || ''} />
                  <div className="acts-field-description">ф.и.о.</div>
                  <PrintRow prefix={'реквизиты документа, удостоверяющего личность:'} data={data.witness_document || ''} />
                </>
              )}

              <PrintRow prefix={'составлен настоящий акт о том, что «'} data={actDateFormatted.day + '» ' + actDateFormatted.month + ' 20' + actDateFormatted.year + 'г. в ' 
                + (actTimeFormatted.hours || '__') + ':' + (actTimeFormatted.minutes || '__') + ' час. « » мин.'} />

              <PrintRow prefix={'по адресу:'} data={formatAddress()} />

              <PrintRow prefix={'выявлено:'} data={ data.violations_found || '_____'} />
                  <div className="acts-field-description">описание выявленных проблем</div>


              {/* Секция счетчиков */}
              <div className="acts-meters-section">
                <div className="acts-section-title"></div>
                <PrintRow prefix={'Показания счетчиков:'} data={""} />
                
                {data.meters && data.meters.length > 0 ? (
                  data.meters.map((meter, index) => (
                    <div key={index} className="acts-meter-block">
                      <PrintRow prefix={'счетчик №'} data={(meter.meter_number || '____') + ' тип: ' + (meter.meter_type || '_____') + ' показания: ' + (meter.current_reading || '_____') + ' м³'} />
                    </div>
                  ))
                ) : (
                  <div className="acts-meter-block">
                    <PrintRow prefix={'счетчик №'} data={'____________________ тип: G_____ №'} />
                    <PrintRow prefix={'показания:'} data={'____________________ составляют: ___ м³ пломба _______________ цвет __________'} />
                    <PrintRow prefix={'газовое оборудование:'} data={''} />
                    <PrintRow prefix={'Произведен контрольный замер отапливаемых площадей:'} data={'жилая площадь ____________ м² нежилая площадь ________________ м² количество ______ чел.'} />
                  </div>
                )}
              </div>

              {data.subscriber_opinion && (
                <>
                  <PrintRow prefix={'Особое мнение абонента:'} data={data.subscriber_opinion || ''} />
                </>
              )}

              {data.notes && (
                <>
                  <PrintRow prefix={'Примечание:'} data={data.notes || ''} />
                </>
              )}

              {/* Секция подписей */}
              <div className="acts-signatures-section">
                <div className="acts-signatures-title">Подписи сторон:</div>

                <PrintRow prefix={'представитель организации'} data={''} />
                <PrintRow prefix={''} data={' '} />
                <div className="acts-field-description">ф.и.о., подпись</div>

                <PrintRow prefix={'абонент'} data={''} />
                <PrintRow prefix={''} data={' '} />
                <div className="acts-field-description">ф.и.о., подпись</div>

                {data.subscriber_representative_name && (
                  <>
                    <PrintRow prefix={'представитель абонента'} data={''} />
                    <PrintRow prefix={''} data={' '} />
                    <div className="acts-field-description">ф.и.о., подпись</div>
                  </>
                )}

                {data.witness_name && (
                  <>
                    <PrintRow prefix={'При проведении проверки и составлении акта присутствовал:'} data={''} />
                    <PrintRow prefix={'реквизиты документа, удостоверяющего личность'} data={''} />
                  </>
                )}
              </div>

              <div className="acts-note-section">
                <strong>Примечание:</strong> АКТ составляется в двух экземплярах, один из которых выдается на руки абоненту, другой хранится у поставщика газа.
              </div>
            </div>
          </div>
        </div>
      </div>
    );

};

export default ActHouseInspectPrint;