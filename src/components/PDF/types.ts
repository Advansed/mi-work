// ============================================
// ОСНОВНЫЕ ТИПЫ PDF МОДУЛЯ
// ============================================

// Базовые конфигурационные типы
export interface PDFConfig {
    orientation: 'portrait' | 'landscape';
    format: string | number[];
    colors: {
        primary: string;
        secondary: string;
        text: string;
        background: string;
    };
    fonts: {
        regular: FontConfig;
        bold: FontConfig;
        italic: FontConfig;
    };
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export interface FontConfig {
    family: string;
    size: number;
    lineHeight: number;
}

export interface TextOptions {
    align?: 'left' | 'center' | 'right' | 'justify';
    maxWidth?: number;
    lineHeight?: number;
    color?: string;
    font?: string;
    fontSize?: number;
}

export interface FieldPosition {
    x: number;
    y: number;
    width?: number;
    height?: number;
}

export interface TemplateLayout {
    pageWidth: number;
    pageHeight: number;
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    sections: {
        header: FieldPosition;
        content: FieldPosition;
        footer: FieldPosition;
    };
}

export interface FieldPositions {
    [key: string]: FieldPosition;
}

export interface SectionSpacing {
    before: number;
    after: number;
    internal: number;
}

// ============================================
// ТИПЫ ДЛЯ АКТ-НАРЯДА (существующие)
// ============================================

export interface RepresentativeData {
    name: string;
    position: string;
    reason: string;
}

export interface OrderData {
    equipment: string;
    apartment: string;
    house: string;
    street: string;
    subscriber: string;
}

export interface ExecutionData {
    datetime: string;
    equipment_description: string;
    apartment: string;
    house: string;
    street: string;
}

export interface ReconnectionData {
    representative: string;
    subscriber: string;
    apartment: string;
    house: string;
    street: string;
    connection_date: string;
}

export interface SignatureData {
    representative: string;
    subscriber: string;
}

export interface ActOrderData {
    actNumber: string;
    date: string;
    representative: RepresentativeData;
    order: OrderData;
    execution: ExecutionData;
    reconnection: ReconnectionData;
    signatures: SignatureData;
}

// ============================================
// ТИПЫ ДЛЯ АКТА ПЛОМБИРОВАНИЯ (новые)
// ============================================

export interface PlombMeterData {
    meter_number: string;
    seal_number: string;
    current_reading?: string | number;
    meter_type?: string;
    notes?: string;
    sequence_order?: number;
}

export interface ActPlombData {
    id?: string;
    act_number?: string;
    act_date: string;
    subscriber_name: string;
    address?: string;
    street: string;
    house: string;
    apartment: string;
    usd_representative: string;
    notes?: string;
    invoice_id?: string;
    meters: PlombMeterData[];
    recipient_signature?: string;
    receipt_date?: string;
    created_at?: string;
    updated_at?: string;
}

// ============================================
// ОБЩИЕ СЛУЖЕБНЫЕ ТИПЫ
// ============================================

export interface PDFGenerationResult {
    success: boolean;
    blob?: Blob;
    url?: string;
    error?: string;
}

export interface PDFGenerationOptions {
    filename?: string;
    autoDownload?: boolean;
    showPreview?: boolean;
    quality?: 'low' | 'medium' | 'high';
}

// ============================================
// ТИПЫ ДЛЯ ШАБЛОНОВ
// ============================================

export interface TemplateRenderOptions {
    data: ActOrderData | ActPlombData;
    config?: Partial<PDFConfig>;
    layout?: Partial<TemplateLayout>;
}

export interface TemplateValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// ============================================
// ТИПЫ ДЛЯ УТИЛИТ
// ============================================

export interface TextMeasurement {
    width: number;
    height: number;
    lines: string[];
}

export interface FontInfo {
    family: string;
    style: string;
    size: number;
    available: boolean;
    cyrillic: boolean;
}