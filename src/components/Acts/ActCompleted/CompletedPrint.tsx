import React from 'react';
import './CompletedPrint.css';
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
      <div className="completed-form-container">
        <div className="completed-print-actions">
          <button onClick={handlePrint} className="completed-btn completed-btn-primary">
            🖨️ Печать
          </button>
          <button onClick={onClose} className="completed-btn completed-btn-secondary">
            ✕ Закрыть
          </button>
        </div>

        <div className="completed-print-content-scrollable">
          <div className="completed-print-content">
            {/* Заголовок организации */}
            <div className="completed-document-header">
              <div className="logo-section">
                <img src="USD.png" alt="USD" className='h-4'/>
              </div>
              <div className="logo-section">
                <img src="qr.png" alt="USD" className='h-4'/>
              </div>
            </div>

            {/* Реквизиты организации */}
            <div className="completed-company-details">
              <div className="completed-divider-line"></div>
              <div className="completed-details-text">
                <strong>Структурное подразделение Управление по сбытовой деятельности «Сахатранснефтегаз»</strong>
              </div>
              <div className="completed-details-text">
                ИНН 1435142972, КПП 140045003, ОГРН 1031402073097
              </div>
              <div className="completed-details-text">
                Адрес пункта приема платежа: г.Якутск, ул. П.Алексеева, 64б, тел/факс: 46-00-93, 46-00-41
              </div>
              <div className="completed-details-text">
                Время работы: будни с 8:00 до 17:00, обед с 12:00 до 13:00; суббота, воскресенье - выходной
              </div>
            </div>

            {/* Заголовок документа */}
            <div className="completed-document-title">
              <h1>АКТ ВЫПОЛНЕННЫХ РАБОТ</h1>
              
              <div className="completed-date-line">
                от «<span className="completed-field-value">{actDateFormatted.day}</span>»
                <span className="completed-field-value">{actDateFormatted.month}</span>
                20<span className="completed-field-value">{actDateFormatted.year}</span>г.
                <span className="completed-field-value completed-act-number">№ {data.act_number || '__________'}</span>
              </div>
            </div>

            {/* Содержание документа */}
            <div className="completed-document-content">
              
              {/* Данные исполнителя */}
              <div className="completed-content-section">
                <PrintRow prefix={'Исполнитель работ:'} data={data.executor_name || ''} />
                <div className="completed-field-description">ф.и.о.</div>
                
                <PrintRow prefix={'Должность:'} data={data.executor_position || ''} />
              </div>

              {/* Данные заказчика */}
              <div className="completed-content-section">
                <PrintRow prefix={'Заказчик (абонент):'} data={data.client_name || ''} />
                <div className="completed-field-description">ф.и.о.</div>
                
                <PrintRow prefix={'Адрес выполнения работ:'} data={formatAddress()} />
              </div>

              {/* Описание работ */}
              <div className="completed-content-section">
                <div className="completed-section-title">Выполненные работы:</div>
                
                <div className="completed-work-description">
                  {data.work_description ? (
                    <div className="completed-work-text">{data.work_description}</div>
                  ) : (
                    <div className="completed-work-placeholder">
                      _____________________________________________________________________
                      _____________________________________________________________________
                      _____________________________________________________________________
                      _____________________________________________________________________
                    </div>
                  )}
                </div>
                <div className="completed-field-description">подробное описание выполненных работ</div>
              </div>

              {/* Использованные материалы */}
              <div className="completed-content-section">
                <div className="completed-section-title">Использованные материалы и оборудование:</div>
                
                <div className="completed-equipment-used">
                  {data.equipment_used ? (
                    <div className="completed-equipment-text">{data.equipment_used}</div>
                  ) : (
                    <div className="completed-equipment-placeholder">
                      _____________________________________________________________________
                      _____________________________________________________________________
                      _____________________________________________________________________
                    </div>
                  )}
                </div>
                <div className="completed-field-description">наименование, количество, характеристики</div>
              </div>

              {/* Сроки выполнения */}
              <div className="completed-content-section">
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
              <div className="completed-content-section">
                <div className="completed-section-title">Оценка качества выполненных работ:</div>
                
                <div className="completed-quality-assessment">
                  {data.quality_assessment ? (
                    <div className="completed-quality-text">{data.quality_assessment}</div>
                  ) : (
                    <div className="completed-quality-placeholder">
                      _____________________________________________________________________
                      _____________________________________________________________________
                    </div>
                  )}
                </div>
              </div>

              {/* Недостатки */}
              {data.defects_found && (
                <div className="completed-content-section">
                  <div className="completed-section-title">Обнаруженные недостатки:</div>
                  <div className="completed-defects-text">{data.defects_found}</div>
                </div>
              )}

              {/* Рекомендации */}
              {data.recommendations && (
                <div className="completed-content-section">
                  <div className="completed-section-title">Рекомендации:</div>
                  <div className="completed-recommendations-text">{data.recommendations}</div>
                </div>
              )}

              {/* Примечания */}
              {data.notes && (
                <div className="completed-content-section">
                  <div className="completed-section-title">Примечания:</div>
                  <div className="completed-notes-text">{data.notes}</div>
                </div>
              )}

              {/* Секция подписей */}
              <div className="completed-signatures-section">
                <div className="completed-signatures-title">Подписи сторон:</div>

                <div className="completed-signature-block">
                  <PrintRow prefix={'Исполнитель работ:'} data={''} />
                  <div className="completed-signature-line">
                    <span className="completed-signature-placeholder">_________________________</span>
                    <span className="completed-signature-name">({data.executor_signature || data.executor_name || ''})</span>
                  </div>
                  <div className="completed-field-description">подпись, ф.и.о.</div>
                </div>

                <div className="completed-signature-block">
                  <PrintRow prefix={'Заказчик (абонент):'} data={''} />
                  <div className="completed-signature-line">
                    <span className="completed-signature-placeholder">_________________________</span>
                    <span className="completed-signature-name">({data.client_signature || data.client_name || ''})</span>
                  </div>
                  <div className="completed-field-description">подпись, ф.и.о.</div>
                </div>

                {data.representative_signature && (
                  <div className="completed-signature-block">
                    <PrintRow prefix={'Представитель организации:'} data={''} />
                    <div className="completed-signature-line">
                      <span className="completed-signature-placeholder">_________________________</span>
                      <span className="completed-signature-name">({data.representative_signature})</span>
                    </div>
                    <div className="completed-field-description">подпись, ф.и.о.</div>
                  </div>
                )}
              </div>

              {/* Примечание о копиях */}
              <div className="completed-note-section">
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