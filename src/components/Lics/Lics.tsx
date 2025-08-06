import React, { useState } from 'react';
import LicsList from './components/List/List';
import FindLics from './components/FindLic/FindLics';
import { useLics } from './useLics';
import styles from './Lics.module.css';

const Lics: React.FC = () => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  
  const {
    data,
    loading,
    error,
    refreshData,
    handleLicClick,
    formatSum,
    getTotalDebt,
    formatAddress,
    formatDate,
    hasActiveDebts,
    getDebtStatus
  } = useLics();

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const handleLicSelect = (lic: string) => {
    console.log(lic);
    closeSearchModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Лицевые счета</h1>
        
        <div className={styles.actions}>
          <button 
            className={styles.searchButton}
            onClick={openSearchModal}
          >
            <span className={styles.buttonIcon}>🔍</span>
            Поиск
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <LicsList 
          data={data}
          loading={loading}
          error={error}
          onLicClick={handleLicClick}
          formatSum={formatSum}
          getTotalDebt={getTotalDebt}
          formatAddress={formatAddress}
          getDebtStatus={getDebtStatus}
        />
      </div>

      {isSearchModalOpen && (
        <FindLics
          isOpen={isSearchModalOpen}
          onClose={closeSearchModal}
          onSelect={handleLicSelect}
        />
      )}
    </div>
  );
};

export default Lics;