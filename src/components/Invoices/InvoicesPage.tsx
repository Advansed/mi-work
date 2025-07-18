import React, { useState } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonList,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonText,
    IonCard,
    IonCardContent,
    IonSkeletonText,
    IonItem,
    IonLabel,
    RefresherEventDetail
} from '@ionic/react';
import {
    refreshOutline,
    documentTextOutline,
    callOutline,
    alertCircleOutline
} from 'ionicons/icons';
import { useInvoices } from './useInvoices';
import InvoiceCard from './InvoiceCard';
import InvoiceModal from './InvoiceModal';
import InvoiceFiltersComponent from './InvoiceFilters';
import { Invoice } from './types';
import './Invoices.css';

const InvoicesPage: React.FC = () => {
    const {
        filteredInvoices,
        loading,
        refreshing,
        error,
        filters,
        loadInvoices,
        refreshInvoices,
        setFilters,
        clearError,
        getInvoiceStatus,
        formatDate,
        formatPhone
    } = useInvoices();

    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Обработчик поиска
    const handleSearch = (event: CustomEvent) => {
        const query = event.detail.value;
        setFilters({ search: query });
    };

    // Обработчик refresh
    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await refreshInvoices();
        event.detail.complete();
    };

    // Открытие модального окна
    const handleCardClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    // Закрытие модального окна
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedInvoice(null);
    };

    // Звонок клиенту
    const handlePhoneClick = (phone: string) => {
        if (phone) {
            window.open(`tel:${phone}`, '_self');
        }
    };

    // Повторная загрузка при ошибке
    const handleRetry = () => {
        clearError();
        loadInvoices();
    };

    // Рендер скелетона загрузки
    const renderSkeleton = () => (
        <div className="invoices-skeleton">
            {[1, 2, 3, 4, 5].map((item) => (
                <IonCard key={item}>
                    <IonCardContent>
                        <IonSkeletonText animated style={{ width: '60%', height: '20px' }} />
                        <IonSkeletonText animated style={{ width: '40%', height: '16px', marginTop: '10px' }} />
                        <IonSkeletonText animated style={{ width: '80%', height: '16px', marginTop: '5px' }} />
                        <IonSkeletonText animated style={{ width: '50%', height: '16px', marginTop: '5px' }} />
                    </IonCardContent>
                </IonCard>
            ))}
        </div>
    );

    // Рендер ошибки
    const renderError = () => (
        <div className="invoices-error">
            <IonCard>
                <IonCardContent className="error-content">
                    <IonIcon icon={alertCircleOutline} className="error-icon" />
                    <h2>Ошибка загрузки</h2>
                    <p>{error}</p>
                    <IonButton
                        expand="block"
                        fill="outline"
                        onClick={handleRetry}
                    >
                        <IonIcon icon={refreshOutline} slot="start" />
                        Повторить
                    </IonButton>
                </IonCardContent>
            </IonCard>
        </div>
    );

    // Рендер пустого списка
    const renderEmpty = () => (
        <div className="invoices-empty">
            <IonCard>
                <IonCardContent className="empty-content">
                    <IonIcon icon={documentTextOutline} className="empty-icon" />
                    <h2>Заявок не найдено</h2>
                    <p>
                        {filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo
                            ? 'Попробуйте изменить параметры поиска или фильтры'
                            : 'Новые заявки появятся здесь'
                        }
                    </p>
                    <IonButton
                        expand="block"
                        fill="outline"
                        onClick={() => setFilters({ search: '', status: 'all', dateFrom: undefined, dateTo: undefined })}
                    >
                        Сбросить фильтры
                    </IonButton>
                </IonCardContent>
            </IonCard>
        </div>
    );

    return (
        <IonPage className="invoices-page">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Заявки</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={loadInvoices} disabled={loading}>
                            <IonIcon icon={refreshOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Заявки</IonTitle>
                    </IonToolbar>
                </IonHeader>

                {/* Refresher */}
                <IonRefresher
                    slot="fixed"
                    onIonRefresh={handleRefresh}
                    disabled={loading}
                >
                    <IonRefresherContent />
                </IonRefresher>

                {/* Поиск */}
                <div className="search-container">
                    <IonSearchbar
                        value={filters.search}
                        onIonInput={handleSearch}
                        placeholder="Поиск по номеру заявки или адресу"
                        showClearButton="focus"
                        disabled={loading}
                    />
                </div>

                {/* Фильтры */}
                {/* <div className="filters-container">
                    <InvoiceFiltersComponent
                        filters={filters}
                        onFiltersChange={setFilters}
                        totalCount={filteredInvoices.length}
                        filteredCount={filteredInvoices.length}
                    />
                </div> */}

                {/* Контент */}
                <div className="invoices-content">
                    {loading && !refreshing ? (
                        renderSkeleton()
                    ) : error ? (
                        renderError()
                    ) : filteredInvoices.length === 0 ? (
                        renderEmpty()
                    ) : (
                        <IonList className="invoices-list">
                            {filteredInvoices.map((invoice) => (
                                <InvoiceCard
                                    key={invoice.id}
                                    invoice={invoice}
                                    status={getInvoiceStatus(invoice)}
                                    onCardClick={handleCardClick}
                                    onPhoneClick={handlePhoneClick}
                                    formatDate={formatDate}
                                    formatPhone={formatPhone}
                                />
                            ))}
                        </IonList>
                    )}
                </div>

                {/* Модальное окно */}
                <InvoiceModal
                    isOpen={isModalOpen}
                    invoice={selectedInvoice}
                    status={selectedInvoice ? getInvoiceStatus(selectedInvoice) : null}
                    onDismiss={handleModalClose}
                    onPhoneClick={handlePhoneClick}
                    formatDate={formatDate}
                    formatPhone={formatPhone}
                />
            </IonContent>
        </IonPage>
    );
};

export default InvoicesPage;