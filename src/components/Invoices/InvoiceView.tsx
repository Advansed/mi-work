import React from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonList } from '@ionic/react';
import { callOutline, locationOutline, timeOutline, documentOutline, printOutline, codeWorkingOutline } from 'ionicons/icons';
import { Invoice, InvoiceStatus } from './types';
import './Invoices.css';

interface InvoiceViewProps {
    invoice: Invoice;
    invoiceStatus: InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
    onNavigateToActs: () => void;
    onNavigateToPrint: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
    invoice,
    invoiceStatus,
    formatDate,
    formatPhone,
    onNavigateToActs,
    onNavigateToPrint
}) => {
    const handleCall = () => {
        if (invoice.phone) {
            window.open(`tel:${invoice.phone}`);
        }
    };

    return (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <h2 className="invoice-page-title">Заявка #{invoice.number}</h2>
                <p className="invoice-page-subtitle">{formatDate(invoice.date)}</p>
            </div>

            <div className="invoice-page-content scroll">
                {/* Статус заявки */}

                {/* Основная информация */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Информация о заявке</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <IonItem >
                                <IonIcon icon={ codeWorkingOutline } slot="start" />
                                <IonLabel>
                                    <h3>Статус</h3>
                                    <IonChip color={invoiceStatus.color} >
                                        <IonLabel>{invoiceStatus.label}</IonLabel>
                                    </IonChip>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonIcon icon={locationOutline} slot="start" />
                                <IonLabel>
                                    <h3>Адрес</h3>
                                    <p>{invoice.address}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem button onClick={handleCall}>
                                <IonIcon icon={callOutline} slot="start" />
                                <IonLabel>
                                    <h3>Телефон</h3>
                                    <p>{formatPhone(invoice.phone)}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={timeOutline} slot="start" />
                                <IonLabel>
                                    <h3>Срок выполнения</h3>
                                    <p>{formatDate(invoice.term_begin)} - {formatDate(invoice.term_end)}</p>
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

                {/* Действия */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Действия</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <IonButton 
                                expand="block" 
                                fill="solid"
                                onClick={onNavigateToActs}
                            >
                                <IonIcon icon={documentOutline} slot="start" />
                                Акты и документы
                            </IonButton>

                            <IonButton 
                                expand="block" 
                                fill="solid"
                                onClick={onNavigateToPrint}
                            >
                                <IonIcon icon={printOutline} slot="start" />
                                Печатные формы
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>
            </div>
        </div>
    );
};