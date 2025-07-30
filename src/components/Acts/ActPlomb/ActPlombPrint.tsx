// src/components/Acts/ActPlomb/ActPlombPrint.tsx
import React, { useState } from 'react';
import { ActPlombData } from './useActPlomb';
import './ActPlombPrint.css';

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
      <div className="plomb-print-container">
        <div className="print-actions no-print">
          <button onClick={handlePrint} className="btn btn-primary">
            🖨️ Печать
          </button>
          <button onClick={handleSavePDF} className="btn btn-secondary">
            📄 Сохранить PDF
          </button>
          <button onClick={onClose} className="btn btn-outline">
            ✖ Закрыть
          </button>
        </div>

        <div className="print-content-scrollable">
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
              <div className="qr-code">
                {/* QR код будет добавлен позже */}
                <div className="qr-placeholder">QR</div>
              </div>
            </div>

            {/* Реквизиты организации */}
            <div className="company-details">
              <div className="divider-line"></div>
              <div className="details-text">
                Структурное подразделение Управление по сбытовой деятельности «Сахатранснефтегаз»
              </div>
              <div className="details-text">
                ИНН 1435142972, КПП 140045003, ОГРН 1031402073097
              </div>
              <div className="details-text">
                Адрес пункта приема платежа: г.Якутск, ул. П.Алексеева, 64Б, тел/факс: 46-00-93, 46-00-41
              </div>
              <div className="details-text">
                Время работы: будни с 8:00 до 17:00, обед с 12:00 до 13:00; суббота, воскресенье - выходной
              </div>
            </div>

            {/* Заголовок документа */}
            <div className="document-title">
              <h1>АКТ ПЛОМБИРОВАНИЯ ПРИБОРА УЧЕТА ГАЗА</h1>
              
              <div className="date-line">
                от «<span className="field-value">{actDateFormatted.day}</span>»
                <span className="field-value">{actDateFormatted.month}</span>
                20<span className="field-value">{actDateFormatted.year}</span>г.
              </div>
            </div>

            {/* Основная информация */}
            <div className="document-content">
              <div className="content-line">
                Дан(а) ФИО: <span className="field-value underline">{data.subscriber_name || '_'.repeat(79)}</span>
              </div>

              <div className="content-line">
                По адресу <span className="field-value underline">{ data.address || '_'.repeat(79)}</span>
              </div>

              <div className="content-line section-title">
                Прибор учета расхода газа опломбирован:
              </div>

              {/* Список приборов учета */}
              <div className="meters-section">
                {data.meters && data.meters.length > 0 ? (
                  data.meters.map((meter, index) => (
                    <div key={index} className="meter-block">
                      <div className="content-line">
                        {index + 1}.G- № сч<span className="field-value underline">{meter.meter_number || '______________'}</span>
                        {' '}пломба №<span className="field-value underline">{meter.seal_number || '___________________'}</span>
                        {' '}примечания <span className="field-value underline">{meter.notes || '____________________'}</span>
                      </div>
                      <div className="content-line meter-reading">
                        текущие показания прибора учета газа<span className="field-value underline">{meter.current_reading || '________________'}</span>м³
                      </div>
                    </div>
                  ))
                ) : (
                  // Пустые строки если нет данных
                  [...Array(3)].map((_, index) => (
                    <div key={index} className="meter-block">
                      <div className="content-line">
                        {index + 1}.G- № сч<span className="field-value underline">______________</span>
                        {' '}пломба №<span className="field-value underline">___________________</span>
                        {' '}примечания <span className="field-value underline">____________________</span>
                      </div>
                      <div className="content-line meter-reading">
                        текущие показания прибора учета газа<span className="field-value underline">________________</span>м³
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Подписи */}
              <div className="signatures-section">
                <div className="signature-line company-signature">
                  УСД АО «Сахатранснефтегаз» 
                  <span className="field-value">__________________________________</span>/
                  <span className="field-value">____________________</span>/
                </div>
                
                <div className="signature-line recipient-signature">
                  АКТ ПОЛУЧИЛ(А): 
                  <span className="field-value">___________________</span>/
                  <span className="field-value">____________________________</span>/ 
                  Дата <span className="field-value">_____________</span>
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

export default ActPlombPrint;