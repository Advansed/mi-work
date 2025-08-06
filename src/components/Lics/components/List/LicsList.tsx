import React from 'react';
import { ILicAccount, IDebt } from '../../useLics';
import styles from './List.module.css';

interface LicsListProps {
  data: ILicAccount[];
  loading: boolean;
  error: string | null;
  onLicClick: (licAccount: ILicAccount) => void;
  onLicDel: (lic: string) => void;
  formatSum: (sum: number) => string;
  getTotalDebt: (debts: IDebt[]) => number;
  formatAddress: (address: string) => string;
  getDebtStatus: (debts: IDebt[]) => 'none' | 'positive' | 'negative';
}

const LicsList: React.FC<LicsListProps> = ({
  data,
  loading,
  error,
  onLicClick,
  onLicDel,
  formatSum,
  getTotalDebt,
  formatAddress,
  getDebtStatus
}) => {

   const handleDelete = (licAccount: ILicAccount, event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем клик по карточке
    console.log('Удаление лицевого счета:', licAccount.code, licAccount.id);
    onLicDel( licAccount.code )
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Лицевые счета</h2>
      
      <div className={styles.itemsContainer}>
        {data.map((lic) => {
          const totalDebt = getTotalDebt(lic.debts);
          const debtStatus = getDebtStatus(lic.debts);
          
          return (
            <div 
              key={lic.id}
              className={`${styles.item} ${styles[`debt${debtStatus.charAt(0).toUpperCase() + debtStatus.slice(1)}`]}`}
              onClick={() => onLicClick(lic)}
            >
              <div className={styles.itemHeader}>
                <div className={styles.code}>{lic.code}</div>
                <div className={styles.debtContainer}>
                  <span className={styles.debtSum}>
                    {formatSum(totalDebt)}
                  </span>
                  {debtStatus === 'positive' && (
                    <span className={styles.debtIndicator}>●</span>
                  )}
                </div>
                 <button 
                    className={styles.deleteButton}
                    onClick={(e) => handleDelete( lic , e)}
                    title="Удалить лицевой счет"
                  >
                    🗑️
                  </button>
              </div>
              
              <div className={styles.itemBody}>
                <div className={styles.name}>{lic.name}</div>
                <div className={styles.address}>{formatAddress(lic.address_go)}</div>
                <div className={styles.plot}>Участок: {lic.plot}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length === 0 && (
        <div className={styles.empty}>Нет данных для отображения</div>
      )}
    </div>
  );
};

export default LicsList;