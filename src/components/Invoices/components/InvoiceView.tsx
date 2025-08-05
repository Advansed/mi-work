// src/components/Invoices/components/InvoiceView.tsx
import React, { useCallback, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonList, IonModal, IonSpinner } from '@ionic/react';
import { callOutline, locationOutline, timeOutline, documentOutline, printOutline, codeWorkingOutline, warningOutline, checkmarkCircleOutline, searchOutline, ellipsisHorizontalOutline, ribbonOutline, alertCircleOutline, personCircleOutline, calendarOutline } from 'ionicons/icons';
import { Invoice, InvoiceStatus } from '../types';
import './InvoiceView.css';
import { AddressForm } from '../../Lics/components/FindAddress';
import LicsForm from '../../Lics/components/FindLics';

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
    const [isAccountSearchModalOpen, setIsAccountSearchModalOpen] = useState(false);

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
    const handleAddressSearch = useCallback(() => {
        setIsAddressSearchModalOpen(true);
    }, []);

    const handleAccountSearch = useCallback(() => {
        setIsAccountSearchModalOpen(true);
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
                        <div className='flex fl-space'>
                            <div>
                                Заявка #{invoice.number}
                                <IonChip color={invoiceStatus.color} className="status-chip">
                                    <IonIcon icon={ alertCircleOutline }  className='w-15 h-15'/>
                                    <span>{invoiceStatus.text}</span>
                                </IonChip>
                            </div>
                            <IonButton onClick={ onNavigateToActs }>Акты...</IonButton>
                        </div>                        
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
                            <IonIcon icon={ personCircleOutline} slot="start" />
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
                                onClick={handleAddressSearch}
                            >
                                <IonIcon icon={searchOutline}  color= "primary" />
                            </IonButton>
                        </IonItem>

                        <IonItem>
                            <IonIcon icon={ codeWorkingOutline } slot="start" />
                            <IonLabel>
                                <h3>Лицевой счет</h3>
                                <p>{ invoice.lic.code || "НЕ УКАЗАНО" }</p>
                                {isUpdatingAddress && <IonSpinner name="dots" />}
                            </IonLabel>
                            <IonButton 
                                fill="outline" 
                                slot="end" 
                                onClick={handleAccountSearch}
                            >
                                <IonIcon icon={ ellipsisHorizontalOutline }  color= "primary" />
                            </IonButton>
                        </IonItem>

                        {/* Услуга */}
                        <IonItem>
                            <IonIcon icon={ ribbonOutline } slot="start" />
                            <IonLabel>
                                <h3>Услуга</h3>
                                <p>{invoice.service}</p>
                            </IonLabel>
                        </IonItem>

                        {/* Срок выполнения */}
                        <IonItem>
                            <IonIcon icon={ calendarOutline } slot="start" />
                            <IonLabel>
                                <h3>Срок выполнения</h3>
                                <p>{invoice.term} дней</p>
                                <p>с {formatDate(invoice.term_begin)} по {formatDate(invoice.term_end)}</p>
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
                <div>
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
                </div>
            </IonModal>

            {
                isAccountSearchModalOpen 
                    ? <>
                        <LicsForm
                            address         = { invoice.address } 
                            invoiceId       = { invoice.id } 
                            onUpdateLics    = { ()=>{}} 
                            isOpen          = { isAccountSearchModalOpen } 
                            onClose         = { ()=>{ setIsAccountSearchModalOpen(false)} }
                        />
                    </>
                    : <></>
            }
        </div>
    );
};