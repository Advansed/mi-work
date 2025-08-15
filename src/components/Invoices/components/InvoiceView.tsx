// src/components/Invoices/components/InvoiceView.tsx
import React, { useCallback, useState } from 'react';
import { IonButton, IonCard, IonChip, IonIcon, IonItem, IonLabel, IonList, IonModal, IonSpinner } from '@ionic/react';
import { callOutline, locationOutline, timeOutline, personCircleOutline, searchOutline, checkmarkCircleOutline, warningOutline, alertCircleOutline, ribbonOutline, calendarOutline, codeWorkingOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { Invoice, InvoiceStatus } from '../types';
import './InvoiceView.css';
import { AddressForm } from '../../Lics/components/FindAddress/FindAddress';
import FindLics from '../../Lics/components/FindLic/FindLics';

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
    const [currentAddress, setCurrentAddress] = useState(invoice.address);
    const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
    const [isAddressSearchModalOpen, setIsAddressSearchModalOpen] = useState(false);
    const [isAccountSearchModalOpen, setIsAccountSearchModalOpen] = useState(false);

    const handleCall = useCallback(() => {
        if (!invoice.phone) return;
        
        const cleanPhone = invoice.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) return;
        
        try {
            window.open(`tel:${invoice.phone}`);
        } catch (error) {
            console.error('Ошибка при попытке звонка:', error);
        }
    }, [invoice.phone]);

    const handleAddressSearch = useCallback(() => {
        setIsAddressSearchModalOpen(true);
    }, []);

    const handleAccountSearch = useCallback(() => {
        setIsAccountSearchModalOpen(true);
    }, []);

    const handleAddressUpdate = useCallback(async (newAddress: string) => {
        if (!onUpdateAddress) return;
        
        setIsUpdatingAddress(true);
        try {
            const result = await onUpdateAddress(invoice.id, newAddress);
            if (result.success) {
                setCurrentAddress(newAddress);
                setIsAddressSearchModalOpen(false);
            }
        } catch (error) {
            console.error('Ошибка обновления адреса:', error);
        } finally {
            setIsUpdatingAddress(false);
        }
    }, [onUpdateAddress, invoice.id]);

    const getStatusIcon = () => {
        switch (invoiceStatus?.color) {
            case 'success': return checkmarkCircleOutline;
            case 'warning': return warningOutline;
            case 'danger': return alertCircleOutline;
            default: return alertCircleOutline;
        }
    };

    const getStatusColor = () => {
        return invoiceStatus?.color || 'medium';
    };

    return (
        <IonCard className="invoice-card-mobile">
            {/* Компактный заголовок */}
            <div className="invoice-header-mobile">
                <div className="invoice-title-mobile">
                    <h2>Заявка №{invoice.number}</h2>
                    <IonChip color={getStatusColor()} className="status-chip-mobile">
                        <IonIcon icon={getStatusIcon()} />
                        {invoiceStatus?.text || 'Неизвестно'}
                    </IonChip>
                </div>
                <IonButton 
                    fill="outline" 
                    size="small" 
                    className="acts-button-mobile"
                    onClick={onNavigateToActs}
                >
                    Акты
                </IonButton>
            </div>

            {/* Основная информация */}
            <IonList className="invoice-list-mobile">
                <IonItem className="invoice-item-mobile">
                    <IonIcon icon={timeOutline} slot="start" />
                    <IonLabel>
                        <h3>Дата заявки</h3>
                        <p>{formatDate(invoice.date)}</p>
                    </IonLabel>
                </IonItem>

                <IonItem className="invoice-item-mobile">
                    <IonIcon icon={personCircleOutline} slot="start" />
                    <IonLabel>
                        <h3>Заявитель</h3>
                        <p>{invoice.applicant}</p>
                    </IonLabel>
                </IonItem>

                <IonItem 
                    button 
                    onClick={handleCall} 
                    disabled={!invoice.phone}
                    className="invoice-item-mobile"
                >
                    <IonIcon icon={callOutline} slot="start" />
                    <IonLabel>
                        <h3>Телефон</h3>
                        <p>{formatPhone(invoice.phone)}</p>
                    </IonLabel>
                </IonItem>

                <IonItem className="invoice-item-mobile">
                    <IonIcon icon={locationOutline} slot="start" />
                    <IonLabel>
                        <h3>Адрес</h3>
                        <p>{currentAddress}</p>
                    </IonLabel>
                    <IonButton 
                        fill="clear" 
                        size="small"
                        onClick={handleAddressSearch}
                        slot="end"
                    >
                        <IonIcon icon={searchOutline} />
                    </IonButton>
                </IonItem>

                <IonItem className="invoice-item-mobile">
                    <IonIcon icon={codeWorkingOutline} slot="start" />
                    <IonLabel>
                        <h3>Лицевой счет</h3>
                        <p>{invoice.lic.code || "НЕ УКАЗАНО"}</p>
                    </IonLabel>
                    <IonButton 
                        fill="clear" 
                        size="small"
                        onClick={handleAccountSearch}
                        slot="end"
                    >
                        <IonIcon icon={ellipsisHorizontalOutline} />
                    </IonButton>
                </IonItem>

                <IonItem className="invoice-item-mobile">
                    <IonIcon icon={ribbonOutline} slot="start" />
                    <IonLabel>
                        <h3>Услуга</h3>
                        <p>{invoice.service}</p>
                    </IonLabel>
                </IonItem>

                <IonItem className="invoice-item-mobile">
                    <IonIcon icon={calendarOutline} slot="start" />
                    <IonLabel>
                        <h3>Срок выполнения</h3>
                        <p>{formatDate(invoice.term_begin)} - {formatDate(invoice.term_end)}</p>
                    </IonLabel>
                </IonItem>
            </IonList>

            {/* Модальные окна */}
            <IonModal isOpen={isAddressSearchModalOpen} onDidDismiss={() => setIsAddressSearchModalOpen(false)}>
                <AddressForm 
                    initialAddress={currentAddress}
                    invoiceId={invoice.id}
                    onAddressSaved={handleAddressUpdate}
                    disabled={isUpdatingAddress}
                />
            </IonModal>

            <FindLics 
                address={currentAddress}
                invoiceId={invoice.id}
                onSelect={(lic: string) => {
                    setIsAccountSearchModalOpen(false);
                }}
                isOpen={isAccountSearchModalOpen}
                onClose={() => setIsAccountSearchModalOpen(false)}
            />
        </IonCard>
    );
};