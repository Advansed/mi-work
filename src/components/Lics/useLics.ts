import { useState, useEffect } from 'react';
import { getData, Store } from '../Store';

// Типы/интерфейсы
export interface IDebt {
  id: string;
  service: string;
  sum: number;
}

export interface ICounter {
  id:           string;
  code:         string;
  name:         string;
  tip:          string;
  indice:       number;
  period:       string;
  poverka:      string;
  seal:         string;
  seal_date:    string;
}

export interface IAgree {
  name: string;
  number: string;
  status: string;
  begin_date: string;
  end_date: string;
}

export interface IEquip {
  tip: string;
  name: string;
  number: string;
  active: string;
}

export interface ILicAccount {
  id: string;
  code: string;
  name: string;
  address_go: string;
  plot: string;
  debts: IDebt[];
  counters: ICounter[];
  agrees: IAgree[];
  equips: IEquip[];
}

export interface ILicsResponse {
  success: boolean;
  data: ILicAccount[];
  message: string;
}

// Утилиты
export const formatSum = (sum: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2
  }).format(sum);
};

export const getTotalDebt = (debts: IDebt[]): number => {
  return debts.reduce((total, debt) => total + debt.sum, 0);
};

export const formatUUID = (uuid: string): string => {
  // Предполагается использование f_encode_uuid/f_decode_uuid из базы
  return uuid;
};

export const formatAddress = (address: string): string => {
  return address.replace(/,\s*/g, ', ');
};

export const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'не указано') return 'не указано';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  } catch {
    return dateString;
  }
};

export const hasActiveDebts = (debts: IDebt[]): boolean => {
  return debts.some(debt => debt.sum > 0);
};

export const getDebtStatus = (debts: IDebt[]): 'none' | 'positive' | 'negative' => {
  const total = getTotalDebt(debts);
  if (total === 0) return 'none';
  return total > 0 ? 'positive' : 'negative';
};

// Хук
export const useLics = () => {
  const [ data,     setData ]     = useState<ILicAccount[]>([]);
  const [ item,     setItem ]     = useState<ILicAccount>()
  const [ loading,  setLoading ]  = useState<boolean>(false);
  const [ error,    setError ]    = useState<string | null>(null);


  const loadLics    = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Здесь будет вызов API метода get_lics
      const response = await getData('getlics',{ token: Store.getState().login.token })

      const result: ILicsResponse = response;
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Ошибка загрузки данных');
      }
    } catch (err) {
      setError('Ошибка сети или сервера');
      console.error('Error loading lics:', err);
    } finally {
      setLoading(false);
    }

  };

  
  const addLics     = async (lc) => {


    try {
      // Здесь будет вызов API метода get_lics
      const response = await getData('addLic',{ token: Store.getState().login.token, lc: lc })

      const result: ILicsResponse = response;
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Ошибка загрузки данных');
      }
    } catch (err) {
      setError('Ошибка сети или сервера');
    } finally {
      setLoading(false);
    }

  }


  const deleteLics  = async (lc) => {


    try {
      // Здесь будет вызов API метода get_lics
      const response = await getData( 'deleteLic', { token: Store.getState().login.token, lc: lc } )

      const result: ILicsResponse = response;
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Ошибка загрузки данных');
      }
    } catch (err) {
      setError('Ошибка сети или сервера');
      console.error('Error loading lics:', err);
    } finally {
      setLoading(false);
    }

  }

  
  const handleLicClick = (licAccount: ILicAccount) => {
    // Навигация к детальной карточке
    setItem( licAccount )
  };

  
  const refreshData = () => {
    loadLics();
  };


  useEffect(() => {
    loadLics();
  }, []);

  return {
    data,
    item,
    loading,
    error,
    setItem,
    refreshData,
    handleLicClick,
    addLics,
    deleteLics,
    // Утилиты
    formatSum,
    getTotalDebt,
    formatAddress,
    formatDate,
    hasActiveDebts,
    getDebtStatus
  };
};