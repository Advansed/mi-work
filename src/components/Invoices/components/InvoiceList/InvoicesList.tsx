import React, { useCallback } from 'react';
import { 
    IonButton, 
    IonRefresher, 
    IonRefresherContent, 
    IonText,
    IonAlert
} from '@ionic/react';
import { InvoicesListProps } from '../../types';
import { InvoiceItem } from './InvoiceItem';
import './InvoiceList.css';

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
    const handleRefresh = useCallback(async (event: CustomEvent) => {
        await onRefresh();
        event.detail.complete();
    }, [onRefresh]);

    const handleInvoiceSelect = useCallback((invoiceId: string) => {
        onInvoiceSelect(invoiceId);
    }, [onInvoiceSelect]);

    const handleCall = useCallback((phone: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (phone) {
            window.open(`tel:${phone}`);
        }
    }, []);

    return (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <h2 className="invoice-page-title">Заявки</h2>
                <p className="invoice-page-subtitle">Всего: {invoices.length}</p>
            </div>

            <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                <IonRefresherContent />
            </IonRefresher>

            <div className="invoice-page-content">
                {loading && !refreshing ? (
                    <div className="loading-state">
                        <IonText color="medium">Загрузка заявок...</IonText>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="empty-state">
                        <IonText color="medium">Нет заявок</IonText>
                        <IonButton fill="clear" onClick={onRefresh}>
                            Обновить
                        </IonButton>
                    </div>
                ) : (
                    <div className="invoices-list">
                        {invoices.map(invoice => (
                            <InvoiceItem
                                key={invoice.id}
                                invoice={invoice}
                                status={getInvoiceStatus(invoice)}
                                onSelect={handleInvoiceSelect}
                                onCall={handleCall}
                                formatDate={formatDate}
                                formatPhone={formatPhone}
                            />
                        ))}
                    </div>
                )}
            </div>

            <IonAlert
                isOpen={!!error}
                onDidDismiss={onClearError}
                header="Ошибка"
                message={error || ''}
                buttons={[
                    {
                        text: 'Повторить',
                        handler: onRefresh
                    },
                    {
                        text: 'Закрыть',
                        role: 'cancel'
                    }
                ]}
            />
        </div>
    );
};

export default React.memo(InvoicesList);