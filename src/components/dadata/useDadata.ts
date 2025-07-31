// src/hooks/useDaData.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { DaDataService, AddressHelpers } from './dadataService';
import { DaDataSuggestion, DaDataApiError, FormattedAddress } from './dadata';

// ============================================
// ИНТЕРФЕЙСЫ ДЛЯ ХУКА
// ============================================
export interface UseDaDataOptions {
    apiKey?: string;
    minQueryLength?: number;
    debounceMs?: number;
    maxSuggestions?: number;
    enableGeolocation?: boolean;
}

export interface UseDaDataReturn {
    // Состояние
    suggestions: DaDataSuggestion[];
    loading: boolean;
    error: string | null;
    
    // Методы
    searchAddresses: (query: string) => Promise<void>;
    clearSuggestions: () => void;
    clearError: () => void;
    cancelSearch: () => void;
    
    // Утилиты
    formatAddress: (suggestion: DaDataSuggestion) => FormattedAddress;
    getShortAddress: (suggestion: DaDataSuggestion) => string;
    isCompleteAddress: (suggestion: DaDataSuggestion) => boolean;
    getCoordinates: (suggestion: DaDataSuggestion) => { lat: number; lon: number } | null;
    
    // Хелперы для конкретных частей адреса
    getCity: (suggestion: DaDataSuggestion) => string;
    getStreet: (suggestion: DaDataSuggestion) => string;
    getHouse: (suggestion: DaDataSuggestion) => string;
    getFlat: (suggestion: DaDataSuggestion) => string;
}

// ============================================
// ОСНОВНОЙ ХУК
// ============================================
export const useDaData = (options: UseDaDataOptions = {}): UseDaDataReturn => {
    const {
        apiKey,
        minQueryLength = 3,
        debounceMs = 300,
        maxSuggestions = 10,
        enableGeolocation = false
    } = options;

    // ============================================
    // СОСТОЯНИЕ
    // ============================================
    const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ============================================
    // REFS
    // ============================================
    const serviceRef = useRef<DaDataService | null>(null);
    const debounceRef = useRef<NodeJS.Timeout>(null);

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ СЕРВИСА
    // ============================================
    useEffect(() => {
        try {
            const key = apiKey || process.env.REACT_APP_DADATA_API_KEY;
            if (!key) {
                throw new Error('DaData API ключ не найден');
            }
            
            serviceRef.current = DaDataService.create(key);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка инициализации DaData');
        }
    }, [apiKey]);

    // ============================================
    // ОЧИСТКА ТАЙМЕРА ПРИ РАЗМОНТИРОВАНИИ
    // ============================================
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (serviceRef.current) {
                serviceRef.current.cancelRequest();
            }
        };
    }, []);

    // ============================================
    // ПОИСК АДРЕСОВ С ДЕБАУНСОМ
    // ============================================
    const searchAddresses = useCallback(async (query: string) => {
        // Очищаем предыдущий таймер
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Проверяем минимальную длину запроса
        if (!query || query.length < minQueryLength) {
            setSuggestions([]);
            return;
        }

        if (!serviceRef.current) {
            setError('DaData сервис не инициализирован');
            return;
        }

        // Устанавливаем дебаунс
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            setError(null);

            try {
                const results = await serviceRef.current!.searchAddresses(query, {
                    count: maxSuggestions
                });

                setSuggestions(results);
            } catch (err) {
                if (err instanceof DaDataApiError) {
                    setError(`Ошибка DaData API: ${err.message}`);
                } else {
                    setError('Ошибка при поиске адресов');
                }
                setSuggestions([]);
                console.error('Ошибка поиска адресов:', err);
            } finally {
                setLoading(false);
            }
        }, debounceMs);
    }, [minQueryLength, maxSuggestions, debounceMs]);

    // ============================================
    // ОЧИСТКА ПОДСКАЗОК
    // ============================================
    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
    }, []);

    // ============================================
    // ОЧИСТКА ОШИБКИ
    // ============================================
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ============================================
    // ОТМЕНА ПОИСКА
    // ============================================
    const cancelSearch = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        if (serviceRef.current) {
            serviceRef.current.cancelRequest();
        }
        setLoading(false);
    }, []);

    // ============================================
    // УТИЛИТЫ ФОРМАТИРОВАНИЯ
    // ============================================
    const formatAddress = useCallback((suggestion: DaDataSuggestion): FormattedAddress => {
        return DaDataService.formatAddress(suggestion);
    }, []);

    const getShortAddress = useCallback((suggestion: DaDataSuggestion): string => {
        return DaDataService.getShortAddress(suggestion);
    }, []);

    const isCompleteAddress = useCallback((suggestion: DaDataSuggestion): boolean => {
        return DaDataService.isCompleteAddress(suggestion);
    }, []);

    const getCoordinates = useCallback((suggestion: DaDataSuggestion) => {
        return DaDataService.getCoordinates(suggestion);
    }, []);

    // ============================================
    // ХЕЛПЕРЫ ДЛЯ ЧАСТЕЙ АДРЕСА
    // ============================================
    const getCity = useCallback((suggestion: DaDataSuggestion): string => {
        return AddressHelpers.getCityFromAddress(suggestion);
    }, []);

    const getStreet = useCallback((suggestion: DaDataSuggestion): string => {
        return AddressHelpers.getStreetFromAddress(suggestion);
    }, []);

    const getHouse = useCallback((suggestion: DaDataSuggestion): string => {
        return AddressHelpers.getHouseFromAddress(suggestion);
    }, []);

    const getFlat = useCallback((suggestion: DaDataSuggestion): string => {
        return AddressHelpers.getFlatFromAddress(suggestion);
    }, []);

    return {
        // Состояние
        suggestions,
        loading,
        error,
        
        // Методы
        searchAddresses,
        clearSuggestions,
        clearError,
        cancelSearch,
        
        // Утилиты
        formatAddress,
        getShortAddress,
        isCompleteAddress,
        getCoordinates,
        
        // Хелперы
        getCity,
        getStreet,
        getHouse,
        getFlat
    };
};

// ============================================
// СПЕЦИАЛИЗИРОВАННЫЕ ХУКИ
// ============================================

// Хук для поиска только городов
export const useDaDataCities = (options: UseDaDataOptions = {}) => {
    const dadataHook = useDaData(options);
    
    const searchCities = useCallback(async (query: string) => {
        await dadataHook.searchAddresses(query);
    }, [dadataHook]);

    // Фильтруем только города из результатов
    const cities = dadataHook.suggestions.filter(suggestion => 
        suggestion.data.city && !suggestion.data.street
    );

    return {
        ...dadataHook,
        suggestions: cities,
        searchCities
    };
};

// Хук для поиска полных адресов (с домами)
export const useDaDataFullAddresses = (options: UseDaDataOptions = {}) => {
    const dadataHook = useDaData(options);
    
    const searchFullAddresses = useCallback(async (query: string) => {
        await dadataHook.searchAddresses(query);
    }, [dadataHook]);

    // Фильтруем только полные адреса
    const fullAddresses = dadataHook.suggestions.filter(suggestion => 
        dadataHook.isCompleteAddress(suggestion)
    );

    return {
        ...dadataHook,
        suggestions: fullAddresses,
        searchFullAddresses
    };
};

// Хук для поиска адресов с координатами
export const useDaDataWithCoordinates = (options: UseDaDataOptions = {}) => {
    const dadataHook = useDaData(options);
    
    const searchWithCoordinates = useCallback(async (query: string) => {
        await dadataHook.searchAddresses(query);
    }, [dadataHook]);

    // Фильтруем только адреса с координатами
    const addressesWithCoords = dadataHook.suggestions.filter(suggestion => 
        dadataHook.getCoordinates(suggestion) !== null
    );

    return {
        ...dadataHook,
        suggestions: addressesWithCoords,
        searchWithCoordinates
    };
};

export default useDaData;