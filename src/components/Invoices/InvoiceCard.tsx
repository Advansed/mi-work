import React from 'react';
import {
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
    IonButton,
    IonText
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
        // Предотвращаем всплытие события если кликнули на кнопку звонка
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

    const truncateAddress = (address: string, maxLength: number = 50) => {
        return address.length > maxLength 
            ? address.substring(0, maxLength) + '...'
            : address;
    };

    return (
        <IonCard 
            className={`invoice-card invoice-card--${status.type}`}
            onClick={handleCardClick}
            button
        >
            <IonCardContent>
                {/* Заголовок с номером заявки и статусом */}
                <div className="invoice-card__header">
                    <div className="invoice-card__number">
                        <IonIcon icon={documentTextOutline} />
                        <span>№ {invoice.number}</span>
                    </div>
                    <IonBadge 
                        color={status.color}
                        className="invoice-card__status"
                    >
                        <IonIcon icon={getStatusIcon()} />
                        {status.label}
                    </IonBadge>
                </div>

                {/* Основная информация */}
                <div className="invoice-card__content">
                    {/* Дата создания */}
                    <IonItem lines="none" className="invoice-card__item">
                        <IonIcon icon={timeOutline} slot="start" color="medium" />
                        <IonLabel>
                            <h3>Создана</h3>
                            <p>{formatDate(invoice.date)}</p>
                        </IonLabel>
                    </IonItem>

                    {/* Адрес */}
                    <IonItem lines="none" className="invoice-card__item">
                        <IonIcon icon={locationOutline} slot="start" color="medium" />
                        <IonLabel>
                            <h3>Адрес</h3>
                            <p title={invoice.address}>
                                {truncateAddress(invoice.address)}
                            </p>
                        </IonLabel>
                    </IonItem>

                    {/* Телефон */}
                    <IonItem lines="none" className="invoice-card__item">
                        <IonIcon icon={callOutline} slot="start" color="medium" />
                        <IonLabel>
                            <h3>Телефон</h3>
                            <p>{formatPhone(invoice.phone)}</p>
                        </IonLabel>
                        <IonButton
                            fill="clear"
                            size="small"
                            className="phone-button"
                            onClick={handlePhoneClick}
                            color="primary"
                        >
                            <IonIcon icon={callOutline} />
                        </IonButton>
                    </IonItem>

                    {/* Вид услуги */}
                    {invoice.service && (
                        <IonItem lines="none" className="invoice-card__item">
                            <IonLabel>
                                <h3>Услуга</h3>
                                <p>{invoice.service}</p>
                            </IonLabel>
                        </IonItem>
                    )}
                </div>

                {/* Футер с информацией о сроках */}
                <div className="invoice-card__footer">
                    <div className="invoice-card__term">
                        <IonText color={status.color}>
                            <small>
                                <strong>Выполнить до:</strong> {formatDate(invoice.term)}
                            </small>
                        </IonText>
                    </div>
                    
                    <div className="invoice-card__line">
                        <IonText color="medium">
                            <small>№ {invoice.lineno}</small>
                        </IonText>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default InvoiceCard;