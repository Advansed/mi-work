import React from 'react';
import { 
    IonChip, 
    IonIcon, 
    IonItem, 
    IonGrid,
    IonRow,
    IonCol,
    IonButton
} from '@ionic/react';
import { 
    callOutline, 
    locationOutline, 
    timeOutline, 
    constructOutline
} from 'ionicons/icons';
import { Invoice, InvoiceStatus } from '../../types';
import styles from './InvoiceItem.module.css';

interface InvoiceCardProps {
    invoice: Invoice;
    status: InvoiceStatus;
    onSelect: (invoiceId: string) => void;
    onCall: (phone: string, event: React.MouseEvent) => void;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
}

export const InvoiceItem: React.FC<InvoiceCardProps> = ({
    invoice,
    status,
    onSelect,
    onCall,
    formatDate,
    formatPhone
}) => {
    const handleCardClick = () => {
        onSelect(invoice.id);
    };

    const handleCallClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        onCall(invoice.phone, event);
    };

    return (
        <IonItem 
            button 
            onClick={handleCardClick}
            className={`${styles.invoiceCard}`}
            data-status={status.color}
        >
            <IonGrid className="ion-no-padding">
                {/* Заголовок карточки */}
                <IonRow className="ion-align-items-center ion-margin-bottom">
                    <IonCol size="auto">
                        <div className={styles.invoiceNumber}>#{invoice.number}</div>
                    </IonCol>
                    <IonCol>
                        <div className="ion-text-end">
                            <IonChip color={status.color} className={styles.invoiceStatusChip}>
                                {status.text}
                            </IonChip>
                        </div>
                    </IonCol>
                    {invoice.phone && (
                        <IonCol size="auto">
                            <IonButton
                                fill="clear"
                                size="small"
                                color="primary"
                                onClick={handleCallClick}
                                className={styles.phoneButton}
                            >
                                <IonIcon icon={callOutline} />
                            </IonButton>
                        </IonCol>
                    )}
                </IonRow>

                {/* Основная информация */}
                <IonRow className={styles.invoiceInfo}>
                    <IonCol size="12">
                        <div className={styles.infoRow}>
                            <IonIcon icon={locationOutline} />
                            <span>{invoice.address}</span>
                        </div>
                    </IonCol>
                </IonRow>

                <IonRow className={styles.invoiceInfo}>
                    <IonCol size="12" size-md="6">
                        <div className={styles.infoRow}>
                            <IonIcon icon={constructOutline} />
                            <span>{invoice.service}</span>
                        </div>
                    </IonCol>
                    <IonCol size="12" size-md="6">
                        <div className={styles.infoRow}>
                            <IonIcon icon={timeOutline} />
                            <span>
                                {formatDate(invoice.term_begin)} - {formatDate(invoice.term_end)}
                                {invoice.term > 0 && ` (${invoice.term} дней)`}
                            </span>
                        </div>
                    </IonCol>
                </IonRow>

                {/* Футер */}
                <IonRow className={styles.invoiceFooter}>
                    <IonCol size="6">
                        <span>ЛС: {invoice.lic.code}</span>
                    </IonCol>
                    <IonCol size="6" className={styles.textRight}>
                        <span>Участок: {invoice.lic.plot}</span>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonItem>
    );
};

export default React.memo(InvoiceItem);