import React from 'react';
import './ActHouseInspectPrint.css';
import { HouseInspectData } from './useActHouseInspects';

// ============================================
// ИНТЕРФЕЙСЫ
// ============================================

interface HouseMeterData {
  id?: string;
  meter_type: string;
  meter_number: string;
  reading_value: number;
  seal_number: string;
  seal_color: string;
  gas_equipment: string;
  sequence_order: number;
}

interface ActHouseInspectPrintData {
  id?: string;
  act_number: string;
  act_date: string;
  act_time: string;
  account_number: string;
  address: string;
  street: string;
  house: string;
  apartment: string;
  organization_representative: string;
  subscriber_name: string;
  subscriber_document: string;
  subscriber_representative_name: string;
  subscriber_representative_document: string;
  witness_name: string;
  witness_document: string;
  violations_found: string;
  living_area: number;
  non_living_area: number;
  residents_count: number;
  subscriber_opinion: string;
  notes: string;
  meters: HouseMeterData[];
}

interface ActHouseInspectPrintProps {
  mode: 'print';
  data: HouseInspectData;
  onClose: () => void;
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

const ActHouseInspectPrint: React.FC<ActHouseInspectPrintProps> = ({
  mode,
  data,
  onClose
}) => {
  
  // ============================================
  // ФУНКЦИИ ФОРМАТИРОВАНИЯ
  // ============================================

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
      year: date.getFullYear().toString()
    };
  };

  const formatTimeForDisplay = (timeStr: string) => {
    if (!timeStr) return { hours: '____', minutes: '___' };
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

  const formatMeterType = (type: string) => {
    return type ? `G${type}` : 'G_____';
  };

  // ============================================
  // ФОРМАТИРОВАННЫЕ ДАННЫЕ
  // ============================================

  const actDateFormatted = formatDateForDisplay(data.act_date );
  const actTimeFormatted = formatTimeForDisplay(data.act_time || '');
  const formattedAddress = formatAddress();

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const handlePrint = () => {
    window.print();
  };

  // ============================================
  // РЕНДЕР
  // ============================================

  if (mode === 'print') {
    return (
      <div className="house-inspect-print-container">
        <div className="print-actions no-print">
          <button className="btn btn-primary" onClick={handlePrint}>
            Печать PDF
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Закрыть
          </button>
        </div>

        <div className="print-content-scrollable">
          <div className="print-content">
            {/* Шапка документа */}
            <div className="document-header">
              <div className="header-left">
                <div className="logo-section">
                  <div className="logo-placeholder">САХА ТРАНСНЕФТЕГАЗ УСД</div>
                </div>
              </div>
              <div className="header-right">
                <div className="qr-code-placeholder">QR</div>
              </div>
            </div>

            {/* Информация организации */}
            <div className="organization-info">
              <div className="org-title">Структурное подразделение</div>
              <div className="org-subtitle">Управление по сбытовой деятельности</div>
              <div className="org-address">677005, Республика Саха (Якутия), г.Якутск, ул.Алексеева, 64 Б</div>
            </div>

            {/* Заголовок акта */}
            <div className="act-title-section">
              <div className="act-title">АКТ</div>
              <div className="act-number-line">
                _______________________ д/с
              </div>
              <div className="act-subject">проверки газифицированного объекта по адресу:</div>
              <div className="address-line">
                <span className="field-value underline">{formattedAddress}</span>
              </div>
            </div>

            {/* Правовая основа */}
            <div className="legal-basis">
              Согласно Постановлению Правительства РФ от 21 июля 2008г. №549 «О порядке поставки газа для обеспечения коммунально-бытовых нужд граждан»
            </div>

            {/* Представители */}
            <div className="representatives-section">
              <div className="representative-line">
                Мной, представителем организации УСД АО «Сахатранснефтегаз» 
                <span className="field-value underline">{data.organization_representative || '________________________________________________'}</span>
              </div>

              <div className="participant-block">
                <div className="participant-line">
                  в присутствии абонента: <span className="field-value underline">{data.subscriber_name || '________________________________________________________________________________'}</span>
                </div>
                <div className="document-line">
                  реквизиты документа, удостоверяющего личность <span className="field-value underline">{data.subscriber_document || '________________________________________________________________'}</span>
                </div>
              </div>

              <div className="participant-block">
                <div className="participant-line">
                  представителя абонента: <span className="field-value underline">{data.subscriber_representative_name || '____________________________________________________________________'}</span>
                </div>
                <div className="document-line">
                  реквизиты документа, удостоверяющего личность <span className="field-value underline">{data.subscriber_representative_document || '________________________________________________________________'}</span>
                </div>
              </div>
            </div>

            {/* Время составления */}
            <div className="time-section">
              составлен настоящий акт о том, что «<span className="field-value underline">{actDateFormatted.day}</span>» 
              <span className="field-value underline">{actDateFormatted.month}</span> 
              202<span className="field-value underline">{actDateFormatted.year.slice(-1)}</span>г. 
              «<span className="field-value underline">{actTimeFormatted.hours}</span>» час. 
              «<span className="field-value underline">{actTimeFormatted.minutes}</span>» мин.
            </div>

            {/* Выявленные нарушения */}
            <div className="violations-section">
              <div className="violations-title">выявлено:</div>
              <div className="violations-content">
                {data.violations_found || '___________________________________________________________________________________________________'}
              </div>
            </div>

            {/* Показания счетчиков */}
            <div className="meters-section">
              <div className="meters-title">показания счетчиков:</div>
              
              {[0, 1].map((index) => {
                const meter = data.meters && data.meters[index];
                return (
                  <div key={index} className="meter-block">
                    <div className="meter-info">
                      {index + 1}. тип: <span className="field-value underline">{meter ? formatMeterType(meter.meter_type || '') : 'G_____'}</span> 
                      № <span className="field-value underline">{meter?.meter_number || '______________________'}</span> 
                      составляют: <span className="field-value underline">{meter?.current_reading || '__________________'}</span>м³ 
                      пломба <span className="field-value underline">{meter?.seal_number || '_________________'}</span> 
                      цвет <span className="field-value underline">{meter?.seal_color || '__________'}</span>
                    </div>
                    <div className="gas-equipment">
                      газовое оборудование: <span className="field-value underline">{meter?.gas_equipment || '_______________________________________________________________________________________'}</span>
                    </div>
                    <div className="area-measurement">
                      Произведен контрольный замер отапливаемых площадей:
                    </div>
                    <div className="area-details">
                      жилая площадь <span className="field-value underline">{data.living_area || '_______________'}</span>м² 
                      нежилая площадь <span className="field-value underline">{data.non_living_area || '________________'}</span>м² 
                      количество <span className="field-value underline">{data.residents_count || '_______'}</span> чел.
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Особое мнение абонента */}
            <div className="subscriber-opinion">
              <div className="opinion-title">Особое мнение абонента:</div>
              <div className="opinion-content">
                <span className="field-value underline">{data.subscriber_opinion || '____________________________________________________________________________________'}</span>
              </div>
            </div>

            {/* Примечание */}
            <div className="notes-section">
              <div className="notes-title">Примечание:</div>
              <div className="notes-content">
                <span className="field-value underline">{data.notes || '______________________________________________________________________________________________'}</span>
              </div>
            </div>

            {/* Подписи */}
            <div className="signatures-section">
              <div className="signatures-title">Подписи сторон:</div>
              
              <div className="signature-line">
                представитель организации <span className="field-value underline">__________________</span>/
                <span className="field-value underline">____________________________</span>/
              </div>
              
              <div className="signature-line">
                абонент <span className="field-value underline">____________________</span> /
                <span className="field-value underline">____________________________</span>/
              </div>
              
              <div className="signature-line">
                представитель абонента <span className="field-value underline">____________________</span> /
                <span className="field-value underline">____________________________</span>/
              </div>
            </div>

            {/* Понятой */}
            <div className="witness-section">
              <div className="witness-title">При проведении проверки и составлении акта присутствовал:</div>
              <div className="witness-name">
                Ф.И.О.: <span className="field-value underline">{data.witness_name || '______________________________________________'}</span>
              </div>
              <div className="witness-document">
                реквизиты документа, удостоверяющего личность <span className="field-value underline">{data.witness_document || '______________________________________________________________'}</span>
              </div>
            </div>

            {/* Примечание внизу */}
            <div className="footer-note">
              <strong>Примечание:</strong> АКТ составляется в двух экземплярах, один из которых выдаётся на руки абонента, другой хранится у поставщика газа.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ActHouseInspectPrint;