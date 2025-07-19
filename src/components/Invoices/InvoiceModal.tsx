import React, { useState } from 'react';
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
    printOutline,
    arrowBackOutline
} from 'ionicons/icons';
import { Invoice, InvoiceStatus } from './types';
import { ActOrderForm } from '../Acts';
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

type ModalView = 'invoice' | 'act';

const InvoiceModal: React.FC<InvoiceModalProps> = ({
    isOpen,
    invoice,
    status,
    onDismiss,
    onPhoneClick,
    formatDate,
    formatPhone
}) => {
    const [currentView, setCurrentView] = useState<ModalView>('invoice');

    if (!invoice || !status) {
        return null;
    }

    // Сброс вида при закрытии модального окна
    const handleDismiss = () => {
        setCurrentView('invoice');
        onDismiss();
    };

    const handlePhoneClick = () => {
        onPhoneClick(invoice.phone);
    };

    const handleShowAct = () => {
        setCurrentView('act');
    };

    const handleBackToInvoice = () => {
        setCurrentView('invoice');
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

    // Подготовка данных для актa-наряда
    const prepareActData = () => {
        // Извлекаем компоненты адреса из строки адреса
        const addressParts = invoice.address.split(',').map(part => part.trim());
        
        // Пытаемся извлечь улицу, дом, квартиру из адреса
        let street = '';
        let house = '';
        let apartment = '';
        
        // Простой парсинг адреса (можно улучшить в зависимости от формата)
        addressParts.forEach(part => {
            if (part.includes('ул.') || part.includes('улица')) {
                street = part.replace(/ул\.|улица/gi, '').trim();
            } else if (part.includes('д.') || part.includes('дом')) {
                house = part.replace(/д\.|дом/gi, '').trim();
            } else if (part.includes('кв.') || part.includes('квартира')) {
                apartment = part.replace(/кв\.|квартира/gi, '').trim();
            }
        });

        // Если не удалось распарсить, используем весь адрес как улицу
        if (!street && !house) {
            street = invoice.address;
        }

        return {
            actNumber: invoice.number,
            date: new Date().toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).split('.')[0], // только день
            street: street,
            house: house,
            apartment: apartment,
            subscriber: '', // ФИО абонента - нужно добавить в данные заявки
            equipment: invoice.service || 'газовое оборудование',
            reason: 'плановое техническое обслуживание'
        };
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleDismiss} className="invoice-modal-compact">
            <IonHeader>
                <IonToolbar className="modal-header-compact">
                    <IonTitle className="modal-title-compact">
                        <div className="modal-title-content">
                            <IonIcon 
                                icon={currentView === 'act' ? printOutline : businessOutline} 
                                className="modal-title-icon" 
                            />
                            <span>
                                {currentView === 'act' 
                                    ? `Акт-наряд № ${invoice.number}`
                                    : `Заявка № ${invoice.number}`
                                }
                            </span>
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        {currentView === 'act' && (
                            <IonButton onClick={handleBackToInvoice} className="modal-close-btn">
                                <IonIcon icon={arrowBackOutline} />
                            </IonButton>
                        )}
                        <IonButton onClick={handleDismiss} className="modal-close-btn">
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="modal-content-compact">
                {currentView === 'invoice' ? (
                    /* Просмотр заявки */
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
                                            {formatDateFull(invoice.term_end)}
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
                                            {invoice.lineno} • {formatDateFull(invoice.term_begin)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопки действий */}
                            <div className="invoice-actions-section">
                                <IonButton
                                    expand="block"
                                    onClick={handleShowAct}
                                    className="action-button-call"
                                    size="default"
                                >
                                    <IonIcon icon={printOutline} slot="start" />
                                    Создать акт-наряд
                                </IonButton>

                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={handleDismiss}
                                    className="action-button-close"
                                    size="default"
                                >
                                    <IonIcon icon={close} slot="start" />
                                    Закрыть
                                </IonButton>
                            </div>
                        </IonCardContent>
                    </IonCard>
                ) : (
                    /* Форма акта-наряда */
                    <ActOrderForm 
                        initialData={prepareActData()}
                        onBack={handleBackToInvoice}
                        isModal={true}
                    />
                )}
            </IonContent>
        </IonModal>
    );
};

export default InvoiceModal;