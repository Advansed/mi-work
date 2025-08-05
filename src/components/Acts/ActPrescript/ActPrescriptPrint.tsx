import React from 'react';
import './ActPrescriptPrint.css';
import { PrintRow } from '../Forms/Forms';

// Интерфейс данных для печатной формы предписания
interface ActPrescriptData {
  id?: string;
  prescription_number: string;
  prescription_date: string;
  violator_name: string;
  violator_position: string;
  violator_address: string;
  violation_description: string;
  violation_date: string;
  violation_time: string;
  violation_location: string;
  legal_basis: string;
  elimination_period: string;
  elimination_date: string;
  inspector_name: string;
  inspector_position: string;
  inspector_signature_date: string;
  organization_head_name: string;
  organization_head_position: string;
  gas_equipment_type: string;
  apartment: string;
  house: string;
  street: string;
  subscriber_name: string;
  witness_name?: string;
  witness_position?: string;
  additional_notes?: string;
}

// Обновленный интерфейс props
interface ActPrescriptPrintProps {
  mode: 'print';
  data: ActPrescriptData;
  onClose: () => void;
}

const ActPrescriptPrint: React.FC<ActPrescriptPrintProps> = ({
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
  const prescriptionDateFormatted = formatDateForDisplay(data.prescription_date);
  const violationDateFormatted = formatDateForDisplay(data.violation_date);
  const violationTimeFormatted = formatTimeForDisplay(data.violation_time);
  const eliminationDateFormatted = formatDateForDisplay(data.elimination_date);
  const signatureDateFormatted = formatDateForDisplay(data.inspector_signature_date);

  const handlePrint = () => {
    window.print();
  };

  // Режим печати - возвращаем только печатную форму
  if (mode === 'print') {
    return (
      <div className="prescript-form-container">
        {/* Панель действий */}
        <div className="prescript-print-actions prescript-no-print">
          <button onClick={handlePrint} className="prescript-btn prescript-btn-primary">
            🖨️ Печать
          </button>
          <button onClick={onClose} className="prescript-btn prescript-btn-secondary">
            ✕ Закрыть
          </button>
        </div>

        {/* Контент для печати */}
        <div className="prescript-print-content-scrollable">
          <div className="prescript-print-content">
            {/* Заголовок документа */}
              <div className="act-document-header">
                <div className="act-logo-section">
                  <img src="USD.png" alt="USD" className='h-4'/>
                </div>
              </div>
              <div className="prescript-header-info">
                <div className="prescript-department">
                  Структурное подразделение<br/>
                  Управление по сбытовой деятельности<br/>
                  677005, Республика Саха (Якутия), г.Якутск, ул.П.Алексеева, 64 Б
                </div>
              </div>

            {/* Основное содержание документа */}
            <div className="prescript-document-content">
              <div className="prescript-document-title">
                <h1>ПРЕДПИСАНИЕ №{data.prescription_number || '______'}</h1>
                <h2>за нарушение правил пользования газом в быту</h2>
              </div>

              <div className='flex fl-space'>
                  <div></div>
                  <div>
                    {prescriptionDateFormatted.day + ' ' + prescriptionDateFormatted.month + ' 20' + prescriptionDateFormatted.year + 'г.' }
                  </div>
              </div>

              <div className="prescript-main-content">
                <PrintRow 
                  prefix={'Представителю эксплуатационной организации'} 
                  data={data.violator_name || ''}
                />
                <div className="prescript-field-description">ф.и.о., должность</div>

                <PrintRow 
                  prefix={'в присутствии абонента:'} 
                  data={data.subscriber_name || ''}
                />
                <div className="prescript-field-description">ф.и.о. (полн.)</div>

                <PrintRow 
                  prefix={'реквизиты документа, удостоверяющего личность:'} 
                  data={''}
                />

                <PrintRow 
                  prefix={'представителя абонента:'} 
                  data={''}
                />
                <div className="prescript-field-description">ф.и.о. (полн.)</div>

                <PrintRow 
                  prefix={'реквизиты документа, удостоверяющего личность:'} 
                  data={''}
                />

                <div className="prescript-violation-section">
                  <PrintRow 
                    prefix={'составлен настоящий акт о том, что «'} 
                    data={violationDateFormatted.day}
                  />
                  <PrintRow prefix={''} data={violationDateFormatted.month} />
                  <PrintRow prefix={'202'} data={violationDateFormatted.year + 'г.'} />
                  <PrintRow prefix={'в'} data={violationTimeFormatted.hours} />
                  <PrintRow prefix={'час.'} data={violationTimeFormatted.minutes + ' мин.'} />
                  
                  <div className="prescript-violation-text">
                    <PrintRow prefix={'выявлено:'} data={data.violation_description || ''} />
                  </div>
                </div>

                <div className="prescript-location-section">
                  <PrintRow 
                    prefix={'по адресу: кв.'} 
                    data={data.apartment || '__'} 
                  />
                  <PrintRow prefix={'дом'} data={data.house || '__'} />
                  <PrintRow prefix={'ул.'} data={data.street || '______________'} />
                </div>

                <div className="prescript-legal-section">
                  <PrintRow 
                    prefix={'Согласно Постановлению Правительства РФ от 21 июля 2008г. №549 «О порядке поставки газа для обеспечения коммунально-бытовых нужд граждан»'} 
                    data={''}
                  />
                  
                  <div className="prescript-order-text">
                    <PrintRow 
                      prefix={'ПРЕДПИСЫВАЮ:'} 
                      data={data.legal_basis || ''}
                    />
                  </div>

                  <PrintRow 
                    prefix={'Срок устранения нарушений до «'} 
                    data={eliminationDateFormatted.day}
                  />
                  <PrintRow prefix={''} data={eliminationDateFormatted.month} />
                  <PrintRow prefix={'202'} data={eliminationDateFormatted.year + 'г.'} />
                </div>

                <div className="prescript-equipment-section">
                  <div className="prescript-subsection-title">показания счетчиков:</div>
                  
                  <PrintRow prefix={'1. тип: Г_______ №'} data={''} />
                  <PrintRow prefix={'составляют: ___'} data={'м³ пломба____'} />
                  <PrintRow prefix={'цвет'} data={''} />
                  
                  <div className="prescript-field-description">газовое оборудование:</div>
                  
                  <div className="prescript-measurement-text">
                    Произведен контрольный замер отапливаемых площадей:<br/>
                    жилая площадь ____________м² нежилая площадь ________________м² количество _______ чел.
                  </div>

                  <PrintRow prefix={'2. тип: Г_______ №'} data={''} />
                  <PrintRow prefix={'составляют: ___'} data={'м³ пломба____'} />
                  <PrintRow prefix={'цвет'} data={''} />
                  
                  <div className="prescript-field-description">газовое оборудование:</div>
                  
                  <div className="prescript-measurement-text">
                    Произведен контрольный замер отапливаемых площадей:<br/>
                    жилая площадь ____________м² нежилая площадь ________________м² количество _______ чел.
                  </div>

                  <PrintRow prefix={'Особое мнение абонента:'} data={''} />
                  <PrintRow prefix={'Примечание:'} data={data.additional_notes || ''} />
                </div>

                <div className="prescript-signatures-section">
                  <div className="prescript-signatures-title">Подписи сторон:</div>

                  <PrintRow 
                    prefix={'представитель организации'} 
                    data={''}
                  />
                  <div className="prescript-field-description">должность, ф.и.о.</div>

                  <PrintRow prefix={'абонент'} data={''} />

                  <PrintRow 
                    prefix={'представитель абонента'} 
                    data={''}
                  />

                  <PrintRow 
                    prefix={'При проведении проверки и составлении акта присутствовал: Ф.И.О.:'} 
                    data={''}
                  />
                  <div className="prescript-field-description">реквизиты документа, удостоверяющего личность</div>
                </div>

                <div className="prescript-note-section">
                  <strong>Примечание:</strong> АКТ составляется в двух экземплярах, один из которых выдаётся на руки абоненту, 
                  другой хранится у поставщика газа.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // В других режимах возвращаем null
  return null;
};

export default ActPrescriptPrint;