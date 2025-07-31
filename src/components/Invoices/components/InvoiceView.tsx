import React, { useCallback, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonList } from '@ionic/react';
import { callOutline, locationOutline, timeOutline, documentOutline, printOutline, codeWorkingOutline, warningOutline, checkmarkCircleOutline, searchOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { Invoice, InvoiceStatus } from '../types';
import './InvoiceView.css';
import AddressSearchModal from '../../dadata/AddressSearchModal';
import { DaDataSuggestion } from '../../dadata/dadata';

interface InvoiceViewProps {
    invoice: Invoice;
    invoiceStatus: InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
    onNavigateToActs: () => void;
    onNavigateToPrint: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
    invoice,
    invoiceStatus,
    formatDate,
    formatPhone,
    onNavigateToActs,
    onNavigateToPrint
}) => {
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

    const [isAddressSearchModalOpen, setIsAddressSearchModalOpen] = useState(false);


    // ============================================
    // ОБРАБОТЧИК ПОИСКА ЛИЦЕВОГО СЧЕТА
    // ============================================
    const handleAccountSearch = useCallback(() => {
        setIsAddressSearchModalOpen(true);
    }, []);

    // ============================================
    // ОБРАБОТЧИК РЕЗУЛЬТАТА ПОИСКА АДРЕСА
    // ============================================
    const handleAddressFound = useCallback((address: DaDataSuggestion, subscribers?: any[]) => {
        console.log('Найден адрес:', address);
        console.log('Абоненты:', subscribers);
        
        // TODO: Реализовать навигацию к найденному абоненту
        // Например, открыть новую заявку или перейти к существующей
        
        setIsAddressSearchModalOpen(false);
    }, []);

    // ============================================
    // ОБРАБОТЧИК ЗАКРЫТИЯ МОДАЛЬНОГО ОКНА
    // ============================================
    const handleCloseAddressSearch = useCallback(() => {
        setIsAddressSearchModalOpen(false);
    }, []);

    const getStatusIcon = useCallback((statusType: InvoiceStatus['type']) => {
        switch (statusType) {
            case 'overdue':
                return warningOutline;
            case 'urgent':
                return timeOutline;
            case 'normal':
                return checkmarkCircleOutline;
            default:
                return codeWorkingOutline;
        }
    }, []);


    if (!invoice) {
        return (
            <div className="invoice-page">
                <div className="invoice-page-content">
                    <IonCard>
                        <IonCardContent>
                            <p>Заявка не найдена</p>
                        </IonCardContent>
                    </IonCard>
                </div>
            </div>
        );
    }

    return (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <div className="invoice-header-main">
                    <div className="invoice-header-info">
                        <h2 className="invoice-page-title">Заявка #{invoice.number}</h2>
                        <p className="invoice-page-subtitle">{formatDate(invoice.date)}</p>
                    </div>
                </div>
                <div className="invoice-header-actions">
                    <IonButton 
                        fill="solid"
                        size="default"
                        onClick={onNavigateToActs}
                        className="acts-button"
                    >
                        <IonIcon icon={documentOutline} slot="start" />
                        Акты
                    </IonButton>
                </div>
            </div>

            <div className="invoice-page-content scroll">
                {/* Основная информация */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>
                            <div className='flex fl-space'>
                                <span>Информация о заявке</span>
                                <div className="invoice-header-status">
                                    <IonChip color={invoiceStatus.color} className="status-chip-header">
                                        <IonIcon icon={getStatusIcon(invoiceStatus.type)} />
                                        <IonLabel>{invoiceStatus.label}</IonLabel>
                                    </IonChip>
                                </div>
                            </div>  
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <IonItem>
                                <IonIcon icon={locationOutline} slot="start" />
                                <IonLabel>
                                    <h3>Адрес</h3>
                                    <p>{invoice.address || 'Адрес не указан'}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={locationOutline} slot="start" />
                                <IonLabel>
                                    <h3>Лицевой счет</h3>
                                    <p>{invoice.lic?.code || 'Не указан'}</p>
                                </IonLabel>
                                <IonButton 
                                    fill="outline" 
                                    size="small"
                                    slot="end"
                                    onClick={handleAccountSearch}
                                    
                                >
                                    <IonIcon icon={ ellipsisHorizontalOutline } color= "primary" />
                                </IonButton>
                            </IonItem>

                            <IonItem button onClick={handleCall} disabled={!invoice.phone}>
                                <IonIcon icon={callOutline} slot="start" />
                                <IonLabel>
                                    <h3>Телефон</h3>
                                    <p>{formatPhone(invoice.phone) || 'Не указан'}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={timeOutline} slot="start" />
                                <IonLabel>
                                    <h3>Срок выполнения</h3>
                                    <p>{formatDate(invoice.term_begin)} - {formatDate(invoice.term_end)}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonLabel>
                                    <h3>Услуга</h3>
                                    <p>{invoice.service || 'Не указана'}</p>
                                </IonLabel>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>

            </div>

            {/* Модальное окно поиска адреса */}
            <AddressSearchModal
                isOpen          = { isAddressSearchModalOpen }
                onDidDismiss    = { handleCloseAddressSearch }
                currentAddress  = { invoice.address }
                currentLicCode  = { invoice.lic?.code }
                onAddressFound  = { handleAddressFound }
            />
        </div>
    );
};