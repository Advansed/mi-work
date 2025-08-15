// src/components/Lics/components/FindAddress/FindAddress.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonItem,
    IonInput,
    IonIcon,
    IonSpinner,
    IonText,
    IonLoading
} from '@ionic/react';
import { 
    close,
    locationOutline, 
    saveOutline, 
    checkmarkCircleOutline,
    warningOutline,
    searchOutline
} from 'ionicons/icons';
import styles from './FindAddress.module.css';
import { ConfidenceLevel, StandardizedAddress, useDaData } from '../../../dadata-component';
import { useToast } from '../../../Toast/useToast';

interface FindAddressProps {
    initialAddress?: string;
    invoiceId?: string;
    onAddressChange?: (address: string, isStandardized: boolean) => void;
    onAddressSaved?: (address: string) => Promise<void>;
    onClose?: () => void;
    isOpen: boolean;
    disabled?: boolean;
}

export function FindAddress({ 
    initialAddress = '', 
    invoiceId,
    onAddressChange, 
    onAddressSaved,
    onClose,
    isOpen,
    disabled = false 
}: FindAddressProps) {
    const [address, setAddress] = useState<string>(initialAddress);
    const [standardizedAddress, setStandardizedAddress] = useState<string>('');
    const [isStandardized, setIsStandardized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<StandardizedAddress[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    
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
        setSuggestions([]);
        
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

    const handleClose = () => {
        // Сброс состояния при закрытии
        setAddress(initialAddress);
        setStandardizedAddress('');
        setIsStandardized(false);
        setSuggestions([]);
        setShowSuggestions(false);
        onClose?.();
    };

    return (
        <>
            <IonModal 
                isOpen={isOpen} 
                onDidDismiss={handleClose}
                className={styles.addressFormModal}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Поиск и стандартизация адреса</IonTitle>
                        <IonButtons slot="end">
                            <IonButton 
                                className={styles.closeButton}
                                onClick={handleClose}
                            >
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent>
                    {/* Контейнер ввода адреса */}
                    <div className={styles.addressLevelContainer}>
                        <label className={styles.addressLevelLabel}>
                            Ввод адреса
                        </label>
                        <IonItem className={styles.addressInput} lines="none">
                            <IonInput
                                ref={inputRef}
                                value={address}
                                placeholder="Введите адрес (город, улица, дом, квартира)"
                                onIonInput={(e) => handleAddressChange(e.detail.value!)}
                                disabled={disabled || loading || saving}
                            />
                            <IonIcon icon={locationOutline} slot="end" />
                        </IonItem>
                    </div>

                    {/* Контейнер стандартизации */}
                    <div className={styles.addressLevelContainer}>
                        <label className={styles.addressLevelLabel}>
                            Стандартизация адреса
                        </label>
                        <IonButton
                            className={styles.addressButton}
                            onClick={handleStandardize}
                            disabled={disabled || loading || saving || !address.trim()}
                            expand="block"
                        >
                            {loading ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span style={{ marginLeft: '8px' }}>Стандартизация...</span>
                                </>
                            ) : (
                                <>
                                    <IonIcon icon={searchOutline} slot="start" />
                                    Стандартизировать адрес
                                </>
                            )}
                        </IonButton>
                    </div>

                    {/* Контейнер результата стандартизации */}
                    {isStandardized && standardizedAddress && (
                        <div className={`${styles.addressLevelContainer} ${styles.success}`}>
                            <label className={styles.addressLevelLabel}>
                                Стандартизированный адрес
                            </label>
                            <div className={styles.standardizedContainer}>
                                <div className={styles.standardizedLabel}>
                                    <IonIcon icon={checkmarkCircleOutline} />
                                    Адрес успешно стандартизирован
                                </div>
                                <IonText>
                                    <strong>{standardizedAddress}</strong>
                                </IonText>
                            </div>
                        </div>
                    )}

                    {/* Контейнер предложений */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className={`${styles.addressLevelContainer} ${styles.warning}`}>
                            <label className={styles.addressLevelLabel}>
                                Варианты адресов ({suggestions.length})
                            </label>
                            <IonText color="warning" style={{ marginBottom: '12px', display: 'block' }}>
                                <IonIcon icon={warningOutline} style={{ marginRight: '6px' }} />
                                Выберите подходящий вариант из списка:
                            </IonText>
                            <div className={styles.suggestionsList}>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className={styles.suggestionItem}
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                    >
                                        <div className={styles.suggestionTitle}>
                                            {suggestion.city}, {suggestion.street}
                                        </div>
                                        <div className={styles.suggestionAddress}>
                                            д. {suggestion.house}{suggestion.apartment ? `, кв. ${suggestion.apartment}` : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Контейнер действий */}
                    {onAddressSaved && (
                        <div className={styles.addressLevelContainer}>
                            <label className={styles.addressLevelLabel}>
                                Сохранение адреса
                            </label>
                            <div className={styles.actionsContainer}>
                                <IonButton
                                    className={styles.addressButtonOutline}
                                    onClick={handleSave}
                                    disabled={disabled || loading || saving || !address.trim()}
                                    expand="block"
                                >
                                    {saving ? (
                                        <>
                                            <IonSpinner name="crescent" />
                                            <span style={{ marginLeft: '8px' }}>Сохранение...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IonIcon icon={saveOutline} slot="start" />
                                            Сохранить адрес
                                        </>
                                    )}
                                </IonButton>
                            </div>
                        </div>
                    )}
                </IonContent>
            </IonModal>

            {/* Загрузка */}
            <IonLoading
                isOpen={loading}
                message="Стандартизация адреса..."
                spinner="crescent"
            />
        </>
    );
}