import React from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonBadge,
    IonText,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle
} from '@ionic/react';
import {
    close,
    callOutline,
    timeOutline,
    locationOutline,
    documentTextOutline,
    informationCircleOutline,
    calendarOutline,
    warningOutline,
    checkmarkCircleOutline,
    businessOutline
} from 'ionicons/icons';
import { Invoice, InvoiceStatus } from './types';
import './InvoiceModal.css'

interface InvoiceModalProps {
    isOpen: boolean;
    invoice: Invoice | null;
    status: InvoiceStatus | null;
    onDismiss: () => void;
    onPhoneClick: (phone: string) => void;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
    isOpen,
    invoice,
    status,
    onDismiss,
    onPhoneClick,
    formatDate,
    formatPhone
}) => {
    if (!invoice || !status) {
        return null;
    }

    const handlePhoneClick = () => {
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

    const formatDateFull = (dateString: string): string => {
        if (!dateString) return 'Не указано';
        
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="invoice-modal-corporate">
            <IonHeader>
                <IonToolbar className="modal-header-corporate">
                    <IonTitle className="modal-title-corporate">
                        <div className="modal-title-content">
                            <IonIcon icon={businessOutline} className="modal-title-icon" />
                            <span>Заявка № {invoice.number}</span>
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onDismiss} className="modal-close-btn">
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="modal-content-corporate">
                {/* Заголовочная карточка со статусом - корпоративный стиль */}
                <div className="modal-status-header">
                    <div className="status-header-content">
                        <div className="status-icon-container">
                            <IonIcon icon={getStatusIcon()} className="status-icon-large" />
                        </div>
                        <div className="status-details">
                            <h1>Заявка № {invoice.number}</h1>
                            <div className="status-badge-container">
                                <IonBadge 
                                    color={status.color} 
                                    className="status-badge-large"
                                >
                                    {status.label}
                                </IonBadge>
                            </div>
                            <p className="status-description">
                                Линия: {invoice.lineno} • {formatDateFull(invoice.date)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Основная информация */}
                <IonCard className="info-card-corporate">
                    <IonCardHeader className="card-header-corporate">
                        <IonCardTitle className="card-title-corporate">
                            <IonIcon icon={informationCircleOutline} />
                            Основная информация
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="card-content-corporate">
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-icon">
                                    <IonIcon icon={locationOutline} />
                                </div>
                                <div className="info-content">
                                    <h3>Адрес</h3>
                                    <p>{invoice.address}</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <IonIcon icon={callOutline} />
                                </div>
                                <div className="info-content">
                                    <h3>Контактный телефон</h3>
                                    <p className="phone-clickable" onClick={handlePhoneClick}>
                                        {formatPhone(invoice.phone)}
                                    </p>
                                </div>
                            </div>

                            {invoice.service && (
                                <div className="info-item">
                                    <div className="info-icon">
                                        <IonIcon icon={informationCircleOutline} />
                                    </div>
                                    <div className="info-content">
                                        <h3>Вид услуги</h3>
                                        <p>{invoice.service}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Временные рамки */}
                <IonCard className="info-card-corporate">
                    <IonCardHeader className="card-header-corporate">
                        <IonCardTitle className="card-title-corporate">
                            <IonIcon icon={calendarOutline} />
                            Временные рамки
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="card-content-corporate">
                        <div className="info-grid">
                            <div className="info-item priority">
                                <div className="info-icon">
                                    <IonIcon icon={timeOutline} />
                                </div>
                                <div className="info-content">
                                    <h3>Срок выполнения</h3>
                                    <p className={`term-date term-${status.type}`}>
                                        {formatDateFull(invoice.term)}
                                    </p>
                                </div>
                            </div>

                            {invoice.term_begin && new Date(invoice.term_begin).getFullYear() > 2001 && (
                                <div className="info-item">
                                    <div className="info-icon">
                                        <IonIcon icon={calendarOutline} />
                                    </div>
                                    <div className="info-content">
                                        <h3>Начало периода</h3>
                                        <p>{formatDateFull(invoice.term_begin)}</p>
                                    </div>
                                </div>
                            )}

                            {invoice.term_end && new Date(invoice.term_end).getFullYear() > 2001 && (
                                <div className="info-item">
                                    <div className="info-icon">
                                        <IonIcon icon={calendarOutline} />
                                    </div>
                                    <div className="info-content">
                                        <h3>Окончание периода</h3>
                                        <p>{formatDateFull(invoice.term_end)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Кнопки действий - корпоративный стиль */}
                <div className="modal-actions-corporate">
                    <IonButton
                        expand="block"
                        onClick={handlePhoneClick}
                        className="action-button-primary"
                    >
                        <IonIcon icon={callOutline} slot="start" />
                        Позвонить клиенту
                    </IonButton>

                    <IonButton
                        expand="block"
                        fill="outline"
                        onClick={onDismiss}
                        className="action-button-secondary"
                    >
                        <IonIcon icon={close} slot="start" />
                        Закрыть
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default InvoiceModal;