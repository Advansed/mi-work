// src/components/dadata/useIncrementalAddress.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { DaDataService } from './dadataService';
import { DaDataSuggestion, DaDataApiError } from './dadata';
import { 
    AddressLevel, 
    AddressChain, 
    LevelState, 
    IncrementalSearchOptions,
    LevelConfig 
} from './AddressTypes';

// ============================================
// КОНФИГУРАЦИЯ УРОВНЕЙ АДРЕСА
// ============================================
const LEVEL_CONFIGS: Record<AddressLevel, LevelConfig> = {
    region: {
        fromBound: 'region',
        toBound: 'region',
        placeholder: 'Выберите регион...',
        label: 'Регион'
    },
    city: {
        fromBound: 'city',
        toBound: 'city',
        placeholder: 'Выберите город...',
        label: 'Город',
        parentLevel: 'region'
    },
    street: {
        fromBound: 'street',
        toBound: 'street',
        placeholder: 'Выберите улицу...',
        label: 'Улица',
        parentLevel: 'city'
    },
    house: {
        fromBound: 'house',
        toBound: 'house',
        placeholder: 'Выберите дом...',
        label: 'Дом',
        parentLevel: 'street'
    }
};

const LEVEL_ORDER: AddressLevel[] = ['region', 'city', 'street', 'house'];

// ============================================
// ИНТЕРФЕЙС ВОЗВРАТА ХУКА
// ============================================
export interface UseIncrementalAddressReturn {
    // Состояние
    addressChain: AddressChain;
    levels: Record<AddressLevel, LevelState>;
    
    // Методы поиска
    searchLevel: (level: AddressLevel, query: string) => Promise<void>;
    selectAddress: (level: AddressLevel, suggestion: DaDataSuggestion) => void;
    resetFromLevel: (level: AddressLevel) => void;
    clearAll: () => void;
    
    // Утилиты
    isLevelDisabled: (level: AddressLevel) => boolean;
    getFullAddress: () => string;
    isChainComplete: () => boolean;
    getLevelConfig: (level: AddressLevel) => LevelConfig;
    
    // Валидация
    validateChain: () => boolean;
}

// ============================================
// ОСНОВНОЙ ХУК
// ============================================
export const useIncrementalAddress = (
    options: IncrementalSearchOptions = {}
): UseIncrementalAddressReturn => {
    const {
        apiKey,
        debounceMs = 300,
        maxSuggestions = 10,
        minQueryLength = 2
    } = options;

    // ============================================
    // СОСТОЯНИЕ
    // ============================================
    const [addressChain, setAddressChain] = useState<AddressChain>({
        region: null,
        city: null,
        street: null,
        house: null
    });

    const [levels, setLevels] = useState<Record<AddressLevel, LevelState>>(() => {
        const initialLevels = {} as Record<AddressLevel, LevelState>;
        LEVEL_ORDER.forEach(level => {
            initialLevels[level] = {
                suggestions: [],
                loading: false,
                error: null,
                query: ''
            };
        });
        return initialLevels;
    });

    // ============================================
    // REFS
    // ============================================
    const serviceRef = useRef<DaDataService | null>(null);
    const debounceRefs = useRef<Record<string, NodeJS.Timeout>>({});
    const cacheRef = useRef<Map<string, DaDataSuggestion[]>>(new Map());

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ СЕРВИСА
    // ============================================
    useEffect(() => {
        try {
            const key = apiKey || '50bfb3453a528d091723900fdae5ca5a30369832';
            if (!key) {
                throw new Error('DaData API ключ не найден');
            }
            
            serviceRef.current = DaDataService.create(key);
        } catch (err) {
            console.error('Ошибка инициализации DaData:', err);
        }
    }, [apiKey]);

    // ============================================
    // ОЧИСТКА ТАЙМЕРОВ
    // ============================================
    useEffect(() => {
        return () => {
            Object.values(debounceRefs.current).forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
            if (serviceRef.current) {
                serviceRef.current.cancelRequest();
            }
        };
    }, []);

    // ============================================
    // ГЕНЕРАЦИЯ КЛЮЧА КЭША
    // ============================================
    const getCacheKey = useCallback((level: AddressLevel, query: string, parentFiasId?: string): string => {
        return `${level}:${query}:${parentFiasId || 'root'}`;
    }, []);

    // ============================================
    // ПОЛУЧЕНИЕ РОДИТЕЛЬСКОГО FIAS ID
    // ============================================
    const getParentFiasId = useCallback((level: AddressLevel): string | undefined => {
        const config = LEVEL_CONFIGS[level];
        if (!config.parentLevel) return undefined;
        
        const parentSuggestion = addressChain[config.parentLevel];
        return parentSuggestion?.data?.fias_id;
    }, [addressChain]);

    // ============================================
    // СБРОС ЗАВИСИМЫХ УРОВНЕЙ
    // ============================================
    const resetDependentLevels = useCallback((changedLevel: AddressLevel) => {
        const changedIndex = LEVEL_ORDER.indexOf(changedLevel);
        const levelsToReset = LEVEL_ORDER.slice(changedIndex + 1);
        
        // Сбрасываем выбранные адреса
        setAddressChain(prev => {
            const newChain = { ...prev };
            levelsToReset.forEach(level => {
                newChain[level] = null;
            });
            return newChain;
        });
        
        // Очищаем состояние уровней
        setLevels(prev => {
            const newLevels = { ...prev };
            levelsToReset.forEach(level => {
                newLevels[level] = {
                    suggestions: [],
                    loading: false,
                    error: null,
                    query: ''
                };
            });
            return newLevels;
        });
        
        // Очищаем кэш для зависимых уровней
        const cacheToRemove: string[] = [];
        cacheRef.current.forEach((_, key) => {
            levelsToReset.forEach(level => {
                if (key.startsWith(`${level}:`)) {
                    cacheToRemove.push(key);
                }
            });
        });
        cacheToRemove.forEach(key => cacheRef.current.delete(key));
    }, []);

    // ============================================
    // ПОИСК ПО УРОВНЮ
    // ============================================
    const searchLevel = useCallback(async (level: AddressLevel, query: string) => {
        if (!serviceRef.current) {
            console.error('DaData сервис не инициализирован');
            return;
        }

        if (!query || query.length < minQueryLength) {
            setLevels(prev => ({
                ...prev,
                [level]: { ...prev[level], suggestions: [], query }
            }));
            return;
        }

        // Очищаем предыдущий таймер
        if (debounceRefs.current[level]) {
            clearTimeout(debounceRefs.current[level]);
        }

        // Проверяем кэш
        const parentFiasId = getParentFiasId(level);
        const cacheKey = getCacheKey(level, query, parentFiasId);
        const cachedResults = cacheRef.current.get(cacheKey);
        
        if (cachedResults) {
            setLevels(prev => ({
                ...prev,
                [level]: {
                    ...prev[level],
                    suggestions: cachedResults,
                    query,
                    loading: false,
                    error: null
                }
            }));
            return;
        }

        // Устанавливаем дебаунс
        debounceRefs.current[level] = setTimeout(async () => {
            setLevels(prev => ({
                ...prev,
                [level]: { ...prev[level], loading: true, error: null, query }
            }));

            try {
                const results = await serviceRef.current!.searchByLevel(level, query, parentFiasId);
                
                // Сохраняем в кэш
                cacheRef.current.set(cacheKey, results);
                
                setLevels(prev => ({
                    ...prev,
                    [level]: {
                        ...prev[level],
                        suggestions: results,
                        loading: false,
                        error: null
                    }
                }));
            } catch (err) {
                const errorMessage = err instanceof DaDataApiError 
                    ? `Ошибка DaData API: ${err.message}`
                    : 'Ошибка при поиске адреса';
                    
                setLevels(prev => ({
                    ...prev,
                    [level]: {
                        ...prev[level],
                        loading: false,
                        error: errorMessage,
                        suggestions: []
                    }
                }));
            }
        }, debounceMs);
    }, [minQueryLength, debounceMs, getParentFiasId, getCacheKey]);

    // ============================================
    // ВЫБОР АДРЕСА
    // ============================================
    const selectAddress = useCallback((level: AddressLevel, suggestion: DaDataSuggestion) => {
        setAddressChain(prev => ({
            ...prev,
            [level]: suggestion
        }));
        
        // Сбрасываем зависимые уровни
        resetDependentLevels(level);
        
        // Очищаем предложения текущего уровня
        setLevels(prev => ({
            ...prev,
            [level]: {
                ...prev[level],
                suggestions: [],
                query: suggestion.value
            }
        }));
    }, [resetDependentLevels]);

    // ============================================
    // СБРОС ОТ УРОВНЯ
    // ============================================
    const resetFromLevel = useCallback((level: AddressLevel) => {
        const levelIndex = LEVEL_ORDER.indexOf(level);
        const levelsToReset = LEVEL_ORDER.slice(levelIndex);
        
        setAddressChain(prev => {
            const newChain = { ...prev };
            levelsToReset.forEach(l => {
                newChain[l] = null;
            });
            return newChain;
        });
        
        setLevels(prev => {
            const newLevels = { ...prev };
            levelsToReset.forEach(l => {
                newLevels[l] = {
                    suggestions: [],
                    loading: false,
                    error: null,
                    query: ''
                };
            });
            return newLevels;
        });
    }, []);

    // ============================================
    // ПОЛНАЯ ОЧИСТКА
    // ============================================
    const clearAll = useCallback(() => {
        setAddressChain({
            region: null,
            city: null,
            street: null,
            house: null
        });
        
        setLevels(prev => {
            const newLevels = { ...prev };
            LEVEL_ORDER.forEach(level => {
                newLevels[level] = {
                    suggestions: [],
                    loading: false,
                    error: null,
                    query: ''
                };
            });
            return newLevels;
        });
        
        cacheRef.current.clear();
    }, []);

    // ============================================
    // ПРОВЕРКА БЛОКИРОВКИ УРОВНЯ
    // ============================================
    const isLevelDisabled = useCallback((level: AddressLevel): boolean => {
        const config = LEVEL_CONFIGS[level];
        if (!config.parentLevel) return false;
        
        return !addressChain[config.parentLevel];
    }, [addressChain]);

    // ============================================
    // ПОЛУЧЕНИЕ ПОЛНОГО АДРЕСА
    // ============================================
    const getFullAddress = useCallback((): string => {
        const parts: string[] = [];
        
        LEVEL_ORDER.forEach(level => {
            const suggestion = addressChain[level];
            if (suggestion) {
                parts.push(suggestion.value);
            }
        });
        
        return parts.join(', ');
    }, [addressChain]);

    // ============================================
    // ПРОВЕРКА ЗАВЕРШЕННОСТИ ЦЕПОЧКИ
    // ============================================
    const isChainComplete = useCallback((): boolean => {
        return !!addressChain.house;
    }, [addressChain]);

    // ============================================
    // ПОЛУЧЕНИЕ КОНФИГУРАЦИИ УРОВНЯ
    // ============================================
    const getLevelConfig = useCallback((level: AddressLevel): LevelConfig => {
        return LEVEL_CONFIGS[level];
    }, []);

    // ============================================
    // ВАЛИДАЦИЯ ЦЕПОЧКИ
    // ============================================
    const validateChain = useCallback((): boolean => {
        // Проверяем, что для каждого выбранного уровня есть все предыдущие
        for (let i = 0; i < LEVEL_ORDER.length; i++) {
            const currentLevel = LEVEL_ORDER[i];
            const currentSelection = addressChain[currentLevel];
            
            if (currentSelection) {
                // Проверяем, что все предыдущие уровни заполнены
                for (let j = 0; j < i; j++) {
                    const prevLevel = LEVEL_ORDER[j];
                    if (!addressChain[prevLevel]) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }, [addressChain]);

    return {
        addressChain,
        levels,
        searchLevel,
        selectAddress,
        resetFromLevel,
        clearAll,
        isLevelDisabled,
        getFullAddress,
        isChainComplete,
        getLevelConfig,
        validateChain
    };
};

export default useIncrementalAddress;