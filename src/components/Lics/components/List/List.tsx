import React from 'react';
import { ILicAccount, IDebt } from '../../useLics';
import styles from './List.module.css';

interface LicsListProps {
  data: ILicAccount[];
  loading: boolean;
  error: string | null;
  onLicClick: (licAccount: ILicAccount) => void;
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
  formatSum,
  getTotalDebt,
  formatAddress,
  getDebtStatus
}) => {
  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Лицевые счета</h2>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Лицевой счет</th>
              <th>ФИО</th>
              <th>Адрес</th>
              <th>Участок</th>
              <th>Долг</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lic) => {
              const totalDebt = getTotalDebt(lic.debts);
              const debtStatus = getDebtStatus(lic.debts);
              
              return (
                <tr 
                  key={lic.id}
                  className={`${styles.row} ${styles[`debt${debtStatus.charAt(0).toUpperCase() + debtStatus.slice(1)}`]}`}
                  onClick={() => onLicClick(lic)}
                >
                  <td className={styles.code}>{lic.code}</td>
                  <td className={styles.name}>{lic.name}</td>
                  <td className={styles.address}>{formatAddress(lic.address_go)}</td>
                  <td className={styles.plot}>{lic.plot}</td>
                  <td className={styles.debt}>
                    <span className={styles.debtSum}>
                      {formatSum(totalDebt)}
                    </span>
                    {debtStatus === 'positive' && (
                      <span className={styles.debtIndicator}>●</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className={styles.empty}>Нет данных для отображения</div>
      )}
    </div>
  );
};

export default LicsList;