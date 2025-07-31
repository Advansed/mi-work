// src/components/Invoices/components/InvoiceView.tsx
import React, { useCallback, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonList, IonModal, IonSpinner } from '@ionic/react';
import { callOutline, locationOutline, timeOutline, documentOutline, printOutline, codeWorkingOutline, warningOutline, checkmarkCircleOutline, searchOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { Invoice, InvoiceStatus } from '../types';
import './InvoiceView.css';
import { AddressForm } from '../../Lics/AddressForm';

interface InvoiceViewProps {
    invoice: Invoice;
    invoiceStatus: InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
    onNavigateToActs: () => void;
    onNavigateToPrint: () => void;
    onUpdateAddress?: (invoiceId: string, newAddress: string) => Promise<{success: boolean, message?: string}>;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
    invoice,
    invoiceStatus,
    formatDate,
    formatPhone,
    onNavigateToActs,
    onNavigateToPrint,
    onUpdateAddress
}) => {
    // Состояние для управления адресом
    const [currentAddress, setCurrentAddress] = useState(invoice.address);
    const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
    const [isAddressSearchModalOpen, setIsAddressSearchModalOpen] = useState(false);

    const handleCall = useCallback(() => {
        if (!invoice.phone) {
            return;
        }
        
        const cleanPhone = invoice.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return;
        }
        
        try {
            window.open(`tel:${invoice.phone}`);
        } catch (error) {
            console.error('Ошибка при попытке звонка:', error);
        }
    }, [invoice.phone]);

    // ============================================
    // ОБРАБОТЧИК ПОИСКА ЛИЦЕВОГО СЧЕТА
    // ============================================
    const handleAccountSearch = useCallback(() => {
        setIsAddressSearchModalOpen(true);
    }, []);

    // ============================================
    // ОБРАБОТЧИК ОБНОВЛЕНИЯ АДРЕСА
    // ============================================
    const handleAddressUpdate = useCallback(async (newAddress: string) => {
        if (!onUpdateAddress) return;
        
        setIsUpdatingAddress(true);
        try {
            const result = await onUpdateAddress(invoice.id, newAddress);
            if (result.success) {
                setCurrentAddress(newAddress);
                setIsAddressSearchModalOpen(false);
                // Уведомление об успехе будет показано в компоненте Lics
            } else {
                // Ошибка будет показана в компоненте Lics
                console.error('Ошибка обновления адреса:', result.message);
            }
        } catch (error) {
            console.error('Ошибка обновления адреса:', error);
        } finally {
            setIsUpdatingAddress(false);
        }
    }, [invoice.id, onUpdateAddress]);

    // ============================================
    // ОБРАБОТЧИК ИЗМЕНЕНИЯ АДРЕСА В РЕАЛЬНОМ ВРЕМЕНИ
    // ============================================
    const handleAddressChange = useCallback((address: string, isStandardized: boolean) => {
        // Обновление в реальном времени для предпросмотра
        // Можно использовать для показа предварительного результата
        console.log('Address changed:', address, 'Standardized:', isStandardized);
    }, []);

    // ============================================
    // ОБРАБОТЧИК ЗАКРЫТИЯ МОДАЛЬНОГО ОКНА
    // ============================================
    const handleModalClose = useCallback(() => {
        if (!isUpdatingAddress) {
            setIsAddressSearchModalOpen(false);
        }
    }, [isUpdatingAddress]);

    return (
        <div className="invoice-view">
            {/* Основная информация о заявке */}
            <IonCard>

                <IonCardHeader>
                    <IonCardTitle>
                        Заявка #{invoice.number}
                        <IonChip color={invoiceStatus.color} className="status-chip">
                            <IonIcon icon={invoiceStatus.icon} />
                            <span>{invoiceStatus.text}</span>
                        </IonChip>
                    </IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent>
                    <IonList>
                        {/* Дата заявки */}
                        <IonItem>
                            <IonIcon icon={timeOutline} slot="start" />
                            <IonLabel>
                                <h3>Дата заявки</h3>
                                <p>{formatDate(invoice.date)}</p>
                            </IonLabel>
                        </IonItem>

                        {/* Заявитель */}
                        <IonItem>
                            <IonLabel>
                                <h3>Заявитель</h3>
                                <p>{invoice.applicant}</p>
                            </IonLabel>
                        </IonItem>

                        {/* Телефон с возможностью звонка */}
                        <IonItem button onClick={handleCall} disabled={!invoice.phone}>
                            <IonIcon icon={callOutline} slot="start" />
                            <IonLabel>
                                <h3>Телефон</h3>
                                <p>{formatPhone(invoice.phone)}</p>
                            </IonLabel>
                        </IonItem>

                        {/* Адрес с возможностью поиска */}
                        <IonItem>
                            <IonIcon icon={locationOutline} slot="start" />
                            <IonLabel>
                                <h3>Адрес</h3>
                                <p>{currentAddress}</p>
                                {isUpdatingAddress && <IonSpinner name="dots" />}
                            </IonLabel>
                            <IonButton 
                                fill="outline" 
                                slot="end" 
                                onClick={handleAccountSearch}
                            >
                                <IonIcon icon={searchOutline}  color= "primary" />
                            </IonButton>
                        </IonItem>

                        {/* Услуга */}
                        <IonItem>
                            <IonLabel>
                                <h3>Услуга</h3>
                                <p>{invoice.service}</p>
                            </IonLabel>
                        </IonItem>

                        {/* Срок выполнения */}
                        <IonItem>
                            <IonLabel>
                                <h3>Срок выполнения</h3>
                                <p>{invoice.term} дней</p>
                                <p>с {formatDate(invoice.term_begin)} по {formatDate(invoice.term_end)}</p>
                            </IonLabel>
                        </IonItem>
                    </IonList>
                </IonCardContent>

            </IonCard>

            {/* Действия */}
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Действия</IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent>
                    <IonList>
                        <IonItem button onClick={onNavigateToActs}>
                            <IonIcon icon={documentOutline} slot="start" />
                            <IonLabel>
                                <h3>Акты и документы</h3>
                                <p>Просмотр и создание актов</p>
                            </IonLabel>
                        </IonItem>

                        <IonItem button onClick={onNavigateToPrint}>
                            <IonIcon icon={printOutline} slot="start" />
                            <IonLabel>
                                <h3>Печать документов</h3>
                                <p>Формирование отчетов</p>
                            </IonLabel>
                        </IonItem>
                    </IonList>
                </IonCardContent>
            </IonCard>

            {/* Модальное окно для поиска и стандартизации адреса */}
            <IonModal 
                isOpen={isAddressSearchModalOpen} 
                onDidDismiss={handleModalClose}
                canDismiss={!isUpdatingAddress}
            >
                <IonCardHeader>
                    <IonCardTitle>Стандартизация адреса</IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent>
                    <AddressForm
                        initialAddress={currentAddress}
                        invoiceId={invoice.id}
                        onAddressChange={handleAddressChange}
                        onAddressSaved={handleAddressUpdate}
                        disabled={isUpdatingAddress}
                    />
                    
                    <IonButton 
                        expand="block" 
                        fill="clear" 
                        onClick={handleModalClose}
                        disabled={isUpdatingAddress}
                        style={{ marginTop: '20px' }}
                    >
                        Закрыть
                    </IonButton>
                </IonCardContent>
            </IonModal>
        </div>
    );
};