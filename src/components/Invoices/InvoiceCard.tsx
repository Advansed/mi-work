import React from 'react';
import {
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
    IonButton,
    IonText,
    IonChip
} from '@ionic/react';
import { 
    timeOutline, 
    locationOutline, 
    callOutline, 
    documentTextOutline,
    warningOutline,
    checkmarkCircleOutline
} from 'ionicons/icons';
import { Invoice, InvoiceStatus } from './types';
import './InvoiceCard.css'

interface InvoiceCardProps {
    invoice: Invoice;
    status: InvoiceStatus;
    onCardClick: (invoice: Invoice) => void;
    onPhoneClick: (phone: string) => void;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
    invoice,
    status,
    onCardClick,
    onPhoneClick,
    formatDate,
    formatPhone
}) => {
    
    const handleCardClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.phone-button')) {
            return;
        }
        onCardClick(invoice);
    };

    const handlePhoneClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPhoneClick(invoice.phone);
    };

    const getStatusIcon = () => {
        switch (status.type) {
            case 'overdue':
                return warningOutline;
            case 'urgent':
                return timeOutline;
            case 'normal':
                return checkmarkCircleOutline;
            default:
                return documentTextOutline;
        }
    };

    const truncateText = (text: string, maxLength: number = 30) => {
        return text.length > maxLength 
            ? text.substring(0, maxLength) + '...'
            : text;
    };

    return (
        <IonCard 
            className={`invoice-card-compact invoice-card-compact--${status.type}`}
            onClick={handleCardClick}
            button
        >
            <IonCardContent className="invoice-card-compact__content">
                {/* Верхняя строка: номер заявки и статус */}
                <div className="invoice-card-compact__header">
                    <div className="invoice-card-compact__number">
                        № {invoice.number}
                    </div>
                    <IonBadge 
                        color={ status.color }
                        // className="invoice-card-compact__status"
                    >
                        { status.label }
                    </IonBadge>
                </div>

                {/* Наименование услуги */}
                {invoice.service && (
                    <div className="invoice-card-compact__service">
                        <span title={invoice.service}>
                            {truncateText(invoice.service, 40)}
                        </span>
                    </div>
                )}

                {/* Адрес */}
                <div className="invoice-card-compact__address">
                    <IonIcon icon={locationOutline} />
                    <span title={invoice.address}>
                        {truncateText(invoice.address, 45)}
                    </span>
                </div>

                {/* Нижняя строка: время и телефон */}
                <div className="invoice-card-compact__footer">
                    <div className="invoice-card-compact__phone">
                        <IonIcon icon={ callOutline} className='w-15 h-15'/>
                        <span>{formatPhone(invoice.phone)}</span>
                        <IonButton
                            fill="clear"
                            size="small"
                            className="phone-button"
                            onClick={handlePhoneClick}
                        >
                            <IonIcon icon={callOutline} />
                        </IonButton>
                    </div>
                    <div className="invoice-card-compact__time">
                        <span>{formatDate( invoice.term_end )}</span>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default InvoiceCard;