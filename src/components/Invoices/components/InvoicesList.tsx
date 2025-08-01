import React from 'react';
import { 
    IonButton, 
    IonCard, 
    IonChip, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonRefresher, 
    IonRefresherContent, 
    IonText,
    IonAlert
} from '@ionic/react';
import { callOutline, locationOutline, timeOutline, chevronForwardOutline } from 'ionicons/icons';
import { InvoicesListProps } from '../types';
import './Invoices.css';

export const InvoicesList: React.FC<InvoicesListProps> = ({
    invoices,
    loading,
    refreshing,
    error,
    onRefresh,
    onClearError,
    onInvoiceSelect,
    getInvoiceStatus,
    formatDate,
    formatPhone
}) => {
    const handleRefresh = async (event: CustomEvent) => {
        await onRefresh();
        event.detail.complete();
    };

    const handleCall = (phone: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (phone) {
            window.open(`tel:${phone}`);
        }
    };

    return (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <h2 className="invoice-page-title">Заявки</h2>
                <p className="invoice-page-subtitle">Всего: {invoices.length}</p>
            </div>

            <IonRefresher slot="fixed" onIonRefresh={ handleRefresh }>
                <IonRefresherContent />
            </IonRefresher>

            {/* Список заявок */}
            <div className="invoice-page-content">
                {loading && !refreshing ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <IonText color="medium">Загрузка заявок...</IonText>
                    </div>
                ) : invoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                    </div>
                ) : (
                    <IonList>
                        {invoices.map(invoice => {
                            const status = getInvoiceStatus(invoice);
                            return (
                                <IonCard key={invoice.id} style={{ margin: '8px 16px' }}>
                                    <IonItem 
                                        button 
                                        onClick={() => onInvoiceSelect(invoice.id)}
                                        style={{ '--inner-padding-end': '8px' }}
                                    >
                                        <div slot="start" style={{ marginRight: '12px' }}>
                                            <IonChip color={status.color} >
                                                { status.text }
                                            </IonChip>
                                        </div>

                                        <IonLabel>
                                            <h2>
                                                <strong>#{invoice.number}</strong>
                                                <IonText color="medium" style={{ marginLeft: '8px', fontSize: '14px' }}>
                                                    {formatDate(invoice.date)}
                                                </IonText>
                                            </h2>
                                            
                                            <div style={{ margin: '4px 0' }}>
                                                <IonIcon icon={locationOutline} style={{ fontSize: '14px', marginRight: '6px' }} />
                                                <span style={{ fontSize: '14px' }}>{invoice.address}</span>
                                            </div>

                                            <div style={{ margin: '4px 0' }}>
                                                <IonIcon icon={timeOutline} style={{ fontSize: '14px', marginRight: '6px' }} />
                                                <span style={{ fontSize: '14px' }}>
                                                    {formatDate(invoice.term_begin)} - {formatDate(invoice.term_end)}
                                                </span>
                                            </div>

                                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--ion-color-medium)' }}>
                                                {invoice.service}
                                            </p>
                                        </IonLabel>

                                        <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <IonButton
                                                fill="clear"
                                                size="small"
                                                onClick={(e) => handleCall(invoice.phone, e)}
                                            >
                                                <IonIcon icon={callOutline} slot="icon-only" />
                                            </IonButton>
                                            <IonIcon icon={chevronForwardOutline} color="medium" />
                                        </div>
                                    </IonItem>
                                </IonCard>
                            );
                        })}
                    </IonList>
                )}
            </div>

            {/* Алерт для ошибок */}
            <IonAlert
                isOpen={!!error}
                onDidDismiss={onClearError}
                header="Ошибка"
                message={error || ''}
                buttons={['OK']}
            />
        </div>
    );
};