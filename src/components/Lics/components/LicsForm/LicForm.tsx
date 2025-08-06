import React from 'react';
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
import { closeOutline } from 'ionicons/icons';
import { ILicAccount, formatSum, formatDate, formatAddress, getTotalDebt, getDebtStatus } from '../../useLics';
import './LicForm.css';

interface LicFormProps {
  isOpen: boolean;
  onClose: () => void;
  licAccount: ILicAccount | undefined;
  loading?: boolean;
}

const LicForm: React.FC<LicFormProps> = ({
  isOpen,
  onClose,
  licAccount,
  loading = false
}) => {
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
          {/* Основная информация */}
          <div className="lics-level-container">
            <span className="lics-level-label">Основная информация</span>
            <div className="lic-info-row">
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

          {/* Финансовая информация */}
          <div className={`lics-level-container ${debtStatus === 'positive' ? 'warning' : debtStatus === 'negative' ? 'success' : ''}`}>
            <span className="lics-level-label">Задолженности</span>
            <div className="lic-info-row">
              <div className="lic-info-field">
                <label>Общая задолженность:</label>
                <span className={`lic-info-value debt-${debtStatus}`}>
                  {formatSum(totalDebt)}
                </span>
              </div>
            </div>
            {licAccount.debts.length > 0 && (
              <div className="debts-list">
                {licAccount.debts.map((debt, index) => (
                  <div key={index} className="debt-item">
                    <span className="debt-service">{debt.service}</span>
                    <span className={`debt-sum debt-${debt.sum > 0 ? 'positive' : debt.sum < 0 ? 'negative' : 'none'}`}>
                      {formatSum(debt.sum)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Счетчики */}
          {licAccount.counters.length > 0 && (
            <div className="lics-level-container">
              <span className="lics-level-label">Приборы учета</span>
              <div className="counters-list">
                {licAccount.counters.map((counter, index) => (
                  <div key={index} className="counter-item">
                    <div className="counter-header">
                      <span className="counter-code">{counter.code}</span>
                      <span className="counter-type">{counter.tip}</span>
                    </div>
                    <div className="counter-details">
                      <div className="counter-name">{counter.name}</div>
                      <div className="counter-data">
                        <span>Показания: {counter.indice}</span>
                        <span>Период: {counter.period}</span>
                        <span>Поверка: {formatDate(counter.poverka)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Договоры */}
          {licAccount.agrees.length > 0 && (
            <div className="lics-level-container">
              <span className="lics-level-label">Договоры</span>
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
                      <div>№ {agree.number}</div>
                      <div>
                        {formatDate(agree.begin_date)} - {formatDate(agree.end_date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Оборудование */}
          {licAccount.equips.length > 0 && (
            <div className="lics-level-container">
              <span className="lics-level-label">Газовое оборудование</span>
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
            </div>
          )}
        </IonContent>
      </IonModal>
    </>
  );
};

export default LicForm;