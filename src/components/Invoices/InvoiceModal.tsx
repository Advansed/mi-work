import React, { useState } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonChip
} from '@ionic/react';
import {
    closeOutline,
    personOutline,
    locationOutline,
    callOutline,
    documentTextOutline,
    timeOutline,
    cashOutline,
    informationCircleOutline,
    checkboxOutline
} from 'ionicons/icons';
import PrintableActOrder from '../Acts/PrintableActOrder';
import PrintableActForm from '../Acts/PrintableActForm';
import './InvoiceModal.css';

interface InvoiceModalProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, isOpen, onClose }) => {
    const [showActOrder, setShowActOrder] = useState(false);
    const [showActForm, setShowActForm] = useState(false);

    if (!invoice) return null;

    // Показать акт-наряд
    const handleShowActOrder = () => {
        setShowActOrder(true);
        setShowActForm(false);
    };

    // Показать акт выполненных работ
    const handleShowActForm = () => {
        setShowActForm(true);
        setShowActOrder(false);
    };

    // Вернуться к заявке из акт-наряда
    const handleBackToInvoice = () => {
        setShowActOrder(false);
        setShowActForm(false);
    };

    // Закрыть модальное окно
    const handleClose = () => {
        setShowActOrder(false);
        setShowActForm(false);
        onClose();
    };

    // Получить цвет статуса
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'выполнен':
                return 'success';
            case 'в работе':
                return 'warning';
            case 'отменен':
                return 'danger';
            default:
                return 'medium';
        }
    };

    // Получить цвет приоритета
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'высокий':
                return 'danger';
            case 'средний':
                return 'warning';
            case 'низкий':
                return 'success';
            default:
                return 'medium';
        }
    };

    // Форматирование даты
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Форматирование времени
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Подготовка данных для печатной формы акта-наряда
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
            date: new Date().toISOString(),
            representative: {
                name: '',
                position: 'Слесарь',
                reason: 'плановое техническое обслуживание'
            },
            order: {
                equipment: invoice.service || 'газовое оборудование',
                apartment: apartment,
                house: house,
                street: street,
                subscriber: '', // ФИО абонента - нужно добавить в данные заявки
                orderGiver: {
                    name: '',
                    position: 'Мастер'
                },
                orderReceiver: {
                    name: '',
                    position: 'Слесарь'
                }
            },
            execution: {
                executor: '',
                executionDate: new Date().toISOString(),
                executionTime: '',
                disconnectedEquipment: ''
            },
            reconnection: {
                reconnectionDate: '',
                reconnectionBy: '',
                reconnectionOrder: '',
                subscriber: ''
            }
        };
    };

    // Подготовка данных для печатной формы акта выполненных работ
    const prepareActFormData = () => {
        // Извлекаем компоненты адреса из строки адреса
        const addressParts = invoice.address.split(',').map(part => part.trim());
        
        // Пытаемся извлечь улицу, дом, квартиру из адреса
        let street = '';
        let house = '';
        let apartment = '';
        
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

        // Создаем список услуг
        const services = [
            {
                id: '1',
                name: invoice.service || 'Техническое обслуживание газового оборудования',
                unit: 'усл.',
                quantity: 1,
                price: invoice.amount || 0,
                total: invoice.amount || 0
            }
        ];

        return {
            actNumber: invoice.number,
            date: new Date().toISOString(),
            customer: {
                name: '', // ФИО заказчика - нужно добавить в данные заявки
                address: invoice.address,
                apartment: apartment,
                house: house,
                street: street
            },
            executor: {
                name: '', // ФИО исполнителя - заполняется вручную
                position: 'слесарь',
                organization: 'ООО "СахаТрансНефтеГаз"'
            },
            services: services,
            total: invoice.amount || 0,
            workPeriod: {
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString()
            },
            quality: 'отличное',
            notes: invoice.notes || ''
        };
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="invoice-modal">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        {!showActOrder && !showActForm ? `Заявка №${invoice.number}` : 
                         showActOrder ? 'Акт-наряд' : 'Акт выполненных работ'}
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            
            <IonContent>
                {!showActOrder && !showActForm ? (
                    /* Основное содержимое заявки */
                    <div className="invoice-content">
                        {/* Заголовок с номером и статусом */}
                        <IonCard>
                            <IonCardHeader>
                                <div className="invoice-header">
                                    <IonCardTitle>Заявка №{invoice.number}</IonCardTitle>
                                    <div className="status-badges">
                                        <IonBadge color={getStatusColor(invoice.status)}>
                                            {invoice.status}
                                        </IonBadge>
                                        <IonBadge color={getPriorityColor(invoice.priority)}>
                                            {invoice.priority}
                                        </IonBadge>
                                    </div>
                                </div>
                            </IonCardHeader>
                        </IonCard>

                        {/* Информация о клиенте */}
                        <IonCard>
                            <IonCardHeader>
                                <IonCardTitle>
                                    <IonIcon icon={personOutline} />
                                    Информация о клиенте
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <IonItem lines="none">
                                    <IonIcon icon={personOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Клиент</h3>
                                        <p>{invoice.customerName}</p>
                                    </IonLabel>
                                </IonItem>
                                
                                <IonItem lines="none">
                                    <IonIcon icon={locationOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Адрес</h3>
                                        <p>{invoice.address}</p>
                                    </IonLabel>
                                </IonItem>
                                
                                <IonItem lines="none">
                                    <IonIcon icon={callOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Телефон</h3>
                                        <p>{invoice.phone}</p>
                                    </IonLabel>
                                </IonItem>
                            </IonCardContent>
                        </IonCard>

                        {/* Детали заявки */}
                        <IonCard>
                            <IonCardHeader>
                                <IonCardTitle>
                                    <IonIcon icon={documentTextOutline} />
                                    Детали заявки
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <IonItem lines="none">
                                    <IonIcon icon={documentTextOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Услуга</h3>
                                        <p>{invoice.service}</p>
                                    </IonLabel>
                                </IonItem>
                                
                                <IonItem lines="none">
                                    <IonIcon icon={timeOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Дата создания</h3>
                                        <p>{formatDate(invoice.date)} в {formatTime(invoice.date)}</p>
                                    </IonLabel>
                                </IonItem>
                                
                                <IonItem lines="none">
                                    <IonIcon icon={cashOutline} slot="start" />
                                    <IonLabel>
                                        <h3>Сумма</h3>
                                        <p>{invoice.amount.toLocaleString('ru-RU')} ₽</p>
                                    </IonLabel>
                                </IonItem>
                                
                                {invoice.notes && (
                                    <IonItem lines="none">
                                        <IonIcon icon={informationCircleOutline} slot="start" />
                                        <IonLabel>
                                            <h3>Примечания</h3>
                                            <p>{invoice.notes}</p>
                                        </IonLabel>
                                    </IonItem>
                                )}
                            </IonCardContent>
                        </IonCard>

                        {/* Действия */}
                        <div className="invoice-actions">
                            <IonButton 
                                expand="block" 
                                fill="outline"
                                onClick={handleShowActOrder}
                            >
                                <IonIcon icon={documentTextOutline} slot="start" />
                                Создать акт-наряд
                            </IonButton>
                            
                            <IonButton 
                                expand="block" 
                                fill="outline"
                                onClick={handleShowActForm}
                                color="secondary"
                            >
                                <IonIcon icon={checkboxOutline} slot="start" />
                                Создать акт выполненных работ
                            </IonButton>
                            
                            <IonButton 
                                expand="block" 
                                fill="clear"
                                onClick={onClose}
                            >
                                <IonIcon icon={closeOutline} slot="start" />
                                Закрыть
                            </IonButton>
                        </div>
                    </div>
                ) : showActOrder ? (
                    /* Печатная форма акта-наряда */
                    <PrintableActOrder 
                        data={prepareActData()}
                        onBack={handleBackToInvoice}
                        isModal={true}
                    />
                ) : (
                    /* Печатная форма акта выполненных работ */
                    <PrintableActForm 
                        data={prepareActFormData()}
                        onBack={handleBackToInvoice}
                        isModal={true}
                    />
                )}
            </IonContent>
        </IonModal>
    );
};

export default InvoiceModal;