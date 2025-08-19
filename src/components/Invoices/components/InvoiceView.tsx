// src/components/Invoices/components/InvoiceView.tsx
import React, { useCallback, useState } from 'react';
import { IonButton, IonCard, IonChip, IonIcon, IonItem, IonLabel, IonList, IonModal, IonSpinner } from '@ionic/react';
import { callOutline, locationOutline, timeOutline, personCircleOutline, searchOutline, checkmarkCircleOutline, warningOutline, alertCircleOutline, ribbonOutline, calendarOutline, codeWorkingOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { Invoice, InvoiceStatus } from '../types';
import styles from './InvoiceView.module.css';
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
        <IonCard className={styles.invoiceCard}>
            {/* Компактный заголовок */}
            <div className={styles.invoiceHeader}>
                <div className={styles.invoiceTitle}>
                    <h2>Заявка №{invoice.number}</h2>
                    <IonChip color={getStatusColor()} className={styles.statusChip}>
                        <IonIcon icon={getStatusIcon()} />
                        {invoiceStatus?.text || 'Неизвестно'}
                    </IonChip>
                </div>
                <IonButton 
                    size="small" 
                    color="primary"
                    className={styles.actsButton}
                    onClick={onNavigateToActs}
                >
                    Акты...
                </IonButton>
            </div>

            {/* Основная информация */}
            <IonList className={styles.invoiceList}>
                <IonItem className={styles.invoiceItem}>
                    <IonIcon icon={timeOutline} slot="start" />
                    <IonLabel>
                        <h3>Дата заявки</h3>
                        <p>{formatDate(invoice.date)}</p>
                    </IonLabel>
                </IonItem>

                <IonItem className={styles.invoiceItem}>
                    <IonIcon icon={personCircleOutline} slot="start" />
                    <IonLabel>
                        <h3>Заявитель</h3>
                        <p>{invoice.applicant}</p>
                    </IonLabel>
                </IonItem>

                <IonItem className={styles.invoiceItem}>
                    <IonIcon icon={locationOutline} slot="start" />
                    <IonLabel>
                        <h3>Адрес</h3>
                        <p>{currentAddress}</p>
                    </IonLabel>
                    <IonButton 
                        fill="outline" 
                        color={"primary"}
                        slot="end"
                        onClick={handleAddressSearch}
                        disabled={isUpdatingAddress}
                    >
                        {isUpdatingAddress ? (
                            <IonSpinner name="dots" />
                        ) : (
                            <IonIcon icon={searchOutline} />
                        )}
                    </IonButton>
                </IonItem>

                {invoice.phone && (
                    <IonItem className={styles.invoiceItem}>
                        <IonIcon icon={callOutline} slot="start" />
                        <IonLabel>
                            <h3>Телефон</h3>
                            <p>{formatPhone(invoice.phone)}</p>
                        </IonLabel>
                        <IonButton 
                            fill="outline" 
                            color={"primary"}
                            slot="end"
                            onClick={handleCall}
                        >
                            <IonIcon icon={callOutline} />
                        </IonButton>
                    </IonItem>
                )}

                <IonItem className={styles.invoiceItem}>
                    <IonIcon icon={codeWorkingOutline} slot="start" />
                    <IonLabel>
                        <h3>Лицевой счет</h3>
                        <p>{invoice.lic.code || 'Не указан'}</p>
                    </IonLabel>
                    <IonButton 
                        fill="outline" 
                        color={"primary"}
                        onClick={handleAccountSearch}
                        slot="end"
                    >
                        <IonIcon icon={ellipsisHorizontalOutline} />
                    </IonButton>
                </IonItem>

                <IonItem className={styles.invoiceItem}>
                    <IonIcon icon={ribbonOutline} slot="start" />
                    <IonLabel>
                        <h3>Услуга</h3>
                        <p>{invoice.service}</p>
                    </IonLabel>
                </IonItem>

                <IonItem className={styles.invoiceItem}>
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
                    onAddressClosed={ ()=>setIsAddressSearchModalOpen(false) }
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