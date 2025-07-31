// src/components/dadata/IncrementalAddressForm.tsx

import React, { useState, useRef, useCallback } from 'react';
import { useIncrementalAddress } from './useAddress';
import { DaDataSuggestion } from './dadata';
import { AddressLevel, IncrementalSearchOptions } from './AddressTypes';
import './AddressForm.css'

// ============================================
// ИНТЕРФЕЙСЫ КОМПОНЕНТА
// ============================================
export interface IncrementalAddressFormProps {
    onAddressComplete?: (fullAddress: string, addressChain: any) => void;
    onAddressChange?: (addressChain: any) => void;
    options?: IncrementalSearchOptions;
    disabled?: boolean;
    className?: string;
    showFullAddress?: boolean;
    showProgress?: boolean;
}

interface LevelSelectProps {
    level: AddressLevel;
    suggestions: DaDataSuggestion[];
    loading: boolean;
    error: string | null;
    query: string;
    disabled: boolean;
    placeholder: string;
    label: string;
    onSearch: (query: string) => void;
    onSelect: (suggestion: DaDataSuggestion) => void;
    onClear: () => void;
    selectedValue?: DaDataSuggestion;
}

// ============================================
// КОМПОНЕНТ СЕЛЕКТОРА УРОВНЯ
// ============================================
const LevelSelect: React.FC<LevelSelectProps> = ({
    level,
    suggestions,
    loading,
    error,
    query,
    disabled,
    placeholder,
    label,
    onSearch,
    onSelect,
    onClear,
    selectedValue
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState(selectedValue?.value || '');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        onSearch(value);
        setShowSuggestions(true);
    }, [onSearch]);

    const handleSuggestionClick = useCallback((suggestion: DaDataSuggestion) => {
        setInputValue(suggestion.value);
        onSelect(suggestion);
        setShowSuggestions(false);
    }, [onSelect]);

    const handleInputFocus = useCallback(() => {
        if (!disabled && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    }, [disabled, suggestions.length]);

    const handleInputBlur = useCallback(() => {
        // Задержка чтобы клик по предложению успел сработать
        setTimeout(() => setShowSuggestions(false), 200);
    }, []);

    const handleClear = useCallback(() => {
        setInputValue('');
        onClear();
        setShowSuggestions(false);
        inputRef.current?.focus();
    }, [onClear]);

    return (
        <div className="level-select">
            <label className="level-label">
                {label}
                {selectedValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="clear-button"
                        title="Очистить"
                    >
                        ✕
                    </button>
                )}
            </label>
            
            <div className="input-container">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={disabled ? 'Сначала выберите предыдущий уровень' : placeholder}
                    disabled={disabled}
                    className={`level-input ${disabled ? 'disabled' : ''} ${error ? 'error' : ''}`}
                />
                
                {loading && (
                    <div className="loading-indicator">
                        <span className="spinner">⏳</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {showSuggestions && suggestions.length > 0 && !disabled && (
                <div className="suggestions-dropdown">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.data.fias_id || index}`}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <div className="suggestion-value">
                                {suggestion.value}
                            </div>
                            {suggestion.data.postal_code && (
                                <div className="suggestion-postal">
                                    {suggestion.data.postal_code}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ ФОРМЫ
// ============================================
export const IncrementalAddressForm: React.FC<IncrementalAddressFormProps> = ({
    onAddressComplete,
    onAddressChange,
    options,
    disabled = false,
    className = '',
    showFullAddress = true,
    showProgress = true
}) => {
    const {
        addressChain,
        levels,
        searchLevel,
        selectAddress,
        resetFromLevel,
        clearAll,
        isLevelDisabled,
        getFullAddress,
        isChainComplete,
        getLevelConfig
    } = useIncrementalAddress(options);

    // ============================================
    // УРОВНИ АДРЕСА
    // ============================================
    const addressLevels: AddressLevel[] = ['region', 'city', 'street', 'house'];

    // ============================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ============================================
    const handleLevelSearch = useCallback((level: AddressLevel, query: string) => {
        searchLevel(level, query);
    }, [searchLevel]);

    const handleLevelSelect = useCallback((level: AddressLevel, suggestion: DaDataSuggestion) => {
        selectAddress(level, suggestion);
        
        // Вызываем колбэк изменения адреса
        const newChain = { ...addressChain, [level]: suggestion };
        onAddressChange?.(newChain);
        
        // Если адрес завершен, вызываем колбэк завершения
        if (level === 'house') {
            const fullAddress = getFullAddress();
            onAddressComplete?.(fullAddress, newChain);
        }
    }, [selectAddress, addressChain, onAddressChange, onAddressComplete, getFullAddress]);

    const handleLevelClear = useCallback((level: AddressLevel) => {
        resetFromLevel(level);
        onAddressChange?.(addressChain);
    }, [resetFromLevel, addressChain, onAddressChange]);

    const handleClearAll = useCallback(() => {
        clearAll();
        onAddressChange?.({
            region: null,
            city: null,
            street: null,
            house: null
        });
    }, [clearAll, onAddressChange]);

    // ============================================
    // ВЫЧИСЛЕНИЕ ПРОГРЕССА
    // ============================================
    const getProgress = useCallback((): { completed: number; total: number; percentage: number } => {
        const completed = addressLevels.filter(level => addressChain[level]).length;
        const total = addressLevels.length;
        const percentage = Math.round((completed / total) * 100);
        
        return { completed, total, percentage };
    }, [addressChain, addressLevels]);

    const progress = getProgress();

    return (
        <div className={`incremental-address-form ${className}`}>
            {/* Заголовок и прогресс */}
            <div className="form-header">
                <h3 className="form-title">Выберите адрес</h3>
                
                {showProgress && (
                    <div className="progress-section">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                        <span className="progress-text">
                            {progress.completed} из {progress.total} уровней
                        </span>
                    </div>
                )}
                
                {(progress.completed > 0) && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="clear-all-button"
                        disabled={disabled}
                    >
                        Очистить всё
                    </button>
                )}
            </div>

            {/* Селекторы уровней */}
            <div className="levels-container">
                {addressLevels.map(level => {
                    const levelState = levels[level];
                    const levelConfig = getLevelConfig(level);
                    const isDisabled = disabled || isLevelDisabled(level);
                    const selectedValue = addressChain[level];

                    return (
                        <LevelSelect
                            key={level}
                            level={level}
                            suggestions={levelState.suggestions}
                            loading={levelState.loading}
                            error={levelState.error}
                            query={levelState.query}
                            disabled={isDisabled}
                            placeholder={levelConfig.placeholder}
                            label={levelConfig.label}
                            onSearch={(query) => handleLevelSearch(level, query)}
                            onSelect={(suggestion) => handleLevelSelect(level, suggestion)}
                            onClear={() => handleLevelClear(level)}
                            selectedValue={selectedValue || undefined}
                        />
                    );
                })}
            </div>

            {/* Полный адрес */}
            {showFullAddress && progress.completed > 0 && (
                <div className="full-address-section">
                    <label className="full-address-label">Выбранный адрес:</label>
                    <div className={`full-address-value ${isChainComplete() ? 'complete' : 'incomplete'}`}>
                        {getFullAddress() || 'Адрес не выбран'}
                    </div>
                    {isChainComplete() && (
                        <div className="address-complete-indicator">
                            ✓ Адрес заполнен полностью
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IncrementalAddressForm;