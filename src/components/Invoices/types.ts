// ============================================
// ИНТЕРФЕЙСЫ ДЛЯ МОДУЛЯ INVOICES
// ============================================

export interface Invoice {
    id: string;
    lineno: number;
    number: string;
    date: string;
    phone: string;
    address: string;
    service: string;
    term: string;
    term_begin: string;
    term_end: string;
}

export interface InvoiceStatus {
    type: 'overdue' | 'urgent' | 'normal';
    label: string;
    color: 'danger' | 'warning' | 'success';
    priority: number;
}

export interface InvoiceFilters {
    search: string;
    status: 'all' | 'overdue' | 'urgent' | 'normal';
    dateFrom?: string;
    dateTo?: string;
}

export interface InvoicesResponse {
    success: boolean;
    data?: Invoice[];
    message?: string;
}

export interface UseInvoicesReturn {
    invoices: Invoice[];
    filteredInvoices: Invoice[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    filters: InvoiceFilters;
    loadInvoices: () => Promise<void>;
    refreshInvoices: () => Promise<void>;
    setFilters: (filters: Partial<InvoiceFilters>) => void;
    clearError: () => void;
    getInvoiceStatus: (invoice: Invoice) => InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
}