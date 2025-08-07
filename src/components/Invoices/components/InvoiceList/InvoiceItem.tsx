import React from 'react';
import { 
    IonCard, 
    IonChip, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonButton,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import { 
    callOutline, 
    locationOutline, 
    timeOutline, 
    chevronForwardOutline,
    personOutline,
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
        <IonCard className="invoice-card" style={{ margin: '8px 16px' }}>
            <IonItem 
                button 
                onClick={handleCardClick}
                style={{ '--inner-padding-end': '8px' }}
            >
                <div slot="start" style={{ marginRight: '12px' }}>
                    <IonChip color={status.color}>
                        {status.text}
                    </IonChip>
                </div>

                <IonLabel>
                    <h2>
                        <strong>#{invoice.number}</strong>
                    </h2>
                    
                    <div className="invoice-info">
                        <div className="info-row">
                            <IonIcon icon={personOutline} />
                            <div>{invoice.applicant}</div>
                        </div>
                        
                        <div className="info-row">
                            <IonIcon icon={locationOutline} />
                            <div>{invoice.address}</div>
                        </div>
                        
                        <div className="info-row">
                            <IonIcon icon={constructOutline} />
                            <div>{invoice.service}</div>
                        </div>
                        
                        <div className="info-row">
                            <IonIcon icon={timeOutline} />
                            <div>
                                {formatDate(invoice.term_begin)} - {formatDate(invoice.term_end)}
                                {invoice.term > 0 && ` (${invoice.term} дней)`}
                            </div>
                        </div>
                    </div>
                </IonLabel>

                <div slot="end" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <IonButton
                        fill="clear"
                        size="small"
                        onClick={handleCallClick}
                        title={`Позвонить ${formatPhone(invoice.phone)}`}
                    >
                        <IonIcon icon={callOutline} />
                    </IonButton>
                    
                    <IonIcon icon={chevronForwardOutline} color="medium" />
                </div>
            </IonItem>

            {/* Дополнительная информация */}
            <div className="invoice-footer">
                <IonGrid>
                    <IonRow>
                        <IonCol size="6">
                            <small>ЛС: {invoice.lic.code}</small>
                        </IonCol>
                        <IonCol size="6" style={{ textAlign: 'right' }}>
                            <small>Участок: {invoice.lic.plot}</small>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </div>
        </IonCard>
    );
};

export default React.memo(InvoiceItem);