import React from 'react';
import '../ActsPrint.css'; // НОВЫЙ ИМПОРТ ЕДИНОГО CSS
import { PrintRow } from '../Forms/Forms';
import { ActCompletedData } from './useCompleted';

// ==========================================
// ИНТЕРФЕЙСЫ
// ==========================================

interface CompletedPrintProps {
  mode: 'print';
  data: ActCompletedData;
  onClose: () => void;
}

// ==========================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ==========================================

const CompletedPrint: React.FC<CompletedPrintProps> = ({
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
      year: date.getFullYear().toString().slice(-2)
    };
  };

  const formatAddress = () => {
    return data.address || '________________________________________________';
  };

  // Форматированные данные
  const actDateFormatted = formatDateForDisplay(data.act_date);
  const workStartedFormatted = formatDateForDisplay(data.work_started_date);
  const workCompletedFormatted = formatDateForDisplay(data.work_completed_date);

  const handlePrint = () => {
    window.print();
  };

  // ============================================
  // РЕЖИМ ПЕЧАТИ
  // ============================================

  if (mode === 'print') {
    return (
      <div className="acts-print-wrapper">
        <div className="acts-print-actions">
          <button onClick={handlePrint} className="acts-btn acts-btn-primary">
            🖨️ Печать
          </button>
          <button onClick={onClose} className="acts-btn acts-btn-secondary">
            ✕ Закрыть
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
              <div className="acts-details-text">Республика Саха (Якутия), г. Якутск, ул. Кирова, д. 20</div>
              <div className="acts-details-text">Тел.: +7 (4112) 42-42-42, факс: +7 (4112) 42-42-43</div>
              <div className="acts-details-text">Email: info@stngas.ru</div>
              <div className="acts-divider-line"></div>
            </div>

            {/* Заголовок акта */}
            <div className="acts-document-title">
              <h1>АКТ ВЫПОЛНЕННЫХ РАБОТ</h1>
              <div className="acts-date-line">
                <span>
                  от «{actDateFormatted.day}» {actDateFormatted.month} 20{actDateFormatted.year}г.
                </span>
                <span className="acts-field-value acts-act-number">№ {data.act_number || '__________'}</span>
              </div>
            </div>

            {/* Содержание документа */}
            <div className="acts-section-spacing">
              
              {/* Данные исполнителя */}
              <div className="acts-work-section">
                <PrintRow prefix={'Исполнитель работ:'} data={data.executor_name || ''} />
                <div className="acts-field-description">ф.и.о.</div>
                
                <PrintRow prefix={'Должность:'} data={data.executor_position || ''} />
              </div>

              {/* Данные заказчика */}
              <div className="acts-work-section">
                <PrintRow prefix={'Заказчик (абонент):'} data={data.client_name || ''} />
                <div className="acts-field-description">ф.и.о.</div>
                
                <PrintRow prefix={'Адрес выполнения работ:'} data={formatAddress()} />
              </div>

              {/* Описание работ */}
              <div className="acts-work-section">
                <div className="acts-work-title">Выполненные работы:</div>
                
                <div className="acts-work-description">
                  {data.work_description ? (
                    <div className="acts-work-text">{data.work_description}</div>
                  ) : (
                    <div className="acts-work-placeholder">
                      _____________________________________________________________________
                      _____________________________________________________________________
                      _____________________________________________________________________
                      _____________________________________________________________________
                    </div>
                  )}
                </div>
                <div className="acts-field-description">подробное описание выполненных работ</div>
              </div>

              {/* Использованные материалы */}
              <div className="acts-work-section">
                <div className="acts-work-title">Использованные материалы и оборудование:</div>
                
                <div className="acts-equipment-used">
                  {data.equipment_used ? (
                    <div className="acts-equipment-text">{data.equipment_used}</div>
                  ) : (
                    <div className="acts-equipment-placeholder">
                      _____________________________________________________________________
                      _____________________________________________________________________
                      _____________________________________________________________________
                    </div>
                  )}
                </div>
                <div className="acts-field-description">наименование, количество, характеристики</div>
              </div>

              {/* Сроки выполнения */}
              <div className="acts-work-section">
                <PrintRow prefix={'Работы начаты:'} data={
                  data.work_started_date ? 
                  `«${workStartedFormatted.day}» ${workStartedFormatted.month} 20${workStartedFormatted.year}г.` :
                  '«___»____________20___г.'
                } />
                
                <PrintRow prefix={'Работы завершены:'} data={
                  data.work_completed_date ? 
                  `«${workCompletedFormatted.day}» ${workCompletedFormatted.month} 20${workCompletedFormatted.year}г.` :
                  '«___»____________20___г.'
                } />
              </div>

              {/* Оценка качества */}
              <div className="acts-work-section">
                <div className="acts-work-title">Оценка качества выполненных работ:</div>
                
                <div className="acts-quality-assessment">
                  {data.quality_assessment ? (
                    <div className="acts-quality-text">{data.quality_assessment}</div>
                  ) : (
                    <div className="acts-quality-placeholder">
                      _____________________________________________________________________
                      _____________________________________________________________________
                    </div>
                  )}
                </div>
              </div>

              {/* Недостатки */}
              {data.defects_found && (
                <div className="acts-work-section">
                  <div className="acts-work-title">Обнаруженные недостатки:</div>
                  <div className="acts-defects-text">{data.defects_found}</div>
                </div>
              )}

              {/* Рекомендации */}
              {data.recommendations && (
                <div className="acts-work-section">
                  <div className="acts-work-title">Рекомендации:</div>
                  <div className="acts-recommendations-text">{data.recommendations}</div>
                </div>
              )}

              {/* Примечания */}
              {data.notes && (
                <div className="acts-work-section">
                  <div className="acts-work-title">Примечания:</div>
                  <div className="acts-notes-text">{data.notes}</div>
                </div>
              )}

              {/* Секция подписей */}
              <div className="acts-signatures-section">
                <div className="acts-signatures-title">Подписи сторон:</div>

                <div className="acts-signature-block">
                  <PrintRow prefix={'Исполнитель работ:'} data={''} />
                  <div className="acts-signature-line">
                    <span className="acts-signature-placeholder">_________________________</span>
                    <span className="acts-signature-name">({data.executor_signature || data.executor_name || ''})</span>
                  </div>
                  <div className="acts-field-description">подпись, ф.и.о.</div>
                </div>

                <div className="acts-signature-block">
                  <PrintRow prefix={'Заказчик (абонент):'} data={''} />
                  <div className="acts-signature-line">
                    <span className="acts-signature-placeholder">_________________________</span>
                    <span className="acts-signature-name">({data.client_signature || data.client_name || ''})</span>
                  </div>
                  <div className="acts-field-description">подпись, ф.и.о.</div>
                </div>

                {data.representative_signature && (
                  <div className="acts-signature-block">
                    <PrintRow prefix={'Представитель организации:'} data={''} />
                    <div className="acts-signature-line">
                      <span className="acts-signature-placeholder">_________________________</span>
                      <span className="acts-signature-name">({data.representative_signature})</span>
                    </div>
                    <div className="acts-field-description">подпись, ф.и.о.</div>
                  </div>
                )}
              </div>

              {/* Примечание о копиях */}
              <div className="acts-note-section">
                <strong>Примечание:</strong> Акт составляется в двух экземплярах, 
                один из которых выдается на руки заказчику, другой хранится в исполняющей организации.
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

export default CompletedPrint;