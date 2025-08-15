import React from 'react';
import { 
    IonChip, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonButton
} from '@ionic/react';
import { 
    callOutline, 
    locationOutline, 
    timeOutline, 
    constructOutline
} from 'ionicons/icons';
import { Invoice, InvoiceStatus } from '../../types';
import styles from './InvoiceList.module.css';

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
        onCall(invoice.phone, event);
    };

    return (
        <IonItem 
            button 
            onClick={handleCardClick}
            className={`mt-1 ${styles.invoiceItemCompact}`}
        >
            <div className='w-100 pb-1'>
                <div className={`flex fl-space w-100 ${styles.invoiceHeader}`}>
                    
                    <div className={`fs-09 fs-bold ${styles.invoiceNumber}`}>#{invoice.number}</div>

                    <IonChip color={status.color} className={styles.invoiceStatusChip}>
                        {status.text}
                    </IonChip>

                </div>
                
                <div className={styles.invoiceDetails}>
                    <div className={`flex ${styles.detailRow}`}>
                        <IonIcon icon={locationOutline} className='h-1 w-1' color="tertiary"/>
                        <div className='ml-1 fs-08'>{invoice.address}</div>
                    </div>
                    
                    <div className={`flex mt-05 ${styles.detailRow}`}>
                        <div>
                            <IonIcon icon={constructOutline} className='h-1 w-1' color="tertiary"/>
                        </div>
                        <div className='ml-1 fs-08'>{invoice.service}</div>
                    </div>
                    
                    <div className={`flex mt-05 ${styles.detailRow}`}>
                        <IonIcon icon={timeOutline} className='h-1 w-1' color="tertiary"/>
                        <div className='ml-1 fs-08'>{formatDate(invoice.term_begin)} - {formatDate(invoice.term_end)}
                            {invoice.term > 0 && ` (${invoice.term} дней)`}</div>
                    </div>

                </div>

                <div className={styles.invoiceFooter}>
                    <span>ЛС: {invoice.lic.code}</span>
                    <span className={styles.textRight}>Участок: {invoice.lic.plot}</span>
                </div>
            </div>
        </IonItem>
    );
};

export default React.memo(InvoiceItem);