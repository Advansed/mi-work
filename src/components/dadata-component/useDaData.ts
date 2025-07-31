
// useDaData.ts
import { useState, useCallback, useMemo } from 'react';
import DaDataService from './dadata-service';
import { DaDataConfig, DaDataResponse } from './types';

interface UseDaDataReturn {
  standardizeAddress: (address: string) => Promise<DaDataResponse>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useDaData = (config: DaDataConfig): UseDaDataReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => new DaDataService(config), [config]);

  const standardizeAddress = useCallback(async (address: string): Promise<DaDataResponse> => {
    setLoading(true);
    setError(null);

    try {
      const result = await service.standardizeAddress(address);
      
      if (!result.success && result.message) {
        setError(result.message);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      setError(errorMessage);
      
      return {
        success: false,
        data: null,
        suggestions: [],
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [service]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    standardizeAddress,
    loading,
    error,
    clearError
  };
};