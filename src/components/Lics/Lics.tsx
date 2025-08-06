import React, { useState } from 'react';
import LicsList from './LicsList';
import FindLics from './components/FindLics';
import styles from './Lics.module.css';

const Lics: React.FC = () => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const handleLicSelect = (lic: string) => {
    console.log( lic )
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
        <LicsList  />
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