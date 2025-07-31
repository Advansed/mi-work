// src/components/AddressSearch/AddressSearchModal.tsx
import React, { useState, useCallback } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
    IonText
} from '@ionic/react';
import { closeOutline, searchOutline, locationOutline, callOutline } from 'ionicons/icons';
import { DaDataSuggestion } from './dadata';
import './AddressSearchModal.css';
import IncrementalAddressForm from './AddressForm';

interface AddressSearchModalProps {
    isOpen: boolean;
    onDidDismiss: () => void;
    currentAddress?: string;
    currentLicCode?: string;
    onAddressFound?: (address: DaDataSuggestion, subscribers?: SubscriberInfo[]) => void;
}

interface SubscriberInfo {
    licCode: string;
    fullName: string;
    phone: string;
    contractNumber: string;
    contractDate: string;
    lastServiceDate?: string;
    equipment: string[];
    debt: number;
}

export const AddressSearchModal: React.FC<AddressSearchModalProps> = ({
    isOpen,
    onDidDismiss,
    currentAddress,
    currentLicCode,
    onAddressFound
}) => {
    const [selectedAddress, setSelectedAddress] = useState<DaDataSuggestion | null>(null);
    const [subscribers, setSubscribers] = useState<SubscriberInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // ============================================
    // ПОИСК АБОНЕНТОВ ПО АДРЕСУ
    // ============================================
    const searchSubscribersByAddress = useCallback(async (address: DaDataSuggestion) => {
        setLoading(true);
        setSearchPerformed(true);

        try {
            // TODO: Заменить на реальный API запрос
            const response = await fetch('/api/search_subscribers_by_address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: address.value,
                    fiasId: address.data.fias_id
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSubscribers(data.data || []);
                } else {
                    setSubscribers([]);
                }
            } else {
                setSubscribers([]);
            }
        } catch (error) {
            console.error('Ошибка поиска абонентов:', error);
            setSubscribers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================
    // ОБРАБОТЧИК ВЫБОРА АДРЕСА
    // ============================================
    const handleAddressSelect = useCallback((address: DaDataSuggestion) => {
        setSelectedAddress(address);
        searchSubscribersByAddress(address);
    }, [searchSubscribersByAddress]);

    // ============================================
    // ОБРАБОТЧИК ЗВОНКА АБОНЕНТУ
    // ============================================
    const handleCallSubscriber = useCallback((phone: string) => {
        try {
            window.open(`tel:${phone}`);
        } catch (error) {
            console.error('Ошибка при попытке звонка:', error);
        }
    }, []);

    // ============================================
    // ОБРАБОТЧИК ВЫБОРА АБОНЕНТА
    // ============================================
    const handleSelectSubscriber = useCallback((subscriber: SubscriberInfo) => {
        if (selectedAddress && onAddressFound) {
            onAddressFound(selectedAddress, [subscriber]);
        }
        onDidDismiss();
    }, [selectedAddress, onAddressFound, onDidDismiss]);

    // ============================================
    // СБРОС СОСТОЯНИЯ ПРИ ЗАКРЫТИИ
    // ============================================
    const handleModalDismiss = useCallback(() => {
        setSelectedAddress(null);
        setSubscribers([]);
        setSearchPerformed(false);
        onDidDismiss();
    }, [onDidDismiss]);

    // ============================================
    // ФОРМАТИРОВАНИЕ ТЕЛЕФОНА
    // ============================================
    const formatPhone = useCallback((phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('7')) {
            return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
        }
        return phone;
    }, []);

    // ============================================
    // ФОРМАТИРОВАНИЕ ДАТЫ
    // ============================================
    const formatDate = useCallback((dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString('ru-RU');
        } catch {
            return dateString;
        }
    }, []);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleModalDismiss} className="address-search-modal">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Поиск адреса</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleModalDismiss}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="address-search-content">
                {/* Текущий адрес */}
                {currentAddress && (
                    <IonCard className="current-address-card">
                        <IonCardHeader>
                            <IonCardTitle>Текущий адрес</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem lines="none">
                                <IonIcon icon={locationOutline} slot="start" />
                                <IonLabel>
                                    <p>{currentAddress}</p>
                                    {currentLicCode && (
                                        <p className="lic-code">Лицевой счет: {currentLicCode}</p>
                                    )}
                                </IonLabel>
                            </IonItem>
                        </IonCardContent>
                    </IonCard>
                )}

                {/* Форма поиска */}
                <IonCard className="search-form-card">
                    <IonCardHeader>
                        <IonCardTitle>
                            <IonIcon icon={searchOutline} className="search-title-icon" />
                            Найти новый адрес
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IncrementalAddressForm
                            options={{ 
                                debounceMs: 500, 
                                maxSuggestions: 5 
                            }}
                            showProgress={true}
                            showFullAddress={true}
                        />   
                    </IonCardContent>
                </IonCard>

                {/* Результаты поиска абонентов */}
                {selectedAddress && (
                    <IonCard className="subscribers-card">
                        <IonCardHeader>
                            <IonCardTitle>Абоненты по адресу</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {loading ? (
                                <div className="loading-container">
                                    <IonText>Поиск абонентов...</IonText>
                                </div>
                            ) : searchPerformed && subscribers.length === 0 ? (
                                <IonText color="medium">
                                    <p>По данному адресу абоненты не найдены</p>
                                </IonText>
                            ) : (
                                <IonList>
                                    {subscribers.map((subscriber, index) => (
                                        <IonCard key={index} className="subscriber-card" button onClick={() => handleSelectSubscriber(subscriber)}>
                                            <IonCardContent>
                                                <div className="subscriber-header">
                                                    <h3 className="subscriber-name">{subscriber.fullName}</h3>
                                                    <IonButton
                                                        fill="clear"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCallSubscriber(subscriber.phone);
                                                        }}
                                                        className="call-button"
                                                    >
                                                        <IonIcon icon={callOutline} />
                                                    </IonButton>
                                                </div>

                                                <div className="subscriber-details">
                                                    <IonItem lines="none" className="detail-item">
                                                        <IonLabel>
                                                            <h4>Лицевой счет</h4>
                                                            <p>{subscriber.licCode}</p>
                                                        </IonLabel>
                                                    </IonItem>

                                                    <IonItem lines="none" className="detail-item">
                                                        <IonLabel>
                                                            <h4>Телефон</h4>
                                                            <p>{formatPhone(subscriber.phone)}</p>
                                                        </IonLabel>
                                                    </IonItem>

                                                    <IonItem lines="none" className="detail-item">
                                                        <IonLabel>
                                                            <h4>Договор ТО</h4>
                                                            <p>№ {subscriber.contractNumber} от {formatDate(subscriber.contractDate)}</p>
                                                        </IonLabel>
                                                    </IonItem>

                                                    {subscriber.lastServiceDate && (
                                                        <IonItem lines="none" className="detail-item">
                                                            <IonLabel>
                                                                <h4>Последнее ТО</h4>
                                                                <p>{formatDate(subscriber.lastServiceDate)}</p>
                                                            </IonLabel>
                                                        </IonItem>
                                                    )}

                                                    {subscriber.equipment.length > 0 && (
                                                        <IonItem lines="none" className="detail-item">
                                                            <IonLabel>
                                                                <h4>Оборудование</h4>
                                                                <p>{subscriber.equipment.join(', ')}</p>
                                                            </IonLabel>
                                                        </IonItem>
                                                    )}

                                                    {subscriber.debt > 0 && (
                                                        <IonItem lines="none" className="detail-item debt">
                                                            <IonLabel color="danger">
                                                                <h4>Задолженность</h4>
                                                                <p>{subscriber.debt.toLocaleString('ru-RU')} ₽</p>
                                                            </IonLabel>
                                                        </IonItem>
                                                    )}
                                                </div>
                                            </IonCardContent>
                                        </IonCard>
                                    ))}
                                </IonList>
                            )}
                        </IonCardContent>
                    </IonCard>
                )}
            </IonContent>
        </IonModal>
    );
};

export default AddressSearchModal;