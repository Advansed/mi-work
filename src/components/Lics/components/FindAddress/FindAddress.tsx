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
    IonText,
    IonList,
    IonPopover
} from '@ionic/react';
import { locationOutline, ellipsisHorizontal, chevronDownOutline, saveOutline } from 'ionicons/icons';
import { useDaData } from '../../dadata-component/useDaData';
import { ConfidenceLevel, StandardizedAddress } from '../../dadata-component/types';
import { useToast } from '../../Toast/useToast';
import './FindAddress.css';

interface LicsProps {
    initialAddress?: string;
    invoiceId?: string;
    onAddressChange?: (address: string, isStandardized: boolean) => void;
    onAddressSaved?: (address: string) => Promise<void>;
    disabled?: boolean;
}

export function AddressForm({ 
    initialAddress = '', 
    invoiceId,
    onAddressChange, 
    onAddressSaved,
    disabled = false 
}: LicsProps) {
    const [address, setAddress] = useState<string>(initialAddress);
    const [standardizedAddress, setStandardizedAddress] = useState<string>('');
    const [isStandardized, setIsStandardized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<StandardizedAddress[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    
    const suggestionsRef = useRef<HTMLIonPopoverElement>(null);
    const inputRef = useRef<HTMLIonInputElement>(null);

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

    const handleAddressChange = (value: string) => {
        setAddress(value);
        if (isStandardized) {
            setIsStandardized(false);
            setStandardizedAddress('');
        }
        setSuggestions([]);
        setShowSuggestions(false);
        onAddressChange?.(value, false);
    };

    const handleStandardize = async () => {
        if (!address.trim()) {
            showWarning('Введите адрес для стандартизации');
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
                        Введите адрес и выполните стандартизацию для получения точного адреса
                    </IonText>
                </IonCardHeader>

                <IonCardContent className="address-form-content">
                    {/* Поле ввода адреса */}
                    <IonItem className="address-form-item" lines="none">
                        <IonInput
                            ref={inputRef}
                            className="address-form-input"
                            value={address}
                            placeholder="Введите адрес (город, улица, дом, квартира)"
                            onIonInput={(e) => handleAddressChange(e.detail.value!)}
                            disabled={disabled || loading || saving}
                            id="address-input"
                        />
                        <IonIcon icon={locationOutline} slot="end" />
                    </IonItem>

                    {/* Стандартизированный адрес */}
                    {isStandardized && standardizedAddress && (
                        <div className="standardized-address fade-in">
                            <div className="standardized-label">
                                Стандартизированный адрес
                            </div>
                            <IonInput
                                ref={inputRef}
                                className="address-form-input"
                                value={ standardizedAddress }
                                placeholder="Введите адрес (город, улица, дом, квартира)"
                                onIonInput={(e) => {
                                    const value = e.detail.value as string
                                    setStandardizedAddress( value )
                                }}
                                disabled={disabled || loading || saving}
                                id="address-input"
                            />
                            {/* <div className="standardized-text">
                                {standardizedAddress}
                            </div> */}
                        </div>
                    )}

                    {/* Кнопки действий */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                        <IonButton
                            className="address-form-button"
                            onClick={handleStandardize}
                            disabled={disabled || loading || saving || !address.trim()}
                            expand="block"
                            fill="solid"
                        >
                            {loading ? (
                                <>
                                    <IonSpinner name="crescent" className="address-form-spinner" />
                                    Стандартизация...
                                </>
                            ) : (
                                <>
                                    <IonIcon icon={ellipsisHorizontal} slot="start" />
                                    Стандартизировать
                                </>
                            )}
                        </IonButton>

                        {onAddressSaved && (
                            <IonButton
                                // className="address-form-button-outline"
                                onClick={handleSave}
                                disabled={disabled || loading || saving || !address.trim()}
                                expand="block"
                                fill="outline"
                            >
                                {saving ? (
                                    <>
                                        <IonSpinner name="crescent" className="address-form-spinner" />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <IonIcon icon={saveOutline} slot="start" />
                                        Сохранить
                                    </>
                                )}
                            </IonButton>
                        )}
                    </div>

                    {/* Индикатор загрузки */}
                    {loading && (
                        <div className="loading-container fade-in">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">
                                Выполняется стандартизация адреса...
                            </div>
                        </div>
                    )}
                </IonCardContent>
            </IonCard>

            {/* Попover с предложениями */}
            <IonPopover
                ref={suggestionsRef}
                isOpen={showSuggestions}
                onDidDismiss={() => setShowSuggestions(false)}
                trigger="address-input"
                // placement="bottom"
                className="address-form-popover"
            >
                <IonList className="address-form-list">
                    {suggestions.map((suggestion, index) => (
                        <IonItem
                            key={index}
                            button
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="suggestion-item interactive"
                        >
                            <IonText>
                                {`${suggestion.city}, ${suggestion.street}, д. ${suggestion.house}${suggestion.apartment ? `, кв. ${suggestion.apartment}` : ''}`}
                            </IonText>
                        </IonItem>
                    ))}
                </IonList>
            </IonPopover>
        </div>
    );
}