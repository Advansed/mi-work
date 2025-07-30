import React from 'react';
import { PrescriptionData } from './useActPrescript';
import './ActPrescriptPrint.css';

interface ActPrescriptPrintProps {
  data: PrescriptionData;
  mode: 'edit' | 'print';
  onClose?: () => void;
}

const ActPrescriptPrint: React.FC<ActPrescriptPrintProps> = ({ 
  data, 
  mode, 
  onClose 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '__________';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="print-wrapper">
      {/* Панель действий */}
      {mode === 'edit' && (
        <div className="print-actions">
          <button onClick={handlePrint} className="btn btn-primary">
            Печать
          </button>
          {onClose && (
            <button onClick={onClose} className="btn btn-secondary">
              Закрыть
            </button>
          )}
        </div>
      )}

      {/* Печатная форма */}
      <div className="print-form prescription-print">
        <div className="document-header">
          <div className="logo-section">
            <div className="logo-circle">
              <div className="logo-text">
                САХА<br/>
                ТРАНС<br/>
                НЕФТЕ<br/>
                ГАЗ<br/>
                УСД
              </div>
            </div>
            <div className="qr-placeholder">
              <div className="qr-code">QR</div>
            </div>
          </div>

          <div className="header-info">
            <div className="department">
              Структурное подразделение<br/>
              Управление по сбытовой деятельности<br/>
              677005, Республика Саха (Якутия), г.Якутск, ул.П.Алексеева, 64 Б
            </div>
          </div>
        </div>

        <div className="document-title">
          <h1>ПРЕДПИСАНИЕ</h1>
          <h2>за нарушение правил пользования газом в быту</h2>
        </div>

        <div className="prescription-info">
          <div className="prescription-number">
            «{data.prescription_number || '______'}» {formatDate(data.prescription_date)} 20___г.
            по Вашему адресу при проведении проверки по адресу:
          </div>

          <div className="address-line">
            {data.check_address || '_'.repeat(50)}, Л/С {data.account_number || '______'},
          </div>

          <div className="subscriber-line">
            {data.subscriber_name || '_'.repeat(40)}, {data.subscriber_phone || '_'.repeat(15)}
          </div>
          <div className="labels">
            (фио абонента) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;№ телефона
          </div>
        </div>

        <div className="violations-section">
          <div className="violations-header">
            Выявлены нарушения СП 62.13330.2011, не соответствующие нормативно-технической 
            документации при эксплуатации газоиспользующего оборудования:
          </div>

          <div className="violations-text">
            {data.violations_text || '_'.repeat(200)}
          </div>

          <div className="deadline-section">
            <div className="warning-text">
              В соответствии с подписанным договором Поставки газа, при выявлении Поставщиком 
              газа нарушений ВДГО, предусмотрены штрафные санкции.
            </div>

            <div className="deadline-text">
              Предлагаем Вам в срок до «{formatDate(data.deadline_date) || '______'}» 20___г. устранить выявленные нарушения,
              (внести изменения в договор поставки газа), в противном случае будем вынуждены в 
              соответствии с Правилами поставки газа №549 от 21.07.08г. приостановить/прекратить 
              поставку газа.
            </div>
          </div>
        </div>

        <div className="contact-info">
          По вопросам устранения нарушений обращаться в Вашу обслуживающую организацию или по 
          адресу: г. Якутск ул. П. Алексеева,64, тел 509-555
        </div>

        <div className="signatures-section">
          <div className="signature-title">Предписание вручил:</div>
          
          <div className="signature-line">
            представитель организации {data.organization_representative || '_'.repeat(25)} /{data.organization_representative || '_'.repeat(25)}/
          </div>

          <div className="signature-line">
            абонент {data.subscriber_signature || '_'.repeat(20)} /{data.subscriber_representative || '_'.repeat(25)}/
          </div>

          <div className="signature-line">
            представитель абонента {data.subscriber_representative || '_'.repeat(20)} /{data.subscriber_representative || '_'.repeat(25)}/
          </div>
        </div>

        <div className="note">
          <strong>Примечание:</strong> АКТ составляется в двух экземплярах, один из которых выдаётся на руки абоненту, 
          другой хранится у поставщика газа.
        </div>
      </div>
    </div>
  );
};

export default ActPrescriptPrint;