import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import { InvoicePosition, InvoiceBreadcrumbItem } from '../types';
import './Invoices.css';

interface InvoicesBreadcrumbProps {
    currentPosition: InvoicePosition;
    selectedInvoiceId: string | null;
    canGoBack: boolean;
    onNavigate: (position: InvoicePosition) => void;
    onGoBack: () => void;
}

const BREADCRUMB_LABELS: Record<InvoicePosition, string> = {
    0: 'Список',
    1: 'Заявка', 
    2: 'Акты',
    3: 'Печать'
};

export const InvoicesBreadcrumb: React.FC<InvoicesBreadcrumbProps> = ({
    currentPosition,
    selectedInvoiceId,
    canGoBack,
    onNavigate,
    onGoBack
}) => {
    
    const getBreadcrumbItems = (): InvoiceBreadcrumbItem[] => {
        return [0, 1, 2, 3].map((pos) => ({
            position: pos as InvoicePosition,
            label: BREADCRUMB_LABELS[pos as InvoicePosition],
            active: pos === currentPosition,
            accessible: pos === 0 || (pos <= currentPosition && selectedInvoiceId !== null)
        }));
    };

    const items = getBreadcrumbItems();

    return (
        <div className="invoices-breadcrumb">
            {canGoBack && (
                <IonButton 
                    fill="clear" 
                    size="small"
                    className="breadcrumb-back-btn"
                    onClick={onGoBack}
                >
                    <IonIcon icon={chevronBackOutline} slot="icon-only" />
                </IonButton>
            )}
            
            <div className="breadcrumb-nav">
                {items.map((item, index) => (
                    <React.Fragment key={item.position}>
                        <div 
                            className={`breadcrumb-item ${item.active ? 'active' : ''} ${item.accessible ? 'accessible' : 'disabled'}`}
                            onClick={item.accessible ? () => onNavigate(item.position) : undefined}
                        >
                            <span className="breadcrumb-number">
                                {item.active ? `(${item.position})` : item.position}
                            </span>
                            <span className="breadcrumb-label">{item.label}</span>
                        </div>
                        
                        {index < items.length - 1 && (
                            <span className="breadcrumb-separator">—</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};