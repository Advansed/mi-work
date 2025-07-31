// src/components/Lics/Lics.tsx
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
import { useDaData } from '../dadata-component/useDaData';
import { ConfidenceLevel, StandardizedAddress } from '../dadata-component/types';
import { useToast } from '../Toast/useToast';

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
        
        if (suggestion.confidence_level >= ConfidenceLevel.GOOD_MATCH) {
            showSuccess('Адрес выбран');
        }
    };

    const handleSaveAddress = async () => {
        if (!onAddressSaved || !isStandardized || !standardizedAddress) {
            return;
        }

        setSaving(true);
        try {
            await onAddressSaved(standardizedAddress);
            showSuccess('Адрес сохранен в заявку');
        } catch (error) {
            showError('Ошибка при сохранении адреса');
        } finally {
            setSaving(false);
        }
    };

    const formatSuggestionText = (suggestion: StandardizedAddress) => {
        const { city, street, house, apartment } = suggestion;
        return `${city}, ${street}, д. ${house}${apartment ? `, кв. ${apartment}` : ''}`;
    };

    const getConfidenceText = (level: number) => {
        if (level >= ConfidenceLevel.EXACT_MATCH) return 'точное совпадение';
        if (level >= ConfidenceLevel.GOOD_MATCH) return 'хорошее совпадение';
        if (level >= ConfidenceLevel.PARTIAL_MATCH) return 'частичное совпадение';
        return 'низкая точность';
    };

    const getConfidenceColor = (level: number) => {
        if (level >= ConfidenceLevel.EXACT_MATCH) return 'success';
        if (level >= ConfidenceLevel.GOOD_MATCH) return 'primary';
        if (level >= ConfidenceLevel.PARTIAL_MATCH) return 'warning';
        return 'danger';
    };

    const isControlsDisabled = disabled || loading || saving;

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>
                    <IonIcon icon={locationOutline} /> Адрес абонента
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <IonItem>
                    <IonInput
                        ref={inputRef}
                        value={address}
                        placeholder="Введите адрес"
                        onIonInput={(e) => handleAddressChange(e.detail.value!)}
                        readonly={isControlsDisabled}
                    />
                    {suggestions.length > 0 && (
                        <IonButton
                            fill="clear"
                            slot="end"
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            disabled={isControlsDisabled}
                        >
                            <IonIcon icon={chevronDownOutline} />
                        </IonButton>
                    )}
                </IonItem>

                {isStandardized && (
                    <IonItem>
                        <IonText color="success">
                            <small>✓ Адрес стандартизирован</small>
                        </IonText>
                    </IonItem>
                )}

                <IonItem>
                    <IonButton
                        expand="block"
                        onClick={handleStandardize}
                        disabled={isControlsDisabled || !address.trim()}
                        color="primary"
                    >
                        {loading ? (
                            <>
                                <IonSpinner name="crescent" />
                                <span style={{ marginLeft: '8px' }}>Стандартизация...</span>
                            </>
                        ) : (
                            'Стандартизировать адрес'
                        )}
                    </IonButton>
                </IonItem>

                {/* Кнопка сохранения в заявку */}
                {invoiceId && onAddressSaved && isStandardized && (
                    <IonItem>
                        <IonButton
                            expand="block"
                            onClick={handleSaveAddress}
                            disabled={isControlsDisabled || !standardizedAddress}
                            color="success"
                        >
                            {saving ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span style={{ marginLeft: '8px' }}>Сохранение...</span>
                                </>
                            ) : (
                                <>
                                    <IonIcon icon={saveOutline} slot="start" />
                                    Сохранить в заявку
                                </>
                            )}
                        </IonButton>
                    </IonItem>
                )}

                {/* Выпадающий список предложений */}
                <IonPopover
                    ref={suggestionsRef}
                    isOpen={showSuggestions}
                    onDidDismiss={() => setShowSuggestions(false)}
                    trigger={undefined}
                    showBackdrop={true}
                    dismissOnSelect={true}
                >
                    <IonList>
                        {suggestions.map((suggestion, index) => (
                            <IonItem
                                key={index}
                                button
                                onClick={() => handleSuggestionSelect(suggestion)}
                                disabled={isControlsDisabled}
                            >
                                <div style={{ width: '100%' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                        {formatSuggestionText(suggestion)}
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.8em', 
                                        color: `var(--ion-color-${getConfidenceColor(suggestion.confidence_level)})` 
                                    }}>
                                        {getConfidenceText(suggestion.confidence_level)}
                                    </div>
                                </div>
                            </IonItem>
                        ))}
                    </IonList>
                </IonPopover>
            </IonCardContent>
        </IonCard>
    );
}