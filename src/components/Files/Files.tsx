import React, { useEffect, useState } from "react";
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { addOutline, cameraOutline, documentTextOutline, mailOutline, removeOutline, sendOutline } from "ionicons/icons";
import { IonButton, IonChip, IonIcon, IonLoading, IonModal } from "@ionic/react";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { RenderCurrentScaleProps, RenderZoomInProps, RenderZoomOutProps, zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import './Files.css'

// Импорт хука и типов
import { useFileOperations, FileInfo, PDFPage } from './useFile';

defineCustomElements(window);

// ============================================
// ИНТЕРФЕЙСЫ КОМПОНЕНТОВ
// ============================================


interface FilesMultiProps {
    info: Array<{
        Файлы: FileInfo[];
        Имя: string;
        Описание: string;
    }>;
}

// ============================================
// УТИЛИТАРНЫЕ ФУНКЦИИ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
// ============================================

export const takePicture = async () => {
    const fileOps = useFileOperations();
    return await fileOps.takePicture();
};

export const toPDF = async (pages: PDFPage[], name: string) => {
    const fileOps = useFileOperations();
    return await fileOps.convertToPDF(pages, name);
};


interface PDFDocProps {
    url: string;
    name?: string;
    title?: string;
}

// ============================================
// КОМПОНЕНТ PDFDOC В КОРПОРАТИВНОМ СТИЛЕ
// ============================================

export function PDFDoc(props: PDFDocProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // Инициализация плагина масштабирования
    const zoomPluginInstance = zoomPlugin();
    const { CurrentScale, ZoomIn, ZoomOut } = zoomPluginInstance;

    // ============================================
    // КОНВЕРТАЦИЯ BASE64 В BLOB
    // ============================================

    const base64toBlob = (data: string): Blob => {
        try {
            const jarr = data.split(",");
            const base64WithoutPrefix = jarr[1];
            
            if (!base64WithoutPrefix) {
                throw new Error('Неверный формат base64 данных');
            }

            const bytes = atob(base64WithoutPrefix);
            let length = bytes.length;
            const out = new Uint8Array(length);

            while (length--) {
                out[length] = bytes.charCodeAt(length);
            }

            return new Blob([out], { type: 'application/pdf' });
        } catch (error) {
            console.error('Ошибка конвертации base64:', error);
            throw new Error('Не удалось конвертировать PDF данные');
        }
    };

    // ============================================
    // СОЗДАНИЕ URL ДЛЯ PDF
    // ============================================

    useEffect(() => {
        const createPdfUrl = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (!props.url) {
                    throw new Error('URL PDF не предоставлен');
                }

                const blob = base64toBlob(props.url);
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
                setError(errorMessage);
                console.error('Ошибка создания PDF URL:', err);
            } finally {
                setIsLoading(false);
            }
        };

        createPdfUrl();

        // Очистка URL при размонтировании
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [props.url]);

    // ============================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ============================================

    const handleSendMail = async () => {
        try {
            // Функция отправки email из старой версии
            // TODO: Реализовать интеграцию с getData('SendMail', ...)
            console.log('Отправка PDF по email:', {
                title: props.title,
                name: props.name
            });
        } catch (error) {
            console.error('Ошибка отправки email:', error);
        }
    };

    // ============================================
    // РЕНДЕР СОСТОЯНИЙ
    // ============================================

    // Состояние загрузки
    if (isLoading) {
        return (
            <div className="pdfdoc-container">
                <div className="pdfdoc-toolbar">
                    <div className="pdfdoc-toolbar-title">
                        <IonIcon icon={documentTextOutline} className="pdfdoc-toolbar-icon" />
                        PDF документ
                    </div>
                </div>
                <div className="pdfdoc-loading">
                    <div className="pdfdoc-loading-spinner"></div>
                    <div className="pdfdoc-loading-text">Загрузка PDF...</div>
                </div>
            </div>
        );
    }

    // Состояние ошибки
    if (error || !pdfUrl) {
        return (
            <div className="pdfdoc-container">
                <div className="pdfdoc-toolbar">
                    <div className="pdfdoc-toolbar-title">
                        <IonIcon icon={documentTextOutline} className="pdfdoc-toolbar-icon" />
                        PDF документ
                    </div>
                </div>
                <div className="pdfdoc-error">
                    <IonIcon icon={documentTextOutline} className="pdfdoc-error-icon" />
                    <div className="pdfdoc-error-text">
                        Ошибка загрузки PDF: {error || 'Неизвестная ошибка'}
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // ОСНОВНОЙ РЕНДЕР
    // ============================================

    return (
        <div className="pdfdoc-container pdfdoc-fade-in">
            {/* Панель управления */}
            <div className="pdfdoc-toolbar">
                <div className="pdfdoc-toolbar-title">
                    <IonIcon icon={documentTextOutline} className="pdfdoc-toolbar-icon" />
                    PDF просмотр
                    {props.title && (
                        <span style={{ fontWeight: 400, fontSize: '12px', opacity: 0.8 }}>
                            • {props.title}
                        </span>
                    )}
                </div>

                <div className="pdfdoc-toolbar-controls">
                    {/* Кнопка уменьшения масштаба */}
                    <ZoomOut>
                        {(zoomProps: RenderZoomOutProps) => (
                            <IonButton
                                onClick={zoomProps.onClick}
                                title="Уменьшить масштаб"
                            >
                                <IonIcon icon={removeOutline} />
                            </IonButton>
                        )}
                    </ZoomOut>

                    {/* Отображение текущего масштаба */}
                    <CurrentScale>
                        {(scaleProps: RenderCurrentScaleProps) => (
                            <div className="pdfdoc-scale-display">
                                {Math.round(scaleProps.scale * 100)}%
                            </div>
                        )}
                    </CurrentScale>

                    {/* Кнопка увеличения масштаба */}
                    <ZoomIn>
                        {(zoomProps: RenderZoomInProps) => (
                            <IonButton
                                onClick={zoomProps.onClick}
                                title="Увеличить масштаб"
                            >
                                <IonIcon icon={addOutline} />
                            </IonButton>
                        )}
                    </ZoomIn>

                    {/* Кнопка отправки по email */}
                    {props.name && props.title && (
                        <IonButton
                            onClick={handleSendMail}
                            title="Отправить по email"
                        >
                            <IonIcon icon={mailOutline} />
                        </IonButton>
                    )}
                </div>
            </div>

            {/* Область просмотра PDF */}
            <div className="pdfdoc-viewer-container">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer
                        fileUrl={pdfUrl}
                        plugins={[zoomPluginInstance]}
                        // onLoadError={(error) => {
                        //     console.error('Ошибка загрузки PDF:', error);
                        //     setError('Не удалось загрузить PDF документ');
                        // }}
                    />
                </Worker>
            </div>
        </div>
    );
}
