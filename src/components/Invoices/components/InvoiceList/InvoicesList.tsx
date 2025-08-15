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
import styles from './InvoiceList.module.css';

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
        <div className={styles.invoicePage}>
            <div className={styles.invoicePageHeader}>
                <h2 className={styles.invoicePageTitle}>Заявки</h2>
                <p className={styles.invoicePageSubtitle}>Всего: {invoices.length}</p>
            </div>

            <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                <IonRefresherContent />
            </IonRefresher>

            <div className={styles.invoicePageContent}>
                {loading && !refreshing ? (
                    <div className={styles.loadingState}>
                        <IonText color="medium">Загрузка заявок...</IonText>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className={styles.emptyState}>
                        <IonText color="medium">Нет заявок</IonText>
                        <IonButton fill="clear" onClick={onRefresh}>
                            Обновить
                        </IonButton>
                    </div>
                ) : (
                    <div className={styles.invoicesList}>
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
                buttons={['ОК']}
            />
        </div>
    );
};

export default React.memo(InvoicesList);