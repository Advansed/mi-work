import React, { useState } from 'react';
import {
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonPopover,
    IonContent,
    IonList,
    IonDatetime,
    IonText,
    IonChip,
    IonRow,
    IonCol
} from '@ionic/react';
import {
    funnelOutline,
    closeOutline,
    calendarOutline,
    checkmarkOutline
} from 'ionicons/icons';
import { InvoiceFilters } from './types';

interface InvoiceFiltersProps {
    filters: InvoiceFilters;
    onFiltersChange: (filters: Partial<InvoiceFilters>) => void;
    totalCount: number;
    filteredCount: number;
}

const InvoiceFiltersComponent: React.FC<InvoiceFiltersProps> = ({
    filters,
    onFiltersChange,
    totalCount,
    filteredCount
}) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const statusOptions = [
        { value: 'all', label: 'Все заявки', color: 'medium' },
        { value: 'overdue', label: 'Просроченные', color: 'danger' },
        { value: 'urgent', label: 'Срочные', color: 'warning' },
        { value: 'normal', label: 'Обычные', color: 'success' }
    ];

    const handleStatusChange = (status: string) => {
        onFiltersChange({ status: status as InvoiceFilters['status'] });
    };

    const handleDateFromChange = (dateValue: string | string[] | null | undefined) => {
        const date = Array.isArray(dateValue) ? dateValue[0] : dateValue;
        onFiltersChange({ dateFrom: date || undefined });
    };

    const handleDateToChange = (dateValue: string | string[] | null | undefined) => {
        const date = Array.isArray(dateValue) ? dateValue[0] : dateValue;
        onFiltersChange({ dateTo: date || undefined });
    };

    const clearFilters = () => {
        onFiltersChange({
            status: 'all',
            dateFrom: undefined,
            dateTo: undefined
        });
        setIsPopoverOpen(false);
    };

    const hasActiveFilters = () => {
        return filters.status !== 'all' || filters.dateFrom || filters.dateTo;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="invoice-filters">
            {/* Быстрые фильтры по статусу */}
            <div className="quick-filters">
                <IonRow>
                    {statusOptions.map((option) => (
                        <IonCol size="3" key={option.value}>
                            <IonChip
                                className={`status-chip ${
                                    filters.status === option.value ? 'status-chip--active' : ''
                                }`}
                                color={filters.status === option.value ? option.color : 'medium'}
                                onClick={() => handleStatusChange(option.value)}
                            >
                                {filters.status === option.value && (
                                    <IonIcon icon={checkmarkOutline} />
                                )}
                                <IonLabel>{option.label}</IonLabel>
                            </IonChip>
                        </IonCol>
                    ))}
                </IonRow>
            </div>

            {/* Кнопка расширенных фильтров */}
            <div className="advanced-filters">
                <IonButton
                    id="filters-trigger"
                    fill="outline"
                    size="small"
                    className={hasActiveFilters() ? 'filters-active' : ''}
                >
                    <IonIcon icon={funnelOutline} slot="start" />
                    Фильтры
                    {hasActiveFilters() && (
                        <IonIcon icon={closeOutline} slot="end" onClick={clearFilters} />
                    )}
                </IonButton>

                {/* Счетчик результатов */}
                <div className="results-counter">
                    <IonText color="medium">
                        <small>
                            {filteredCount === totalCount 
                                ? `${totalCount} заявок`
                                : `${filteredCount} из ${totalCount}`
                            }
                        </small>
                    </IonText>
                </div>
            </div>

            {/* Popover с расширенными фильтрами */}
            <IonPopover
                trigger="filters-trigger"
                isOpen={isPopoverOpen}
                onDidDismiss={() => setIsPopoverOpen(false)}
                showBackdrop={true}
            >
                <IonContent>
                    <div className="advanced-filters-content">
                        <IonList>
                            {/* Фильтр по дате от */}
                            <IonItem>
                                <IonIcon icon={calendarOutline} slot="start" />
                                <IonLabel>
                                    <h3>Дата от</h3>
                                    {filters.dateFrom && (
                                        <p>{formatDate(filters.dateFrom)}</p>
                                    )}
                                </IonLabel>
                                <IonDatetime
                                    presentation="date"
                                    value={filters.dateFrom}
                                    onIonChange={(e) => handleDateFromChange( e.detail.value )}
                                    locale="ru-RU"
                                    slot="end"
                                />
                            </IonItem>

                            {/* Фильтр по дате до */}
                            <IonItem>
                                <IonIcon icon={calendarOutline} slot="start" />
                                <IonLabel>
                                    <h3>Дата до</h3>
                                    {filters.dateTo && (
                                        <p>{formatDate(filters.dateTo)}</p>
                                    )}
                                </IonLabel>
                                <IonDatetime
                                    presentation="date"
                                    value={filters.dateTo}
                                    onIonChange={(e) => handleDateToChange( e.detail.value )}
                                    locale="ru-RU"
                                    slot="end"
                                />
                            </IonItem>
                        </IonList>

                        {/* Кнопки действий */}
                        <div className="filter-actions">
                            <IonButton
                                expand="block"
                                fill="outline"
                                onClick={clearFilters}
                                disabled={!hasActiveFilters()}
                            >
                                Сбросить фильтры
                            </IonButton>
                        </div>
                    </div>
                </IonContent>
            </IonPopover>

            {/* Активные фильтры */}
            {hasActiveFilters() && (
                <div className="active-filters">
                    {filters.dateFrom && (
                        <IonChip color="primary">
                            <IonLabel>От: {formatDate(filters.dateFrom)}</IonLabel>
                            <IonIcon
                                icon={closeOutline}
                                onClick={() => onFiltersChange({ dateFrom: undefined })}
                            />
                        </IonChip>
                    )}
                    
                    {filters.dateTo && (
                        <IonChip color="primary">
                            <IonLabel>До: {formatDate(filters.dateTo)}</IonLabel>
                            <IonIcon
                                icon={closeOutline}
                                onClick={() => onFiltersChange({ dateTo: undefined })}
                            />
                        </IonChip>
                    )}
                </div>
            )}
        </div>
    );
};

export default InvoiceFiltersComponent;