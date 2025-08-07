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
            className="mt-1"
        >
            <div className='w-100 pb-1'>
                <div className="flex fl-space w-100">
                    
                    <div className="fs-09 fs-bold">#{invoice.number}</div>

                    <IonChip color={status.color} className="invoice-status-chip">
                        {status.text}
                    </IonChip>

                </div>
                
                <div className="invoice-details">
                    <div className="flex">
                        <IonIcon icon={locationOutline} className='h-1 w-1' color="tertiary"/>
                        <div className='ml-1 fs-08'>{invoice.address}</div>
                    </div>
                    
                    <div className="flex mt-05">
                        <div>
                            <IonIcon icon={constructOutline} className='h-1 w-1' color="tertiary"/>
                        </div>
                        <div className='ml-1 fs-08'>{invoice.service}</div>
                    </div>
                    
                    <div className="flex mt-05">
                        <IonIcon icon={timeOutline} className='h-1 w-1' color="tertiary"/>
                        <div className='ml-1 fs-08'>{formatDate(invoice.term_begin)} - {formatDate(invoice.term_end)}
                            {invoice.term > 0 && ` (${invoice.term} дней)`}</div>
                    </div>

                </div>

                {/* <div className="invoice-footer">
                    <span>ЛС: {invoice.lic.code}</span>
                    <span>Участок: {invoice.lic.plot}</span>
                </div> */}
            </div>
        </IonItem>
    );
};

export default React.memo(InvoiceItem);