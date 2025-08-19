// src/components/Lics/AddressForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText
} from '@ionic/react';
import { locationOutline, ellipsisHorizontal, saveOutline } from 'ionicons/icons';
import './FindAddress.css';
import { ConfidenceLevel, StandardizedAddress, useDaData } from '../../../dadata-component';
import { useToast } from '../../../Toast/useToast';

interface LicsProps {
    initialAddress?: string;
    invoiceId?: string;
    onAddressChange?: (address: string, isStandardized: boolean) => void;
    onAddressSaved?: (address: string) => Promise<void>;
    onAddressClosed?: () => void;
    disabled?: boolean;
}

export function AddressForm({ 
    initialAddress = '', 
    invoiceId,
    onAddressChange, 
    onAddressSaved,
    onAddressClosed,
    disabled = false 
}: LicsProps) {
    const [address, setAddress] = useState<string>(initialAddress);
    const [standardizedAddress, setStandardizedAddress] = useState<string>('');
    const [isStandardized, setIsStandardized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<StandardizedAddress[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [isStandardizing, setIsStandardizing] = useState<boolean>(false);
    
    const inputRef = useRef<HTMLIonInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { standardizeAddress } = useDaData({
        apiKey: '50bfb3453a528d091723900fdae5ca5a30369832',
        timeout: 5000
    });

    const { showSuccess, showError, showWarning } = useToast();

    // Синхронизируем с внешним адресом
    useEffect(() => {
        if (initialAddress !== address) {
            setAddress(initialAddress);
            setIsStandardized(false);
            setStandardizedAddress('');
        }
    }, [initialAddress]);

    // Обработка клика вне выпадающего списка
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSuggestions]);

    // Очистка таймеров при размонтировании
    useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const handleAddressChange = (value: string) => {
        setAddress(value);
        if (isStandardized) {
            setIsStandardized(false);
            setStandardizedAddress('');
        }
        setSuggestions([]);
        setShowSuggestions(false);
        onAddressChange?.(value, false);

        // Очищаем предыдущий таймер debounce
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Запускаем новый таймер для автоматической стандартизации
        if (value.trim().length > 3) {
            debounceTimeoutRef.current = setTimeout(() => {
                handleAutoStandardize(value);
            }, 800);
        }
    };

    const handleAutoStandardize = async (addressValue: string) => {
        if (!addressValue.trim() || isStandardizing || addressValue === standardizedAddress) {
            return;
        }

        setIsStandardizing(true);
        setLoading(true);
        
        try {
            const result = await standardizeAddress(addressValue);

            if (result.success && result.data) {
                const { city, street, house, apartment } = result.data;
                const fullAddress = `${city}, ${street}, д. ${house}${apartment ? `, кв. ${apartment}` : ''}`;
                
                setStandardizedAddress(fullAddress);
                setAddress(fullAddress);
                setIsStandardized(true);
                
                // Устанавливаем предложения
                setSuggestions(result.suggestions || []);
                
                // Показываем выпадающий список если есть альтернативы
                if (result.suggestions && result.suggestions.length > 1) {
                    setShowSuggestions(true);
                }
                
                onAddressChange?.(fullAddress, true);

                // Определяем качество стандартизации
                if (result.data.confidence_level >= ConfidenceLevel.GOOD_MATCH) {
                    showSuccess('Адрес успешно стандартизирован');
                } else if (result.data.confidence_level >= ConfidenceLevel.PARTIAL_MATCH) {
                    showWarning('Адрес стандартизирован с низкой точностью');
                } else {
                    showWarning('Не удалось точно определить адрес');
                }
            } else {
                // Если стандартизация не удалась, но есть предложения
                if (result.suggestions && result.suggestions.length > 0) {
                    setSuggestions(result.suggestions);
                    setShowSuggestions(true);
                    showWarning(`Найдено ${result.suggestions.length} вариантов. Выберите подходящий.`);
                }
            }
        } catch (error) {
            // Тихо обрабатываем ошибки автоматической стандартизации
            console.error('Автоматическая стандартизация не удалась:', error);
        } finally {
            setLoading(false);
            setIsStandardizing(false);
        }
    };

    const handleStandardize = async () => {
        if (!address.trim()) {
            return;
        }

        // Если адрес уже стандартизирован, не стандартизируем повторно
        if (isStandardized && standardizedAddress === address) {
            return;
        }

        setLoading(true);
        try {
            const result = await standardizeAddress(address);

            if (result.success && result.data) {
                const { city, street, house, apartment } = result.data;
                const fullAddress = `${city}, ${street}, д. ${house}${apartment ? `, кв. ${apartment}` : ''}`;
                
                setStandardizedAddress(fullAddress);
                setAddress(fullAddress);
                setIsStandardized(true);
                
                // Устанавливаем предложения
                setSuggestions(result.suggestions || []);
                
                // Показываем выпадающий список если есть альтернативы
                if (result.suggestions && result.suggestions.length > 1) {
                    setShowSuggestions(true);
                }
                
                // Определяем качество стандартизации
                if (result.data.confidence_level >= ConfidenceLevel.GOOD_MATCH) {
                    showSuccess('Адрес успешно стандартизирован');
                } else if (result.data.confidence_level >= ConfidenceLevel.PARTIAL_MATCH) {
                    showWarning('Адрес стандартизирован с низкой точностью');
                } else {
                    showWarning('Не удалось точно определить адрес');
                }
                
                onAddressChange?.(fullAddress, true);
            } else {
                // Если стандартизация не удалась, но есть предложения
                if (result.suggestions && result.suggestions.length > 0) {
                    setSuggestions(result.suggestions);
                    setShowSuggestions(true);
                    showWarning(`Найдено ${result.suggestions.length} вариантов. Выберите подходящий.`);
                } else {
                    showError(result.message || 'Адрес не найден');
                }
            }
        } catch (error) {
            showError('Ошибка при стандартизации адреса');
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionSelect = (suggestion: StandardizedAddress) => {
        const { city, street, house, apartment } = suggestion;
        const fullAddress = `${city}, ${street}, д. ${house}${apartment ? `, кв. ${apartment}` : ''}`;
        
        setAddress(fullAddress);
        setStandardizedAddress(fullAddress);
        setIsStandardized(true);
        setShowSuggestions(false);
        
        onAddressChange?.(fullAddress, true);
        showSuccess('Адрес выбран из предложений');
    };

    const handleSave = async () => {
        if (!onAddressSaved) return;
        
        const addressToSave = isStandardized ? standardizedAddress : address;
        if (!addressToSave.trim()) {
            showWarning('Введите адрес для сохранения');
            return;
        }

        setSaving(true);
        try {
            await onAddressSaved(addressToSave);
            showSuccess('Адрес успешно сохранен');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            showError('Не удалось сохранить адрес');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="address-form">
            <IonCard className="address-form-card">
                <IonCardHeader className="address-form-header">
                    <IonCardTitle className="address-form-title">
                        <IonIcon icon={locationOutline} />
                        Ввод и стандартизация адреса
                    </IonCardTitle>
                    <IonText className="description-text">
                        Введите адрес. Стандартизация выполняется автоматически через 0.8 сек после окончания ввода.
                    </IonText>
                </IonCardHeader>

                <IonCardContent className="address-form-content">
                    {/* Поле ввода адреса с выпадающим списком */}
                    <div className="address-input-container" ref={dropdownRef}>
                        <IonItem className="address-form-item" lines="none">
                            <IonInput
                                ref={inputRef}
                                className="address-form-input"
                                value={address}
                                placeholder="Введите адрес (город, улица, дом, квартира)"
                                onIonInput={(e) => handleAddressChange(e.detail.value!)}
                                disabled={disabled}
                                clearInput={true}
                            />
                            {loading && (
                                <IonSpinner name="crescent" slot="end" className="address-form-spinner" />
                            )}
                        </IonItem>

                        {/* Выпадающий список предложений */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="suggestions-dropdown">
                                {suggestions.map((suggestion, index) => {
                                    const { city, street, house, apartment } = suggestion;
                                    const fullAddress = `${city}, ${street}, д. ${house}${apartment ? `, кв. ${apartment}` : ''}`;
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="suggestion-item"
                                            onClick={() => handleSuggestionSelect(suggestion)}
                                        >
                                            <div className="suggestion-text">{fullAddress}</div>
                                            <div className="suggestion-confidence">
                                                Точность: {suggestion.confidence_level || 0}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Отображение стандартизированного адреса */}
                    {isStandardized && standardizedAddress && (
                        <div className="standardized-address">
                            <div className="standardized-label">
                                <IonIcon icon={locationOutline} size="small" />
                                Стандартизированный адрес
                            </div>
                            <div className="standardized-text">{standardizedAddress}</div>
                        </div>
                    )}

                    {/* Кнопки управления */}
                    <div className="address-buttons">
                        <IonButton
                            expand="block"
                            onClick={handleStandardize}
                            disabled={loading || disabled || !address.trim()}
                        >
                            {loading ? (
                                <>
                                    <IonSpinner name="crescent" className="address-form-spinner" />
                                    Стандартизация...
                                </>
                            ) : (
                                <>
                                    <IonIcon icon={ellipsisHorizontal} slot="start" />
                                    Стандартизировать вручную
                                </>
                            )}
                        </IonButton>

                        {onAddressSaved && (
                            <IonButton
                                expand="block"
                                fill="outline"
                                onClick={handleSave}
                                disabled={saving || disabled || !address.trim()}
                            >
                                {saving ? (
                                    <>
                                        <IonSpinner name="crescent" className="address-form-spinner" />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <IonIcon icon={saveOutline} slot="start" />
                                        Сохранить адрес
                                    </>
                                )}
                            </IonButton>
                        )}
                            <IonButton
                                expand="block"
                                fill="outline"
                                onClick={ onAddressClosed }
                                disabled={saving || disabled || !address.trim()}
                            >
                                {saving ? (
                                    <>
                                        <IonSpinner name="crescent" className="address-form-spinner" />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <IonIcon icon={saveOutline} slot="start" />
                                        Закрыть
                                    </>
                                )}
                            </IonButton>
                    </div>
                </IonCardContent>
            </IonCard>
        </div>
    );
}