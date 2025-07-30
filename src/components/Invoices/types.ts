// ============================================
// ОСНОВНЫЕ ИНТЕРФЕЙСЫ ДЛЯ МОДУЛЯ INVOICES
// ============================================

export interface Lic {
    id:     string;
    name:   string;
    code:   string;
    plot:   string;
}

export interface Invoice {
    id:         string;
    lineno:     number;
    number:     string;
    date:       string;
    phone:      string;
    address:    string;
    service:    string;
    term:       string;
    lic:        Lic
    term_begin: string;
    term_end:   string;
}

export interface InvoiceStatus {
    type: 'overdue' | 'urgent' | 'normal';
    label: string;
    color: 'danger' | 'warning' | 'success';
    priority: number;
}

export interface InvoicesResponse {
    success: boolean;
    data?: Invoice[];
    message?: string;
}

// ============================================
// ТИПЫ ДЛЯ НАВИГАЦИИ МЕЖДУ СТРАНИЦАМИ
// ============================================

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

// ============================================
// ПРОПСЫ ДЛЯ КОМПОНЕНТОВ
// ============================================

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

export interface InvoiceViewProps {
    invoice: Invoice;
    invoiceStatus: InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
    onNavigateToActs: () => void;
    onNavigateToPrint: () => void;
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

// ============================================
// ВОЗВРАЩАЕМЫЙ ТИП ХУКА useInvoices
// ============================================

export interface UseInvoicesReturn {
    invoices: Invoice[];
    loading: boolean;
    refreshing: boolean;
    navigation: InvoiceNavigation;
    selectedInvoice: Invoice | null;
    loadInvoices: () => Promise<void>;
    refreshInvoices: () => Promise<void>;
    getInvoiceStatus: (invoice: Invoice) => InvoiceStatus;
    formatDate: (dateString: string) => string;
    formatPhone: (phone: string) => string;
    navigateToPosition: (position: InvoicePosition, invoiceId?: string) => void;
    goBack: () => void;
    selectInvoice: (invoiceId: string) => void;
}

// ============================================
// ТИПЫ ДЛЯ АКТОВ И ДОКУМЕНТОВ
// ============================================

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

// ============================================
// ТИПЫ ДЛЯ ПЕЧАТНЫХ ФОРМ
// ============================================

export interface PrintForm {
    id: string;
    name: string;
    description: string;
    template: string;
    requiredFields: string[];
}

export interface QRCodeData {
    invoiceId: string;
    amount: number;
    description: string;
    paymentUrl: string;
}

// ============================================
// ТИПЫ ДЛЯ ОБОРУДОВАНИЯ
// ============================================

export interface GasEquipment {
    id: string;
    brand: string;
    model: string;
    serialNumber: string;
    installDate: string;
    lastMaintenanceDate?: string;
    status: 'active' | 'inactive' | 'requires_maintenance';
}

export interface EquipmentService {
    id: string;
    equipmentId: string;
    serviceType: string;
    description: string;
    cost: number;
    executedDate: string;
    executedBy: string;
}

// ============================================
// ТИПЫ ДЛЯ ПРЕДПИСАНИЙ
// ============================================

export interface Prescription {
    id: string;
    invoiceId: string;
    number: string;
    issueDate: string;
    reason: string;
    description: string;
    requirements: string[];
    deadline: string;
    status: 'issued' | 'executed' | 'overdue';
    issuedBy: string;
}

export interface PrescriptionReason {
    code: string;
    description: string;
    isDefault?: boolean;
}

// ============================================
// УТИЛИТАРНЫЕ ТИПЫ
// ============================================

export type InvoiceActionType = 
    | 'call'
    | 'navigate' 
    | 'view_acts'
    | 'print_forms'
    | 'create_prescription'
    | 'add_equipment'
    | 'mark_completed';

export interface InvoiceAction {
    type: InvoiceActionType;
    label: string;
    icon: string;
    available: boolean;
    requiresConfirmation?: boolean;
}

// ============================================
// КОНСТАНТЫ
// ============================================

export const INVOICE_STATUS_COLORS = {
    overdue: 'danger',
    urgent: 'warning', 
    normal: 'success'
} as const;

export const INVOICE_POSITIONS = {
    LIST: 0,
    VIEW: 1,
    ACTS: 2,
    PRINT: 3
} as const;