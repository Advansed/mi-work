// ============================================
// REACT КОМПОНЕНТ ДЛЯ PDF ГЕНЕРАТОРА
// ============================================

import React, { useState, useRef, useCallback } from 'react';
import {
    IonButton,
    IonIcon,
    IonLoading,
    IonAlert,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonCard,
    IonCardContent,
    IonToast
} from '@ionic/react';
import {
    documentOutline,
    eyeOutline,
    downloadOutline,
    printOutline,
    shareOutline,
    closeOutline,
    checkmarkCircleOutline,
    alertCircleOutline
} from 'ionicons/icons';
import { PDFGenerator } from './PDFGenerator';
import { ActOrderData } from './types';
import './PDFGenerator.css';

// ============================================
// ИНТЕРФЕЙСЫ
// ============================================

export interface PDFGeneratorComponentProps {
    data: ActOrderData;
    onGenerate?: (blob: Blob) => void;
    onError?: (error: string) => void;
    showPreview?: boolean;
    autoDownload?: boolean;
    filename?: string;
    disabled?: boolean;
}

interface PDFPreviewModalProps {
    isOpen: boolean;
    previewUrl: string | null;
    onClose: () => void;
    onDownload: () => void;
    onPrint: () => void;
    onShare: () => void;
}

// ============================================
// МОДАЛЬНОЕ ОКНО ПРЕДПРОСМОТРА
// ============================================

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
    isOpen,
    previewUrl,
    onClose,
    onDownload,
    onPrint,
    onShare
}) => {
    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} className="pdf-preview-modal">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Предпросмотр документа</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            
            <IonContent>
                {previewUrl && (
                    <div className="pdf-preview-container">
                        <iframe
                            src={previewUrl}
                            className="pdf-preview-iframe"
                            title="PDF Предпросмотр"
                        />
                    </div>
                )}
                
                <div className="pdf-preview-actions">
                    <IonGrid>
                        <IonRow>
                            <IonCol size="3">
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={onDownload}
                                    className="preview-action-btn"
                                >
                                    <IonIcon icon={downloadOutline} slot="start" />
                                    Скачать
                                </IonButton>
                            </IonCol>
                            <IonCol size="3">
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={onPrint}
                                    className="preview-action-btn"
                                >
                                    <IonIcon icon={printOutline} slot="start" />
                                    Печать
                                </IonButton>
                            </IonCol>
                            <IonCol size="3">
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={onShare}
                                    className="preview-action-btn"
                                >
                                    <IonIcon icon={shareOutline} slot="start" />
                                    Поделиться
                                </IonButton>
                            </IonCol>
                            <IonCol size="3">
                                <IonButton
                                    expand="block"
                                    fill="clear"
                                    onClick={onClose}
                                    className="preview-action-btn"
                                >
                                    <IonIcon icon={closeOutline} slot="start" />
                                    Закрыть
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
        </IonModal>
    );
};

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export const PDFGeneratorComponent: React.FC<PDFGeneratorComponentProps> = ({
    data,
    onGenerate,
    onError,
    showPreview = true,
    autoDownload = false,
    filename = 'act-order.pdf',
    disabled = false
}) => {
    // ===== СОСТОЯНИЕ =====
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // ===== РЕФЫ =====
    const generatorRef = useRef<PDFGenerator | null>(null);

    // ===== МЕТОДЫ =====

    /**
     * Создает экземпляр генератора
     */
    const createGenerator = useCallback(async (): Promise<PDFGenerator> => {
        if (!generatorRef.current) {
            generatorRef.current = new PDFGenerator();
            await generatorRef.current.initialize();
        }
        return generatorRef.current;
    }, []);

    /**
     * Обработка ошибок
     */
    const handleError = useCallback((errorMessage: string) => {
        console.error('PDF Generation Error:', errorMessage);
        setError(errorMessage);
        if (onError) {
            onError(errorMessage);
        }
    }, [onError]);

    /**
     * Показывает сообщение об успехе
     */
    const showSuccess = useCallback((message: string) => {
        setSuccessMessage(message);
        setShowSuccessToast(true);
    }, []);

    /**
     * Генерирует PDF
     */
    const generatePDF = useCallback(async (): Promise<PDFGenerator | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const generator = await createGenerator();
            await generator.generateActOrder(data);
            return generator;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            handleError(errorMessage);
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [data, createGenerator, handleError]);

    /**
     * Предпросмотр документа
     */
    const handlePreview = useCallback(async () => {
        const generator = await generatePDF();
        if (!generator) return;

        try {
            const url = generator.getPreviewUrl();
            setPreviewUrl(url);
            setIsPreviewOpen(true);
        } catch (err) {
            handleError('Ошибка создания предпросмотра');
        }
    }, [generatePDF, handleError]);

    /**
     * Скачивание документа
     */
    const handleDownload = useCallback(async () => {
        const generator = await generatePDF();
        if (!generator) return;

        try {
            generator.savePDF(filename);
            
            if (onGenerate) {
                const blob = generator.getBlob();
                onGenerate(blob);
            }
            
            showSuccess('Документ успешно скачан');
        } catch (err) {
            handleError('Ошибка скачивания документа');
        }
    }, [generatePDF, filename, onGenerate, showSuccess, handleError]);

    /**
     * Печать документа
     */
    const handlePrint = useCallback(async () => {
        const generator = await generatePDF();
        if (!generator) return;

        try {
            generator.print();
            showSuccess('Документ отправлен на печать');
        } catch (err) {
            handleError('Ошибка печати документа');
        }
    }, [generatePDF, showSuccess, handleError]);

    /**
     * Поделиться документом
     */
    const handleShare = useCallback(async () => {
        const generator = await generatePDF();
        if (!generator) return;

        try {
            await generator.share(filename);
            showSuccess('Документ отправлен');
        } catch (err) {
            handleError('Ошибка отправки документа');
        }
    }, [generatePDF, filename, showSuccess, handleError]);

    /**
     * Закрытие предпросмотра
     */
    const handleClosePreview = useCallback(() => {
        setIsPreviewOpen(false);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [previewUrl]);

    // ===== АВТОМАТИЧЕСКОЕ СКАЧИВАНИЕ =====
    React.useEffect(() => {
        if (autoDownload && data) {
            handleDownload();
        }
    }, [autoDownload, data, handleDownload]);

    // ===== РЕНДЕР =====
    return (
        <div className="pdf-generator">
            <IonCard className="pdf-generator-card">
                <IonCardContent>
                    <div className="pdf-generator-header">
                        <IonIcon icon={documentOutline} className="pdf-generator-icon" />
                        <div className="pdf-generator-info">
                            <h3>Генерация PDF документа</h3>
                            <p>АКТ-НАРЯД на отключение газового оборудования</p>
                        </div>
                    </div>

                    <IonGrid className="pdf-generator-actions">
                        <IonRow>
                            {showPreview && (
                                <IonCol size="6" sizeMd="3">
                                    <IonButton
                                        expand="block"
                                        fill="outline"
                                        onClick={handlePreview}
                                        disabled={disabled || isGenerating}
                                        className="pdf-action-btn"
                                    >
                                        <IonIcon icon={eyeOutline} slot="start" />
                                        Предпросмотр
                                    </IonButton>
                                </IonCol>
                            )}
                            
                            <IonCol size="6" sizeMd="3">
                                <IonButton
                                    expand="block"
                                    onClick={handleDownload}
                                    disabled={disabled || isGenerating}
                                    className="pdf-action-btn primary"
                                >
                                    <IonIcon icon={downloadOutline} slot="start" />
                                    Скачать
                                </IonButton>
                            </IonCol>
                            
                            <IonCol size="6" sizeMd="3">
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={handlePrint}
                                    disabled={disabled || isGenerating}
                                    className="pdf-action-btn"
                                >
                                    <IonIcon icon={printOutline} slot="start" />
                                    Печать
                                </IonButton>
                            </IonCol>
                            
                            <IonCol size="6" sizeMd="3">
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={handleShare}
                                    disabled={disabled || isGenerating}
                                    className="pdf-action-btn"
                                >
                                    <IonIcon icon={shareOutline} slot="start" />
                                    Поделиться
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {isGenerating && (
                        <div className="pdf-generator-status">
                            <IonText color="primary">
                                <p>Генерация документа...</p>
                            </IonText>
                        </div>
                    )}
                </IonCardContent>
            </IonCard>

            {/* Модальное окно предпросмотра */}
            <PDFPreviewModal
                isOpen={isPreviewOpen}
                previewUrl={previewUrl}
                onClose={handleClosePreview}
                onDownload={handleDownload}
                onPrint={handlePrint}
                onShare={handleShare}
            />

            {/* Загрузка */}
            <IonLoading
                isOpen={isGenerating}
                message="Генерация PDF документа..."
                spinner="crescent"
            />

            {/* Алерт ошибки */}
            <IonAlert
                isOpen={!!error}
                onDidDismiss={() => setError(null)}
                header="Ошибка"
                subHeader="Не удалось сгенерировать документ"
                message={error || ''}
                buttons={['OK']}
            />

            {/* Тост успеха */}
            <IonToast
                isOpen={showSuccessToast}
                onDidDismiss={() => setShowSuccessToast(false)}
                message={successMessage}
                duration={3000}
                icon={checkmarkCircleOutline}
                color="success"
                position="top"
            />
        </div>
    );
};