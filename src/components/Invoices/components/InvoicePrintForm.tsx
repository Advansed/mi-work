import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonLabel, IonList, IonToast } from '@ionic/react';
import { printOutline, qrCodeOutline, shareOutline, documentTextOutline } from 'ionicons/icons';
import { Invoice } from '../types';
import './Invoices.css';

interface InvoicePrintFormProps {
    invoice: Invoice;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
}

export const InvoicePrintForm: React.FC<InvoicePrintFormProps> = ({
    invoice,
    formatDate,
    formatPhone
}) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handlePrint = (formType: string) => {
        setToastMessage(`Печать: ${formType}`);
        setShowToast(true);
    };

    const handleGenerateQR = () => {
        setToastMessage('QR-код для оплаты сгенерирован');
        setShowToast(true);
    };

    const handleShare = (formType: string) => {
        setToastMessage(`Отправка: ${formType}`);
        setShowToast(true);
    };

    const printForms = [
        {
            id: 'work_order',
            name: 'Наряд на выполнение работ',
            description: 'Документ для исполнителя работ'
        },
        {
            id: 'payment_receipt',
            name: 'Квитанция об оплате',
            description: 'Документ с QR-кодом для оплаты'
        },
        {
            id: 'completion_act',
            name: 'Акт выполненных работ',
            description: 'Подтверждение выполнения услуг'
        },
        {
            id: 'prescription',
            name: 'Предписание',
            description: 'Документ с требованиями к абоненту'
        }
    ];

    return (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <h2 className="invoice-page-title">Печатные формы</h2>
                <p className="invoice-page-subtitle">Заявка #{invoice.number}</p>
            </div>

            <div className="invoice-page-content">
                {/* Информация для печати */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Данные заявки</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <IonItem>
                                <IonLabel>
                                    <h3>Номер заявки</h3>
                                    <p>#{invoice.number}</p>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <h3>Адрес</h3>
                                    <p>{invoice.address}</p>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <h3>Телефон</h3>
                                    <p>{formatPhone(invoice.phone)}</p>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <h3>Услуга</h3>
                                    <p>{invoice.service}</p>
                                </IonLabel>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>

                {/* QR-код для оплаты */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Оплата услуг</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ 
                                width: '150px', 
                                height: '150px', 
                                border: '2px solid var(--ion-color-medium)',
                                margin: '0 auto 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px'
                            }}>
                                <IonIcon 
                                    icon={qrCodeOutline} 
                                    style={{ fontSize: '80px', color: 'var(--ion-color-medium)' }}
                                />
                            </div>
                            <p>QR-код для оплаты услуг</p>
                            <IonButton 
                                expand="block" 
                                onClick={handleGenerateQR}
                            >
                                Сгенерировать QR-код
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Доступные формы */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Доступные формы</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            {printForms.map(form => (
                                <IonItem key={form.id}>
                                    <IonIcon icon={documentTextOutline} slot="start" />
                                    <IonLabel>
                                        <h3>{form.name}</h3>
                                        <p>{form.description}</p>
                                    </IonLabel>
                                    <div slot="end" style={{ display: 'flex', gap: '8px' }}>
                                        <IonButton 
                                            fill="clear" 
                                            onClick={() => handlePrint(form.name)}
                                        >
                                            <IonIcon icon={printOutline} slot="icon-only" />
                                        </IonButton>
                                        <IonButton 
                                            fill="clear"
                                            onClick={() => handleShare(form.name)}
                                        >
                                            <IonIcon icon={shareOutline} slot="icon-only" />
                                        </IonButton>
                                    </div>
                                </IonItem>
                            ))}
                        </IonList>
                    </IonCardContent>
                </IonCard>
            </div>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={2000}
            />
        </div>
    );
};