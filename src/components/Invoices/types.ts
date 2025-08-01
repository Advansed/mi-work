// src/components/Invoices/types.ts

// ============================================
// ТИПЫ ДЛЯ ОБНОВЛЕНИЯ АДРЕСА
// ============================================

export interface AddressUpdateResult {
    success: boolean;
    message?: string;
}

export interface AddressUpdateRequest {
    invoice_id: string;
    address: string;
}

// ============================================
// ОБНОВЛЕННЫЙ ИНТЕРФЕЙС UseInvoicesReturn
// ============================================

export interface UseInvoicesReturn {
    invoices: Invoice[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    navigation: InvoiceNavigation;
    selectedInvoice: Invoice | null;
    loadInvoices: () => Promise<void>;
    refreshInvoices: () => Promise<void>;
    clearError: () => void;
    getInvoiceStatus: (invoice: Invoice) => InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
    navigateToPosition: (position: InvoicePosition, invoiceId?: string) => void;
    goBack: () => void;
    selectInvoice: (invoiceId: string) => void;
    // updateInvoiceAddress: (invoiceId: string, newAddress: string) => Promise<AddressUpdateResult>; // НОВЫЙ МЕТОД
}

// ============================================
// ОБНОВЛЕННЫЙ ИНТЕРФЕЙС InvoiceViewProps
// ============================================

export interface InvoiceViewProps {
    invoice: Invoice;
    invoiceStatus: InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
    onNavigateToActs: () => void;
    onNavigateToPrint: () => void;
    onUpdateAddress?: (invoiceId: string, newAddress: string) => Promise<AddressUpdateResult>; // НОВЫЙ PROP
}

// ============================================
// ОБНОВЛЕННЫЙ ИНТЕРФЕЙС LicsProps
// ============================================

export interface LicsProps {
    initialAddress?: string;
    invoiceId?: string; // НОВЫЙ PROP - ID заявки
    onAddressChange?: (address: string, isStandardized: boolean) => void;
    onAddressSaved?: (address: string) => Promise<void>; // НОВЫЙ PROP - callback сохранения
    disabled?: boolean; // НОВЫЙ PROP - блокировка интерфейса
}

// ============================================
// СУЩЕСТВУЮЩИЕ ТИПЫ (без изменений)
// ============================================

export interface Lics {
    
    code:   string;
    name:   string;
    plot:   string;
}


export interface Invoice {
    id: string;
    number: string;
    date: string;
    applicant: string;
    phone: string;
    address: string;
    lic: Lics;
    lineno: number;
    service: string;
    term: number;
    term_begin: string;
    term_end: string;
    done: boolean;
}

export interface InvoiceStatus {
    text: string;
    color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
}

export interface InvoicesResponse {
    success: boolean;
    data: Invoice[];
    message?: string;
}

export type InvoicePosition = 0 | 1 | 2 | 3;

export interface InvoiceNavigation {
    position: InvoicePosition;
    selectedInvoiceId: string | null;
    canGoBack: boolean;
}

export interface InvoiceBreadcrumbItem {
    position: InvoicePosition;
    label: string;
    active: boolean;
    accessible: boolean;
}

export interface InvoicesListProps {
    invoices: Invoice[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    onRefresh: () => Promise<void>;
    onClearError: () => void;
    onInvoiceSelect: (invoiceId: string) => void;
    getInvoiceStatus: (invoice: Invoice) => InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
}

export interface InvoiceActsProps {
    invoice: Invoice;
}

export interface InvoicePrintFormProps {
    invoice: Invoice;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
}

export interface InvoicesBreadcrumbProps {
    currentPosition: InvoicePosition;
    selectedInvoiceId: string | null;
    canGoBack: boolean;
    onNavigate: (position: InvoicePosition) => void;
    onGoBack: () => void;
}

export interface InvoiceAct {
    id: string;
    name: string;
    date: string;
    type: 'work_completed' | 'prescription' | 'order' | 'other';
    url?: string;
    fileSize?: number;
    mimeType?: string;
}

export interface ActFormData {
    invoiceId: string;
    actType: string;
    description: string;
    createdDate: string;
    file?: File;
}