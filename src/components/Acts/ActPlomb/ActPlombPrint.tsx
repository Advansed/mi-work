// src/components/Acts/ActPlomb/ActPlombPrint.tsx
import React, { useState } from 'react';
import { ActPlombData } from './useActPlomb';
import '../ActsPrint.css'; // НОВЫЙ ИМПОРТ ЕДИНОГО CSS
import { PrintRow } from '../Forms/Forms';

interface ActPlombPrintProps {
  data: ActPlombData;
  mode: 'edit' | 'print';
  onClose?: () => void;
}

const ActPlombPrint: React.FC<ActPlombPrintProps> = ({ 
  data, 
  mode, 
  onClose 
}) => {
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    if (!dateString) return { day: '_____', month: '_____________', year: '__' };
    
    const date = new Date(dateString);
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: months[date.getMonth()],
      year: date.getFullYear().toString().slice(-2)
    };
  };

  const actDateFormatted = formatDate(data.act_date);

  // Обработчики печати
  const handlePrint = () => {
    window.print();
  };

  const handleSavePDF = () => {
    // Используем браузерную печать в PDF
    const originalTitle = document.title;
    document.title = `Акт_пломбирования_${data.act_number || 'новый'}.pdf`;
    
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 100);
  };

  // Режим печати
  if (mode === 'print') {
    return (
      <div className="acts-print-wrapper">
        <div className="acts-print-actions">
          <button onClick={handlePrint} className="acts-btn acts-btn-primary">
            🖨️ Печать
          </button>
          <button onClick={handleSavePDF} className="acts-btn acts-btn-secondary">
            📄 Сохранить PDF
          </button>
          <button onClick={onClose} className="acts-btn acts-btn-outline">
            ✖ Закрыть
          </button>
        </div>

        <div className="acts-print-scrollable">
          <div className="acts-print-content">
            {/* Заголовок с логотипом */}
            <div className="acts-document-header">
              <div className="acts-logo-section">
                <img src="USD.png" alt="USD" className='h-4'/>
              </div>
              <div className="acts-logo-section">
                <img src="qr.png" alt="USD" className='h-4'/>
              </div>
            </div>

            {/* Реквизиты организации */}
            <div className="acts-company-details">
              <div className="acts-divider-line"></div>
              <div className="acts-details-text fs-07">
                Структурное подразделение Управление по сбытовой деятельности «Сахатранснефтегаз»
              </div>
              <div className="acts-details-text">
                ИНН 1435142972, КПП 140045003, ОГРН 1031402073097
              </div>
              <div className="acts-details-text">
                Адрес пункта приема платежа: г.Якутск, ул.П.Алексеева, 64Б, тел/факс: 46-00-93, 46-00-41
              </div>
              <div className="acts-details-text">
                Время работы: будни с 8:00 до 17:00, обед с 12:00 до 13:00; суббота, воскресенье - выходной
              </div>
            </div>

            {/* Заголовок документа */}
            <div className="acts-document-title">
              <div><b>АКТ ПЛОМБИРОВАНИЯ ПРИБОРА УЧЕТА ГАЗА</b></div>
              
              <div className='flex fl-space'>
                <div></div>
                <div className="acts-date-line">
                  от «<span className="acts-field-value">{actDateFormatted.day}</span>»
                  <span className="acts-field-value">{actDateFormatted.month}</span>
                  20<span className="acts-field-value">{actDateFormatted.year}</span>г.
                </div>
              </div>
            </div>

            {/* Основная информация */}
            <div className="acts-document-content">

              <PrintRow  prefix = { "Дан(а) ФИО:" } data = { data.subscriber_name } />

              <PrintRow  prefix = { "По адресу" } data = { data.address } />

              <PrintRow  prefix = { "Прибор учета расхода газа опломбирован:" } data = { '' } />

              {/* Список приборов учета */}
              <div className="acts-meters-section">
                {data.meters && data.meters.length > 0 ? (
                  data.meters.map((meter, index) => (
                    <div key={index} className="acts-meter-block">
                      <div className="acts-content-line">
                        <PrintRow prefix = { "" } data = { (index + 1) + ".G- № сч " + (meter.meter_number || '____') + ' пломба ' + (meter.seal_number || '_________') + ' примечания ' + (meter.notes || '________') 
                          + ' текущие показания прибора учета газа:' + (meter.current_reading || '__') 
                        } />
                      </div>
                    </div>
                  ))
                ) : (
                    <div key={ 1 } className="acts-meter-block">
                      <div className="acts-content-line">
                        <PrintRow prefix = { "" } data = { (1) + ".G- № сч " + ( '____') + ' пломба ' + ( '_________') + ' примечания ' + ( '________') 
                          + ' текущие показания прибора учета газа:' + ( '__') 
                        } />
                      </div>
                    </div>                  
                )}
              </div>

              {/* Подписи */}
              <div className="acts-signatures-section">

                <PrintRow prefix = { 'УСД АО «Сахатранснефтегаз» ' } data = { '______________/_______/' } />

                <PrintRow prefix = { 'Акт получил(а): ' } data = { '______________/_______/' } />
                
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

export default ActPlombPrint;