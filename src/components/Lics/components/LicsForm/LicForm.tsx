import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonLoading
} from '@ionic/react';
import { closeOutline, chevronDown, chevronUp } from 'ionicons/icons';
import { ILicAccount, formatSum, formatDate, formatAddress, getTotalDebt, getDebtStatus } from '../../useLics';
import './LicForm.css';

interface LicFormProps {
  isOpen: boolean;
  onClose: () => void;
  licAccount: ILicAccount | undefined;
  loading?: boolean;
}

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  className = ''
}) => (
  <div className={`accordion-section ${className}`}>
    <button className="accordion-header" onClick={onToggle}>
      <span className="accordion-title">{title}</span>
      <IonIcon icon={isOpen ? chevronUp : chevronDown} className="accordion-icon" />
    </button>
    <div className={`accordion-content ${isOpen ? 'open' : 'closed'}`}>
      {children}
    </div>
  </div>
);

const LicForm: React.FC<LicFormProps> = ({
  isOpen,
  onClose,
  licAccount,
  loading = false
}) => {
  const [openSections, setOpenSections] = useState({
    debts: false,
    counters: false,
    agrees: false,
    equips: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!licAccount) return null;

  const totalDebt = getTotalDebt(licAccount.debts);
  const debtStatus = getDebtStatus(licAccount.debts);

  return (
    <>
      <IonLoading isOpen={loading} />
      <IonModal 
        isOpen={isOpen} 
        onDidDismiss={onClose}
        className="lics-form-modal"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Лицевой счет</IonTitle>
            <IonButtons slot="end">
              <IonButton 
                fill="clear" 
                onClick={onClose}
                className="close-button"
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <div className="lic-form-card">
            {/* Основная информация - всегда видна */}
            <div className="lic-main-info">
              <h2 className="lic-main-title">Основная информация</h2>
              <div className="lic-info-grid">
                <div className="lic-info-field">
                  <label>Код лицевого счета:</label>
                  <span className="lic-info-value">{licAccount.code}</span>
                </div>
                <div className="lic-info-field">
                  <label>Абонент:</label>
                  <span className="lic-info-value">{licAccount.name}</span>
                </div>
                <div className="lic-info-field">
                  <label>Участок:</label>
                  <span className="lic-info-value">{licAccount.plot}</span>
                </div>
                <div className="lic-info-field">
                  <label>Адрес:</label>
                  <span className="lic-info-value">{licAccount.address_go}</span>
                </div>
              </div>
            </div>

            {/* Складные секции */}
            <div className="accordion-container">

              {/* Задолженность */}
              <AccordionSection
                title="Задолженность"
                isOpen={openSections.debts}
                onToggle={() => toggleSection('debts')}
                className={`debt-section debt-${debtStatus}`}
              >
                <div className="lic-info-field debt-total">
                  <label>Общая задолженность:</label>
                  <span className={`lic-info-value debt-${debtStatus}`}>
                    {formatSum(totalDebt)}
                  </span>
                </div>
                {licAccount.debts.length > 0 && (
                  <div className="debts-list">
                    {licAccount.debts.map((debt, index) => (
                      <div key={index} className="debt-item">
                        <span className="debt-service">{debt.service}</span>
                        <span className={`debt-sum debt-${debt.sum > 0 ? 'positive' : debt.sum < 0 ? 'negative' : 'zero'}`}>
                          {formatSum(debt.sum)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionSection>

              {/* Приборы учета */}
              <AccordionSection
                title="Приборы учета"
                isOpen={openSections.counters}
                onToggle={() => toggleSection('counters')}
              >
                {licAccount.counters?.length > 0 ? (
                  <div className="counters-list">
                    {licAccount.counters.map((counter, index) => (
                      <div key={index} className="counter-item">
                        <div className="counter-header">
                          <span className="counter-code">{counter.code}</span>
                          <span className="counter-type">{counter.tip}</span>
                        </div>
                        <div className="counter-name">{counter.name}</div>
                        <div className="counter-data">
                          <span>Пломба: {counter.seal || ''}</span>
                          <span>Дата пломбы: {formatDate(counter.seal_date || '')}</span>
                          <span>Показания: {counter.indice }</span>
                          <span>Дата показаний: {formatDate( counter.period )}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section">Приборы учета не найдены</div>
                )}
              </AccordionSection>

              {/* Договор */}
              <AccordionSection
                title="Договор"
                isOpen={openSections.agrees}
                onToggle={() => toggleSection('agrees')}
              >
                {licAccount.agrees?.length > 0 ? (
                  <div className="agrees-list">
                    {licAccount.agrees.map((agree, index) => (
                      <div key={index} className="agree-item">
                        <div className="agree-header">
                          <span className="agree-name">{agree.name}</span>
                          <span className={`agree-status ${agree.status.toLowerCase()}`}>
                            {agree.status}
                          </span>
                        </div>
                        <div className="agree-details">
                          <div>Номер: {agree.number}</div>
                          <div>Дата: {formatDate(agree.begin_date )}</div>
                          {agree.end_date && <div>Дата окончания: {formatDate(agree.end_date)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section">Договоры не найдены</div>
                )}
              </AccordionSection>

              {/* Газовое оборудование */}
              <AccordionSection
                title="Газовое оборудование"
                isOpen={openSections.equips}
                onToggle={() => toggleSection('equips')}
              >
                {licAccount.equips.length > 0 ? (
                  <div className="equips-list">
                    {licAccount.equips.map((equip, index) => (
                      <div key={index} className="equip-item">
                        <div className="equip-header">
                          <span className="equip-type">{equip.tip}</span>
                          <span className={`equip-status ${equip.active === 'true' ? 'active' : 'inactive'}`}>
                            {equip.active === 'true' ? 'Активно' : 'Неактивно'}
                          </span>
                        </div>
                        <div className="equip-details">
                          <div className="equip-name">{equip.name}</div>
                          <div className="equip-number">№ {equip.number}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section">Газовое оборудование не найдено</div>
                )}
              </AccordionSection>

            </div>
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

export default LicForm;