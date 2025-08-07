import React, { useEffect } from 'react';
import { useInvoices } from '../useInvoices';
import { InvoicesBreadcrumb } from './InvoicesBreadcrumb';
import { InvoicesList } from './InvoiceList/InvoicesList';
import { InvoiceView } from './InvoiceView';
import { InvoiceActs } from './InvoiceActs';
import { InvoicePrintForm } from './InvoicePrintForm';
import { getData, Store } from '../../Store';

const InvoicesPage: React.FC = () => {
    const {
        invoices,
        loading,
        refreshing,
        error,
        navigation,
        selectedInvoice,
        refreshInvoices,
        clearError,
        getInvoiceStatus,
        formatDate,
        formatPhone,
        navigateToPosition,
        goBack,
        selectInvoice
    } = useInvoices();

    useEffect(() => {
        if (navigation.position === 1 && !selectedInvoice) {
            navigateToPosition(0);
        }
    }, [navigation.position, selectedInvoice, navigateToPosition]);


    const handleUpdateAddress = async (invoiceId: string, newAddress: string): Promise<{success: boolean, message?: string}> => {
        try {
            const params = {
                token:          Store.getState().login.token,
                invoice_id:     invoiceId,
                address:        newAddress
            }
            
            const result = await getData('invoice_address', params );
            
            if ( result.success ) {
                invoices.forEach(elem => {
                    if(elem.id === invoiceId) elem.address = newAddress;
                });

                return result
            }
            
            return {
            success: false,
            message: 'No response from database'
            };
            
        } catch (error) {
            return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    };

    const renderCurrentPage = () => {
        switch (navigation.position) {
            
            case 0:
                return (
                    <InvoicesList
                        invoices                = { invoices }
                        loading                 = { loading }
                        refreshing              = { refreshing }
                        error                   = { error }
                        onRefresh               = { refreshInvoices }
                        onClearError            = { clearError }
                        onInvoiceSelect         = { selectInvoice }
                        getInvoiceStatus        = { getInvoiceStatus }
                        formatDate              = { formatDate }
                        formatPhone             = { formatPhone }
                    />
                );

            case 1:
                if (!selectedInvoice) {
                    return <div>Загрузка...</div>; // ✅ Заменить на это
                }
                return (
                    <InvoiceView
                        invoice={selectedInvoice}
                        invoiceStatus={getInvoiceStatus(selectedInvoice)}
                        formatDate={formatDate}
                        formatPhone={formatPhone}
                        onNavigateToActs={() => navigateToPosition(2)}
                        onNavigateToPrint={() => navigateToPosition(3)}
                        onUpdateAddress={  handleUpdateAddress }
                    />
                );

            case 2:
                if (!selectedInvoice) {
                    navigateToPosition(0);
                    return null;
                }
                return <InvoiceActs invoice={selectedInvoice} />;

            case 3:
                if (!selectedInvoice) {
                    navigateToPosition(0);
                    return null;
                }
                return (
                    <InvoicePrintForm
                        invoice={selectedInvoice}
                        formatDate={formatDate}
                        formatPhone={formatPhone}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="invoices-page">
            <InvoicesBreadcrumb
                currentPosition={navigation.position}
                selectedInvoiceId={navigation.selectedInvoiceId}
                canGoBack={navigation.canGoBack}
                onNavigate={navigateToPosition}
                onGoBack={goBack}
            />
            {renderCurrentPage()}
        </div>
    );
};

export default InvoicesPage;