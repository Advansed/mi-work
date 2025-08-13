import React from 'react';
import '../ActsPrint.css'; // НОВЫЙ ИМПОРТ ЕДИНОГО CSS
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
      <div className="acts-print-wrapper">
        {/* Панель действий */}
        <div className="acts-print-actions">
          <button onClick={handlePrint} className="acts-btn acts-btn-primary">
            🖨️ Печать
          </button>
          <button onClick={onClose} className="acts-btn acts-btn-secondary">
            ✕ Закрыть
          </button>
        </div>

        {/* Контент для печати */}
        <div className="acts-print-scrollable">
          <div className="acts-print-content">
            {/* Заголовок документа */}
              <div className="acts-document-header">
                <div className="acts-logo-section">
                  <img src="USD.png" alt="USD" className='h-4'/>
                </div>
                <div className="acts-logo-section">
                  <img src="qr.png" alt="USD" className='h-4'/>
                </div>
              </div>
              <div className="acts-header-info">
                <div className="acts-department">
                  Структурное подразделение<br/>
                  Управление по сбытовой деятельности<br/>
                  677005, Республика Саха (Якутия), г.Якутск, ул.П.Алексеева, 64 Б
                </div>
              </div>

            {/* Основное содержание документа */}
            <div className="acts-document-content">
              <div className="acts-document-title">
                <h1>ПРЕДПИСАНИЕ №{data.prescription_number || '______'}</h1>
                <h2>за нарушение правил пользования газом в быту</h2>
              </div>

              <div className='flex fl-space'>
                  <div></div>
                  <div>
                    {prescriptionDateFormatted.day + ' ' + prescriptionDateFormatted.month + ' 20' + prescriptionDateFormatted.year + 'г.' }
                  </div>
              </div>

              <div className="acts-main-content">
                <PrintRow 
                  prefix={'Представителю эксплуатационной организации'} 
                  data={data.violator_name || ''}
                />
                <div className="acts-field-description">ф.и.о., должность</div>

                <PrintRow 
                  prefix={'в присутствии абонента:'} 
                  data={data.subscriber_name || ''}
                />
                <div className="acts-field-description">ф.и.о. (полностью)</div>

                <PrintRow 
                  prefix={'по адресу:'} 
                  data={`${data.street || ''}, д. ${data.house || ''}, кв. ${data.apartment || ''}`.trim() || data.violator_address || ''}
                />

                <PrintRow 
                  prefix={'при осмотре газифицированного жилого помещения'} 
                  data={violationDateFormatted.day + ' ' + violationDateFormatted.month + ' 20' + violationDateFormatted.year + 'г. в ' + (violationTimeFormatted.hours || '__') + ':' + (violationTimeFormatted.minutes || '__') + ' час.'}
                />

                <PrintRow 
                  prefix={'установлено нарушение:'} 
                  data={data.violation_description || ''}
                />
                <div className="acts-field-description">описание нарушения</div>

                <PrintRow 
                  prefix={'что является нарушением:'} 
                  data={data.legal_basis || ''}
                />
                <div className="acts-field-description">правовая основа</div>

                <div className="acts-violation-section">
                  <div className="acts-warning-box">
                    <div className="acts-warning-title">
                      В связи с этим ПРЕДПИСЫВАЮ:
                    </div>
                    <div className="acts-warning-content">
                      Устранить выявленные нарушения в срок до 
                      <span className="acts-field-value acts-underline">
                        {eliminationDateFormatted.day + ' ' + eliminationDateFormatted.month + ' 20' + eliminationDateFormatted.year + 'г.'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="acts-equipment-section">
                  <PrintRow prefix={'Показания счетчиков:'} data={''} />
                  <PrintRow prefix={'счетчик №'} data={'____________________ '} />
                  <PrintRow prefix={'тип: Г_______ №'} data={''} />
                  <PrintRow prefix={'составляют: ___'} data={'м³ пломба____'} />
                  <PrintRow prefix={'цвет'} data={''} />
                  
                  <div className="acts-field-description">газовое оборудование:</div>
                  
                  <div className="acts-measurement-text">
                    Произведен контрольный замер отапливаемых площадей:<br/>
                    жилая площадь ____________м² нежилая площадь ________________м² количество _______ чел.
                  </div>

                  <PrintRow prefix={'Особое мнение абонента:'} data={''} />
                  <PrintRow prefix={'Примечание:'} data={data.additional_notes || ''} />
                </div>

                <div className="acts-signatures-section">
                  <div className="acts-signatures-title">Подписи сторон:</div>

                  <PrintRow 
                    prefix={'представитель организации'} 
                    data={''}
                  />
                  <div className="acts-field-description">должность, ф.и.о.</div>

                  <PrintRow prefix={'абонент'} data={''} />

                  <PrintRow 
                    prefix={'представитель абонента'} 
                    data={''}
                  />

                  <PrintRow 
                    prefix={'При проведении проверки и составлении акта присутствовал: Ф.И.О.:'} 
                    data={''}
                  />
                  <div className="acts-field-description">реквизиты документа, удостоверяющего личность</div>
                </div>

                <div className="acts-note-section">
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