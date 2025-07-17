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
    checkmarkCircleOutline
} from 'ionicons/icons';
import { Invoice, InvoiceStatus } from './types';

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
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Заявка № {invoice.number}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onDismiss}>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="invoice-modal">
                {/* Статус заявки */}
                <IonCard className={`status-card status-card--${status.type}`}>
                    <IonCardContent>
                        <div className="status-content">
                            <IonIcon icon={getStatusIcon()} className="status-icon" />
                            <div className="status-info">
                                <h2>{status.label}</h2>
                                <p>Статус заявки № {invoice.number}</p>
                            </div>
                            <IonBadge color={status.color} className="status-badge">
                                {status.label}
                            </IonBadge>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Основная информация */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>
                            <IonIcon icon={informationCircleOutline} />
                            Основная информация
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <IonItem>
                                <IonIcon icon={documentTextOutline} slot="start" />
                                <IonLabel>
                                    <h3>Номер заявки</h3>
                                    <p>{invoice.number}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={documentTextOutline} slot="start" />
                                <IonLabel>
                                    <h3>Номер строки</h3>
                                    <p>{invoice.lineno}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={timeOutline} slot="start" />
                                <IonLabel>
                                    <h3>Дата создания</h3>
                                    <p>{formatDateFull(invoice.date)}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={locationOutline} slot="start" />
                                <IonLabel>
                                    <h3>Адрес</h3>
                                    <p>{invoice.address}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem button onClick={handlePhoneClick}>
                                <IonIcon icon={callOutline} slot="start" />
                                <IonLabel>
                                    <h3>Телефон</h3>
                                    <p>{formatPhone(invoice.phone)}</p>
                                </IonLabel>
                                <IonButton fill="clear" slot="end">
                                    <IonIcon icon={callOutline} />
                                </IonButton>
                            </IonItem>

                            {invoice.service && (
                                <IonItem>
                                    <IonIcon icon={informationCircleOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Вид услуги</h3>
                                        <p>{invoice.service}</p>
                                    </IonLabel>
                                </IonItem>
                            )}
                        </IonList>
                    </IonCardContent>
                </IonCard>

                {/* Временные рамки */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>
                            <IonIcon icon={calendarOutline} />
                            Временные рамки
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <IonItem>
                                <IonIcon icon={calendarOutline} slot="start" />
                                <IonLabel>
                                    <h3>Срок выполнения</h3>
                                    <IonText color={status.color}>
                                        <p><strong>{formatDateFull(invoice.term)}</strong></p>
                                    </IonText>
                                </IonLabel>
                            </IonItem>

                            {invoice.term_begin && new Date(invoice.term_begin).getFullYear() > 2001 && (
                                <IonItem>
                                    <IonIcon icon={calendarOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Начало периода</h3>
                                        <p>{formatDateFull(invoice.term_begin)}</p>
                                    </IonLabel>
                                </IonItem>
                            )}

                            {invoice.term_end && new Date(invoice.term_end).getFullYear() > 2001 && (
                                <IonItem>
                                    <IonIcon icon={calendarOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Окончание периода</h3>
                                        <p>{formatDateFull(invoice.term_end)}</p>
                                    </IonLabel>
                                </IonItem>
                            )}
                        </IonList>
                    </IonCardContent>
                </IonCard>

                {/* Кнопки действий */}
                <div className="modal-actions">
                    <IonButton
                        expand="block"
                        fill="solid"
                        onClick={handlePhoneClick}
                        className="call-button"
                    >
                        <IonIcon icon={callOutline} slot="start" />
                        Позвонить клиенту
                    </IonButton>

                    <IonButton
                        expand="block"
                        fill="outline"
                        onClick={onDismiss}
                        className="close-button"
                    >
                        Закрыть
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default InvoiceModal;