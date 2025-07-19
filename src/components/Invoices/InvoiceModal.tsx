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
    IonBadge,
    IonCard,
    IonCardContent
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
    businessOutline,
    printOutline
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
//        onPhoneClick(invoice.phone);
        
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
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="invoice-modal-compact">
            <IonHeader>
                <IonToolbar className="modal-header-compact">
                    <IonTitle className="modal-title-compact">
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

            <IonContent className="modal-content-compact">
                {/* Основная информационная карточка */}
                <IonCard className="invoice-info-card">
                    <IonCardContent className="invoice-info-content">
                        {/* Заголовок с номером и статусом */}
                        <div className="invoice-header-section">
                            <div className="invoice-number">
                                <IonIcon icon={getStatusIcon()} className="status-icon" />
                                <span>Заявка № {invoice.number}</span>
                            </div>
                            <IonBadge color={status.color} className="status-badge-compact">
                                {status.label}
                            </IonBadge>
                        </div>

                        {/* Основная информация */}
                        <div className="invoice-details-section">
                            <div className="detail-item">
                                <div className="detail-icon">
                                    <IonIcon icon={locationOutline} />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Адрес</span>
                                    <span className="detail-value">{invoice.address}</span>
                                </div>
                            </div>

                            <div className="detail-item clickable" onClick={handlePhoneClick}>
                                <div className="detail-icon phone-icon">
                                    <IonIcon icon={callOutline} />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Телефон</span>
                                    <span className="detail-value phone-value">{formatPhone(invoice.phone)}</span>
                                </div>
                            </div>

                            {invoice.service && (
                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <IonIcon icon={informationCircleOutline} />
                                    </div>
                                    <div className="detail-content">
                                        <span className="detail-label">Услуга</span>
                                        <span className="detail-value">{invoice.service}</span>
                                    </div>
                                </div>
                            )}

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <IonIcon icon={calendarOutline} />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Срок выполнения</span>
                                    <span className={`detail-value term-${status.type}`}>
                                        {formatDateFull(invoice.term)}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <IonIcon icon={documentTextOutline} />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Линия / Дата создания</span>
                                    <span className="detail-value">
                                        {invoice.lineno} • {formatDateFull(invoice.date)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="invoice-actions-section">
                            <IonButton
                                expand="block"
                                onClick={handlePhoneClick}
                                className="action-button-call"
                                size="default"
                            >
                                <IonIcon icon={ printOutline } slot="start" />
                                Акт
                            </IonButton>

                            <IonButton
                                expand="block"
                                fill="outline"
                                onClick={onDismiss}
                                className="action-button-close"
                                size="default"
                            >
                                <IonIcon icon={close} slot="start" />
                                Закрыть
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonModal>
    );
};

export default InvoiceModal;