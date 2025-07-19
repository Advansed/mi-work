// ============================================
// ТИПЫ ДАННЫХ ДЛЯ PDF ГЕНЕРАТОРА
// ============================================

export interface ActOrderData {
    actNumber: string;
    date: string;
    representative: RepresentativeData;
    order: OrderData;
    execution: ExecutionData;
    reconnection: ReconnectionData;
}

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
    orderGiver: SignatureData;
    orderReceiver: SignatureData;
}

export interface ExecutionData {
    executor: string;
    executionDate: string;
    executionTime: string;
    disconnectedEquipment: string;
    representativeSignature: SignatureData;
    subscriberSignature: SignatureData;
}

export interface ReconnectionData {
    reconnectionDate: string;
    reconnectionBy: string;
    reconnectionOrder: string;
    apartment: string;
    house: string;
    street: string;
    subscriber: string;
    representativeSignature: SignatureData;
    subscriberSignature: SignatureData;
}

export interface SignatureData {
    name: string;
    position: string;
    signature?: string; // base64 изображение подписи
}

export interface PDFConfig {
    format: 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    fonts: {
        regular: FontConfig;
        bold: FontConfig;
        title: FontConfig;
    };
    colors: {
        primary: string;
        secondary: string;
        text: string;
        lines: string;
    };
    elements: {
        logoWidth: number;
        logoHeight: number;
        lineHeight: number;
        fieldHeight: number;
        sectionSpacing: number;
    };
}

export interface FontConfig {
    family: string;
    size: number;
    style: 'normal' | 'bold' | 'italic';
}

export interface TextOptions {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic';
    align?: 'left' | 'center' | 'right';
    color?: string;
    maxWidth?: number;
}

export interface FieldPosition {
    x: number;
    y: number;
    width: number;
    height?: number;
}

export interface TemplateLayout {
    header: {
        height: number;
        logoPosition: FieldPosition;
        titlePosition: FieldPosition;
        datePosition: FieldPosition;
    };
    sections: {
        representative: FieldPosition;
        order: FieldPosition;
        execution: FieldPosition;
        reconnection: FieldPosition;
    };
    footer: {
        height: number;
        notePosition: FieldPosition;
    };
}

export interface FieldPositions {
    [key: string]: FieldPosition;
}

export interface SectionSpacing {
    beforeSection: number;
    afterSection: number;
    betweenElements: number;
    beforeSignatures: number;
}